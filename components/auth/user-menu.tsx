"use client";

import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	AlertTriangle,
	LogOut,
	Settings,
	UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts"
import { useEffect, useState } from "react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import Alert from "@/components/alert";
import { logout } from "@/auth/logout/actions";
import { User } from "@/auth/sessions";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserMenu({ user }: { user: User }) {
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [signOutOpen, setSignOutOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	function SignOutConfirmation() {
		return (
			<>
				<Alert
					title="Are you sure?"
					description="You are about to sign out of your account. Any unsaved changes you may have made will be lost."
					onSubmit={logout}
					onCancel={() => setOpen(!open)}
					open={signOutOpen}
					setOpen={setSignOutOpen}
				/>
			</>
		);
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (<Skeleton className="size-8 rounded-full" />)
	}

	return (
		<>
			{isDesktop ? (
				<>
					{user && (
						<>
							<DropdownMenu open={open} onOpenChange={setOpen}>
								<DropdownMenuTrigger asChild className="cursor-pointer">
									<Avatar className="border border-black/10 dark:border dark:border-white/10">
										<AvatarImage src={user.avatar} alt="Avatar" aria-label="Avatar" />
										<AvatarFallback>
											{(user.username ?? "T").slice(0, 1).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="mr-2 min-w-[22rem] p-0"
									side="bottom"
								>
									<AspectRatio ratio={3 / 1}>
										{!user.email_verified && (
											<Link href="/auth/verify">
												<div className="absolute top-0 z-51 h-[32px] w-full bg-[#EBCB8B] text-black dark:text-black">
													<div className="flex max-h-[32px] flex-row items-center justify-start gap-2 p-2">
														<div className="flex flex-row items-center w-full gap-2">
															<AlertTriangle className="h-4 w-4" />
															<p className="text-sm font-semibold">
																Your account isn&apos;t verified.
															</p>
														</div>
														<span>
															&rarr;
														</span>
													</div>
												</div>
											</Link>
										)}
										<Image
											src={user.banner}
											width={1050}
											height={450}
											alt="banner"
											className="h-full w-full object-cover"
										/>
									</AspectRatio>
									<DropdownMenuLabel className="flex h-20 min-h-20 -translate-y-16 flex-col px-3 text-xl font-semibold">
										<Avatar className="mb-2 h-20 w-20 border-2 border-black/10 dark:border-white/10">
											<AvatarImage
												src={user.avatar}
												aria-label="User Avatar"
												alt="Avatar"
											/>
											<AvatarFallback>
												{(user.username ?? "A").slice(0, 1).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-row items-center justify-between">
											<div className="flex flex-col items-start">
												<span className="flex flex-row items-center gap-2 font-semibold text-black dark:text-white">
													{user.name}
													{/* {user.visibility === "private" && (
														<Tooltip delayDuration={0}>
															<TooltipTrigger>
																<Lock size={16} />
															</TooltipTrigger>
															<TooltipContent>Private</TooltipContent>
														</Tooltip>
													)}
													{user.visibility === "unlisted" && (
														<Tooltip delayDuration={500}>
															<TooltipTrigger>
																<EyeOff size={16} />
															</TooltipTrigger>
															<TooltipContent>Unlisted</TooltipContent>
														</Tooltip>
													)} */}
												</span>
												<span className="text-sm font-normal text-neutral-500">
													({user.username})
												</span>
											</div>
											<div className="flex flex-row items-start">
												{/* Badges */}
											</div>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />

									<Link href="/profile">
										<DropdownMenuItem>
											<UserIcon className="mr-2 h-4 w-4" />
											<span>Profile</span>
										</DropdownMenuItem>
									</Link>

									<Link href="/account">
										<DropdownMenuItem>
											<Settings className="mr-2 h-4 w-4" />
											<span>Account</span>
										</DropdownMenuItem>
									</Link>

									<DropdownMenuItem
										onClick={() => {
											setOpen(!open);
											setSignOutOpen(!signOutOpen);
										}}
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Sign out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<SignOutConfirmation />
						</>
					)}
				</>
			) : (
				<>
					{user && (
						<>
							<Drawer open={open} onOpenChange={setOpen}>
								<DrawerTrigger asChild className="cursor-pointer">
									<Avatar className="border border-black/10 dark:border dark:border-white/10">
										<AvatarImage src={user.avatar} alt="Avatar" aria-label="Avatar" />
										<AvatarFallback>
											{(user.username ?? "A").slice(0, 1).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</DrawerTrigger>
								<DrawerContent className="border-0 p-0">
									<AspectRatio ratio={2 / 1}>
										{!user.email_verified && (
											<div className="absolute top-0 z-51 h-[32px] w-full bg-[#EBCB8B] text-black dark:text-black">
												<div className="flex max-h-[32px] flex-row items-center justify-start gap-2 p-2">
													<AlertTriangle className="h-4 w-4" />
													<p className="text-sm font-semibold">
														Please check your email for a verification link.
													</p>
												</div>
											</div>
										)}
										<Image
											src={user.banner}
											width={1050}
											height={450}
											alt="banner"
											className="h-full w-full rounded-t-md object-cover"
										/>
									</AspectRatio>
									<div className="flex h-24 min-h-24 -translate-y-12 flex-col px-3 text-xl font-semibold">
										<Avatar className="mb-2 h-20 w-20 border-2 border-black/10 dark:border-white/10">
											<AvatarImage
												src={user.avatar}
												aria-label="User Avatar"
												alt="Avatar"
											/>
											<AvatarFallback>
												{(user.username ?? "A").slice(0, 1).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-row items-center justify-between">
											<div className="flex flex-col items-start">
												<span className="flex flex-row items-center gap-2 font-semibold text-black dark:text-white">
													{user.name}
													{/* {user.visibility === "private" && (
															<Tooltip delayDuration={0}>
																<TooltipTrigger>
																	<Lock size={16} />
																</TooltipTrigger>
																<TooltipContent>Private</TooltipContent>
															</Tooltip>
														)}
														{user.visibility === "unlisted" && (
															<Tooltip delayDuration={500}>
																<TooltipTrigger>
																	<EyeOff size={16} />
																</TooltipTrigger>
																<TooltipContent>Unlisted</TooltipContent>
															</Tooltip>
														)} */}
												</span>
												<span className="text-sm font-normal text-neutral-500">
													({user.username})
												</span>
											</div>

											<div className="flex flex-row items-start">
												{/* Badges */}
											</div>
										</div>
									</div>
									<hr className="w-full border-b border-black/10 dark:border-white/10" />
									<div className="flex flex-col items-start">
										<Link href="/profile" className="w-full">
											<DrawerClose className="w-full">
												<div className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50">
													<UserIcon className="mr-2 h-4 w-4" />
													<span>Profile</span>
												</div>
											</DrawerClose>
										</Link>
										<Link href="/account" className="w-full">
											<DrawerClose className="w-full">
												<div className="text-md flex w-full cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50">
													<Settings className="mr-2 h-4 w-4" />
													<span>Account</span>
												</div>
											</DrawerClose>
										</Link>
										<hr className="w-full border-b border-black/10 dark:border-white/10" />
										<DrawerClose className="w-full">
											<div
												className="text-md flex cursor-default select-none items-center p-4 outline-hidden transition-colors focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50"
												onClick={() => setSignOutOpen(!signOutOpen)}
											>
												<LogOut className="mr-2 h-4 w-4" />
												<span>Sign out</span>
											</div>
										</DrawerClose>
									</div>
								</DrawerContent>
							</Drawer>

							<SignOutConfirmation />
						</>
					)}
				</>
			)}
		</>
	)
}