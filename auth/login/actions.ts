"use server";

import { ActionResult } from "@/components/form";
import { verifyEmailInput } from "../email";
import client from "@/lib/mongodb";
import { verify } from "@node-rs/argon2"
import { createSession, generateSessionToken, UsersCollection } from "../sessions";
import { setSessionTokenCookie } from "../cookies";
import { redirect } from "next/navigation";

export async function login(prevState: ActionResult, formData: FormData) {
	"use server";
	const email = formData.get("email");

	if (!email || !verifyEmailInput(email.toString())) {
		return {
			error: true,
			message: "Invalid email"
		};
	}

	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: true,
			message: "Invalid password"
		};
	}

	await client.connect();

	const existing = await client.db().collection<UsersCollection>("users").findOne({ email: email });

	if (!existing) {
		return {
			error: true,
			message: "Incorrect email or password"
		};
	}

	if (!existing.password_hash) {
		return {
			error: true,
			message: "This account does not have a password set. Please login with a social provider."
		};
	}

	const validPassword = await verify(existing.password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	if (!validPassword) {
		return {
			error: true,
			message: "Incorrect email or password"
		};
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, existing._id);
	await setSessionTokenCookie(sessionToken, session.expires_at);

	redirect("/");
}