"use client";

import { X } from "lucide-react";
import { QuoteList } from "@/components/ask/QuoteList";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { NotInData } from "@/components/ui/not-in-data";
import { PLATFORM_LABEL } from "@/lib/filters";
import type { ConfirmedHabitat } from "@/lib/habitats";
import {
  classifyAgainstHabitat,
  computeReduction,
  formatLimit,
  formatReduction,
  habitatSentence,
  type LimitKind,
} from "@/lib/margins";
import type { SafetyMargin } from "@/lib/types";
import { cn } from "@/lib/utils";

type MarginDetailProps = {
  margin: SafetyMargin;
  habitats: readonly ConfirmedHabitat[];
  onClose: () => void;
};

const QUALIFIER_TEXT = {
  exact: "Exact: both limits were reached in the tests.",
  "at least":
    "At least: the microgravity flame was still burning at the lowest oxygen tested, so the true reduction may be larger.",
  unknown: "Cannot be determined from the data.",
} as const;

const habitatName = (h: ConfirmedHabitat) => h.shortLabel;

function StatusMark({ status }: { status: ReturnType<typeof classifyAgainstHabitat> }) {
  const text = status === "below" ? "Below" : status === "above" ? "Above" : "Unknown";
  return (
    <span
      className={cn(
        "inline-flex min-w-20 shrink-0 justify-center rounded-pill border px-2 py-0.5 text-sm font-semibold",
        status === "below"
          ? "border-risk-high/60 text-risk-high"
          : status === "above"
            ? "border-risk-low/60 text-risk-low"
            : "border-dashed border-border text-muted-foreground",
      )}
    >
      {text}
    </span>
  );
}

/** Inline panel for a tapped material (not a modal). */
function MarginDetail({ margin: m, habitats, onClose }: MarginDetailProps) {
  const r = computeReduction(m);
  const rows: [string, string][] = [
    ["1-g limit", formatLimit(m.loc_1g_percent, m.loc_1g_is_bound)],
    ["Microgravity limit", formatLimit(m.loc_microgravity_percent, m.loc_microgravity_is_bound)],
    ["Reduction", formatReduction(r)],
    ["Pressure", m.pressure_psi === null ? "Not reported" : `${m.pressure_psi} psi`],
    ["Flow speed", m.flow_speed_cm_s === null ? "Not reported" : `${m.flow_speed_cm_s} cm/s`],
    [
      "Platform (µg)",
      m.platform_microgravity === null ? "Not reported" : PLATFORM_LABEL[m.platform_microgravity],
    ],
  ];
  if (m.category) rows.push(["Category", m.category]);
  const kinds: LimitKind[] = ["microgravity", "1g"];

  return (
    <Card variant="raised" className="relative" aria-live="polite">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close material details"
        className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
      >
        <X className="size-5" aria-hidden />
      </button>
      <div className="flex flex-wrap items-center gap-2 pr-12">
        <h3 className="text-2xl break-words">{m.material}</h3>
        {m.sample ? <Badge variant="risk-medium">[SAMPLE]</Badge> : null}
        <Badge variant="preliminary">Preliminary</Badge>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-base">
            <dt className="w-40 shrink-0 text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-base text-muted-foreground">{QUALIFIER_TEXT[r.qualifier]}</p>

      <div className="mt-5">
        <h4 className="mb-2 text-base font-bold">Against habitats</h4>
        {habitats.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Turn on a habitat reference above to compare.
          </p>
        ) : (
          <ul className="space-y-2">
            {habitats.flatMap((h) =>
              kinds.map((k) => (
                <li key={`${h.id}-${k}`} className="flex items-start gap-3 text-base">
                  <StatusMark status={classifyAgainstHabitat(m, h, k)} />
                  <span className="min-w-0">{habitatSentence(m, h, k, habitatName(h))}</span>
                </li>
              )),
            )}
          </ul>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Compares tested limits with habitat oxygen levels. It is not a safety rating.
        </p>
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-base font-bold">Evidence</h4>
        {m.evidence ? (
          <EvidenceBadge
            testCount={m.evidence.test_count}
            platform={PLATFORM_LABEL[m.evidence.platform]}
            repeats={m.evidence.repeats}
          />
        ) : (
          <p className="text-base text-muted-foreground">Evidence strength not reported.</p>
        )}
      </div>

      <div className="mt-5">
        <h4 className="mb-2 text-base font-bold">Sources</h4>
        {m.citations.length ? (
          <QuoteList citations={m.citations} />
        ) : (
          <NotInData detail="No source is recorded for this material, so these values cannot be checked." />
        )}
      </div>

      {m.note ? (
        <div className="mt-5">
          <h4 className="mb-2 text-base font-bold">Note</h4>
          <p className="max-w-[70ch] text-base text-muted-foreground">{m.note}</p>
        </div>
      ) : null}

      <div className="mt-5 border-t border-border pt-4">
        <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
      </div>
    </Card>
  );
}

export { MarginDetail };
