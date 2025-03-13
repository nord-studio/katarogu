import { generateSessionToken, createSession, UsersCollection, getCurrentSession } from "@/auth/sessions";
import { cookies } from "next/headers";

import type { OAuth2Tokens } from "arctic";
import client from "@/lib/mongodb";
import { setSessionTokenCookie } from "@/auth/cookies";
import { generateIdFromEntropySize } from "@/auth/crypto";
import { discord } from "@/auth/oauth/providers";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = (await cookies()).get("discord_oauth_state")?.value ?? null;
	const flow = (await cookies()).get("discord_oauth_flow")?.value ?? "auth";

	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=invalid_request"
			}
		});
	}

	if (state !== storedState) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=invalid_request"
			}
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await discord.validateAuthorizationCode(code, null);
	} catch (err) {
		console.error(err);
		// Invalid code or client credentials
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=invalid_request"
			}
		});
	}

	const res = await fetch("https://discord.com/api/users/@me", {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});

	const discordUser = await res.json();
	const discordId = discordUser.id;
	const discordUsername = discordUser.username;
	const discordEmail = discordUser.email;
	const discordEmailVerified = discordUser.verified;

	if (discordEmailVerified !== true) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/oauth/error?error_code=oauth_email_unverified"
			}
		});
	}

	if (flow === "link") {
		/// ---
		/// If a session already exists, link the Google account to the user.
		/// ---

		await client.connect();

		const existingUser = await client.db().collection<UsersCollection>("users").findOne({ discord_id: discordId });

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
					discord_id: discordId
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
		/// ---
		/// If user that already exists with the Google ID, log them in.
		/// ---

		await client.connect();

		// Check if the user already exists with the GitHub ID.
		const existingUser = await client.db().collection<UsersCollection>("users").findOne({ discord_id: discordId });

		// If the user exists, log them in
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

		const row = await client.db().collection<UsersCollection>("users").findOne({ email: discordEmail });

		if (row !== null && row.email === discordEmail) {
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
					discord_id: discordId
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

		/// ---
		/// If not user exists, create a new user.
		/// ---

		// Continue to create a new user.
		const userId = generateIdFromEntropySize(10);

		client.db().collection<UsersCollection>("users").insertOne({
			_id: userId,
			name: discordUsername + "_discord",
			username: discordUsername,
			email: discordEmail,
			email_verified: true,
			avatar: `https://api.dicebear.com/7.x/lorelei-neutral/png?seed=${discordUsername}`,
			banner: "https://images.unsplash.com/photo-1636955816868-fcb881e57954?q=25",
			password_hash: null,
			visibility: "public",
			oauth_auto_link: true,
			github_id: null,
			google_id: null,
			discord_id: discordId
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
