"use client";

import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

// Basic bundle only (scatter, bar, pie). Keeps the client bundle small.
const PlotlyChart = createPlotlyComponent(Plotly);

export default PlotlyChart;
