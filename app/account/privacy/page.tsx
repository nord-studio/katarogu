import { getCurrentSession } from "@/auth/sessions";
import React from "react";
import PrivacyFields from "./fields";
import { redirect } from "next/navigation";

export default async function PrivacyPage() {
	const { user } = await getCurrentSession();

	if (!user) {
		return redirect("/auth/login");
	}

	return (
		<>
			<PrivacyFields user={user} />
		</>
	)
}