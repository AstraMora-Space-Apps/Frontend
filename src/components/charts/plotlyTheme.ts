/**
 * Shared Plotly theme. Every chart builds its layout from `baseLayout` and passes `baseConfig`.
 * Hard rule 7: chart text >= 16px (axis titles 18px) so it reads on a recorded video.
 */
import type { Config, Layout } from "plotly.js";
import { CHART } from "@/lib/tokens";

export const CHART_FONT_SIZE = 16;
export const AXIS_TITLE_SIZE = 18;
const FALLBACK_FONT = "Inter, system-ui, -apple-system, Segoe UI, sans-serif";

/**
 * next/font gives Inter a generated family name, and SVG attributes cannot resolve CSS
 * variables, so read the computed family from <body> (client only).
 */
export function chartFontFamily(): string {
  if (typeof document === "undefined") return FALLBACK_FONT;
  return getComputedStyle(document.body).fontFamily || FALLBACK_FONT;
}

export function baseLayout(fontFamily: string, compact: boolean): Partial<Layout> {
  return {
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: fontFamily, size: CHART_FONT_SIZE, color: CHART.text },
    margin: compact ? { l: 56, r: 12, t: 16, b: 56 } : { l: 72, r: 24, t: 56, b: 64 },
    hovermode: "closest",
    hoverdistance: 24, // generous hit area for touch
    clickmode: "event",
    dragmode: "zoom",
    hoverlabel: {
      font: { family: fontFamily, size: 15, color: CHART.text },
      bgcolor: CHART.surface,
      bordercolor: CHART.grid,
      align: "left",
    },
    legend: {
      font: { size: CHART_FONT_SIZE, color: CHART.text },
      bgcolor: "rgba(0,0,0,0)",
      orientation: "h",
      x: 0,
      xanchor: "left",
      y: 1.02,
      yanchor: "bottom",
    },
  };
}

export function axisStyle(title: string) {
  return {
    title: { text: title, font: { size: AXIS_TITLE_SIZE, color: CHART.text }, standoff: 12 },
    gridcolor: CHART.grid,
    zerolinecolor: CHART.grid,
    linecolor: CHART.grid,
    tickfont: { size: CHART_FONT_SIZE, color: CHART.textMuted },
    fixedrange: false,
  } as const;
}

export const baseConfig: Partial<Config> = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ["lasso2d", "select2d"],
  scrollZoom: false,
};
