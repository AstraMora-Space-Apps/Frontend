"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Route error boundary. Shows a plain message, never the error text or stack.
 * `retry` re-fetches and re-renders the segment (Next 16.3+).
 */
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-4 py-16 sm:px-6 sm:py-24">
      <TriangleAlert className="size-10 text-risk-medium" aria-hidden />
      <h1 className="mt-4">Something went wrong</h1>
      <p className="mt-4 text-lg text-muted-foreground" role="alert">
        This part of FlameSight could not be shown. Try again, or go back to the home page. If the
        research service is waking up, a second try usually works.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="xl" onClick={() => retry()}>
          <RotateCcw aria-hidden />
          Try again
        </Button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-xl")}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
