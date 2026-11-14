"use client";

import { useCallback, useId, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Info, LayoutGrid, Table2 } from "lucide-react";
import { SafetyMarginChart, chartHeight } from "@/components/charts/SafetyMarginChart";
import { ErrorState } from "@/components/explore/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NotInData } from "@/components/ui/not-in-data";
import { HABITATS, isConfirmed, type ConfirmedHabitat, type HabitatId } from "@/lib/habitats";
import { useSafetyMargins } from "@/lib/hooks";
import {
  DEFAULT_MARGIN_SORT,
  MARGIN_SORTS,
  MARGIN_SORT_LABEL,
  classifyAgainstHabitat,
  computeReduction,
  isPaired,
  sortMargins,
  type MarginSort,
} from "@/lib/margins";
import { MARGIN_COLORS } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { MarginDetail } from "./MarginDetail";
import { MarginTable } from "./MarginTable";

/** Habitats offered as reference lines. Numbers always come from habitats.ts. */
const REFERENCE_IDS: readonly HabitatId[] = ["earth", "moon_base"];
const REFERENCES: readonly ConfirmedHabitat[] = HABITATS.filter(isConfirmed).filter((h) =>
  REFERENCE_IDS.includes(h.id),
);
const MOON_BASE = REFERENCES.find((h) => h.id === "moon_base") ?? null;

const parseSort = (raw: string | null): MarginSort =>
  MARGIN_SORTS.find((s) => s === raw) ?? DEFAULT_MARGIN_SORT;

/** Absent = all on (default); "none" = all off; otherwise a comma list of ids. */
function parseHabitats(raw: string | null): ConfirmedHabitat[] {
  if (raw === null) return [...REFERENCES];
  const ids = raw.split(",");
  return REFERENCES.filter((h) => ids.includes(h.id));
}

const HOW_TO_READ =
  "The oxygen limit is the lowest oxygen level at which a flame was sustained in the tests. A lower limit in microgravity means less safety margin. Bars marked 'at least' are bounds: the flame was still burning at the lowest oxygen tested. Definition preliminary, to be confirmed by the science lead.";

function NotAvailable() {
  return (
    <NotInData
      className="py-8"
      detail="Safety-margin data is not available yet. No numbers are shown until the research team publishes paired 1-g and microgravity limits."
    />
  );
}

function SafetyMarginClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramString = params.toString();
  const sortId = useId();

  const sort = parseSort(params.get("sort"));
  const habitats = useMemo(() => parseHabitats(params.get("habitats")), [params]);
  const showUnpaired = params.get("unpaired") === "1";
  const tableView = params.get("view") === "table";
  const selectedId = params.get("sel");

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(paramString);
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [paramString, pathname, router],
  );

  const q = useSafetyMargins();
  const all = useMemo(() => q.data?.margins ?? [], [q.data]);
  const shown = useMemo(
    () => sortMargins(showUnpaired ? all : all.filter(isPaired), sort),
    [all, showUnpaired, sort],
  );
  const selected = shown.find((m) => m.id === selectedId) ?? null;

  const paired = shown.filter(isPaired);
  const unpairedTotal = all.length - all.filter(isPaired).length;
  const belowMoon = MOON_BASE
    ? paired.filter((m) => classifyAgainstHabitat(m, MOON_BASE) === "below").length
    : 0;
  const reductions = paired.map(computeReduction);
  const exact = reductions.filter((r) => r.qualifier === "exact").length;
  const atLeast = reductions.filter((r) => r.qualifier === "at least").length;
  const unknown = reductions.length - exact - atLeast;
  const excluded = q.data?.excluded_non_solid ?? 0;

  const notAvailable =
    (q.error?.kind === "http" && q.error.status === 404) || (q.data !== undefined && !all.length);

  const select = (id: string) =>
    update((p) => (p.get("sel") === id ? p.delete("sel") : p.set("sel", id)));

  const toggleHabitat = (id: HabitatId) =>
    update((p) => {
      const on = habitats.some((h) => h.id === id);
      const next = on
        ? habitats.filter((h) => h.id !== id).map((h) => h.id)
        : REFERENCES.filter((h) => h.id === id || habitats.some((x) => x.id === h.id)).map(
            (h) => h.id,
          );
      if (next.length === REFERENCES.length) p.delete("habitats");
      else p.set("habitats", next.length ? next.join(",") : "none");
    });

  const summary = `${paired.length} paired material${paired.length === 1 ? "" : "s"} shown. ${
    MOON_BASE
      ? `${belowMoon} ${belowMoon === 1 ? "has" : "have"} a microgravity limit at or below ${MOON_BASE.shortLabel} O₂ (${MOON_BASE.o2_percent} %). `
      : ""
  }Reduction: ${exact} exact, ${atLeast} bound (at least)${unknown ? `, ${unknown} cannot be determined` : ""}.`;

  return (
    <div className="space-y-8 pb-10">
      <Card className="space-y-5 p-4 sm:p-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={sortId} className="text-base font-semibold">
              Sort by
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(e) => {
                const s = parseSort(e.target.value);
                update((p) => (s === DEFAULT_MARGIN_SORT ? p.delete("sort") : p.set("sort", s)));
              }}
              className="min-h-11 rounded-lg border border-input bg-surface-raised px-3 text-base"
            >
              {MARGIN_SORTS.map((s) => (
                <option key={s} value={s}>
                  {MARGIN_SORT_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div role="group" aria-label="Habitat reference lines" className="flex flex-wrap gap-2">
            {REFERENCES.map((h) => {
              const on = habitats.some((x) => x.id === h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleHabitat(h.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm font-semibold",
                    on
                      ? "border-ember/70 bg-ember/15 text-foreground"
                      : "border-border bg-surface-raised text-muted-foreground hover:border-ember/40",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-4 w-0 border-l-[3px] border-dashed"
                    style={{ borderColor: h.color }}
                  />
                  {h.shortLabel} {h.o2_percent} %
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-base">
            <input
              type="checkbox"
              role="switch"
              checked={showUnpaired}
              onChange={(e) =>
                update((p) => (e.target.checked ? p.set("unpaired", "1") : p.delete("unpaired")))
              }
              className="size-5 accent-[var(--fs-ember)]"
            />
            Show unpaired materials
            {q.data ? <span className="text-muted-foreground">({unpairedTotal})</span> : null}
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

        {/* Summary strip, computed from the loaded data */}
        <p className="text-base text-muted-foreground" role="status" aria-live="polite">
          {q.isLoading
            ? "Loading safety margins…"
            : q.error || notAvailable
              ? ""
              : summary +
                (excluded
                  ? ` ${excluded} gas-flame record${excluded === 1 ? " is" : "s are"} not shown: gas flames are never compared with solid materials.`
                  : "")}
        </p>

        {/* Key */}
        {!q.isLoading && !q.error && !notAvailable ? (
          <ul
            aria-label="How to read the bars"
            className="flex flex-wrap gap-x-6 gap-y-2 text-base"
          >
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-7 rounded-sm"
                style={{ backgroundColor: MARGIN_COLORS.g1 }}
              />
              1-g (normal gravity)
            </li>
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-7 rounded-sm"
                style={{ backgroundColor: MARGIN_COLORS.microgravity }}
              />
              Microgravity
            </li>
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-7 rounded-sm border-2"
                style={{
                  borderColor: MARGIN_COLORS.microgravity,
                  backgroundImage: `repeating-linear-gradient(-45deg, ${MARGIN_COLORS.microgravity} 0 3px, transparent 3px 8px)`,
                }}
              />
              Hatched, “≤” = bound (at least): flame still burning at the lowest O₂ tested
            </li>
            <li className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-0 border-l-[3px] border-dashed border-foreground"
              />
              Dashed line = habitat O₂
            </li>
          </ul>
        ) : null}

        {/* Chart / table / states */}
        {q.isLoading ? (
          <div
            className="w-full animate-pulse rounded-lg bg-muted"
            style={{ height: chartHeight(8) }}
            aria-hidden
          />
        ) : notAvailable ? (
          <NotAvailable />
        ) : q.error ? (
          <ErrorState error={q.error} onRetry={q.refetch} />
        ) : shown.length === 0 ? (
          <Card className="flex flex-col items-center px-6 py-10 text-center">
            <p className="text-lg font-bold">No paired materials to show</p>
            <p className="mt-1 text-base text-muted-foreground">
              Every material is missing either the 1-g or the microgravity limit.
            </p>
            <Button
              variant="outline"
              size="xl"
              className="mt-5 rounded-xl"
              onClick={() => update((p) => p.set("unpaired", "1"))}
            >
              Show unpaired materials
            </Button>
          </Card>
        ) : tableView ? (
          <MarginTable margins={shown} onSelect={select} />
        ) : (
          <SafetyMarginChart
            margins={shown}
            habitats={habitats}
            selectedId={selected?.id ?? null}
            onSelect={select}
            ariaLabel={`Safety-margin chart: oxygen limit in 1-g versus microgravity for ${shown.length} materials, with habitat oxygen reference lines. ${summary} Use "View as table" for an accessible list.`}
          />
        )}

        {/* How to read this */}
        <div className="flex items-start gap-3 border-t border-border pt-4">
          <Info className="mt-1 size-5 shrink-0 text-cyan" aria-hidden />
          <div className="text-base">
            <p className="font-bold">How to read this</p>
            <p className="mt-1 max-w-[80ch] text-muted-foreground">{HOW_TO_READ}</p>
            <p className="mt-2 max-w-[80ch] text-sm text-muted-foreground">
              Reduction = 1-g limit minus microgravity limit, in percentage points. Positive means
              the flame was sustained at lower oxygen in microgravity.
            </p>
          </div>
        </div>
      </Card>

      {selected ? (
        <MarginDetail margin={selected} habitats={habitats} onClose={() => select(selected.id)} />
      ) : null}
    </div>
  );
}

export { SafetyMarginClient };
