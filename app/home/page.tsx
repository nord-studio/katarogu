import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
	return (
		<>
			<main className="flex flex-col gap-16 items-center justify-center">
				<div className="min-h-screen-no-nav items-center justify-center flex flex-col">
					<div className="flex flex-col items-center gap-8 text-center">
						<div className="flex flex-col items-center justify-center gap-2">
							<span className="rounded-full after:content-['Katarogu'] hover:after:content-['カタログ'] flex flex-row gap-1 items-center border-2 border-black/10 px-3 text-neutral-500 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950">
								Introducing
							</span>
							<div className="flex flex-col items-center gap-6">
								<h1 className="font-display text-4xl font-bold sm:text-5xl md:text-6xl">
									A new way to track anime
								</h1>
								<p className="text-md text-center text-neutral-600 dark:text-neutral-400">
									A free, open-source and community driven manga and anime
									tracking service.
								</p>
							</div>
						</div>
						<div className="flex flex-row gap-4">
							<Link href="https://github.com/nord-studio/katarogu">
								<Button variant="outline">Learn More</Button>
							</Link>
							<Link href="/auth/register" passHref>
								<Button>Get Started</Button>
							</Link>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}