"use server";

import { ActionResult } from "@/components/form";
import client from "@/lib/mongodb";
import { render } from "jsx-email";
import { generateRandomString, RandomReader } from "@oslojs/crypto/random";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { hash } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { createTransport } from "nodemailer";
import ResetPasswordEmail from "./email";
import { verifyEmailInput } from "../email";
import { createSession, generateSessionToken, invalidateSession } from "../sessions";
import { setSessionTokenCookie } from "../cookies";
import { createDate, TimeSpan } from "@/auth/time";

// Email functions
export async function generateResetPasswordToken(userId: string, email: string): Promise<string> {
	await client.connect();

	const existing_token = client.db().collection("password_reset_tokens").find({ user_id: userId });

	for await (const token of existing_token) {
		await client.db().collection("password_reset_tokens").deleteOne({ _id: token._id });
	}

	const alphabet = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	const random: RandomReader = {
		read(bytes) {
			crypto.getRandomValues(bytes);
		}
	};
	const token = generateRandomString(random, alphabet, 64);
	const sha = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	await client.db().collection("password_reset_tokens").insertOne({
		user_id: userId,
		token: sha,
		// Token expires in 1 hour
		expires_at: createDate(new TimeSpan(1, "h"))
	});

	await client.close();

	return token;
}

export async function sendResetPasswordEmail(email: string, token: string) {
	client.connect();

	const user = await client.db().collection("users").findOne({ email });

	if (!user) {
		// We do not tell the user if the email is invalid to prevent email enumeration
		return;
	}

	const transporter = createTransport({
		host: process.env.SMTP_HOST,
		secure: process.env.SMTP_SECURE === "true",
		port: parseInt(process.env.SMTP_PORT!),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD
		},
		debug: process.env.NODE_ENV === "development"
	});

	const body = await render(<ResetPasswordEmail resetToken={token} />);

	const info = await transporter.sendMail({
		from: process.env.SMTP_FROM,
		to: email,
		subject: "Rest password request",
		html: body
	});

	await transporter.sendMail(info).catch((err) => {
		console.error(err);
	});
}

// Server functions
export async function requestPasswordReset(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
	"use server";

	const email = formData.get("email");
	if (!email || !verifyEmailInput(email.toString())) {
		return {
			error: true,
			message: "Invalid email"
		};
	}

	await client.connect();

	const user = await client.db().collection("users").findOne({
		email
	});

	if (!user) {
		return {
			error: true,
			message: "Invalid email"
		};
	}

	const token = await generateResetPasswordToken(user._id.toString(), user.email);
	await sendResetPasswordEmail(user.email, token);

	return {
		error: false,
		message: "Please check your email for a password reset link",
	}
}

export async function resetPassword(_: unknown, formData: FormData): Promise<ActionResult> {
	"use server";
	const token = formData.get("token");
	if (typeof token !== "string") {
		return {
			error: true,
			message: "Invalid token"
		};
	}

	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 8 || password.length > 255) {
		return {
			error: true,
			message: "Invalid password"
		};
	}

	const passwordConfirm = formData.get("passwordConfirm");
	if (password !== passwordConfirm) {
		return {
			error: true,
			message: "Passwords do not match"
		};
	}

	await client.connect();

	// Plain token from URL converted to sha256
	const sha = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const data = await client.db().collection("password_reset_tokens").findOne({ token: sha });

	// If the token doesn't exist, return an message
	if (!data) {
		return {
			error: true,
			message: "Invalid token. Please request a new password reset link."
		};
	}

	if (data.expires_at < new Date()) {
		return {
			error: true,
			message: "Token has expired. Invalid token. Please request a new password reset link."
		};
	}

	// Compare hash
	if (sha !== data.token) {
		return {
			error: true,
			message: "Invalid token. Please request a new password reset link."
		};
	}

	await invalidateSession(data.user_id);

	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	await client.db().collection("users").updateOne({
		_id: data.user_id
	}, {
		$set: {
			password_hash: passwordHash
		}
	});

	await client.db().collection("password_reset_tokens").deleteOne({
		user_id: data.user_id
	});

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, data.user_id);
	await setSessionTokenCookie(sessionToken, session.expires_at);

	return redirect("/");
}