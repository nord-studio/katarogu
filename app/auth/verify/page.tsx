import { getCurrentSession } from "@/auth/sessions"
import { redirect } from "next/navigation";
import VerifyAccountForm from "@/auth/verify/form";

export default async function VerifyAccountPage(
	props: {
		searchParams: Promise<{
			code: string | undefined
		}>
	}
) {
	const searchParams = await props.searchParams;
	const { user } = await getCurrentSession();

	if (!user) {
		return redirect("/auth/login");
	}

	if (user.email_verified) {
		return redirect("/auth/verify/success")
	}

	return (
		<>
			<div className="flex flex-col gap-4 items-center w-full h-snug justify-center">
				<div className="text-center">
					<h1 className="text-3xl font-bold">
						Almost there!
					</h1>
					<p>
						Please check your email for a verification code and enter it below to verify your account.
					</p>
				</div>
				<VerifyAccountForm code={searchParams.code} />
			</div>
		</>
	)
}