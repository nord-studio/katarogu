"use client"

import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail, verifyAccount } from "@/auth/verify/actions";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Spinner from "@/components/ui/spinner";

export default function VerifyAccountForm({ code }: { code?: string | undefined }) {
	const [state, formAction] = useActionState(verifyAccount, {
		error: false,
		message: ""
	});

	return (
		<form
			action={formAction}
			className="flex w-full flex-col items-center gap-4"
		>
			{state.error && (
				<p className="text-center">
					{state.message}
				</p>
			)}
			<InnerForm code={code} />
		</form>
	)
}

function InnerForm({ code }: { code?: string | undefined }) {
	const { pending } = useFormStatus();
	const [loading, setLoading] = React.useState(false);

	const resendCode = async () => {
		setLoading(true);
		await resendVerificationEmail().then(() => {
			toast.success("Success!", {
				description: "Please check your email for a new verification code."
			});
		}).catch((err) => {
			toast.error("Something went wrong!", {
				description: err.error
			});
		}).finally(() => {
			setLoading(false);
		});
	}

	return (
		<>
			<InputOTP maxLength={6} value={code} disabled={pending} pattern={REGEXP_ONLY_DIGITS} className="w-full" id="code" name="code">
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
				</InputOTPGroup>
				<InputOTPSeparator />
				<InputOTPGroup>
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<div className="flex flex-row gap-2">
				<Button variant="outline" type="button" disabled={loading} onClick={resendCode}>
					{loading ? (<div className="flex flex-row gap-2 items-center">Resend Code <Spinner size={16} /></div>) : "Resend Code"}
				</Button>
				<Button type="submit">
					Submit
				</Button>
			</div>
		</>
	)
}