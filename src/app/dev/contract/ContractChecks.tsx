"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { exportCsvUrl, isStubMode, type ApiError, type DataSource } from "@/lib/api";
import { useAsk, useInsights, useInvestigations, useTests, type QueryState } from "@/lib/hooks";
import { splitByFuelClass } from "@/lib/types";
import { cn } from "@/lib/utils";

type Row = {
  name: string;
  status: "pending" | "pass" | "fail";
  detail: string;
  source?: DataSource;
  error?: ApiError | null;
};

function rowFrom<T>(name: string, q: QueryState<T>, describe: (data: T) => [boolean, string]): Row {
  if (q.isLoading) return { name, status: "pending", detail: "Loading…" };
  if (q.error) return { name, status: "fail", detail: q.error.message, error: q.error };
  if (q.data === undefined) return { name, status: "pending", detail: "Not started" };
  const [pass, detail] = describe(q.data);
  return { name, status: pass ? "pass" : "fail", detail, source: q.source };
}

const MOON = { o2_min: 28, o2_max: 32, pressure_min: 9.5, pressure_max: 11 } as const;

export function ContractChecks() {
  const investigations = useInvestigations();
  const gasInvestigations = useInvestigations({ fuel_class: "gas" });
  const tests = useTests();
  const moonTests = useTests(MOON);
  const insights = useInsights();
  const answered = useAsk();
  const notInData = useAsk();
  const cached = useAsk();
  const [cacheMs, setCacheMs] = useState<number>();
  const started = useRef(false);

  const { submit: submitAnswered } = answered;
  const { submit: submitNotInData } = notInData;
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    submitAnswered("Which tested materials are risky at the Moon Base's 30% oxygen?");
    submitNotInData("What is the boiling point of lunar regolith tea?");
  }, [submitAnswered, submitNotInData]);

  // Cache check: once the first answer is in, ask the same question again (different case/spacing).
  const askedAgain = useRef(false);
  const t0 = useRef(0);
  const { submit: submitCached } = cached;
  useEffect(() => {
    if (askedAgain.current || !answered.data) return;
    askedAgain.current = true;
    t0.current = performance.now();
    submitCached("  which tested materials are risky at the moon base's 30% OXYGEN?  ");
  }, [answered.data, submitCached]);
  useEffect(() => {
    if (cached.data && cacheMs === undefined)
      setCacheMs(Math.round(performance.now() - t0.current));
  }, [cached.data, cacheMs]);

  const csvUrl = exportCsvUrl({ fuel_class: "solid", o2_min: 20 });

  const rows: Row[] = [
    rowFrom("getInvestigations()", investigations, (d) => [
      d.length > 0,
      `${d.length} investigations`,
    ]),
    rowFrom("getInvestigations({ fuel_class: 'gas' })", gasInvestigations, (d) => [
      d.every((i) => i.fuels.some((f) => f.fuel_class === "gas")),
      `${d.length} match (${d.map((i) => i.name).join(", ") || "none"})`,
    ]),
    rowFrom("getTests() + splitByFuelClass()", tests, (d) => {
      const s = splitByFuelClass(d);
      const ended = d.filter((t) => t.ended_early).length;
      return [
        d.length > 0 &&
          s.solid.every((t) => t.fuel_class === "solid") &&
          s.gas.every((t) => t.fuel_class === "gas"),
        `${d.length} tests · solid ${s.solid.length} · gas ${s.gas.length} · liquid ${s.liquid.length} · ended early ${ended}`,
      ];
    }),
    rowFrom("getTests(Moon Base window)", moonTests, (d) => [
      d.every(
        (t) =>
          t.o2_percent !== null &&
          t.pressure_psi !== null &&
          t.o2_percent >= 28 &&
          t.o2_percent <= 32 &&
          t.pressure_psi >= 9.5 &&
          t.pressure_psi <= 11,
      ),
      `${d.length} tests at 28–32% O₂, 9.5–11 psi`,
    ]),
    rowFrom("getInsights()", insights, (d) => [
      d.every((i) => i.score === i.safety_impact * i.evidence_strength * i.mission_relevance),
      `${d.length} insights · ${d.filter((i) => i.reviewed).length} reviewed · scores valid`,
    ]),
    rowFrom("ask(answerable)", answered, (d) => [
      d.grounded && d.citations.length >= 2 && d.citations.length <= 4,
      `grounded · ${d.citations.length} citations · evidence ${d.evidence?.strength ?? "none"}`,
    ]),
    rowFrom("ask(unanswerable) → not in data", notInData, (d) => [
      !d.grounded && d.citations.length === 0,
      d.grounded ? "unexpectedly grounded" : "grounded: false, 0 citations",
    ]),
    rowFrom("useAsk cache (repeat question)", cached, () => [
      cacheMs !== undefined && cacheMs < 100,
      cacheMs === undefined ? "Waiting…" : `returned in ${cacheMs} ms`,
    ]),
    {
      name: "exportCsvUrl({ fuel_class: 'solid', o2_min: 20 })",
      status: isStubMode ? (csvUrl === null ? "pass" : "fail") : csvUrl ? "pass" : "fail",
      detail: csvUrl ?? "null (stub mode: CSV is built client-side)",
    },
  ];

  const passed = rows.filter((r) => r.status === "pass").length;

  return (
    <section aria-label="Contract checks" className="mt-8">
      <p className="text-lg font-semibold" role="status">
        {passed} / {rows.length} passed
      </p>
      <ul className="mt-4 divide-y divide-border rounded-card border border-border bg-surface">
        {rows.map((r) => (
          <li key={r.name} className="flex items-start gap-3 px-4 py-3" data-status={r.status}>
            {r.status === "pass" ? (
              <CircleCheck className="mt-1 size-5 shrink-0 text-risk-low" aria-label="pass" />
            ) : r.status === "fail" ? (
              <CircleX className="mt-1 size-5 shrink-0 text-risk-high" aria-label="fail" />
            ) : (
              <LoaderCircle
                className="mt-1 size-5 shrink-0 animate-spin text-muted-foreground"
                aria-label="pending"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm break-words text-foreground">{r.name}</p>
              <p
                className={cn(
                  "text-base break-words",
                  r.status === "fail" ? "text-risk-high" : "text-muted-foreground",
                )}
              >
                {r.error ? `[${r.error.kind}${r.error.status ? ` ${r.error.status}` : ""}] ` : ""}
                {r.detail}
                {r.source ? ` · source: ${r.source}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
