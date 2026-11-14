/** Pure helpers for the Explore compare view. */
import type { FuelClass, Investigation, Range } from "@/lib/types";

export type CompareRow = {
  key: string;
  label: string;
  /** One display value per investigation, same order as the input. */
  values: string[];
  /** true when not every investigation has the same value. */
  differs: boolean;
};

export const formatRange = (r: Range | null, unit: string) =>
  r === null ? "Not reported" : r.min === r.max ? `${r.min} ${unit}` : `${r.min}–${r.max} ${unit}`;

const list = (items: readonly string[]) => (items.length ? items.join(", ") : "None listed");

const ROWS: ReadonlyArray<{ key: string; label: string; get: (i: Investigation) => string }> = [
  { key: "hardware", label: "Hardware", get: (i) => i.hardware },
  { key: "pillar", label: "Pillar", get: (i) => i.pillar },
  { key: "objective", label: "Objective", get: (i) => i.objective },
  {
    key: "fuels",
    label: "Fuels",
    get: (i) => list(i.fuels.map((f) => `${f.name} (${f.fuel_class})`)),
  },
  {
    key: "sample",
    label: "Sample shape and size",
    get: (i) => list(i.fuels.map((f) => `${f.sample_shape}, ${f.sample_size}`)),
  },
  { key: "o2", label: "O₂ range", get: (i) => formatRange(i.conditions.o2_percent, "%") },
  {
    key: "pressure",
    label: "Pressure range",
    get: (i) => formatRange(i.conditions.pressure_psi, "psi"),
  },
  {
    key: "flow",
    label: "Flow speed range",
    get: (i) => formatRange(i.conditions.flow_speed_cm_s, "cm/s"),
  },
  { key: "variables", label: "Variables", get: (i) => list(i.variables) },
  { key: "sensors", label: "Sensors", get: (i) => list(i.sensors) },
  {
    key: "citations",
    label: "Citations",
    get: (i) => `${i.citations.length} source${i.citations.length === 1 ? "" : "s"}`,
  },
];

export function buildCompareRows(invs: readonly Investigation[]): CompareRow[] {
  return ROWS.map(({ key, label, get }) => {
    const values = invs.map(get);
    return { key, label, values, differs: new Set(values).size > 1 };
  });
}

function intersect(sets: ReadonlyArray<readonly string[]>): string[] {
  if (sets.length === 0) return [];
  const [first, ...rest] = sets;
  return [...new Set(first)].filter((v) => rest.every((s) => s.includes(v)));
}

export type Similarities = { fuels: string[]; sensors: string[]; variables: string[] };

export function similarities(invs: readonly Investigation[]): Similarities {
  return {
    fuels: intersect(invs.map((i) => i.fuels.map((f) => f.name))),
    sensors: intersect(invs.map((i) => i.sensors)),
    variables: intersect(invs.map((i) => i.variables)),
  };
}

export function fuelClassesOf(inv: Investigation): Set<FuelClass> {
  return new Set(inv.fuels.map((f) => f.fuel_class));
}

/** Hard rule 2: true when the selection spans more than one fuel class. */
export function mixesFuelClasses(invs: readonly Investigation[]): boolean {
  const all = new Set(invs.flatMap((i) => [...fuelClassesOf(i)]));
  return all.size > 1;
}
