"use client";

import { useMemo, useState } from "react";
import type { Annotation, Data, Layout, PlotMouseEvent, Shape } from "plotly.js";
import Plot from "@/components/charts/Plot";
import {
  axisStyle,
  baseConfig,
  baseLayout,
  chartFontFamily,
  CHART_FONT_SIZE,
} from "@/components/charts/plotlyTheme";
import type { ConfirmedHabitat } from "@/lib/habitats";
import { formatLimit } from "@/lib/margins";
import { CHART, MARGIN_COLORS } from "@/lib/tokens";
import type { SafetyMargin } from "@/lib/types";
import { useMediaQuery } from "@/lib/use-media-query";

const ROW_PX = 56;
const MIN_HEIGHT = 420;

type SafetyMarginChartProps = {
  /** Already sorted; first row is drawn at the top. Solid materials only. */
  margins: readonly SafetyMargin[];
  habitats: readonly ConfirmedHabitat[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
};

/** Breaks a long material name into lines of at most `max` characters for the y axis. */
function wrap(text: string, max: number): string {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.join("<br>");
}

/** Annotation label: the part before " / " (e.g. "Moon Base") plus the O2 from habitats.ts. */
const lineLabel = (h: ConfirmedHabitat) => `${h.shortLabel.split(" / ")[0]} ${h.o2_percent} %`;

export function chartHeight(rows: number): number {
  return Math.max(MIN_HEIGHT, rows * ROW_PX + 140);
}

function barTrace(
  margins: readonly SafetyMargin[],
  kind: "g1" | "microgravity",
  selectedId: string | null,
): Data {
  const name = kind === "g1" ? "1-g" : "Microgravity";
  const color = MARGIN_COLORS[kind];
  const values = margins.map((m) =>
    kind === "g1" ? m.loc_1g_percent : m.loc_microgravity_percent,
  );
  const bounds = margins.map((m) =>
    kind === "g1" ? m.loc_1g_is_bound : m.loc_microgravity_is_bound,
  );
  const labels = values.map((v, i) => formatLimit(v, bounds[i] ?? false));
  const trace: Data = {
    type: "bar",
    orientation: "h",
    name,
    y: margins.map((m) => m.id),
    // Missing values sit at 0 so their "Not reported" label is still visible.
    x: values.map((v) => v ?? 0),
    customdata: margins.map((m) => m.id),
    text: labels.map((l) => (l === "Not reported" ? "not reported" : l)),
    textposition: "outside",
    cliponaxis: false,
    textfont: { size: CHART_FONT_SIZE, color: CHART.text },
    hovertext: margins.map(
      (m, i) =>
        `<b>${m.material}</b><br>${name} limit: ${labels[i]}` +
        (bounds[i] ? "<br>Bound: flame still burning at the lowest O₂ tested" : ""),
    ),
    hovertemplate: "%{hovertext}<extra></extra>",
    marker: {
      color,
      opacity: margins.map((m) => (selectedId && m.id !== selectedId ? 0.45 : 1)),
      // Hard rule 3: bounds are hatched and outlined, so they read without colour.
      pattern: {
        shape: bounds.map((b) => (b ? "/" : "")),
        fillmode: "replace",
        bgcolor: CHART.surface,
        fgcolor: color,
        size: 9,
        solidity: 0.45,
      },
      line: { color, width: bounds.map((b) => (b ? 2.5 : 0)) },
    },
  };
  return trace;
}

/**
 * Horizontal grouped bars: 1-g vs microgravity oxygen limit per material, with dashed habitat
 * reference lines. Height grows with rows; axes are fixed so a phone scrolls the page.
 */
function SafetyMarginChart({
  margins,
  habitats,
  selectedId,
  onSelect,
  ariaLabel,
}: SafetyMarginChartProps) {
  const compact = !useMediaQuery("(min-width: 768px)");
  const [fontFamily] = useState(chartFontFamily);

  const data = useMemo(
    () => [barTrace(margins, "g1", selectedId), barTrace(margins, "microgravity", selectedId)],
    [margins, selectedId],
  );

  const layout = useMemo<Partial<Layout>>(() => {
    const base = baseLayout(fontFamily, compact);
    const sorted = [...habitats].sort((a, b) => a.o2_percent - b.o2_percent);
    const shapes: Partial<Shape>[] = sorted.map((h) => ({
      type: "line",
      xref: "x",
      yref: "paper",
      x0: h.o2_percent,
      x1: h.o2_percent,
      y0: 0,
      y1: 1,
      line: { color: h.color, width: 2.5, dash: "dash" },
      layer: "below", // behind bars, so value labels stay readable
    }));
    // Lowest line labelled to its left, the others to the right, so close lines never overlap.
    const annotations: Partial<Annotation>[] = sorted.map((h, i) => ({
      x: h.o2_percent,
      xref: "x",
      y: 1,
      yref: "paper",
      yanchor: "bottom",
      xanchor: sorted.length > 1 && i === 0 ? "right" : "left",
      xshift: sorted.length > 1 && i === 0 ? -4 : 4,
      text: lineLabel(h),
      showarrow: false,
      font: { size: CHART_FONT_SIZE, color: h.color },
      bgcolor: CHART.labelBg,
    }));
    return {
      ...base,
      showlegend: false, // the HTML key above the chart explains colours and hatching
      barmode: "group",
      bargap: 0.28,
      bargroupgap: 0.08,
      dragmode: false,
      hovermode: "closest",
      margin: compact ? { l: 8, r: 16, t: 40, b: 64 } : { l: 16, r: 32, t: 44, b: 72 },
      xaxis: {
        ...axisStyle("Oxygen limit (% O₂)"),
        range: [0, 100],
        dtick: compact ? 25 : 10,
        fixedrange: true,
      },
      yaxis: {
        type: "category",
        tickmode: "array",
        tickvals: margins.map((m) => m.id),
        ticktext: margins.map((m) => wrap(m.material, compact ? 16 : 28)),
        tickfont: { size: CHART_FONT_SIZE, color: CHART.text },
        categoryorder: "array",
        categoryarray: margins.map((m) => m.id),
        autorange: "reversed",
        automargin: true,
        fixedrange: true,
        gridcolor: "rgba(0,0,0,0)",
        linecolor: CHART.grid,
      },
      shapes,
      annotations,
    };
  }, [fontFamily, compact, habitats, margins]);

  return (
    <div role="figure" aria-label={ariaLabel} style={{ height: chartHeight(margins.length) }}>
      <Plot
        data={data}
        layout={layout}
        config={{ ...baseConfig, displayModeBar: false }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
        onClick={(e: Readonly<PlotMouseEvent>) => {
          const id = e.points[0]?.customdata;
          if (typeof id === "string") onSelect(id);
        }}
      />
    </div>
  );
}

export { SafetyMarginChart };
