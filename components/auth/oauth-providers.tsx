"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import React from "react";
import { toast } from "sonner";

export default function OAuthProviders() {
	const router = useRouter();
	const [loading, setLoading] = React.useState(false);

	const loginWithOAuth = (provider: "github" | "google" | "discord") => {
		setLoading(true);
		const w = 600;
		const h = 600;
		const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
		const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

		const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

		const systemZoom = width / window.screen.availWidth;
		const left = (width - w) / 2 / systemZoom + dualScreenLeft
		const top = (height - h) / 2 / systemZoom + dualScreenTop
		const popup = window.open(`${process.env.NEXT_PUBLIC_URL}/oauth/${provider}?flow=auth`, "popup", `popup=true, scrollbars=no, width=${w / systemZoom}, height=${h / systemZoom}, top=${top}, left=${left}`);
		const checkPopup = setInterval(async () => {
			if (!popup) return;
			if (popup.window.location.href.includes("/oauth/success")) {
				popup.close();
				router.refresh()
				const res = await fetch("/api/auth/user");
				const data = await res.json();
				if (data.id) {
					setLoading(false);
					clearInterval(checkPopup);
					toast.success("Success!", {
						description: `Welcome back, ${data.username}!`,
					});
					router.push("/dashboard");
				}
			}
			if (popup.window.location.href.includes("/oauth/error")) {
				setLoading(false);
				clearInterval(checkPopup);
			}
			if (!popup.closed) return;
		}, 1000);
	}

	return (
		<>
			<div className="grid grid-cols-3 gap-4 w-full">
				<Button
					className="w-full"
					variant="outline"
					onClick={() => loginWithOAuth("github")}
					disabled={loading}
				>
					<Icons.Github className="w-4 h-4 mr-2" />
					GitHub
				</Button>

				<Button
					className="w-full"
					variant="outline"
					onClick={() => loginWithOAuth("google")}
					disabled={loading}
				>
					<Icons.Google className="w-4 h-4 mr-2" />
					Google
				</Button>

				<Button
					className="w-full"
					variant="outline"
					onClick={() => loginWithOAuth("discord")}
					disabled={loading}
				>
					<Icons.Discord className="w-4 h-4 mr-2" />
					Discord
				</Button>
			</div>
		</>
	)
}