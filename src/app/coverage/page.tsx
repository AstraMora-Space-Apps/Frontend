import { Suspense } from "react";
import type { Metadata } from "next";
import { CoverageClient } from "@/components/coverage/CoverageClient";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Coverage Map",
  description:
    "Where microgravity combustion tests have been run in oxygen and pressure, against habitat atmospheres.",
};

export default function CoveragePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeader
        title="Coverage Map"
        subtitle="Where tests have been run in oxygen and pressure, and which experiments matter for each crew habitat."
      />
      <div className="mt-8">
        {/* URL state (useSearchParams) needs a Suspense boundary on a static page. */}
        <Suspense
          fallback={
            <div
              className="h-[420px] w-full animate-pulse rounded-lg bg-muted md:h-[560px]"
              aria-hidden
            />
          }
        >
          <CoverageClient />
        </Suspense>
      </div>
    </div>
  );
}
