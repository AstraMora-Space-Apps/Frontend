"use client";

import dynamic from "next/dynamic";

// Plotly touches `window`, so charts are client-only. Always import charts from here.
const Plot = dynamic(() => import("./PlotlyChart"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded-lg bg-muted" aria-hidden />,
});

export default Plot;
