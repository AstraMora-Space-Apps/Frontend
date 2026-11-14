"use client";

import { useId } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_INSIGHT_FILTERS,
  SORTS,
  SORT_LABEL,
  isDefaultFilters,
  type InsightFilters,
  type InsightSort,
} from "@/lib/insights";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const RISK_CHIPS: ReadonlyArray<{ value: RiskLevel | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

type InsightControlsProps = {
  value: InsightFilters;
  onChange: (f: InsightFilters) => void;
  count: number;
};

function InsightControls({ value, onChange, count }: InsightControlsProps) {
  const sortId = useId();
  return (
    <div className="space-y-3 rounded-card border border-border bg-surface p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Risk level" className="flex flex-wrap gap-2">
          {RISK_CHIPS.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={value.risk === r.value}
              onClick={() => onChange({ ...value, risk: r.value })}
              className={cn(
                "min-h-11 rounded-pill border px-4 text-sm font-semibold transition-colors",
                value.risk === r.value
                  ? "border-ember/70 bg-ember/15 text-ember"
                  : "border-border bg-surface-raised hover:border-ember/40",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-base">
            <input
              type="checkbox"
              role="switch"
              checked={value.reviewedOnly}
              onChange={(e) => onChange({ ...value, reviewedOnly: e.target.checked })}
              className="size-5 accent-[var(--fs-ember)]"
            />
            Reviewed only
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="text-sm font-semibold">
              Sort by
            </label>
            <select
              id={sortId}
              value={value.sort}
              onChange={(e) => {
                const s = SORTS.find((x) => x === e.target.value);
                if (s) onChange({ ...value, sort: s satisfies InsightSort });
              }}
              className="min-h-11 rounded-lg border border-border bg-surface-raised px-3 text-base"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {SORT_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          {!isDefaultFilters(value) ? (
            <Button
              variant="ghost"
              onClick={() => onChange(DEFAULT_INSIGHT_FILTERS)}
              className="min-h-11 gap-1 px-3 text-sm"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-base text-muted-foreground" role="status" aria-live="polite">
        {count} insight{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export { InsightControls };
