"use client"

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "usehooks-ts"
import React, { useEffect, useState } from "react";
import LoginForm from "@/auth/login/form";
import RegisterForm from "@/auth/register/form";
import { RequestPasswordResetForm } from "@/auth/reset/form";
import OAuthProviders from "./oauth-providers";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthMenu() {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [mode, setMode] = useState<"login" | "register" | "reset">("login");
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const changeMode = (mode: "login" | "register" | "reset") => {
		setMode(mode);
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return (
		<Skeleton className="w-[77px] h-[36px]" />
	)

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Sign In</Button>
					</DialogTrigger>
					<DialogContent className="p-0 sm:max-w-[425px]">
						<DialogHeader className="px-6 pt-6">
							<DialogTitle>
								{mode === "login" && "Log in"}
								{mode === "register" && "Register"}
								{mode === "reset" && "Reset Password"}
							</DialogTitle>
							<DialogDescription>
								{mode === "login" && "Log in with your credentials here."}
								{mode === "register" && "Create an account to get started."}
								{mode === "reset" &&
									"Please provide the email associated with your account to request a password reset."}
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-2 py-2">
							<div className="flex w-full flex-col gap-3 px-4">
								{mode === "login" && (
									<>
										<div className="flex flex-col gap-4">
											<OAuthProviders />
										</div>
										<div className="w-full py-2 flex items-center">
											<hr className="w-full border-t border-black/10 dark:border-white/10" />
										</div>
									</>
								)}

								{mode === "login" && (
									<LoginForm />
								)}
								{mode === "register" && (
									<RegisterForm />
								)}
								{mode === "reset" && (
									<RequestPasswordResetForm />
								)}
							</div>
							<div className="px-6 pt-3 text-center">
								<span className="text-sm">
									By continuing, you agree to our{" "}
									<a href="#" className="text-blue-500 hover:underline">
										Terms of Service
									</a>{" "}
									and{" "}
									<a href="#" className="text-blue-500 hover:underline">
										Privacy Policy
									</a>
									.
								</span>
							</div>
						</div>
						<div className="mx-auto flex w-full flex-col items-center gap-2 border-t border-black/10 p-4 dark:border-white/10">
							<div className="flex flex-col items-center gap-2">
								{mode === "login" && (
									<>
										<div className="flex flex-row gap-2">
											<span>Forgot password?</span>
											<button
												className="text-blue-500 hover:underline"
												onClick={() => changeMode("reset")}
											>
												Reset
											</button>
										</div>
										<div className="flex flex-row gap-2">
											<span>Don&apos;t have an account?</span>
											<button
												className="text-blue-500 hover:underline"
												onClick={() => changeMode("register")}
											>
												Register
											</button>
										</div>
									</>
								)}
								{mode === "register" && (
									<>
										<div className="flex flex-row gap-2">
											<span>Already have an account?</span>
											<button
												className="text-blue-500 hover:underline"
												onClick={() => changeMode("login")}
											>
												Log in
											</button>
										</div>
									</>
								)}
								{mode === "reset" && (
									<>
										<div className="flex flex-row gap-2">
											<span>Remember your password?</span>
											<button
												className="text-blue-500 hover:underline"
												onClick={() => changeMode("login")}
											>
												Log in
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		);
	} else {
		return (
			<>
				<Drawer direction="bottom" open={open} onOpenChange={setOpen}>
					<DrawerTrigger asChild>
						<Button>Sign In</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle className="font-display text-3xl font-black">
								{mode === "login" && "Log In"}
								{mode === "register" && "Register"}
								{mode === "reset" && "Reset Password"}
							</DrawerTitle>
							<DrawerDescription>
								{mode === "login" && "Log in with your credentials here."}
								{mode === "register" && "Create an account to get started."}
								{mode === "reset" &&
									"Please provide the email associated with your account to request a password reset."}
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col gap-2 pt-2">
							<div className="flex w-full flex-col gap-3 px-4">
								{mode === "login" && (
									<>
										<div className="flex flex-col gap-4">
											<OAuthProviders />
										</div>
										<div className="w-full py-2 flex items-center">
											<hr className="w-full border-t border-black/10 dark:border-white/10" />
										</div>
									</>
								)}
								{mode === "login" && (
									<LoginForm />
								)}
								{mode === "register" && (
									<RegisterForm />
								)}
								{mode === "reset" && (
									<RequestPasswordResetForm />
								)}
							</div>
							<div className="px-6 py-4 text-center">
								<span>
									By continuing, you agree to our{" "}
									<a href="#" className="text-blue-500 hover:underline">
										Terms of Service
									</a>{" "}
									and{" "}
									<a href="#" className="text-blue-500 hover:underline">
										Privacy Policy
									</a>
									.
								</span>
							</div>
						</div>
						<DrawerFooter>
							<div className="mx-auto flex w-full flex-col items-center gap-2 border-t border-black/10 dark:border-white/10">
								<div className="flex flex-col items-center gap-2 p-4">
									{mode === "login" && (
										<>
											<div className="flex flex-row gap-2">
												<span>Forgot password?</span>
												<button
													className="text-blue-500 hover:underline"
													onClick={() => changeMode("reset")}
												>
													Reset
												</button>
											</div>
											<div className="flex flex-row gap-2">
												<span>Don&apos;t have an account?</span>
												<button
													className="text-blue-500 hover:underline"
													onClick={() => changeMode("register")}
												>
													Register
												</button>
											</div>
										</>
									)}
									{mode === "register" && (
										<>
											<div className="flex flex-row gap-2">
												<span>Already have an account?</span>
												<button
													className="text-blue-500 hover:underline"
													onClick={() => changeMode("login")}
												>
													Log in{" "}
												</button>
											</div>
										</>
									)}
									{mode === "reset" && (
										<>
											<div className="flex flex-row gap-2">
												<span>Remember your password?</span>
												<button
													className="text-blue-500 hover:underline"
													onClick={() => changeMode("login")}
												>
													Log in
												</button>
											</div>
										</>
									)}
								</div>
							</div>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</>
		);
	}
}