"use client";

import { useState } from "react";
import {
  ChevronDown,
  CircleAlert,
  Clock,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { QuoteList } from "@/components/ask/QuoteList";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RankedInsight } from "@/lib/insights";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScoreBreakdown } from "./ScoreBreakdown";

const RISK: Record<
  RiskLevel,
  { label: string; variant: "risk-high" | "risk-medium" | "risk-low"; icon: typeof ShieldAlert }
> = {
  high: { label: "High risk", variant: "risk-high", icon: TriangleAlert },
  medium: { label: "Medium risk", variant: "risk-medium", icon: CircleAlert },
  low: { label: "Low risk", variant: "risk-low", icon: ShieldCheck },
};

export const insightAnchor = (id: string) => `insight-${id}`;

type InsightCardProps = { ranked: RankedInsight; highlighted: boolean };

function InsightCard({ ranked, highlighted }: InsightCardProps) {
  const { insight, score, rank } = ranked;
  const [open, setOpen] = useState(false);
  const risk = RISK[insight.risk_level];
  const RiskIcon = risk.icon;
  const detailsId = `${insightAnchor(insight.id)}-details`;

  return (
    <Card
      id={insightAnchor(insight.id)}
      tabIndex={-1}
      role="article"
      aria-labelledby={`${insightAnchor(insight.id)}-title`}
      className={cn(
        "scroll-mt-28 space-y-5 transition-shadow duration-700",
        highlighted && "border-ember shadow-glow-strong",
      )}
    >
      <header className="flex flex-wrap items-start gap-3">
        <span
          className="flex h-11 min-w-11 items-center justify-center rounded-pill bg-ember/15 px-2 text-lg font-extrabold text-ember"
          aria-label={`Rank ${rank}`}
        >
          #{rank}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${insightAnchor(insight.id)}-title`} className="text-xl break-words sm:text-2xl">
            {insight.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={risk.variant}>
              <RiskIcon aria-hidden />
              {risk.label}
            </Badge>
            {insight.reviewed ? (
              <Badge variant="reviewed">
                <ShieldCheck aria-hidden />
                Reviewed
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden />
                Awaiting expert review
              </span>
            )}
            {insight.sample ? <Badge variant="risk-medium">[SAMPLE]</Badge> : null}
            <Badge variant="preliminary" className="max-w-full whitespace-normal">
              v0.1 · preliminary / unverified
            </Badge>
          </div>
        </div>
      </header>

      <p className="max-w-[70ch] text-base text-foreground">{insight.summary}</p>

      <div className="flex max-w-[70ch] items-start gap-3 rounded-xl border border-ember/40 bg-ember/10 p-4">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-ember" aria-hidden />
        <div>
          <p className="text-sm font-bold tracking-wide text-ember uppercase">Recommendation</p>
          <p className="mt-1 text-base font-medium">{insight.recommendation}</p>
        </div>
      </div>

      <ScoreBreakdown insight={insight} score={score} />

      <section aria-label="Sources for this insight">
        <h3 className="mb-2 text-base font-bold">
          Sources{" "}
          <span className="font-normal text-muted-foreground">({insight.citations.length})</span>
        </h3>
        {insight.citations.length > 0 ? (
          <QuoteList citations={insight.citations} />
        ) : (
          <p className="text-base text-muted-foreground">
            Not in the data: no source is attached to this insight.
          </p>
        )}
      </section>

      <div className="border-t border-border pt-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-cyan hover:underline"
        >
          {open ? "Hide details" : "Details"}
          <ChevronDown
            className={cn("size-5 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
        <dl
          id={detailsId}
          hidden={!open}
          className="mt-2 grid gap-2 text-base sm:grid-cols-[12rem_1fr]"
        >
          <dt className="text-muted-foreground">Insight id</dt>
          <dd className="font-mono text-sm">{insight.id}</dd>
          <dt className="text-muted-foreground">Summary</dt>
          <dd className="max-w-[70ch]">{insight.summary}</dd>
          <dt className="text-muted-foreground">Recommendation</dt>
          <dd className="max-w-[70ch]">{insight.recommendation}</dd>
          <dt className="text-muted-foreground">Score reasoning</dt>
          <dd className="max-w-[70ch]">{insight.score_reason}</dd>
          <dt className="text-muted-foreground">Review status</dt>
          <dd>
            {insight.reviewed ? "Checked by a human reviewer" : "Not yet reviewed by a human"}
          </dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>v0.1, preliminary / unverified</dd>
        </dl>
      </div>
    </Card>
  );
}

export { InsightCard };
