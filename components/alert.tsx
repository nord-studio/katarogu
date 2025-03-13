import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "usehooks-ts"

export default function Alert({
	open,
	setOpen,
	title,
	description,
	footer,
	onSubmit,
	onCancel,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	title: string;
	description: string;
	footer?: string;
	onSubmit?: () => void;
	onCancel?: () => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const cancel = () => {
		setOpen(!open);
		if (onCancel) {
			onCancel();
		}
	};

	const submit = () => {
		setOpen(!open);
		if (onSubmit) {
			onSubmit();
		}
	};

	if (isDesktop) {
		return (
			<>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="gap-0 p-0 sm:max-w-[425px]">
						<DialogHeader className="p-6">
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription>{description}</DialogDescription>
						</DialogHeader>
						<div className="flex flex-row items-center justify-between gap-4 border-t bg-neutral-200/50 dark:bg-neutral-900/50 p-4">
							{footer ? (
								<span className="text-sm text-neutral-600 dark:text-neutral-400">
									{footer}
								</span>
							) : (
								<Button variant="outline" onClick={cancel}>
									Cancel
								</Button>
							)}
							<div className="flex flex-row gap-4">
								{footer && (
									<Button variant="outline" onClick={cancel}>
										Cancel
									</Button>
								)}
								<Button variant="destructive" onClick={submit}>
									Confirm
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{title}</DrawerTitle>
						<DrawerDescription>{description}</DrawerDescription>
					</DrawerHeader>
					<div className="flex w-full flex-row justify-between gap-2 border-t p-4">
						<Button variant="outline" onClick={cancel}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={submit}>
							Confirm
						</Button>
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}