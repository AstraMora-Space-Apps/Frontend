"use client";

import { useId, useState } from "react";
import { Check, Table2 } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CitationChip } from "@/components/ui/citation-chip";
import { formatRange } from "@/lib/compare";
import { FUEL_LABEL, PILLAR_LABEL } from "@/lib/filters";
import type { FuelClass, Investigation } from "@/lib/types";
import { cn } from "@/lib/utils";

export const FUEL_BADGE: Record<FuelClass, NonNullable<BadgeProps["variant"]>> = {
  solid: "ember",
  gas: "cyan",
  liquid: "reviewed",
};

function ChipList({ label, items }: { label: string; items: readonly string[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 3);
  const rest = items.length - 3;
  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None listed</p>
      ) : (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {shown.map((s) => (
            <li
              key={s}
              className="rounded-md border border-border bg-surface-raised px-2 py-0.5 text-sm"
            >
              {s}
            </li>
          ))}
          {rest > 0 ? (
            <li>
              <button
                type="button"
                onClick={() => setAll((v) => !v)}
                aria-expanded={all}
                className="min-h-8 rounded-md px-2 text-sm font-semibold text-cyan hover:underline"
              >
                {all ? "Show less" : `+${rest} more`}
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

type InvestigationCardProps = {
  inv: Investigation;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onViewTests: (id: string) => void;
};

function InvestigationCard({ inv, selected, onToggleSelect, onViewTests }: InvestigationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const objectiveId = useId();
  const { o2_percent, pressure_psi, flow_speed_cm_s } = inv.conditions;

  return (
    <Card
      variant={selected ? "glow" : "default"}
      className="flex h-full min-w-0 flex-col gap-4 p-5"
      aria-label={inv.name}
      role="article"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-2xl break-words">{inv.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{inv.hardware}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant="cyan">{PILLAR_LABEL[inv.pillar]}</Badge>
          {inv.sample ? <Badge variant="risk-medium">[SAMPLE]</Badge> : null}
        </div>
      </div>

      <div>
        <p
          id={objectiveId}
          className={cn("text-base text-foreground", !expanded && "line-clamp-3")}
        >
          {inv.objective}
        </p>
        {inv.objective.length > 140 ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={objectiveId}
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 min-h-8 text-sm font-semibold text-cyan hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>

      <div>
        <p className="text-sm font-semibold text-muted-foreground">Fuels</p>
        <ul className="mt-1 space-y-1.5">
          {inv.fuels.map((f) => (
            <li key={f.name} className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={FUEL_BADGE[f.fuel_class]}>{FUEL_LABEL[f.fuel_class]}</Badge>
              <span className="font-medium text-foreground">{f.name}</span>
              <span className="text-muted-foreground">
                {f.sample_shape}, {f.sample_size}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background/40 p-3 text-sm">
        <div>
          <dt className="text-muted-foreground">O₂</dt>
          <dd className="font-semibold tabular-nums">{formatRange(o2_percent, "%")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pressure</dt>
          <dd className="font-semibold tabular-nums">{formatRange(pressure_psi, "psi")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Flow</dt>
          <dd className="font-semibold tabular-nums">{formatRange(flow_speed_cm_s, "cm/s")}</dd>
        </div>
      </dl>

      <ChipList label="Variables" items={inv.variables} />
      <ChipList label="Sensors" items={inv.sensors} />

      <div>
        <p className="text-sm font-semibold text-muted-foreground">
          {inv.citations.length} source{inv.citations.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {inv.citations.map((c, i) => (
            <li key={`${c.paper_title}-${i}`} className="max-w-full min-w-0">
              <CitationChip paper={c.paper_title} page={c.page} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <Badge variant="preliminary" className="self-start">
          v0.1 · preliminary / unverified
        </Badge>
        <div className="flex flex-wrap gap-2">
          <label
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-ember",
              selected
                ? "border-ember/70 bg-ember/15 text-ember"
                : "border-border bg-surface-raised text-foreground hover:border-ember/40",
            )}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(inv.id)}
              aria-label={`Select ${inv.name} to compare`}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "flex size-5 items-center justify-center rounded border",
                selected
                  ? "border-ember bg-ember text-primary-foreground"
                  : "border-muted-foreground",
              )}
            >
              {selected ? <Check className="size-4" /> : null}
            </span>
            {selected ? "Selected" : "Select to compare"}
          </label>
          <button
            type="button"
            onClick={() => onViewTests(inv.id)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan/50 px-3 text-sm font-semibold text-cyan hover:bg-cyan/10"
          >
            <Table2 className="size-4" aria-hidden />
            View tests
          </button>
        </div>
      </div>
    </Card>
  );
}

export { InvestigationCard };
