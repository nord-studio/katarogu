import { getCurrentSession } from "@/auth/sessions";

export async function GET() {
	const { user } = await getCurrentSession();

	if (!user) return new Response(JSON.stringify(null), { status: 401 });

	return new Response(JSON.stringify(user), { status: 200 });
}