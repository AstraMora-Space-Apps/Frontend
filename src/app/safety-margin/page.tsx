import { Suspense } from "react";
import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { SafetyMarginClient } from "@/components/margin/SafetyMarginClient";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Safety-margin explorer",
  description:
    "Preliminary comparison of oxygen limits in normal gravity and microgravity for paired solid materials.",
};

export default function SafetyMarginPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeader
        title="Safety-margin explorer"
        titleAdornment={
          <Badge
            variant="preliminary"
            className="border-2 px-4 py-1.5 text-lg font-extrabold tracking-widest"
          >
            PRELIMINARY
          </Badge>
        }
        subtitle="Oxygen limits in normal gravity (1-g) and microgravity for paired solid materials, against habitat oxygen levels."
      />
      <div
        role="note"
        className="mt-6 flex flex-col gap-3 rounded-card border-2 border-ember-glow/50 bg-ember-glow/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <p className="flex items-start gap-3 text-lg font-semibold text-foreground">
          <TriangleAlert className="mt-1 size-6 shrink-0 text-ember-glow" aria-hidden />
          Preliminary view: small number of paired materials, definitions under review. Do not use
          for safety decisions.
        </p>
        <Badge variant="preliminary" className="self-start sm:self-center">
          v0.1 · preliminary / unverified
        </Badge>
      </div>
      <div className="mt-8">
        {/* URL state (useSearchParams) needs a Suspense boundary on a static page. */}
        <Suspense
          fallback={
            <div className="h-[420px] w-full animate-pulse rounded-lg bg-muted" aria-hidden />
          }
        >
          <SafetyMarginClient />
        </Suspense>
      </div>
    </div>
  );
}
