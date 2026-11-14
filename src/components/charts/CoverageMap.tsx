"use client";

import { useMemo, useState } from "react";
import type { Layout, PlotMouseEvent } from "plotly.js";
import Plot from "@/components/charts/Plot";
import {
  axisStyle,
  baseConfig,
  baseLayout,
  chartFontFamily,
  CHART_FONT_SIZE,
} from "@/components/charts/plotlyTheme";
import {
  buildHabitatAnnotations,
  buildHabitatShapes,
  buildHighlightTrace,
  buildTestTraces,
  testIdFromPoint,
  X_RANGE,
  Y_RANGE,
  type ZoneBox,
} from "@/lib/plot";
import type { TestRecord } from "@/lib/types";
import { useMediaQuery } from "@/lib/use-media-query";

type CoverageMapProps = {
  /** Tests of exactly ONE fuel class (Hard rule 2). */
  tests: readonly TestRecord[];
  zones: readonly ZoneBox[];
  selectedHabitatId: string | null;
  highlight: readonly TestRecord[];
  selectedTest: TestRecord | null;
  onPointClick: (testId: string) => void;
  ariaLabel: string;
};

/** O2 vs pressure scatter with habitat reference bands. Client-only Plotly via the shared Plot wrapper. */
function CoverageMap({
  tests,
  zones,
  selectedHabitatId,
  highlight,
  selectedTest,
  onPointClick,
  ariaLabel,
}: CoverageMapProps) {
  const compact = !useMediaQuery("(min-width: 768px)");
  const [fontFamily] = useState(chartFontFamily);

  const data = useMemo(() => {
    const traces = buildTestTraces(tests);
    if (highlight.length) traces.push(buildHighlightTrace(highlight, "hovered investigation"));
    if (selectedTest) traces.push(buildHighlightTrace([selectedTest], "selected test"));
    return traces;
  }, [tests, highlight, selectedTest]);

  const layout = useMemo<Partial<Layout>>(() => {
    const base = baseLayout(fontFamily, compact);
    return {
      ...base,
      showlegend: !compact, // mobile: the HTML "How to read" key carries the colours
      xaxis: { ...axisStyle("Oxygen concentration (%)"), range: X_RANGE, dtick: compact ? 25 : 10 },
      yaxis: { ...axisStyle("Total pressure (psi)"), range: Y_RANGE, dtick: compact ? 4 : 2 },
      shapes: buildHabitatShapes(zones, selectedHabitatId),
      annotations: buildHabitatAnnotations(zones, selectedHabitatId, CHART_FONT_SIZE, compact),
      uirevision: "coverage", // keep zoom across data updates
    };
  }, [fontFamily, compact, zones, selectedHabitatId]);

  return (
    <div role="figure" aria-label={ariaLabel} className="h-[420px] w-full md:h-[560px]">
      <Plot
        data={data}
        layout={layout}
        config={baseConfig}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
        onClick={(e: Readonly<PlotMouseEvent>) => {
          const id = testIdFromPoint(e.points[0]?.customdata);
          if (id) onPointClick(id);
        }}
      />
    </div>
  );
}

export { CoverageMap };
