"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NotInData } from "@/components/ui/not-in-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PILLAR_LABEL } from "@/lib/filters";
import { HABITAT_CHOICES, type ConfirmedHabitat } from "@/lib/habitats";
import {
  DISTANCE_LABELS,
  NEARBY_RADIUS,
  hasNearbyEvidence,
  type RankedInvestigation,
} from "@/lib/relevance";
import { cn } from "@/lib/utils";

type HabitatFinderProps = {
  habitat: ConfirmedHabitat | null;
  onSelect: (id: string) => void;
  ranked: readonly RankedInvestigation[];
  includeAll: boolean;
  onIncludeAllChange: (v: boolean) => void;
  fuelLabel: string;
  onHoverInvestigation: (id: string | null) => void;
};

const LABEL_VARIANT: Record<string, "risk-low" | "cyan" | "default" | "preliminary"> = {
  "Very close": "risk-low",
  Close: "cyan",
  Nearby: "preliminary",
  Far: "default",
};

function HabitatChips({ habitat, onSelect }: Pick<HabitatFinderProps, "habitat" | "onSelect">) {
  return (
    <div role="group" aria-label="Habitat" className="flex flex-wrap gap-2">
      {HABITAT_CHOICES.map((h) => {
        const pending = h.status === "TBC";
        const active = habitat?.id === h.id;
        const chip = (
          <button
            type="button"
            aria-pressed={pending ? undefined : active}
            aria-disabled={pending || undefined}
            onClick={() => {
              if (!pending) onSelect(h.id);
            }}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-colors",
              pending &&
                "cursor-not-allowed border-dashed border-border text-muted-foreground opacity-70",
              !pending && active && "border-ember/70 bg-ember/15 text-ember",
              !pending &&
                !active &&
                "border-border bg-surface-raised text-foreground hover:border-ember/40",
            )}
          >
            <span
              aria-hidden
              className="size-3 rounded-sm border"
              style={{ backgroundColor: h.color, borderColor: h.color }}
            />
            {h.label}
            {pending ? <span className="text-xs font-normal">(values pending)</span> : null}
          </button>
        );
        return pending ? (
          <Tooltip key={h.id}>
            <TooltipTrigger render={chip} />
            <TooltipContent className="bg-popover text-sm text-popover-foreground">
              Values pending: {h.note}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span key={h.id}>{chip}</span>
        );
      })}
    </div>
  );
}

function HabitatFinder({
  habitat,
  onSelect,
  ranked,
  includeAll,
  onIncludeAllChange,
  fuelLabel,
  onHoverInvestigation,
}: HabitatFinderProps) {
  const [showMore, setShowMore] = useState(false);
  const list = ranked.slice(0, showMore ? 10 : 5);
  const evidence = hasNearbyEvidence(ranked);

  return (
    <Card id="finder" className="scroll-mt-28 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl">Habitat Relevance Finder</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Pick a habitat to rank the experiments run closest to its atmosphere.
          </p>
        </div>
        <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
      </div>

      <HabitatChips habitat={habitat} onSelect={onSelect} />

      <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-base">
        <input
          type="checkbox"
          role="switch"
          checked={includeAll}
          onChange={(e) => onIncludeAllChange(e.target.checked)}
          className="size-5 accent-[var(--fs-ember)]"
        />
        Include all fuel classes in ranking
        <span className="text-sm text-muted-foreground">
          (ranking only; the map still shows {fuelLabel.toLowerCase()})
        </span>
      </label>

      {habitat === null ? (
        <p className="text-base text-muted-foreground">
          Choose a habitat above to see the closest experiments.
        </p>
      ) : (
        <>
          <p
            className="flex items-start gap-2 text-lg font-semibold"
            role="status"
            aria-live="polite"
          >
            <MapPin className="mt-1 size-5 shrink-0 text-ember" aria-hidden />
            Closest experiments to {habitat.label} ({habitat.o2_percent} % O₂,{" "}
            {habitat.pressure_psi} psi)
          </p>

          {!evidence ? (
            <NotInData detail="No tests were run near these conditions in the indexed data." />
          ) : (
            <>
              <ol className="space-y-3">
                {list.map((r, i) => (
                  <li
                    key={r.investigation.id}
                    onMouseEnter={() => onHoverInvestigation(r.investigation.id)}
                    onMouseLeave={() => onHoverInvestigation(null)}
                    onFocus={() => onHoverInvestigation(r.investigation.id)}
                    onBlur={() => onHoverInvestigation(null)}
                    className="rounded-xl border border-border bg-surface-raised p-4 transition-colors hover:border-ember/50"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="flex size-9 items-center justify-center rounded-pill bg-ember/15 font-extrabold text-ember">
                        {i + 1}
                      </span>
                      <Link
                        href={`/explore?tab=investigations&q=${encodeURIComponent(r.investigation.name)}`}
                        className="min-h-11 content-center text-lg font-bold underline-offset-4 hover:underline"
                      >
                        {r.investigation.name}
                      </Link>
                      <Badge variant="cyan">{PILLAR_LABEL[r.investigation.pillar]}</Badge>
                      <Badge variant={LABEL_VARIANT[r.label] ?? "default"}>{r.label}</Badge>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-muted-foreground">Nearest test</dt>
                        <dd className="tabular-nums">
                          {r.closestTest.o2_percent} %, {r.closestTest.pressure_psi} psi
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Tests in band</dt>
                        <dd className="tabular-nums">{r.testsInBand}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Tests nearby</dt>
                        <dd className="tabular-nums">{r.testsNearby}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Ended early (nearby)</dt>
                        <dd className="tabular-nums">
                          {r.endedEarlyShare === null
                            ? "–"
                            : `${Math.round(r.endedEarlyShare * 100)} %`}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
              {ranked.length > 5 ? (
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  aria-expanded={showMore}
                  className="min-h-11 text-base font-semibold text-cyan hover:underline"
                >
                  {showMore ? "Show fewer" : `Show more (${Math.min(ranked.length, 10) - 5})`}
                </button>
              ) : null}
            </>
          )}

          <details className="group rounded-xl border border-border p-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-base font-semibold">
              How this ranking works
              <ChevronDown
                className="size-5 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="mt-2 space-y-2 text-base text-muted-foreground">
              <p>
                Each test is a point on the map. Its distance to the habitat is √(((O₂ − O₂ₕ) /
                100)² + ((p − pₕ) / 16)²), so both axes count by their share of the chart range.
              </p>
              <p>
                An investigation ranks by its closest test. &ldquo;Nearby&rdquo; means a distance of{" "}
                {NEARBY_RADIUS} or less; labels:{" "}
                {DISTANCE_LABELS.filter((l) => Number.isFinite(l.max))
                  .map((l) => `${l.label} ≤ ${l.max}`)
                  .join(", ")}
                , otherwise Far. &ldquo;In band&rdquo; uses the illustrative shaded box.
              </p>
            </div>
          </details>
        </>
      )}
    </Card>
  );
}

export { HabitatFinder };
