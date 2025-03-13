"use server";

import { ActionResult } from "@/components/form";
import { redirect } from "next/navigation";
import { getCurrentSession, invalidateSession } from "../sessions";
import { deleteSessionTokenCookie } from "../cookies";

export async function logout(): Promise<ActionResult> {
	"use server";
	const { session } = await getCurrentSession();
	if (!session) {
		return {
			error: true,
			message: "Unauthorized"
		};
	}

	await invalidateSession(session.id);

	await deleteSessionTokenCookie();
	return redirect("/");
}