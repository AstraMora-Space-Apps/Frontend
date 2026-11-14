/**
 * Habitat reference atmospheres. The ONLY source of habitat numbers in the app.
 *
 * Centre values come from the project plan. TBC habitats have no numbers until the
 * science lead confirms them: they are listed (disabled) but never drawn or ranked.
 *
 * The *_halfwidth values are DISPLAY BANDS ONLY: they size the shaded boxes on the
 * Coverage Map and the "tests in band" count. They are illustrative reference bands,
 * not specifications. Logged in docs/API_ASSUMPTIONS.md.
 */
import { HABITAT_COLORS } from "@/lib/tokens";

export type HabitatId = "earth" | "moon_base" | "rover" | "spacesuit" | "iss" | "mars";

type HabitatBase = {
  id: HabitatId;
  label: string;
  /** Used on narrow charts where the full label would overflow. */
  shortLabel: string;
  note: string;
  color: string;
  /** Rover shares the Moon Base atmosphere and is drawn/ranked as that one zone. */
  sharesZoneWith?: HabitatId;
};

export type ConfirmedHabitat = HabitatBase & {
  status: "confirmed";
  o2_percent: number;
  pressure_psi: number;
  o2_halfwidth: number;
  pressure_halfwidth: number;
};

export type PendingHabitat = HabitatBase & {
  status: "TBC";
  o2_percent: null;
  pressure_psi: null;
  o2_halfwidth: null;
  pressure_halfwidth: null;
};

export type Habitat = ConfirmedHabitat | PendingHabitat;

const PENDING_NOTE = "Values to be confirmed with the science lead.";

export const HABITATS: readonly Habitat[] = [
  {
    id: "earth",
    label: "Earth",
    shortLabel: "Earth",
    status: "confirmed",
    o2_percent: 21,
    pressure_psi: 14.7,
    o2_halfwidth: 2,
    pressure_halfwidth: 0.5,
    color: HABITAT_COLORS.earth,
    note: "Sea-level air.",
  },
  {
    id: "moon_base",
    label: "Moon Base / pressurised rover",
    shortLabel: "Moon Base / rover",
    status: "confirmed",
    o2_percent: 30,
    pressure_psi: 10.2,
    o2_halfwidth: 2,
    pressure_halfwidth: 0.5,
    color: HABITAT_COLORS.moon_base,
    note: "Planned Moon Base atmosphere, shared by the pressurised rover.",
  },
  {
    id: "rover",
    label: "Pressurised rover",
    shortLabel: "Rover",
    status: "confirmed",
    o2_percent: 30,
    pressure_psi: 10.2,
    o2_halfwidth: 2,
    pressure_halfwidth: 0.5,
    color: HABITAT_COLORS.moon_base,
    note: "Same atmosphere as the Moon Base.",
    sharesZoneWith: "moon_base",
  },
  {
    id: "spacesuit",
    label: "Spacesuit",
    shortLabel: "Spacesuit",
    status: "confirmed",
    o2_percent: 100,
    pressure_psi: 4.3,
    o2_halfwidth: 3,
    pressure_halfwidth: 0.5,
    color: HABITAT_COLORS.spacesuit,
    note: "Pure oxygen at low pressure.",
  },
  {
    id: "iss",
    label: "ISS",
    shortLabel: "ISS",
    status: "TBC",
    o2_percent: null,
    pressure_psi: null,
    o2_halfwidth: null,
    pressure_halfwidth: null,
    color: HABITAT_COLORS.iss,
    note: PENDING_NOTE,
  },
  {
    id: "mars",
    label: "Mars habitat",
    shortLabel: "Mars",
    status: "TBC",
    o2_percent: null,
    pressure_psi: null,
    o2_halfwidth: null,
    pressure_halfwidth: null,
    color: HABITAT_COLORS.mars,
    note: PENDING_NOTE,
  },
];

export const isConfirmed = (h: Habitat): h is ConfirmedHabitat => h.status === "confirmed";

/** Habitats shown as finder chips and map zones (rover folded into Moon Base). */
export const HABITAT_CHOICES: readonly Habitat[] = HABITATS.filter((h) => !h.sharesZoneWith);

export const DEFAULT_HABITAT_ID: HabitatId = "moon_base";

/** Resolves a URL value to a selectable confirmed habitat (rover → moon_base). null if unknown or TBC. */
export function resolveHabitat(raw: string | null): ConfirmedHabitat | null {
  const h = HABITATS.find((x) => x.id === raw);
  if (!h) return null;
  const target = h.sharesZoneWith ? HABITATS.find((x) => x.id === h.sharesZoneWith) : h;
  return target && isConfirmed(target) ? target : null;
}

export const BAND_FOOTNOTE = "Shaded boxes are illustrative reference bands, not specifications.";
