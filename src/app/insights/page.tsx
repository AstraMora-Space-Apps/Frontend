import { Suspense } from "react";
import type { Metadata } from "next";
import { Info } from "lucide-react";
import { CardSkeleton } from "@/components/explore/States";
import { FormulaStrip } from "@/components/insights/FormulaStrip";
import { InsightsClient } from "@/components/insights/InsightsClient";
import { PageHeader } from "@/components/ui/page-header";
import { INSIGHTS_PROCESS_NOTE } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "Ranked safety insights",
  description:
    "Fire-safety insights scored with a transparent formula, each linked to its sources.",
};

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
      <PageHeader
        title="Ranked safety insights"
        subtitle="Each insight is scored with a transparent formula and links to its sources."
      />
      <div className="mt-8 space-y-5">
        <FormulaStrip />
        <p className="flex max-w-[70ch] items-start gap-2 text-base text-muted-foreground">
          <Info className="mt-1 size-5 shrink-0 text-cyan" aria-hidden />
          {INSIGHTS_PROCESS_NOTE}
        </p>
        {/* URL filter state (useSearchParams) needs a Suspense boundary on a static page. */}
        <Suspense fallback={<CardSkeleton />}>
          <InsightsClient />
        </Suspense>
      </div>
    </div>
  );
}
