import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FACTORS, MAX_SCORE } from "@/lib/insights";

/** The ranking formula as a visual: [factor 1-5] × [factor 1-5] × [factor 1-5] = Score. */
function FormulaStrip() {
  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-5">
      <div
        className="flex flex-wrap items-center gap-2 text-base"
        role="img"
        aria-label={`Score equals safety impact times evidence strength times mission relevance, each from 1 to 5, maximum ${MAX_SCORE}.`}
      >
        {FACTORS.map((f, i) => (
          <span key={f.key} className="inline-flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="text-xl font-bold text-muted-foreground">
                ×
              </span>
            ) : null}
            <span
              className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-semibold"
              aria-hidden
            >
              {f.label} <span className="text-sm font-normal text-muted-foreground">1–5</span>
            </span>
          </span>
        ))}
        <span aria-hidden className="text-xl font-bold text-muted-foreground">
          =
        </span>
        <span
          className="rounded-lg bg-ember px-3 py-1.5 font-bold text-primary-foreground"
          aria-hidden
        >
          Score <span className="font-normal">(max {MAX_SCORE})</span>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href="/about#ranking"
          className="inline-flex min-h-11 items-center text-base font-semibold text-cyan underline-offset-4 hover:underline"
        >
          How is this calculated?
        </Link>
        <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
      </div>
    </div>
  );
}

export { FormulaStrip };
