
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import client from "@/lib/mongodb";
import { cache } from "react";
import { cookies } from "next/headers";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, user_id: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id,
		// 30 days
		expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};

	await client.db().collection<SessionCollection>("sessions").insertOne({
		_id: session.id,
		user_id: session.user_id,
		expires_at: session.expires_at
	});

	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	await client.connect();

	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const sessionDoc = await client.db().collection<SessionCollection>("sessions").findOne({ _id: sessionId });

	if (sessionDoc === null) {
		return { session: null, user: null };
	}

	const userDoc = await client.db().collection<UsersCollection>("users").findOne({ _id: sessionDoc.user_id.toString() });

	if (userDoc === null) {
		return { session: null, user: null };
	}

	const session: Session = {
		id: sessionDoc._id,
		user_id: sessionDoc.user_id,
		expires_at: sessionDoc.expires_at
	};

	const user: User = {
		id: sessionDoc.user_id,
		name: userDoc.name,
		username: userDoc.username,
		email: userDoc.email,
		email_verified: userDoc.email_verified,
		avatar: userDoc.avatar,
		banner: userDoc.banner,
		visibility: userDoc.visibility,
		oauth_auto_link: userDoc.oauth_auto_link,
		github_id: userDoc.github_id,
		google_id: userDoc.google_id,
		discord_id: userDoc.discord_id
	};

	if (Date.now() >= session.expires_at.getTime()) {
		// await db.execute("DELETE FROM user_session WHERE id = ?", session.id);
		await client.db().collection<SessionCollection>("sessions").deleteOne({ _id: session.id });
		return { session: null, user: null };
	}

	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await client.db().collection<SessionCollection>("sessions").updateOne(
			{ _id: session.id },
			{ $set: { expires_at: session.expires_at } }
		);
	}
	return { session, user };
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const token = (await cookies()).get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validateSessionToken(token);
	return result;
});


export async function invalidateSession(sessionId: string): Promise<void> {
	await client.db().collection<SessionCollection>("sessions").deleteOne({ _id: sessionId });
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export type SessionCollection = {
	_id: string;
	user_id: string;
	expires_at: Date;
};

export type UsersCollection = {
	_id: string;
	name: string | null;
	username: string;
	email: string;
	email_verified: boolean;
	avatar: string;
	banner: string;
	password_hash: string | null;
	visibility: "public" | "unlisted" | "private";
	oauth_auto_link: boolean;
	github_id: string | null;
	google_id: string | null;
	discord_id: string | null;
};

export interface Session {
	id: string;
	user_id: string;
	expires_at: Date;
}

export interface User {
	id: string;
	name: string | null;
	username: string;
	email: string;
	email_verified: boolean;
	avatar: string;
	banner: string;
	visibility: "public" | "unlisted" | "private";
	oauth_auto_link: boolean;
	github_id: string | null;
	google_id: string | null;
	discord_id: string | null;
}
