import RegisterForm from "../../../auth/register/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
	return (
		<>
			<div className="absolute left-1/2 top-1/2 w-3/4 -translate-x-1/2 -translate-y-1/2 sm:w-1/2 md:w-auto">
				<div className="flex flex-col items-center justify-center gap-6 text-center">
					<div className="flex w-full flex-col items-center justify-center gap-2">
						<h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
							Sign up for Katarogu
						</h1>
						<p className="text-sm text-neutral-500 sm:text-base">
							Create an account today to get started.
						</p>
					</div>
					<div className="flex w-full flex-col items-center justify-center gap-4">
						<RegisterForm />
					</div>
					<hr className="w-full border border-black/10 dark:border-white/10" />
					<div className="flex w-full flex-col items-center">
						<span>
							Already have an account?{" "}
							<Link href="/auth/login">
								<Button
									variant={"link"}
									className="p-0 text-blue-500 dark:text-blue-500"
								>
									Sign in
								</Button>
							</Link>
						</span>
					</div>
				</div>
			</div>
		</>
	)
}