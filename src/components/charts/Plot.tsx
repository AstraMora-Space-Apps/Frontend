"use client";

import dynamic from "next/dynamic";

// Plotly touches `window`, so charts are client-only. Always import charts from here.
const Plot = dynamic(() => import("./PlotlyChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-lg bg-muted md:h-[560px]" aria-hidden />
  ),
});

export default Plot;
