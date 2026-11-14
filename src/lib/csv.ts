/** Client-side CSV export for per-test data (used in stub mode). Pure except downloadCsv. */
import type { TestRecord } from "@/lib/types";

export const DATASET_STATUS = "v0.1, preliminary / unverified";
export const CSV_FILENAME = "flamesight_tests_v0.1_unverified.csv";

/** RFC 4180 quoting; also neutralises spreadsheet formula injection (=, +, -, @ at start). */
export function escapeCsvCell(value: string | number | boolean | null): string {
  if (value === null) return "";
  let s = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS: ReadonlyArray<{
  header: string;
  get: (t: TestRecord) => string | number | boolean | null;
}> = [
  { header: "test_id", get: (t) => t.id },
  { header: "investigation_id", get: (t) => t.investigation_id },
  { header: "investigation", get: (t) => t.investigation_name },
  { header: "fuel", get: (t) => t.fuel },
  { header: "fuel_class", get: (t) => t.fuel_class },
  { header: "flow_direction", get: (t) => t.flow_direction },
  { header: "o2_percent", get: (t) => t.o2_percent },
  { header: "pressure_psi", get: (t) => t.pressure_psi },
  { header: "flow_speed_cm_s", get: (t) => t.flow_speed_cm_s },
  { header: "platform", get: (t) => t.platform },
  { header: "ended_early", get: (t) => t.ended_early },
  { header: "result", get: (t) => t.result },
  { header: "spread_rate", get: (t) => t.spread_rate },
  { header: "citation_paper", get: (t) => t.citation?.paper_title ?? null },
  { header: "citation_page", get: (t) => t.citation?.page ?? null },
  { header: "sample", get: (t) => t.sample },
  { header: "dataset_status", get: () => DATASET_STATUS },
];

/** CSV text with a UTF-8 BOM (so Excel reads it as UTF-8) and CRLF line endings. */
export function testsToCsv(tests: readonly TestRecord[]): string {
  const lines = [
    COLUMNS.map((c) => c.header).join(","),
    ...tests.map((t) => COLUMNS.map((c) => escapeCsvCell(c.get(t))).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** Browser only: triggers a download of `csv`. */
export function downloadCsv(csv: string, filename = CSV_FILENAME): void {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
