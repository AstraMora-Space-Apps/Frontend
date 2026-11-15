/**
 * Safety-margin helpers (M8, preliminary). Pure functions, no data fetching.
 *
 * Definitions (confirmed by the science lead, 15 Nov):
 * - Oxygen limit = lowest O2 (percent) at which a flame was sustained in the tests.
 * - A "bound" limit means the true limit was not reached (flame still burning at the lowest
 *   O2 tested), so the true limit is AT OR BELOW the value shown.
 * - reduction_points = loc_1g_percent - loc_microgravity_percent (percentage points).
 *   Positive = the material sustained a flame at lower O2 in microgravity: less safety margin.
 *
 * Qualifier logic for the reduction (true values marked *):
 * - both exact: reduction is exact.
 * - microgravity bound, 1-g exact: ug* <= ug, so reduction* = g1 - ug* >= shown: "at least".
 * - 1-g bound, microgravity exact: g1* <= g1, so reduction* <= shown. Only an upper limit is
 *   known: "unknown". If shown <= 0 the direction is certain (not reduced) but the size is not.
 * - both bound: no limit either way: "unknown".
 * - either value missing: "unknown" (unpaired material).
 *
 * Habitat comparison against a limit L (bound or exact) and habitat O2 H:
 * - L <= H: "below" (at or below; a bound only lowers the true value, so this is certain).
 * - L > H and exact: "above".
 * - L > H and bound: "unknown" (the true limit could be on either side of H).
 * - L missing: "unknown".
 */
import type { ConfirmedHabitat } from "@/lib/habitats";
import type { SafetyMargin } from "@/lib/types";

export type ReductionQualifier = "exact" | "at least" | "unknown";
export type ReductionDirection = "reduced" | "not reduced" | "unknown";

export type Reduction = {
  /** Percentage points (1-g minus microgravity). null when it cannot be determined. */
  value: number | null;
  qualifier: ReductionQualifier;
  /** Whether the microgravity limit is lower than the 1-g limit, when that is certain. */
  direction: ReductionDirection;
};

/** Avoids float noise such as 3.4999999 in labels. */
const round1 = (n: number) => Math.round(n * 10) / 10;

export function isPaired(m: SafetyMargin): boolean {
  return m.loc_1g_percent !== null && m.loc_microgravity_percent !== null;
}

export function computeReduction(m: SafetyMargin): Reduction {
  const g1 = m.loc_1g_percent;
  const ug = m.loc_microgravity_percent;
  if (g1 === null || ug === null)
    return { value: null, qualifier: "unknown", direction: "unknown" };
  const v = round1(g1 - ug);
  if (!m.loc_1g_is_bound && !m.loc_microgravity_is_bound) {
    return { value: v, qualifier: "exact", direction: v > 0 ? "reduced" : "not reduced" };
  }
  if (!m.loc_1g_is_bound && m.loc_microgravity_is_bound) {
    // True reduction >= v. Direction is certain only when v > 0.
    return { value: v, qualifier: "at least", direction: v > 0 ? "reduced" : "unknown" };
  }
  if (m.loc_1g_is_bound && !m.loc_microgravity_is_bound) {
    // True reduction <= v. If v <= 0 the microgravity limit is certainly not lower.
    return { value: null, qualifier: "unknown", direction: v <= 0 ? "not reduced" : "unknown" };
  }
  return { value: null, qualifier: "unknown", direction: "unknown" };
}

export type LimitKind = "microgravity" | "1g";
export type HabitatStatus = "below" | "above" | "unknown";

function limitOf(m: SafetyMargin, kind: LimitKind): { value: number | null; bound: boolean } {
  return kind === "microgravity"
    ? { value: m.loc_microgravity_percent, bound: m.loc_microgravity_is_bound }
    : { value: m.loc_1g_percent, bound: m.loc_1g_is_bound };
}

/** Compares a tested limit with a confirmed habitat's O2 (from habitats.ts). See header. */
export function classifyAgainstHabitat(
  m: SafetyMargin,
  habitat: ConfirmedHabitat,
  kind: LimitKind = "microgravity",
): HabitatStatus {
  const { value, bound } = limitOf(m, kind);
  if (value === null) return "unknown";
  if (value <= habitat.o2_percent) return "below";
  return bound ? "unknown" : "above";
}

/** Shown limit with its qualifier, e.g. "17 %", "≤ 17 %", or "Not reported". */
export function formatLimit(value: number | null, bound: boolean): string {
  if (value === null) return "Not reported";
  return `${bound ? "≤ " : ""}${round1(value)} %`;
}

export function formatReduction(r: Reduction): string {
  if (r.value === null) {
    return r.direction === "not reduced"
      ? "Not lower in microgravity (size unknown)"
      : "Cannot be determined";
  }
  const n = `${r.value > 0 ? "+" : ""}${r.value} points`;
  return r.qualifier === "at least" ? `at least ${n}` : n;
}

/**
 * One "Against habitats" sentence. States the tested limit only; never claims real-world safety.
 */
export function habitatSentence(
  m: SafetyMargin,
  habitat: ConfirmedHabitat,
  kind: LimitKind,
  habitatName: string,
): string {
  const { value, bound } = limitOf(m, kind);
  const who = kind === "microgravity" ? "Microgravity limit" : "1-g limit";
  const status = classifyAgainstHabitat(m, habitat, kind);
  const target = `${habitatName} O₂ (${habitat.o2_percent} %)`;
  if (status === "unknown" || value === null) {
    return value === null
      ? `${who}: cannot be determined from the data (not reported).`
      : `${who} ${formatLimit(value, bound)} vs ${target}: cannot be determined from the data (the true limit could be on either side).`;
  }
  const shown = formatLimit(value, bound);
  if (status === "below") {
    const verb = value === habitat.o2_percent ? "equals" : "is below";
    return `${who} ${shown} ${verb} ${target}.`;
  }
  return `${who} ${shown} is above ${target}.`;
}

export const MARGIN_SORTS = ["reduction", "lowest_ug", "name"] as const;
export type MarginSort = (typeof MARGIN_SORTS)[number];
export const MARGIN_SORT_LABEL: Record<MarginSort, string> = {
  reduction: "Largest reduction",
  lowest_ug: "Lowest microgravity limit",
  name: "Material name",
};
export const DEFAULT_MARGIN_SORT: MarginSort = "reduction";

const byName = (a: SafetyMargin, b: SafetyMargin) =>
  a.material.localeCompare(b.material, undefined, { numeric: true, sensitivity: "base" });

/** Nulls (unknown) always sort last; ties broken by material name. Returns a new array. */
export function sortMargins(list: readonly SafetyMargin[], sort: MarginSort): SafetyMargin[] {
  const key = (m: SafetyMargin): number | null =>
    sort === "reduction"
      ? computeReduction(m).value
      : sort === "lowest_ug"
        ? m.loc_microgravity_percent
        : null;
  return [...list].sort((a, b) => {
    if (sort === "name") return byName(a, b);
    const ka = key(a);
    const kb = key(b);
    if (ka === null && kb === null) return byName(a, b);
    if (ka === null) return 1;
    if (kb === null) return -1;
    const d = sort === "reduction" ? kb - ka : ka - kb;
    return d !== 0 ? d : byName(a, b);
  });
}
