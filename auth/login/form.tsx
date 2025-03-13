"use client"

import { Input } from "@/components/ui/input";
import { login } from "@/auth/login/actions";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Spinner from "@/components/ui/spinner";

export default function LoginForm() {
	const [state, formAction] = useActionState(login, {
		error: false,
		message: ""
	});

	return (
		<>
			<form
				className="flex flex-col gap-4 w-full"
				action={formAction}
			>
				{state.error &&
					<p className="text-center">
						{state.message}
					</p>
				}
				{/* This is required to use the "useFormStatus" hook */}
				<InnerForm />
			</form>
		</>
	)
}

function InnerForm() {
	const { pending } = useFormStatus();

	const [showPassword, setShowPassword] = React.useState(false);
	const togglePassword = () => setShowPassword((prev) => !prev);
	return (
		<>
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="Email"
				required
				disabled={pending}
			/>
			<div className="flex w-full flex-row items-center gap-2">
				<Input
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					placeholder="Password"
					required
					disabled={pending}
				/>
				<Button
					variant="outline"
					size="icon"
					className="p-2"
					onClick={togglePassword}
					type="button"
					disabled={pending}
				>
					{showPassword ? (
						<EyeOff size={22} />
					) : (
						<Eye size={22} />
					)}
				</Button>
			</div>
			<Button className="w-full" disabled={pending}>
				{pending ? <Spinner size={16} /> : "Submit"}
			</Button>
		</>
	)
}