/**
 * Habitat Relevance Finder ranking. Pure functions, no hidden score.
 *
 * Each test is a point in (O2 %, pressure psi) space. Both axes are normalised by their
 * chart range (O2 0-100 %, pressure 0-16 psi) so one unit of distance means the same
 * share of either axis:
 *
 *   d = sqrt( ((o2 - o2_h) / 100)^2 + ((p - p_h) / 16)^2 )
 *
 * An investigation's distance is the distance of its closest test. Investigations are
 * ranked by that distance (ties: more tests nearby first, then name).
 */
import type { ConfirmedHabitat } from "@/lib/habitats";
import type { Investigation, TestRecord } from "@/lib/types";

export const O2_SCALE = 100;
export const PRESSURE_SCALE = 16;
/** Tests within this normalised distance count as "nearby". */
export const NEARBY_RADIUS = 0.15;

/** Plain-language distance labels (upper bounds, inclusive). */
export const DISTANCE_LABELS: ReadonlyArray<{ max: number; label: string }> = [
  { max: 0.03, label: "Very close" },
  { max: 0.08, label: "Close" },
  { max: NEARBY_RADIUS, label: "Nearby" },
  { max: Number.POSITIVE_INFINITY, label: "Far" },
];

export function distanceLabel(d: number): string {
  return DISTANCE_LABELS.find((l) => d <= l.max)?.label ?? "Far";
}

export function testDistance(
  t: Pick<TestRecord, "o2_percent" | "pressure_psi">,
  h: ConfirmedHabitat,
): number {
  const dx = (t.o2_percent - h.o2_percent) / O2_SCALE;
  const dy = (t.pressure_psi - h.pressure_psi) / PRESSURE_SCALE;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Inside the habitat's illustrative display band (see habitats.ts). */
export function inBand(
  t: Pick<TestRecord, "o2_percent" | "pressure_psi">,
  h: ConfirmedHabitat,
): boolean {
  return (
    Math.abs(t.o2_percent - h.o2_percent) <= h.o2_halfwidth &&
    Math.abs(t.pressure_psi - h.pressure_psi) <= h.pressure_halfwidth
  );
}

export type RankedInvestigation = {
  investigation: Investigation;
  /** Normalised distance of the closest test. */
  distance: number;
  label: string;
  closestTest: TestRecord;
  testsInBand: number;
  testsNearby: number;
  /** Share (0-1) of nearby tests that ended early; null when no tests are nearby. */
  endedEarlyShare: number | null;
};

export function rankInvestigations(
  tests: readonly TestRecord[],
  investigations: readonly Investigation[],
  habitat: ConfirmedHabitat,
): RankedInvestigation[] {
  const byInvestigation = new Map<string, TestRecord[]>();
  for (const t of tests) {
    const list = byInvestigation.get(t.investigation_id) ?? [];
    list.push(t);
    byInvestigation.set(t.investigation_id, list);
  }

  const ranked: RankedInvestigation[] = [];
  for (const inv of investigations) {
    const list = byInvestigation.get(inv.id);
    if (!list || list.length === 0) continue;
    let closest = list[0];
    let best = testDistance(closest, habitat);
    for (const t of list) {
      const d = testDistance(t, habitat);
      if (d < best) {
        best = d;
        closest = t;
      }
    }
    const nearby = list.filter((t) => testDistance(t, habitat) <= NEARBY_RADIUS);
    ranked.push({
      investigation: inv,
      distance: best,
      label: distanceLabel(best),
      closestTest: closest,
      testsInBand: list.filter((t) => inBand(t, habitat)).length,
      testsNearby: nearby.length,
      endedEarlyShare: nearby.length
        ? nearby.filter((t) => t.ended_early).length / nearby.length
        : null,
    });
  }

  return ranked.sort(
    (a, b) =>
      a.distance - b.distance ||
      b.testsNearby - a.testsNearby ||
      a.investigation.name.localeCompare(b.investigation.name),
  );
}

/** True when at least one ranked investigation has a test within the nearby radius. */
export const hasNearbyEvidence = (ranked: readonly RankedInvestigation[]) =>
  ranked.some((r) => r.distance <= NEARBY_RADIUS);
