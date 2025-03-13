"use client";

import { Button } from "@/components/ui/button";
import AccountCard from "../card";
import { User } from "@/auth/sessions";
import React from "react";
import { toast } from "sonner";
import { updateUser } from "@/auth/user/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function PrivacyFields({ user }: { user: User }) {
	const [visibility, setVisibility] = React.useState<string>(
		user?.visibility ?? "public"
	);
	const router = useRouter();

	const save = (formData: FormData, message?: string) => {
		toast.promise(updateUser(formData), {
			loading: "Saving...",
			success: () => {
				router.refresh();
				return message ?? "Your changes have been saved.";
			},
			error: "Something went wrong. Your changes couldn't be saved",
		});
	};

	return (
		<>
			<AccountCard
				title="Profile Visibility"
				description="You can choose to make your profile public, unlisted, or private."
				footer={`Your profile is currently ${user.visibility}.`}
				action={
					<Button
						size="sm"
						onClick={async () => {
							if (visibility === user.visibility)
								return toast.error("No changes were made.", {
									description: "Please make some changes before saving.",
								});

							if (!["public", "unlisted", "private"].includes(visibility))
								return toast.error("Invalid value.", {
									description:
										"Your visibility can only be 'public', 'unlisted' or 'private'.",
								});

							const formData = new FormData();
							formData.append("visibility", visibility);
							save(formData, `Your profile is now ${visibility}.`);
						}}
					>
						Save
					</Button>
				}
			>
				<Select value={visibility} onValueChange={setVisibility}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Public" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem
							value="public"
							className="data-[current=true]:font-bold"
							data-current={user.visibility === "public"}
						>
							Public
						</SelectItem>
						<SelectItem
							value="unlisted"
							className="data-[current=true]:font-bold"
							data-current={user.visibility === "unlisted"}
						>
							Unlisted
						</SelectItem>
						<SelectItem
							value="private"
							className="data-[current=true]:font-bold"
							data-current={user.visibility === "private"}
						>
							Private
						</SelectItem>
					</SelectContent>
				</Select>
			</AccountCard>
		</>
	)
}