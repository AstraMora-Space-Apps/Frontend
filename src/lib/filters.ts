/**
 * Explore page filter state: URL (de)serialisation, mapping to the API filter params,
 * and client-side matching for filters the backend does not support (logged in
 * docs/API_ASSUMPTIONS.md). Pure functions only.
 */
import {
  FuelClassSchema,
  PillarSchema,
  PlatformSchema,
  type FuelClass,
  type Investigation,
  type InvestigationFilters,
  type Pillar,
  type Platform,
  type TestFilters,
  type TestRecord,
} from "@/lib/types";

export type NumRange = readonly [number, number];

export type ExploreFilters = {
  q: string;
  pillars: Pillar[];
  fuels: FuelClass[];
  hardware: string;
  /** Oxygen, percent. null = no constraint. */
  o2: NumRange | null;
  /** Total pressure, psi. null = no constraint. */
  pressure: NumRange | null;
  platforms: Platform[];
  /** Set by "View tests" on a card. Test tab only. */
  investigationId: string;
};

export const EMPTY_FILTERS: ExploreFilters = {
  q: "",
  pillars: [],
  fuels: [],
  hardware: "",
  o2: null,
  pressure: null,
  platforms: [],
  investigationId: "",
};

export const PILLARS = PillarSchema.options;
export const FUEL_CLASSES = FuelClassSchema.options;
export const PLATFORMS = PlatformSchema.options;
export const O2_BOUNDS: NumRange = [0, 100];

/* ------------------------------------------------------------------ URL */

/** URL keys owned by the filter state. Other keys (tab, sel, compare, fc) are left alone. */
export const FILTER_KEYS = ["q", "pillar", "fuel", "hw", "o2", "p", "platform", "inv"] as const;

function parseList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  const set = new Set(raw.split(","));
  return allowed.filter((v) => set.has(v));
}

function parseRange(raw: string | null, bounds?: NumRange): NumRange | null {
  if (!raw) return null;
  const m = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(raw);
  if (!m) return null;
  let lo = Number(m[1]);
  let hi = Number(m[2]);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) return null;
  if (bounds) {
    lo = Math.max(lo, bounds[0]);
    hi = Math.min(hi, bounds[1]);
  }
  return [lo, hi];
}

const fmtNum = (n: number) => String(Math.round(n * 10) / 10);

export function parseFilters(params: URLSearchParams): ExploreFilters {
  return {
    q: (params.get("q") ?? "").slice(0, 200),
    pillars: parseList(params.get("pillar"), PILLARS),
    fuels: parseList(params.get("fuel"), FUEL_CLASSES),
    hardware: (params.get("hw") ?? "").slice(0, 100),
    o2: parseRange(params.get("o2"), O2_BOUNDS),
    pressure: parseRange(params.get("p")),
    platforms: parseList(params.get("platform"), PLATFORMS),
    investigationId: (params.get("inv") ?? "").slice(0, 100),
  };
}

/** Returns a copy of `base` with the filter keys replaced by `f` (empty values removed). */
export function writeFilters(base: URLSearchParams, f: ExploreFilters): URLSearchParams {
  const next = new URLSearchParams(base);
  for (const k of FILTER_KEYS) next.delete(k);
  const set = (k: (typeof FILTER_KEYS)[number], v: string) => {
    if (v) next.set(k, v);
  };
  set("q", f.q.trim());
  set("pillar", f.pillars.join(","));
  set("fuel", f.fuels.join(","));
  set("hw", f.hardware);
  set("o2", f.o2 ? `${fmtNum(f.o2[0])}-${fmtNum(f.o2[1])}` : "");
  set("p", f.pressure ? `${fmtNum(f.pressure[0])}-${fmtNum(f.pressure[1])}` : "");
  set("platform", f.platforms.join(","));
  set("inv", f.investigationId);
  return next;
}

export function activeFilterCount(f: ExploreFilters): number {
  return [
    f.q.trim() !== "",
    f.pillars.length > 0,
    f.fuels.length > 0,
    f.hardware !== "",
    f.o2 !== null,
    f.pressure !== null,
    f.platforms.length > 0,
    f.investigationId !== "",
  ].filter(Boolean).length;
}

/* ------------------------------------------------------- API mapping */

/**
 * Backend params (assumed) take a single fuel_class / pillar, so we only send them when
 * exactly one is selected; multi-select is applied client-side. Platform has no backend param.
 */
export function toInvestigationFilters(f: ExploreFilters): InvestigationFilters {
  return {
    q: f.q.trim() || undefined,
    hardware: f.hardware || undefined,
    pillar: f.pillars.length === 1 ? f.pillars[0] : undefined,
    fuel_class: f.fuels.length === 1 ? f.fuels[0] : undefined,
    o2_min: f.o2?.[0],
    o2_max: f.o2?.[1],
    pressure_min: f.pressure?.[0],
    pressure_max: f.pressure?.[1],
  };
}

