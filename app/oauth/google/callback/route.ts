import { generateSessionToken, createSession, UsersCollection, getCurrentSession } from "@/auth/sessions";
import { google } from "@/auth/oauth/providers";
import { cookies } from "next/headers";

import { decodeIdToken, type OAuth2Tokens } from "arctic";
import client from "@/lib/mongodb";
import { setSessionTokenCookie } from "@/auth/cookies";
import { generateIdFromEntropySize } from "@/auth/crypto";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = (await cookies()).get("google_oauth_state")?.value ?? null;
	const codeVerifier = (await cookies()).get("google_code_verifier")?.value ?? null;
	const flow = (await cookies()).get("google_oauth_flow")?.value ?? "auth";

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=invalid_request",
			}
		})
	}

	if (state !== storedState) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=invalid_request",
			}
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (err) {
		// Invalid code or client credentials
		console.error(err);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=invalid_request",
			}
		});
	}

	const claims = decodeIdToken(tokens.idToken()) as { sub: string; name: string; picture: string; email: string };
	const id = claims.sub;
	const name = claims.name;
	const avatar = claims.picture;
	const email = claims.email;

	if (flow === "link") {
		// First, check if a linked user already exists.
		await client.connect();

		const existingUser = await client.db().collection<UsersCollection>("users").findOne({ google_id: id });

		if (existingUser !== null) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/oauth/error?error_code=account_already_linked"
				}
			});
		}

		// Then, check if the user is logged in and link the account.
		const { session: currentSession, user } = await getCurrentSession();

		if (currentSession !== null) {
			client.db().collection<UsersCollection>("users").updateOne({ _id: user.id }, {
				$set: {
					google_id: id
				}
			});

			return new Response(null, {
				status: 302,
				headers: {
					Location: "/oauth/success"
				}
			});
		} else {
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/oauth/error?error_code=invalid_request"
				}
			});
		}
	} else {
		// Check if the linked user already exists, if so, log them in.
		await client.connect();

		const existingUser = await client.db().collection<UsersCollection>("users").findOne({ google_id: id });

		if (existingUser !== null) {
			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, existingUser._id);
			setSessionTokenCookie(sessionToken, session.expires_at);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/oauth/success"
				}
			});
		}

		/// ---
		/// If the user does not have Github linked, but the emails match and they have oauth_auto_link enabled, link the account.
		/// ---

		const row = await client.db().collection<UsersCollection>("users").findOne({ email });

		if (row !== null && row.email === email) {
			// A matching Katarogu account that has the same email exists.

			if (row.email_verified !== true) {
				return new Response(null, {
					status: 302,
					headers: {
						Location: "/oauth/error?error_code=email_not_verified"
					}
				});
			}

			if (row.oauth_auto_link !== true) {
				return new Response(null, {
					status: 302,
					headers: {
						Location: "/oauth/error?error_code=auto_link_disabled"
					}
				});
			}

			// Link the account.
			client.db().collection<UsersCollection>("users").updateOne({ _id: row._id }, {
				$set: {
					google_id: id
				}
			});

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, row._id);
			setSessionTokenCookie(sessionToken, session.expires_at);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/oauth/success"
				}
			});
		}

		// Else, create a new user.

		const userId = generateIdFromEntropySize(10);

		client.db().collection<UsersCollection>("users").insertOne({
			_id: userId,
			name,
			username: name.replace(" ", "_").toLowerCase() + "_" + "google",
			email,
			email_verified: true,
			avatar,
			banner: "https://images.unsplash.com/photo-1636955816868-fcb881e57954?q=25",
			password_hash: null,
			visibility: "public",
			oauth_auto_link: true,
			github_id: null,
			google_id: id,
			discord_id: null,
		});

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, userId);
		setSessionTokenCookie(sessionToken, session.expires_at);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/success"
			}
		});
	}
}