"use client";

import { User } from "@/auth/sessions";
import { updateUser } from "@/auth/user/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { toast } from "sonner";
import AccountCard from "../card";
import { useRouter } from "next/navigation";

export default function GeneralAccountFields({ user }: { user: User }) {
	const [username, setUsername] = React.useState(user.username);
	const [name, setName] = React.useState(user.name ?? "");
	const router = useRouter();

	const handleSave = (formData: FormData, message?: string) => {
		toast.promise(updateUser(formData), {
			loading: "Saving...",
			success: () => {
				router.refresh();
				return message ?? "Your changes have been saved.";
			},
			error: "Sorry, we failed to save your changes",
		});
	};

	return (
		<>
			<AccountCard
				title="Username"
				description="This is your unique username that will be used to identify you publicly."
				footer="Please use between 3 and 32 characters."
				action={
					<Button
						size="sm"
						onClick={async () => {
							if (username === user.username)
								return toast.error("No changes were made.", {
									description: "Please make some changes before saving.",
								});

							if (username.length < 3 || username.length > 16)
								return toast.error("Invalid username.", {
									description:
										"Your username must be between 3 and 16 characters long.",
								});

							const formData = new FormData();
							formData.append("username", username);
							handleSave(formData, "Your username has been updated.");
						}}
					>
						Save
					</Button>
				}
			>
				<Input
					placeholder={user.username}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className=""
				/>
			</AccountCard>
			<AccountCard
				title="Display Name"
				description="Please enter your full name, or a display name you are comfortable with."
				footer="Please use 32 characters at maximum."
				action={
					<Button
						size="sm"
						onClick={async () => {
							if (name === user.name)
								return toast.error("No changes were made.", {
									description: "Please make some changes before saving.",
								});

							if (name.length < 1 || name.length > 32)
								return toast.error("Invalid name.", {
									description:
										"Your name must be at least 32 characters long.",
								});

							const formData = new FormData();
							formData.append("name", name);
							handleSave(formData, "Your name has been updated.");

						}}
					>
						Save
					</Button>
				}
			>
				<Input
					placeholder={user.name ?? "Your name"}
					value={name}
					onChange={(e) => setName(e.target.value)}
					className=""
				/>
			</AccountCard>
		</>
	)
}