export function toTestFilters(f: ExploreFilters): TestFilters {
  return { ...toInvestigationFilters(f), investigation_id: f.investigationId || undefined };
}

/* --------------------------------------------------- client matching */

const overlaps = (lo: number, hi: number, r: NumRange | null) => !r || (hi >= r[0] && lo <= r[1]);
const inRange = (v: number, r: NumRange | null) => !r || (v >= r[0] && v <= r[1]);
const textMatch = (fields: readonly string[], q: string) => {
  const needle = q.trim().toLowerCase();
  return !needle || fields.some((s) => s.toLowerCase().includes(needle));
};
const sameText = (a: string, b: string) => !b || a.toLowerCase() === b.toLowerCase();

/** Platforms each investigation has tests on (investigations carry no platform field). */
export function platformsByInvestigation(tests: readonly TestRecord[]): Map<string, Set<Platform>> {
  const map = new Map<string, Set<Platform>>();
  for (const t of tests) {
    const set = map.get(t.investigation_id) ?? new Set<Platform>();
    set.add(t.platform);
    map.set(t.investigation_id, set);
  }
  return map;
}

/** Full client-side check. Idempotent with the backend filters, so it is safe to re-apply. */
export function matchesInvestigation(
  inv: Investigation,
  f: ExploreFilters,
  platforms: ReadonlyMap<string, ReadonlySet<Platform>>,
): boolean {
  const { o2_percent: o2, pressure_psi: p } = inv.conditions;
  const invPlatforms = platforms.get(inv.id);
  return (
    (f.pillars.length === 0 || f.pillars.includes(inv.pillar)) &&
    (f.fuels.length === 0 || inv.fuels.some((x) => f.fuels.includes(x.fuel_class))) &&
    (f.platforms.length === 0 || f.platforms.some((pl) => invPlatforms?.has(pl) ?? false)) &&
    sameText(inv.hardware, f.hardware) &&
    overlaps(o2.min, o2.max, f.o2) &&
    overlaps(p.min, p.max, f.pressure) &&
    textMatch([inv.name, inv.objective, inv.hardware, ...inv.fuels.map((x) => x.name)], f.q)
  );
}

export function matchesTest(
  t: TestRecord,
  f: ExploreFilters,
  investigationsById: ReadonlyMap<string, Investigation>,
): boolean {
  const inv = investigationsById.get(t.investigation_id);
  return (
    (!f.investigationId || t.investigation_id === f.investigationId) &&
    (f.fuels.length === 0 || f.fuels.includes(t.fuel_class)) &&
    (f.platforms.length === 0 || f.platforms.includes(t.platform)) &&
    (f.pillars.length === 0 || (inv !== undefined && f.pillars.includes(inv.pillar))) &&
    (!f.hardware || (inv !== undefined && sameText(inv.hardware, f.hardware))) &&
    inRange(t.o2_percent, f.o2) &&
    inRange(t.pressure_psi, f.pressure) &&
    textMatch([t.investigation_name, t.fuel, t.result], f.q)
  );
}

/* ------------------------------------------------------------ facets */

export function hardwareOptions(invs: readonly Investigation[]): string[] {
  return [...new Set(invs.map((i) => i.hardware))].sort((a, b) => a.localeCompare(b));
}

/** Pressure slider bounds (psi) from all investigation ranges and test values. */
export function pressureBounds(
  invs: readonly Investigation[],
  tests: readonly TestRecord[],
): NumRange {
  const values = [
    ...invs.flatMap((i) => [i.conditions.pressure_psi.min, i.conditions.pressure_psi.max]),
    ...tests.map((t) => t.pressure_psi),
  ];
  if (values.length === 0) return [0, 15];
  return [Math.floor(Math.min(...values)), Math.ceil(Math.max(...values))];
}

/* ------------------------------------------------------------ labels */

export const PILLAR_LABEL: Record<Pillar, string> = {
  prevention: "Prevention",
  detection: "Detection",
  suppression: "Suppression",
  supporting: "Supporting",
};
export const FUEL_LABEL: Record<FuelClass, string> = {
  solid: "Solid",
  gas: "Gas",
  liquid: "Liquid",
};
export const PLATFORM_LABEL: Record<Platform, string> = {
  iss: "ISS",
  drop_tower: "Drop tower",
  other: "Other",
};

/** Comma-separated selection list in a URL param (sel / compare). */
export function parseIdList(raw: string | null, max = 3): string[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].slice(0, max);
}
