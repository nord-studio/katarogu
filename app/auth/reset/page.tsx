import { PasswordResetForm, RequestPasswordResetForm } from "@/auth/reset/form"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ResetPasswordPage(
	props: {
		searchParams: Promise<{ token: string | null }>
	}
) {
	const searchParams = await props.searchParams;
	return (
		<>
			<div className="absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 sm:w-1/2 md:w-auto">
				<div className="flex flex-col items-center justify-center gap-6 text-center max-w-md">
					<div className="flex w-full flex-col items-center justify-center gap-2">
						<h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
							{searchParams.token ? "Set a New Password" : "Reset Password"}
						</h1>
						<p className="text-sm text-neutral-500 sm:text-base">
							{searchParams.token ? "Please enter a new password below, make sure it&apos;s secure!" : "Please provide the email associated with your account to request a password reset."}
						</p>
					</div>
					<div className="flex w-full flex-col items-center justify-center">
						{!searchParams.token ? (
							<RequestPasswordResetForm />
						) : (
							<PasswordResetForm token={searchParams.token} />
						)}
					</div>
					<hr className="w-full border border-black/10 dark:border-white/10" />
					<div className="flex w-full flex-col items-center">
						<span>
							Had an epiphany?{" "}
							<Link href="/auth/login">
								<Button
									variant={"link"}
									className="p-0 text-blue-500 dark:text-blue-500"
								>
									Log in
								</Button>
							</Link>
						</span>
					</div>
				</div>
			</div>
		</>
	)
}