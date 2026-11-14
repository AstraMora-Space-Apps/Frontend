/**
 * Ranked Insights helpers. Pure functions (except the dev-only warning).
 * Score = safety_impact x evidence_strength x mission_relevance (each 1-5, max 125).
 */
import { RiskLevelSchema, type Insight, type RiskLevel } from "@/lib/types";

export const MAX_SCORE = 125;

export const FACTORS = [
  {
    key: "safety_impact",
    label: "Safety impact",
    definition: "How bad the outcome would be for the crew if this goes wrong.",
  },
  {
    key: "evidence_strength",
    label: "Evidence strength",
    definition:
      "How many experiments and repeats support it; flight data counts more than drop tower, and drop tower more than a model.",
  },
  {
    key: "mission_relevance",
    label: "Mission relevance",
    definition:
      "How directly it applies to crew environments such as the ISS, Moon and Mars bases, and rovers.",
  },
] as const satisfies ReadonlyArray<{ key: keyof Insight; label: string; definition: string }>;

export type FactorKey = (typeof FACTORS)[number]["key"];

/** Recomputed score; the UI always displays this value. */
export function recomputeScore(i: Pick<Insight, FactorKey>): number {
  return i.safety_impact * i.evidence_strength * i.mission_relevance;
}

/** Dev-only console warning when the server score disagrees with the formula. */
export function checkScore(i: Insight): number {
  const score = recomputeScore(i);
  if (score !== i.score && process.env.NODE_ENV !== "production") {
    console.warn(`[insights] score mismatch for ${i.id}: server ${i.score}, recomputed ${score}`);
  }
  return score;
}

/* ------------------------------------------------------------ URL state */

export const SORTS = ["score", "safety_impact", "evidence_strength", "mission_relevance"] as const;
export type InsightSort = (typeof SORTS)[number];
export const SORT_LABEL: Record<InsightSort, string> = {
  score: "Score (high to low)",
  safety_impact: "Safety impact",
  evidence_strength: "Evidence strength",
  mission_relevance: "Mission relevance",
};

export type InsightFilters = { risk: RiskLevel | "all"; reviewedOnly: boolean; sort: InsightSort };
export const DEFAULT_INSIGHT_FILTERS: InsightFilters = {
  risk: "all",
  reviewedOnly: false,
  sort: "score",
};

export function parseInsightFilters(params: URLSearchParams): InsightFilters {
  const risk = RiskLevelSchema.safeParse(params.get("risk"));
  const sort = SORTS.find((s) => s === params.get("sort"));
  return {
    risk: risk.success ? risk.data : "all",
    reviewedOnly: params.get("reviewed") === "1",
    sort: sort ?? "score",
  };
}

export function writeInsightFilters(base: URLSearchParams, f: InsightFilters): URLSearchParams {
  const next = new URLSearchParams(base);
  next.delete("risk");
  next.delete("reviewed");
  next.delete("sort");
  if (f.risk !== "all") next.set("risk", f.risk);
  if (f.reviewedOnly) next.set("reviewed", "1");
  if (f.sort !== "score") next.set("sort", f.sort);
  return next;
}

export const isDefaultFilters = (f: InsightFilters) =>
  f.risk === "all" && !f.reviewedOnly && f.sort === "score";

/* -------------------------------------------------------------- ranking */

export type RankedInsight = { insight: Insight; score: number; rank: number };

/**
 * Filters then sorts. Ties break on recomputed score, then title, so order is stable.
 * Ranks are 1-based positions in the resulting list.
 */
export function rankInsights(insights: readonly Insight[], f: InsightFilters): RankedInsight[] {
  return insights
    .filter((i) => (f.risk === "all" || i.risk_level === f.risk) && (!f.reviewedOnly || i.reviewed))
    .map((insight) => ({ insight, score: checkScore(insight) }))
    .sort((a, b) => {
      const primary =
        f.sort === "score" ? b.score - a.score : b.insight[f.sort] - a.insight[f.sort];
      return primary || b.score - a.score || a.insight.title.localeCompare(b.insight.title);
    })
    .map((r, idx) => ({ ...r, rank: idx + 1 }));
}
