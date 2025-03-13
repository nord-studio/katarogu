import { generateSessionToken, createSession, UsersCollection, getCurrentSession } from "@/auth/sessions";
import { github } from "@/auth/oauth/providers";
import { cookies } from "next/headers";

import type { OAuth2Tokens } from "arctic";
import client from "@/lib/mongodb";
import { setSessionTokenCookie } from "@/auth/cookies";
import { generateIdFromEntropySize } from "@/auth/crypto";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = (await cookies()).get("github_oauth_state")?.value ?? null;
	const flow = (await cookies()).get("github_oauth_flow")?.value ?? "auth";

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
		tokens = await github.validateAuthorizationCode(code);
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

	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});

	const githubUser = await githubUserResponse.json();
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	if (flow === "link") {
		/// ---
		/// If a session already exists, link the Google account to the user.
		/// ---

		await client.connect();

		const existingUser = await client.db().collection<UsersCollection>("users").findOne({ github_id: githubUserId });

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
					github_id: githubUserId
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
		const existingUser = await client.db().collection<UsersCollection>("users").findOne({ github_id: githubUserId });

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

		const row = await client.db().collection<UsersCollection>("users").findOne({ email: githubUser.email });

		if (row !== null && row.email === githubUser.email) {
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
					github_id: githubUserId
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
			name: githubUser.name,
			username: githubUsername,
			email: githubUser.email,
			email_verified: true,
			avatar: githubUser.avatar_url,
			banner: "https://images.unsplash.com/photo-1636955816868-fcb881e57954?q=25",
			password_hash: null,
			visibility: "public",
			oauth_auto_link: true,
			github_id: githubUserId,
			google_id: null,
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
