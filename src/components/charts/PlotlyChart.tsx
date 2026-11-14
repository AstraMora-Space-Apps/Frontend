"use client";

import type { ComponentProps } from "react";
import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

// Basic bundle only (scatter, bar, pie). Keeps the client bundle small.
const BasePlot = createPlotlyComponent(Plotly);

type PlotProps = ComponentProps<typeof BasePlot>;

/** Plotly adds an off-screen <svg id="js-plotly-tester"> for text measuring; hide it from assistive tech. */
function hideTester() {
  document.getElementById("js-plotly-tester")?.setAttribute("aria-hidden", "true");
}

function PlotlyChart(props: PlotProps) {
  const { onInitialized } = props;
  return (
    <BasePlot
      {...props}
      onInitialized={(figure, graphDiv) => {
        hideTester();
        onInitialized?.(figure, graphDiv);
      }}
    />
  );
}

export default PlotlyChart;
