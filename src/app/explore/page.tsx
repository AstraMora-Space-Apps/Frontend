import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { CardSkeleton } from "@/components/explore/States";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Explore the research",
  description: "Filter, read and compare microgravity combustion investigations.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeader
        title="Explore the research"
        subtitle="Filter, read and compare microgravity combustion investigations."
      />
      <div className="mt-8">
        {/* useSearchParams (URL filter state) needs a Suspense boundary on a static page. */}
        <Suspense
          fallback={
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
        >
          <ExploreClient />
        </Suspense>
      </div>
    </div>
  );
}
