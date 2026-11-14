"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Circle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CitationChip } from "@/components/ui/citation-chip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { downloadCsv, testsToCsv } from "@/lib/csv";
import { FUEL_CLASSES, FUEL_LABEL, PLATFORM_LABEL } from "@/lib/filters";
import { splitByFuelClass, type FuelClass, type TestRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FUEL_BADGE } from "./InvestigationCard";

export type FuelView = "all" | FuelClass;
const PAGE_SIZE = 25;

type SortKey =
  | "investigation_name"
  | "fuel"
  | "fuel_class"
  | "flow_direction"
  | "o2_percent"
  | "pressure_psi"
  | "flow_speed_cm_s"
  | "platform"
  | "ended_early"
  | "spread_rate";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const COLUMNS: ReadonlyArray<{ key: SortKey | "citation"; label: string; numeric?: boolean }> = [
  { key: "investigation_name", label: "Investigation" },
  { key: "fuel", label: "Fuel" },
  { key: "fuel_class", label: "Fuel class" },
  { key: "flow_direction", label: "Flow direction" },
  { key: "o2_percent", label: "O₂ %", numeric: true },
  { key: "pressure_psi", label: "Pressure (psi)", numeric: true },
  { key: "flow_speed_cm_s", label: "Flow speed (cm/s)", numeric: true },
  { key: "platform", label: "Platform" },
  { key: "ended_early", label: "Outcome" },
  { key: "spread_rate", label: "Spread rate", numeric: true },
  { key: "citation", label: "Citation" },
];

export function sortTests(rows: readonly TestRecord[], sort: Sort): TestRecord[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[sort.key];
    const y = b[sort.key];
    if (x === y) return a.id.localeCompare(b.id);
    if (x === null) return 1; // nulls last in both directions
    if (y === null) return -1;
    if (typeof x === "number" && typeof y === "number") return (x - y) * sign;
    return String(x).localeCompare(String(y)) * sign;
  });
}

const ENDED_EARLY_HINT =
  "The flame was still burning when the experiment ended, so the true limit may be lower.";

