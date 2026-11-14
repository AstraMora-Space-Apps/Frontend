"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportCsvUrl } from "@/lib/api";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  hardwareOptions,
  matchesInvestigation,
  matchesTest,
  parseFilters,
  parseIdList,
  platformsByInvestigation,
  pressureBounds,
  toInvestigationFilters,
  toTestFilters,
  writeFilters,
  type ExploreFilters,
} from "@/lib/filters";
import { useInvestigations, useTests } from "@/lib/hooks";
import { FuelClassSchema, type Investigation } from "@/lib/types";
import { CountUp } from "@/components/motion/CountUp";
import { CompareTray } from "./CompareTray";
import { CompareView } from "./CompareView";
import { Filters } from "./Filters";
import { InvestigationCard } from "./InvestigationCard";
import { MobileFilters } from "./MobileFilters";
import { CardSkeleton, EmptyState, ErrorState } from "./States";
import { TestsTable, type FuelView } from "./TestsTable";

type Tab = "investigations" | "tests";

function parseFuelView(raw: string | null): FuelView {
  const r = FuelClassSchema.safeParse(raw);
  return r.success ? r.data : "all";
}

function ExploreClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramString = params.toString();

  const filters = useMemo(() => parseFilters(new URLSearchParams(paramString)), [paramString]);
  const tab: Tab = params.get("tab") === "tests" ? "tests" : "investigations";
  const selectedIds = useMemo(() => parseIdList(params.get("sel")), [params]);
  const compareIds = useMemo(() => parseIdList(params.get("compare")), [params]);
  const fuelView = parseFuelView(params.get("fc"));

  /** Single place that writes the URL (replace: filters should not flood history). */
  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(paramString);
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [paramString, pathname, router],
  );

  const setFilters = useCallback(
    (f: ExploreFilters) => {
      update((p) => {
        const written = writeFilters(p, f);
        for (const k of [...p.keys()]) p.delete(k);
        written.forEach((v, k) => p.set(k, v));
      });
    },
    [update],
  );
  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);

  // Data: unfiltered sets for facets / lookups, filtered sets for results.
  const allInvestigations = useInvestigations();
  const allTests = useTests();
  const investigationsQ = useInvestigations(toInvestigationFilters(filters));
  const testsQ = useTests(toTestFilters(filters));

  const platforms = useMemo(() => platformsByInvestigation(allTests.data ?? []), [allTests.data]);
  const byId = useMemo(
    () => new Map((allInvestigations.data ?? []).map((i) => [i.id, i])),
    [allInvestigations.data],
  );
  const hwOptions = useMemo(
    () => hardwareOptions(allInvestigations.data ?? []),
    [allInvestigations.data],
  );
  const pBounds = useMemo(
    () => pressureBounds(allInvestigations.data ?? [], allTests.data ?? []),
    [allInvestigations.data, allTests.data],
  );

  const investigations = useMemo(
    () => (investigationsQ.data ?? []).filter((i) => matchesInvestigation(i, filters, platforms)),
    [investigationsQ.data, filters, platforms],
  );
  const tests = useMemo(
    () => (testsQ.data ?? []).filter((t) => matchesTest(t, filters, byId)),
    [testsQ.data, filters, byId],
  );

  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((i): i is Investigation => i !== undefined);
  const compared = compareIds
    .map((id) => byId.get(id))
    .filter((i): i is Investigation => i !== undefined);

  // Selection (max 3) with an inline, self-clearing message.
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      update((p) => {
        const rest = selectedIds.filter((x) => x !== id);
        if (rest.length) p.set("sel", rest.join(","));
        else p.delete("sel");
      });
      return;
    }
    if (selectedIds.length >= 3) {
      setMessage("You can compare up to 3 investigations. Remove one first.");
      return;
    }
    update((p) => p.set("sel", [...selectedIds, id].join(",")));
  };

  const viewTests = (id: string) =>
    update((p) => {
      p.set("tab", "tests");
      p.set("inv", id);
    });

  const invFilterName = filters.investigationId
    ? byId.get(filters.investigationId)?.name
    : undefined;
  const filterCount = activeFilterCount(filters);
  const loading = tab === "investigations" ? investigationsQ.isLoading : testsQ.isLoading;
  const resultCount = tab === "investigations" ? investigations.length : tests.length;
  const resultLabel = `${tab === "investigations" ? "investigation" : "test"}${resultCount === 1 ? "" : "s"} match`;

  return (
    <div className="grid gap-8 pb-28 lg:grid-cols-[18rem_minmax(0,1fr)] lg:pb-10">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] space-y-5 overflow-y-auto rounded-card border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl">
              Filters
              {filterCount > 0 ? (
                <span className="ml-2 rounded-pill bg-ember px-2 text-sm font-bold text-primary-foreground">
                  {filterCount}
                  <span className="sr-only"> active</span>
                </span>
              ) : null}
            </h2>
            {filterCount > 0 ? (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="min-h-11 gap-1 px-2 text-sm"
              >
                <RotateCcw className="size-4" aria-hidden />
                Reset filters
              </Button>
            ) : null}
          </div>
          <Filters
            value={filters}
            onChange={setFilters}
            hardwareOptions={hwOptions}
            pressureBounds={pBounds}
            debounceSearch
          />
        </div>
      </aside>

      <div className="min-w-0">
        <Tabs
          value={tab}
          onValueChange={(v) =>
            update((p) => {
              if (v === "tests") p.set("tab", "tests");
              else p.delete("tab");
            })
          }
          className="gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="h-auto rounded-xl bg-surface-raised p-1">
              <TabsTrigger value="investigations" className="min-h-11 rounded-lg px-4 text-base">
                Investigations
              </TabsTrigger>
              <TabsTrigger value="tests" className="min-h-11 rounded-lg px-4 text-base">
                Per-test data
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <MobileFilters
                value={filters}
                onApply={setFilters}
                hardwareOptions={hwOptions}
                pressureBounds={pBounds}
              />
              {filterCount > 0 ? (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="min-h-11 px-3 text-sm lg:hidden"
                >
                  Reset
                </Button>
              ) : null}
            </div>
          </div>

          <h2 className="sr-only">Results</h2>
          <p className="text-base text-muted-foreground" role="status" aria-live="polite">
            {loading ? (
              "Loading…"
            ) : (
              <>
                <CountUp id="explore-results" value={resultCount} /> {resultLabel}
              </>
            )}
          </p>

          <TabsContent value="investigations" className="text-base">
            <CompareTray
              selected={selected}
              message={message}
              onRemove={toggleSelect}
              onCompare={() => update((p) => p.set("compare", selectedIds.join(",")))}
            />
            {investigationsQ.error ? (
              <ErrorState error={investigationsQ.error} onRetry={investigationsQ.refetch} />
            ) : investigationsQ.isLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : investigations.length === 0 ? (
              <EmptyState what="investigations" onReset={resetFilters} />
            ) : (
              <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {investigations.map((inv, i) => (
                  <li
                    key={inv.id}
                    className="stagger-item min-w-0"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <InvestigationCard
                      inv={inv}
                      selected={selectedIds.includes(inv.id)}
                      onToggleSelect={toggleSelect}
                      onViewTests={viewTests}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4 text-base">
            {filters.investigationId ? (
              <p className="flex flex-wrap items-center gap-2 text-base">
                Showing tests for
                <span className="inline-flex min-h-11 items-center gap-1 rounded-pill border border-cyan/50 bg-cyan/10 pl-3 font-semibold">
                  {invFilterName ?? filters.investigationId}
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, investigationId: "" })}
                    aria-label="Show tests for all investigations"
                    className="flex size-11 items-center justify-center rounded-pill text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              </p>
            ) : null}
            {testsQ.error ? (
              <ErrorState error={testsQ.error} onRetry={testsQ.refetch} />
            ) : testsQ.isLoading ? (
              <CardSkeleton />
            ) : tests.length === 0 ? (
              <EmptyState what="tests" onReset={resetFilters} />
            ) : (
              <TestsTable
                rows={tests}
                view={fuelView}
                onViewChange={(v) =>
                  update((p) => {
                    if (v === "all") p.delete("fc");
                    else p.set("fc", v);
                  })
                }
                csvUrl={exportCsvUrl({
                  ...toTestFilters(filters),
                  fuel_class: fuelView === "all" ? toTestFilters(filters).fuel_class : fuelView,
                })}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CompareView
        open={compareIds.length > 0}
        investigations={compared}
        onOpenChange={(o) => {
          if (!o) update((p) => p.delete("compare"));
        }}
      />
    </div>
  );
}

export { ExploreClient };
