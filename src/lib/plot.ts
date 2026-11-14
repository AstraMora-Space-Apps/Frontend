/**
 * Pure builders for the Coverage Map (Plotly traces, shapes, annotations).
 * Hard rule 2: callers pass tests of ONE fuel class only (from splitByFuelClass).
 * Hard rule 3: ended-early tests are hollow markers; habitats are shaded boxes.
 */
import type { Data, Layout, Shape } from "plotly.js";

type Annotation = NonNullable<Layout["annotations"]>[number];
import { isConfirmed, type ConfirmedHabitat, type Habitat } from "@/lib/habitats";
import { CHART, FLOW_COLORS, FLOW_UNKNOWN_COLOR } from "@/lib/tokens";
import {
  FlowDirectionSchema,
  testKey,
  type FlowDirection,
  type PlottableTest,
  type TestRecord,
} from "@/lib/types";

export const X_RANGE: [number, number] = [0, 100];
export const Y_RANGE: [number, number] = [0, 16];

/**
 * Pressure axis: 0-16 psi by default, extended (to the next even number) when tests go higher,
 * so no plotted point is ever cut off. (M7: live data reaches ~73 psi.)
 */
export function pressureAxisRange(
  tests: readonly Pick<PlottableTest, "pressure_psi">[],
): [number, number] {
  const max = tests.reduce((m, t) => Math.max(m, t.pressure_psi), 0);
  return max <= Y_RANGE[1] ? Y_RANGE : [0, Math.ceil((max + 1) / 2) * 2];
}
export const MARKER_SIZE = 11;

export const FLOW_LABEL: Record<FlowDirection, string> = {
  opposed: "Opposed",
  concurrent: "Concurrent",
  quiescent: "Quiescent",
};

export const flowLabel = (d: FlowDirection | null) =>
  d === null ? "Flow not reported" : FLOW_LABEL[d];

/** Outcome text. null = censoring not reported: never presented as an observed outcome. */
export const outcomeText = (endedEarly: boolean | null) =>
  endedEarly === null
    ? "Not reported"
    : endedEarly
      ? "Ended early (flame still burning)"
      : "Burned to end";

const PLATFORM_TEXT: Record<TestRecord["platform"], string> = {
  iss: "ISS",
  drop_tower: "Drop tower",
  other: "Other",
};

/** customdata column order; index 0 is the unique test key (testKey) used for click handling. */
function customRow(t: PlottableTest): (string | number)[] {
  return [
    testKey(t),
    t.investigation_name,
    t.fuel,
    flowLabel(t.flow_direction),
    t.o2_percent,
    t.pressure_psi,
    t.flow_speed_cm_s === null ? "not reported" : `${t.flow_speed_cm_s} cm/s`,
    PLATFORM_TEXT[t.platform],
    outcomeText(t.ended_early),
    t.sample ? "<br><b>[SAMPLE]</b>" : "",
  ];
}

const HOVER_TEMPLATE =
  "<b>%{customdata[1]}</b>%{customdata[9]}<br>" +
  "Fuel: %{customdata[2]}<br>" +
  "Flow: %{customdata[3]}<br>" +
  "O₂: %{customdata[4]} %<br>" +
  "Pressure: %{customdata[5]} psi<br>" +
  "Flow speed: %{customdata[6]}<br>" +
  "Platform: %{customdata[7]}<br>" +
  "Outcome: %{customdata[8]}" +
  "<extra></extra>";

const OUTCOMES = [false, true, null] as const;

/**
 * One trace per (flow direction or "not reported") x outcome, skipping empty ones.
 * Filled circle = burned to end, hollow circle = ended early (Hard rule 3),
 * diamond = outcome not reported (we do not know whether the flame was still burning).
 */
export function buildTestTraces(tests: readonly PlottableTest[]): Data[] {
  const traces: Data[] = [];
  for (const dir of [...FlowDirectionSchema.options, null] as const) {
    for (const endedEarly of OUTCOMES) {
      const pts = tests.filter((t) => t.flow_direction === dir && t.ended_early === endedEarly);
      if (pts.length === 0) continue;
      const color = dir === null ? FLOW_UNKNOWN_COLOR : FLOW_COLORS[dir];
      const base = flowLabel(dir);
      traces.push({
        type: "scatter",
        mode: "markers",
        name:
          endedEarly === null
            ? `${base}, outcome not reported`
            : endedEarly
              ? `${base}, ended early`
              : base,
        legendgroup: dir ?? "unknown",
        x: pts.map((t) => t.o2_percent),
        y: pts.map((t) => t.pressure_psi),
        customdata: pts.map(customRow),
        hovertemplate: HOVER_TEMPLATE,
        marker:
          endedEarly === null
            ? {
                symbol: "diamond",
                size: MARKER_SIZE,
                color,
                line: { width: 1, color: CHART.surface },
              }
            : endedEarly
              ? { symbol: "circle-open", size: MARKER_SIZE, color, line: { width: 2.5, color } }
              : {
                  symbol: "circle",
                  size: MARKER_SIZE,
                  color,
                  line: { width: 1, color: CHART.surface },
                },
      });
    }
  }
  return traces;
}