function Outcome({ endedEarly }: { endedEarly: boolean }) {
  if (!endedEarly) {
    return (
      <Badge variant="default">
        <Circle className="fill-current" aria-hidden />
        Burned to end
      </Badge>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={`Ended early. ${ENDED_EARLY_HINT}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-risk-medium/60 bg-risk-medium/10 px-3 text-sm font-medium text-risk-medium"
          />
        }
      >
        <Circle className="size-4" strokeWidth={2.5} aria-hidden />
        Ended early
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-popover text-sm text-popover-foreground">
        {ENDED_EARLY_HINT}
      </TooltipContent>
    </Tooltip>
  );
}

const num = (v: number | null, digits = 1) => (v === null ? "–" : v.toFixed(digits));

function TestTable({
  title,
  rows,
  sort,
  onSort,
}: {
  title: string;
  rows: readonly TestRecord[];
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => sortTests(rows, sort), [rows, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const slice = sorted.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const from = sorted.length === 0 ? 0 : current * PAGE_SIZE + 1;
  const to = current * PAGE_SIZE + slice.length;

  return (
    <section aria-label={title} className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl">{title}</h3>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {from} to {to} of {sorted.length}
        </p>
      </div>

      {/* md and up: table */}
      <div
        className="hidden overflow-x-auto rounded-card border border-border md:block"
        tabIndex={0}
        aria-label={`${title} table`}
      >
        <table className="w-full min-w-[64rem] border-separate border-spacing-0 text-base">
          <thead>
            <tr>
              {COLUMNS.map((c) => {
                const sortable = c.key !== "citation";
                const active = sortable && sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : sortable
                          ? "none"
                          : undefined
                    }
                    className={cn(
                      "sticky top-0 border-b border-border bg-surface-raised px-3 py-2 text-left text-sm font-semibold whitespace-nowrap text-muted-foreground",
                      c.numeric && "text-right",
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(c.key as SortKey)}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1 hover:text-foreground",
                          active && "text-foreground",
                        )}
                      >
                        {c.label}
                        {active ? (
                          sort.dir === "asc" ? (
                            <ArrowUp className="size-4" aria-hidden />
                          ) : (
                            <ArrowDown className="size-4" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown className="size-4 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((t) => (
              <tr key={t.id} className="hover:bg-surface-raised/50">
                <td className="border-b border-border px-3 py-2 font-medium">
                  {t.investigation_name}
                </td>
                <td className="border-b border-border px-3 py-2">{t.fuel}</td>
                <td className="border-b border-border px-3 py-2">
                  <Badge variant={FUEL_BADGE[t.fuel_class]}>{FUEL_LABEL[t.fuel_class]}</Badge>
                </td>
                <td className="border-b border-border px-3 py-2 capitalize">{t.flow_direction}</td>
                <td className="border-b border-border px-3 py-2 text-right tabular-nums">
                  {num(t.o2_percent)}
                </td>
                <td className="border-b border-border px-3 py-2 text-right tabular-nums">
                  {num(t.pressure_psi)}
                </td>
                <td className="border-b border-border px-3 py-2 text-right tabular-nums">
                  {num(t.flow_speed_cm_s)}
                </td>
                <td className="border-b border-border px-3 py-2">{PLATFORM_LABEL[t.platform]}</td>
                <td className="border-b border-border px-3 py-2">
                  <Outcome endedEarly={t.ended_early} />
                </td>
                <td className="border-b border-border px-3 py-2 text-right tabular-nums">
                  {num(t.spread_rate, 2)}
                </td>
                <td className="border-b border-border px-3 py-2">
                  {t.citation ? (
                    <CitationChip paper={t.citation.paper_title} page={t.citation.page} />
                  ) : (
                    <span className="text-sm text-muted-foreground">No citation</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* below md: stacked cards */}
      <ul className="space-y-3 md:hidden">
        {slice.map((t) => (
          <li key={t.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold">{t.investigation_name}</p>
                <p className="text-sm text-muted-foreground">{t.fuel}</p>
              </div>
              <Badge variant={FUEL_BADGE[t.fuel_class]}>{FUEL_LABEL[t.fuel_class]}</Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-base">
              <div>
                <dt className="text-sm text-muted-foreground">O₂</dt>
                <dd className="tabular-nums">{num(t.o2_percent)} %</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Pressure</dt>
                <dd className="tabular-nums">{num(t.pressure_psi)} psi</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Flow</dt>
                <dd className="capitalize">{t.flow_direction}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Flow speed</dt>
                <dd className="tabular-nums">
                  {t.flow_speed_cm_s === null ? "–" : `${num(t.flow_speed_cm_s)} cm/s`}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Platform</dt>
                <dd>{PLATFORM_LABEL[t.platform]}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Spread rate</dt>
                <dd className="tabular-nums">{num(t.spread_rate, 2)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Outcome endedEarly={t.ended_early} />
              {t.citation ? (
                <CitationChip paper={t.citation.paper_title} page={t.citation.page} />
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 ? (
        <nav aria-label={`${title} pages`} className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            className="min-h-11 px-4"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {current + 1} of {pages}
          </span>
          <Button
            variant="outline"
            className="min-h-11 px-4"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </section>
  );
}

type TestsTableProps = {
  rows: readonly TestRecord[];
  view: FuelView;
  onViewChange: (v: FuelView) => void;
  /** Backend CSV URL (live mode) or null (stub: build client-side). */
  csvUrl: string | null;
};

/** Per-test data. Hard rule 2: "All" renders one sub-table per fuel class, never a mixed table. */
function TestsTable({ rows, view, onViewChange, csvUrl }: TestsTableProps) {
  const [sort, setSort] = useState<Sort>({ key: "investigation_name", dir: "asc" });
  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );

  const groups = splitByFuelClass(rows);
  const visibleRows = view === "all" ? rows : groups[view];
  const tables = view === "all" ? FUEL_CLASSES.filter((fc) => groups[fc].length > 0) : [view];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div
          role="group"
          aria-label="Fuel class"
          className="inline-flex flex-wrap rounded-xl border border-border bg-surface-raised p-1"
        >
          {(["all", ...FUEL_CLASSES] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => onViewChange(v)}
              className={cn(
                "min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors",
                view === v
                  ? "bg-ember text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "all" ? "All" : FUEL_LABEL[v]}
              <span className="ml-1 font-normal opacity-80">
                ({v === "all" ? rows.length : groups[v].length})
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">
          {csvUrl ? (
            <a
              href={csvUrl}
              download
              className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-xl")}
            >
              <Download aria-hidden />
              Download CSV
            </a>
          ) : (
            <Button
              variant="outline"
              size="xl"
              className="rounded-xl"
              disabled={visibleRows.length === 0}
              onClick={() => downloadCsv(testsToCsv(visibleRows))}
            >
              <Download aria-hidden />
              Download CSV
            </Button>
          )}
          <p className="text-sm text-muted-foreground">File is stamped v0.1, unverified.</p>
        </div>
      </div>

      {tables.map((fc) => (
        <TestTable
          key={fc}
          title={`${FUEL_LABEL[fc]}-fuel tests`}
          rows={groups[fc]}
          sort={sort}
          onSort={onSort}
        />
      ))}
    </div>
  );
}

/** Standalone sortable, paginated test table (used by the Coverage Map "View as table"). */
function TestDataTable({ title, rows }: { title: string; rows: readonly TestRecord[] }) {
  const [sort, setSort] = useState<Sort>({ key: "investigation_name", dir: "asc" });
  return (
    <TestTable
      title={title}
      rows={rows}
      sort={sort}
      onSort={(key) =>
        setSort((s) =>
          s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
        )
      }
    />
  );
}

export { TestsTable, TestDataTable };
