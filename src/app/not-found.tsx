import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Friendly 404 for unknown URLs and notFound() calls. */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-base font-semibold text-ember">404</p>
      <h1 className="mt-2">This page drifted off course</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The address may be mistyped, or the page has moved. Start again from the home page or ask a
        question about the research.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants({ size: "xl" })}>
          Back to home
          <ArrowRight aria-hidden />
        </Link>
        <Link
          href="/ask"
          className={cn(
            buttonVariants({ variant: "outline", size: "xl" }),
            "border-cyan/50 bg-transparent text-cyan hover:bg-cyan/10 hover:text-cyan",
          )}
        >
          <Compass aria-hidden />
          Ask FlameSight
        </Link>
      </div>
    </div>
  );
}
