"use client"

import { User } from "@/auth/sessions"
import AccountCard from "../card"
import { Checkbox } from "@/components/ui/checkbox"
import React, { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateUser } from "@/auth/user/actions"
import { useRouter } from "next/navigation"
import Spinner from "@/components/ui/spinner"
import { Icons } from "@/components/icons"
import Alert from "@/components/alert"
import { unlinkOAuthDiscord, unlinkOAuthGithub, unlinkOAuthGoogle } from "@/auth/oauth/actions"

export default function OAuthFields({ user }: { user: User }) {
	const [autoLink, setAutoLink] = React.useState<boolean>(user.oauth_auto_link);
	const [unlinkGithub, setUnlinkGithub] = React.useState(false);
	const [unlinkGoogle, setUnlinkGoogle] = React.useState(false);
	const [unlinkDiscord, setUnlinkDiscord] = React.useState(false);
	const router = useRouter();

	const loginWithOAuth = (provider: "github" | "google" | "discord") => {
		const w = 600;
		const h = 600;
		const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
		const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

		const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

		const systemZoom = width / window.screen.availWidth;
		const left = (width - w) / 2 / systemZoom + dualScreenLeft
		const top = (height - h) / 2 / systemZoom + dualScreenTop
		const popup = window.open(`${process.env.NEXT_PUBLIC_URL}/oauth/${provider}?flow=link`, "popup", `popup=true, scrollbars=no, width=${w / systemZoom}, height=${h / systemZoom}, top=${top}, left=${left}`);

		const checkPopup = setInterval(async () => {
			if (!popup) return;
			if (popup.window.location.href.includes("/oauth/success")) {
				// Close the window and get the latest data
				popup.close();
				router.refresh();
				clearInterval(checkPopup);
				toast.success("Success!", {
					description: `Your account has been linked with ${provider[0].toUpperCase() + provider.substring(1)}.`,
				});
			}

			// If the popup is not closed, return
			if (!popup.closed) return;
		}, 1000);
	}

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
				title="OAuth Providers"
				description="Connect your Katarogu account with a third-party service to enable additional features."
				footer="You can use OAuth to login to your Katarogu account quickly and securely."
			>
				<div className="flex flex-wrap gap-3">
					{user.github_id ? (
						<Suspense fallback={<Spinner />}>
							<Button
								className="w-fit"
								variant="secondary"
								onClick={() => setUnlinkGithub(true)}
							>
								<Icons.Github className="w-4 h-4 mr-2" />
								Unlink GitHub
							</Button>
							<Alert
								title="Disconnect GitHub?"
								description="Are you sure you want to disconnect your GitHub account?"
								onSubmit={async () => {
									const res = await unlinkOAuthGithub();
									if (res.error) {
										toast.error("Something went wrong!", {
											description: res.message
										});
										return;
									}
									router.refresh();
								}}
								onCancel={() => setUnlinkGithub(false)}
								open={unlinkGithub}
								setOpen={setUnlinkGithub}
							/>
						</Suspense>
					) : (
						<Button
							className="w-fit"
							variant="outline"
							onClick={() => {
								loginWithOAuth("github");
								router.refresh();
							}}
						>
							<Icons.Github className="w-4 h-4 mr-2" /> Connect with
							GitHub
						</Button>
					)}
					{user.google_id ? (
						<Suspense fallback={<Spinner />}>
							<Button
								className="w-fit"
								variant="secondary"
								onClick={() => setUnlinkGoogle(true)}
							>
								<Icons.Google className="w-4 h-4 mr-2" />
								Unlink Google
							</Button>
							<Alert
								title="Disconnect Google?"
								description="Are you sure you want to disconnect your Google account?"
								onSubmit={async () => {
									const res = await unlinkOAuthGoogle();
									if (res.error) {
										toast.error("Something went wrong!", {
											description: res.message
										});
										return;
									}
									router.refresh();
								}}
								onCancel={() => setUnlinkGoogle(false)}
								open={unlinkGoogle}
								setOpen={setUnlinkGoogle}
							/>
						</Suspense>
					) : (
						<Button
							className="w-fit"
							variant="outline"
							onClick={() => {
								loginWithOAuth("google")
								router.refresh();
							}}
						>
							<Icons.Google className="w-4 h-4 mr-2" /> Connect with
							Google
						</Button>
					)}
					{user.discord_id ? (
						<Suspense fallback={<Spinner />}>
							<Button
								className="w-fit"
								variant="secondary"
								onClick={() => setUnlinkDiscord(true)}
							>
								<Icons.Discord className="w-4 h-4 mr-2" />
								Unlink Discord
							</Button>
							<Alert
								title="Disconnect Discord?"
								description="Are you sure you want to disconnect your Discord account?"
								onSubmit={async () => {
									const res = await unlinkOAuthDiscord();
									if (res.error) {
										toast.error("Something went wrong!", {
											description: res.message
										});
										return;
									}
									router.refresh();
								}}
								onCancel={() => setUnlinkDiscord(false)}
								open={unlinkDiscord}
								setOpen={setUnlinkDiscord}
							/>
						</Suspense>
					) : (
						<Button
							className="w-fit"
							variant="outline"
							onClick={() => {
								loginWithOAuth("discord")
								router.refresh();
							}}
						>
							<Icons.Discord className="w-4 h-4 mr-2" /> Connect with
							Discord
						</Button>
					)}
				</div>
			</AccountCard>
			<AccountCard
				title="Automatic Linking"
				description="You can choose to automatically link external accounts when you log in with OAuth with the same email address."
				footer={`Your account is currently set to ${user.oauth_auto_link ? "automatically link" : "not automatically link"} accounts.`}
				action={
					<>
						<Button size="sm" onClick={async () => {
							const formData = new FormData();
							formData.append("oauth_auto_link", autoLink.toString());
							save(formData, `Your account is now set to ${autoLink ? "automatically link" : "not automatically link"} accounts.`);
						}}
						>
							Save
						</Button>
					</>
				}
			>
				<div className="flex items-center space-x-2">
					<Checkbox checked={autoLink} onCheckedChange={() => setAutoLink(!autoLink)} />
					<label
						htmlFor="terms"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Enable automatic linking
					</label>
				</div>
			</AccountCard>
		</>
	)
}