import { FACTORS, MAX_SCORE } from "@/lib/insights";
import type { Insight } from "@/lib/types";
import { cn } from "@/lib/utils";

type ScoreBreakdownProps = {
  insight: Pick<
    Insight,
    "safety_impact" | "evidence_strength" | "mission_relevance" | "score_reason"
  >;
  score: number;
};

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="meter"
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-label={`${label}: ${value} out of 5`}
      className="flex gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden
          className={cn(
            "h-3 w-6 rounded-sm border sm:w-8",
            n <= value ? "border-ember bg-ember" : "border-border bg-surface",
          )}
        />
      ))}
    </div>
  );
}

/** Total plus three 1-5 meters with numbers and one-line definitions (works without colour or hover). */
function ScoreBreakdown({ insight, score }: ScoreBreakdownProps) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="text-lg font-bold">
        Score <span className="text-2xl text-ember tabular-nums">{score}</span>
        <span className="text-muted-foreground"> / {MAX_SCORE}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground tabular-nums">
        {insight.safety_impact} × {insight.evidence_strength} × {insight.mission_relevance} ={" "}
        {score}
      </p>
      <dl className="mt-4 space-y-3">
        {FACTORS.map((f) => (
          <div key={f.key}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <dt className="font-semibold">{f.label}</dt>
              <dd className="flex items-center gap-3">
                <Meter value={insight[f.key]} label={f.label} />
                <span className="w-10 text-right font-bold tabular-nums">{insight[f.key]}/5</span>
              </dd>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{f.definition}</p>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-sm font-semibold">Why these scores</p>
        <p className="mt-1 max-w-[70ch] text-base text-muted-foreground">{insight.score_reason}</p>
      </div>
    </div>
  );
}

export { ScoreBreakdown };
