/**
 * Token values for places CSS variables cannot reach (metadata, Plotly config).
 * Must mirror the --fs-* variables in src/app/globals.css.
 */
import type { FlowDirection } from "@/lib/types";

export const THEME_COLOR = "#070B14";

/** Chart tokens (Plotly renders to SVG/canvas and cannot read CSS variables). */
export const CHART = {
  text: "#F4F6FB",
  textMuted: "#9FB0CC",
  grid: "#1E2A44",
  surface: "#0E1626",
  /** surface at 85% opacity, for chart labels over data. */
  labelBg: "rgba(14,22,38,0.85)",
  ember: "#FF6B2C",
} as const;

/** Colour-blind-safe (Okabe-Ito) palette for flow direction. Meaning is also in legend text. */
export const FLOW_COLORS: Record<FlowDirection, string> = {
  opposed: "#56B4E9",
  concurrent: "#F0E442",
  quiescent: "#CC79A7",
};

/** Flow direction not reported: neutral grey, labelled in legend and hover. */
export const FLOW_UNKNOWN_COLOR = "#9FB0CC";

/** Muted hues for habitat reference bands (drawn at 0.15 opacity with a 1px border). */
export const HABITAT_COLORS = {
  earth: "#8FBC8F",
  moon_base: "#C9C9E8",
  spacesuit: "#E8A87C",
  iss: "#9FB0CC",
  mars: "#D98C6B",
} as const;