/** Non-interactive ember rings around the given tests (hovered finder row / selected point). */
export function buildHighlightTrace(tests: readonly PlottableTest[], name = "highlight"): Data {
  return {
    type: "scatter",
    mode: "markers",
    name,
    showlegend: false,
    hoverinfo: "skip",
    x: tests.map((t) => t.o2_percent),
    y: tests.map((t) => t.pressure_psi),
    marker: {
      symbol: "circle-open",
      size: MARKER_SIZE + 10,
      color: CHART.ember,
      line: { width: 2, color: CHART.ember },
    },
  };
}

export type ZoneBox = { habitat: ConfirmedHabitat; x0: number; x1: number; y0: number; y1: number };

const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v));

/** "#RRGGBB" + alpha → "rgba(r,g,b,a)". */
export function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function habitatBoxes(habitats: readonly Habitat[]): ZoneBox[] {
  return habitats.filter(isConfirmed).map((h) => ({
    habitat: h,
    x0: clamp(h.o2_percent - h.o2_halfwidth, X_RANGE),
    x1: clamp(h.o2_percent + h.o2_halfwidth, X_RANGE),
    y0: clamp(h.pressure_psi - h.pressure_halfwidth, Y_RANGE),
    y1: clamp(h.pressure_psi + h.pressure_halfwidth, Y_RANGE),
  }));
}

/** Shaded habitat rectangles (fill 0.15, 1px border; selected zone stronger). */
export function buildHabitatShapes(
  boxes: readonly ZoneBox[],
  selectedId: string | null,
): Partial<Shape>[] {
  return boxes.map((b) => {
    const selected = b.habitat.id === selectedId;
    return {
      type: "rect",
      xref: "x",
      yref: "y",
      x0: b.x0,
      x1: b.x1,
      y0: b.y0,
      y1: b.y1,
      // Alpha on the fill only, so the 1px border stays full strength (shape opacity dims both).
      fillcolor: withAlpha(b.habitat.color, selected ? 0.3 : 0.15),
      opacity: 1,
      line: { color: b.habitat.color, width: selected ? 2.5 : 1 },
      layer: "below",
    };
  });
}

/**
 * Labels sit just above each box (boxes are too small for 16px text inside). Boxes near the
 * right edge anchor right. Labels whose rows would collide are stacked upward.
 */
export function buildHabitatAnnotations(
  boxes: readonly ZoneBox[],
  selectedId: string | null,
  fontSize: number,
  compact = false,
): Annotation[] {
  const placed: { x: number; y: number; shift: number }[] = [];
  return [...boxes]
    .sort((a, b) => a.y1 - b.y1)
    .map((b) => {
      const right = b.x1 > 80;
      const x = right ? b.x1 : b.x0;
      let shift = 2;
      while (
        placed.some(
          (p) => Math.abs(p.x - x) < 18 && Math.abs(p.y - b.y1) < 1.2 && p.shift === shift,
        )
      )
        shift += 24;
      placed.push({ x, y: b.y1, shift });
      const selected = b.habitat.id === selectedId;
      return {
        x,
        y: b.y1,
        xref: "x",
        yref: "y",
        xanchor: right ? "right" : "left",
        yanchor: "bottom",
        yshift: shift,
        text: (() => {
          const label = compact ? b.habitat.shortLabel : b.habitat.label;
          return selected ? `<b>${label}</b>` : label;
        })(),
        showarrow: false,
        font: { size: fontSize, color: CHART.text },
        bgcolor: CHART.labelBg,
        bordercolor: b.habitat.color,
        borderwidth: selected ? 2 : 1,
        borderpad: 3,
      };
    });
}

/** Reads the test id from a Plotly point's customdata row. */
export function testIdFromPoint(customdata: unknown): string | null {
  if (Array.isArray(customdata) && typeof customdata[0] === "string") return customdata[0];
  return null;
}
