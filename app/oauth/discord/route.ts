import { generateState } from "arctic";
import { discord } from "@/auth/oauth/providers";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
	const flow = request.nextUrl.searchParams.get("flow") ?? "auth";
	const state = generateState();
	const url = discord.createAuthorizationURL(state, ["email", "identify"])

	(await cookies()).set("discord_oauth_flow", flow, {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	(await cookies()).set("discord_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
