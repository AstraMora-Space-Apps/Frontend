"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Info, LayoutGrid, Table2 } from "lucide-react";
import { CoverageMap } from "@/components/charts/CoverageMap";
import { EmptyState, ErrorState } from "@/components/explore/States";
import { TestDataTable } from "@/components/explore/TestsTable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FUEL_LABEL, PLATFORMS, PLATFORM_LABEL } from "@/lib/filters";
import { BAND_FOOTNOTE, DEFAULT_HABITAT_ID, HABITAT_CHOICES, resolveHabitat } from "@/lib/habitats";
import { useInvestigations, useTests } from "@/lib/hooks";
import { FLOW_LABEL, habitatBoxes } from "@/lib/plot";
import { rankInvestigations } from "@/lib/relevance";
import { FLOW_COLORS, FLOW_UNKNOWN_COLOR } from "@/lib/tokens";
import {
  FlowDirectionSchema,
  FuelClassSchema,
  PlatformSchema,
  splitByFuelClass,
  isPlottable,
  testKey,
  type FuelClass,
  type Platform,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { HabitatFinder } from "./HabitatFinder";
import { PointDetail } from "./PointDetail";

const FUEL_SWITCH: ReadonlyArray<{ value: FuelClass; label: string }> = [
  { value: "solid", label: "Solid fuels" },
  { value: "gas", label: "Gas flames" },
  { value: "liquid", label: "Liquid fuels" },
];

/** `fuel` is shared with Explore, where it can be a list: take the first valid class. */
function parseFuel(raw: string | null): FuelClass {
  for (const part of (raw ?? "").split(",")) {
    const r = FuelClassSchema.safeParse(part);
    if (r.success) return r.data;
  }
  return "solid";
}

function parsePlatforms(raw: string | null): Platform[] {
  return (raw ?? "")
    .split(",")
    .map((p) => PlatformSchema.safeParse(p))
    .flatMap((r) => (r.success ? [r.data] : []));
}

function CoverageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramString = params.toString();

  const fuel = parseFuel(params.get("fuel"));
  const platforms = useMemo(() => parsePlatforms(params.get("platform")), [params]);
  const habitatParam = params.get("habitat");
  const habitat = resolveHabitat(habitatParam ?? DEFAULT_HABITAT_ID);
  const showZones = params.get("zones") !== "off";
  const tableView = params.get("view") === "table";

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(paramString);
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [paramString, pathname, router],
  );

  const [includeAll, setIncludeAll] = useState(false);
  const [hoveredInv, setHoveredInv] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const testsQ = useTests();
  const investigationsQ = useInvestigations();

  const filtered = useMemo(
    () =>
      (testsQ.data ?? []).filter((t) => platforms.length === 0 || platforms.includes(t.platform)),
    [testsQ.data, platforms],
  );
  const byClass = useMemo(() => splitByFuelClass(filtered), [filtered]);
  const ofClass = byClass[fuel]; // Hard rule 2: exactly one fuel class on the axes
  // Tests without O2 or pressure cannot be placed; they stay in the table view.
  const plotted = useMemo(() => ofClass.filter(isPlottable), [ofClass]);
  const unplaced = ofClass.length - plotted.length;
  const endedEarly = plotted.filter((t) => t.ended_early === true).length;
  const outcomeUnknown = plotted.filter((t) => t.ended_early === null).length;

  const zones = useMemo(() => (showZones ? habitatBoxes(HABITAT_CHOICES) : []), [showZones]);
  const ranked = useMemo(
    () =>
      habitat
        ? rankInvestigations(includeAll ? filtered : plotted, investigationsQ.data ?? [], habitat)
        : [],
    [habitat, includeAll, filtered, plotted, investigationsQ.data],
  );
  const highlight = useMemo(
    () => (hoveredInv ? plotted.filter((t) => t.investigation_id === hoveredInv) : []),
    [hoveredInv, plotted],
  );
  const selectedTest = plotted.find((t) => testKey(t) === selectedTestId) ?? null;

  const summary =
    `${plotted.length} ${FUEL_LABEL[fuel].toLowerCase()}-fuel test${plotted.length === 1 ? "" : "s"} plotted, ${endedEarly} ended early` +
    (outcomeUnknown ? `, outcome not reported for ${outcomeUnknown}` : "") +
    "." +
    (unplaced
      ? ` ${unplaced} more ${unplaced === 1 ? "has" : "have"} no O₂ or pressure value and ${unplaced === 1 ? "is" : "are"} only in the table view.`
      : "");
  const loading = testsQ.isLoading || investigationsQ.isLoading;
  const error = testsQ.error ?? investigationsQ.error;

  return (
    <div className="space-y-8 pb-10">
      <Card className="space-y-5 p-4 sm:p-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div
              role="group"
              aria-label="Fuel class plotted"
              className="inline-flex flex-wrap rounded-xl border border-border bg-surface-raised p-1"
            >
              {FUEL_SWITCH.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={fuel === f.value}
                  onClick={() => {
                    setSelectedTestId(null);
                    update((p) => p.set("fuel", f.value));
                  }}
                  className={cn(
                    "min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors",
                    fuel === f.value
                      ? "bg-ember text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                  <span className="ml-1 font-normal opacity-80">({byClass[f.value].length})</span>
                </button>
              ))}
            </div>
            <p className="flex max-w-xl items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
              Gas flames and solid fuels are different experiments, so they are never plotted
              together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Platform" className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const on = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      update((q) => {
                        const next = on ? platforms.filter((x) => x !== p) : [...platforms, p];
                        if (next.length) q.set("platform", next.join(","));
                        else q.delete("platform");
                      })
                    }
                    className={cn(
                      "min-h-11 rounded-pill border px-4 text-sm font-medium",
                      on
                        ? "border-ember/70 bg-ember/15 text-ember"
                        : "border-border bg-surface-raised hover:border-ember/40",
                    )}
                  >
                    {PLATFORM_LABEL[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-base">
            <input
              type="checkbox"
              role="switch"
              checked={showZones}
              onChange={(e) =>
                update((p) => (e.target.checked ? p.delete("zones") : p.set("zones", "off")))
              }
              className="size-5 accent-[var(--fs-ember)]"
            />
            Show habitat zones
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
            <button
              type="button"
              aria-pressed={tableView}
              onClick={() => update((p) => (tableView ? p.delete("view") : p.set("view", "table")))}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 text-sm font-semibold hover:border-ember/40"
            >
              {tableView ? (
                <LayoutGrid className="size-4" aria-hidden />
              ) : (
                <Table2 className="size-4" aria-hidden />
              )}
              {tableView ? "View as chart" : "View as table"}
            </button>
          </div>
        </div>

        <p className="text-base text-muted-foreground" role="status" aria-live="polite">
          {loading ? "Loading tests…" : error ? "" : summary}
        </p>

        {/* Chart / table */}
        {error ? (
          <ErrorState
            error={error}
            onRetry={() => {
              testsQ.refetch();
              investigationsQ.refetch();
            }}
          />
        ) : loading ? (
          <div
            className="h-[420px] w-full animate-pulse rounded-lg bg-muted md:h-[560px]"
            aria-hidden
          />
        ) : ofClass.length === 0 ? (
          <EmptyState
            what={`${FUEL_LABEL[fuel].toLowerCase()}-fuel tests`}
            onReset={() => update((p) => p.delete("platform"))}
          />
        ) : tableView ? (
          <TestDataTable title={`${FUEL_LABEL[fuel]}-fuel tests`} rows={ofClass} />
        ) : (
          <CoverageMap
            tests={plotted}
            zones={zones}
            selectedHabitatId={habitat?.id ?? null}
            highlight={highlight}
            selectedTest={selectedTest}
            onPointClick={setSelectedTestId}
            ariaLabel={`Coverage map: oxygen concentration versus total pressure. ${summary} Use "View as table" for an accessible list.`}
          />
        )}

        {/* How to read */}
        <div className="grid gap-4 border-t border-border pt-4 text-base md:grid-cols-[auto_1fr] md:gap-8">
          <ul aria-label="Flow direction colours" className="flex flex-wrap gap-x-5 gap-y-2">
            {FlowDirectionSchema.options.map((d) => (
              <li key={d} className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-4 rounded-full"
                  style={{ backgroundColor: FLOW_COLORS[d] }}
                />
                {FLOW_LABEL[d]}
              </li>
            ))}
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="size-4 rounded-full"
                style={{ backgroundColor: FLOW_UNKNOWN_COLOR }}
              />
              Flow not reported
            </li>
          </ul>
          <ul aria-label="How to read the markers" className="space-y-1 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 size-3.5 shrink-0 rounded-full bg-foreground" />
              <span>
                <strong className="text-foreground">Filled</strong> = flame burned to the end of the
                run (outcome observed).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-1.5 size-3.5 shrink-0 rounded-full border-[2.5px] border-foreground"
              />
              <span>
                <strong className="text-foreground">Hollow</strong> = ended early (flame still
                burning, true limit may be lower).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 size-3 shrink-0 rotate-45 bg-foreground" />
              <span>
                <strong className="text-foreground">Diamond</strong> = outcome not reported (the
                source does not say whether the flame was still burning).
              </span>
            </li>
            <li className="text-sm">{BAND_FOOTNOTE}</li>
          </ul>
        </div>
      </Card>

      {selectedTest && !tableView ? (
        <PointDetail test={selectedTest} onClose={() => setSelectedTestId(null)} />
      ) : null}

      <HabitatFinder
        habitat={habitat}
        onSelect={(id) => update((p) => p.set("habitat", id))}
        ranked={ranked}
        includeAll={includeAll}
        onIncludeAllChange={setIncludeAll}
        fuelLabel={FUEL_SWITCH.find((f) => f.value === fuel)?.label ?? "Solid fuels"}
        onHoverInvestigation={setHoveredInv}
      />
    </div>
  );
}

export { CoverageClient };
