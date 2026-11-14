/**
 * FlameSight API client. The ONLY module that fetches data (CLAUDE.md conventions).
 *
 * - Live mode: FastAPI backend at NEXT_PUBLIC_API_BASE_URL, 10 s timeout, zod-validated.
 * - Stub mode (default): src/stub/*.json, same zod schemas, same filters, fake latency.
 * Every function resolves to an ApiResult and never throws into the UI.
 */
import type { z } from "zod";
import {
  AskResponseSchema,
  AskStubFileSchema,
  InsightListSchema,
  InvestigationListSchema,
  TestRecordListSchema,
  type AskResponse,
  type Insight,
  type Investigation,
  type InvestigationFilters,
  type TestFilters,
  type TestRecord,
} from "@/lib/types";

/* ------------------------------------------------------------------ config */

const DEFAULT_TIMEOUT_MS = 10_000;

/** Client timeout per request. Override with NEXT_PUBLIC_API_TIMEOUT_MS (positive integer, ms). */
export const REQUEST_TIMEOUT_MS: number = (() => {
  const raw = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);
  return Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
})();
const STUB_LATENCY_MS = { min: 400, max: 900 } as const;

/**
 * Stub mode is ON unless NEXT_PUBLIC_USE_STUB is exactly "false".
 * Safe default: a missing env var shows sample data plus the banner, never a silent live call.
 */
export const isStubMode: boolean = process.env.NEXT_PUBLIC_USE_STUB !== "false";

export const API_BASE_URL: string = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);

/* ------------------------------------------------------------------ result */

export type ApiErrorKind = "timeout" | "network" | "http" | "validation";
export type ApiError = { kind: ApiErrorKind; message: string; status?: number };
export type DataSource = "stub" | "live";
export type ApiResult<T> =
  { ok: true; data: T; source: DataSource } | { ok: false; error: ApiError };

const ok = <T>(data: T, source: DataSource): ApiResult<T> => ({ ok: true, data, source });
const fail = <T>(error: ApiError): ApiResult<T> => ({ ok: false, error });

function validate<S extends z.ZodType>(
  schema: S,
  raw: unknown,
  source: DataSource,
): ApiResult<z.infer<S>> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return ok(parsed.data, source);
  const issue = parsed.error.issues[0];
  const where = issue?.path.length ? ` at ${issue.path.join(".")}` : "";
  return fail({
    kind: "validation",
    message: `The ${source} data did not match the expected format${where}: ${issue?.message ?? "unknown issue"}.`,
  });
}

/* --------------------------------------------------------------- live mode */

type QueryValue = string | number | undefined;

export function buildQuery(params: Record<string, QueryValue>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function liveRequest<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: { method: "POST"; body: unknown },
): Promise<ApiResult<z.infer<S>>> {
  if (!API_BASE_URL) {
    return fail({
      kind: "network",
      message: "No API address is configured (NEXT_PUBLIC_API_BASE_URL).",
    });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: init ? { "Content-Type": "application/json" } : undefined,
      body: init ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      return fail({
        kind: "http",
        status: res.status,
        message: `The server answered with an error (${res.status}). Please try again.`,
      });
    }
    let raw: unknown;
    try {
      raw = await res.json();
    } catch {
      return fail({ kind: "validation", message: "The server response was not valid JSON." });
    }
    return validate(schema, raw, "live");
  } catch (err) {
    if (controller.signal.aborted) {
      return fail({
        kind: "timeout",
        message: `The server did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`,
      });
    }
    return fail({
      kind: "network",
      message:
        err instanceof Error
          ? `Could not reach the FlameSight server (${err.message}).`
          : "Could not reach the FlameSight server.",
    });
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------------------------------------------- stub mode */

function stubDelay(): Promise<void> {
  const ms = STUB_LATENCY_MS.min + Math.random() * (STUB_LATENCY_MS.max - STUB_LATENCY_MS.min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Loads a stub file lazily (kept out of the live bundle path) and validates it. */
async function stubLoad<S extends z.ZodType>(
  load: () => Promise<{ default: unknown }>,
  schema: S,
): Promise<ApiResult<z.infer<S>>> {
  await stubDelay();
  try {
    const mod = await load();
    return validate(schema, mod.default, "stub");
  } catch {
    return fail({ kind: "network", message: "Could not load the sample data file." });
  }
}

const overlaps = (lo: number, hi: number, min?: number, max?: number) =>
  (min === undefined || hi >= min) && (max === undefined || lo <= max);

/** Unknown (null) ranges or values only match when that filter is not set. */
const overlapsRange = (r: { min: number; max: number } | null, min?: number, max?: number) =>
  r === null ? min === undefined && max === undefined : overlaps(r.min, r.max, min, max);

const within = (v: number | null, min?: number, max?: number) =>
  v === null
    ? min === undefined && max === undefined
    : (min === undefined || v >= min) && (max === undefined || v <= max);

const includesText = (haystack: readonly string[], q?: string) => {
  const needle = q?.trim().toLowerCase();
  return !needle || haystack.some((h) => h.toLowerCase().includes(needle));
};

const sameText = (a: string, b?: string) => !b || a.toLowerCase() === b.toLowerCase();

export function matchInvestigation(inv: Investigation, f: InvestigationFilters): boolean {
  const { o2_percent: o2, pressure_psi: p } = inv.conditions;
  return (
    (!f.fuel_class || inv.fuels.some((fuel) => fuel.fuel_class === f.fuel_class)) &&
    sameText(inv.hardware, f.hardware) &&
    (!f.pillar || inv.pillar === f.pillar) &&
    overlapsRange(o2, f.o2_min, f.o2_max) &&
    overlapsRange(p, f.pressure_min, f.pressure_max) &&
    includesText([inv.name, inv.objective, inv.hardware, ...inv.fuels.map((x) => x.name)], f.q)
  );
}

export function matchTest(
  t: TestRecord,
  f: TestFilters,
  investigationsById: ReadonlyMap<string, Investigation>,
): boolean {
  const inv = investigationsById.get(t.investigation_id);
  return (
    (!f.investigation_id || t.investigation_id === f.investigation_id) &&
    (!f.fuel_class || t.fuel_class === f.fuel_class) &&
    (!f.hardware || (inv !== undefined && sameText(inv.hardware, f.hardware))) &&
    (!f.pillar || inv?.pillar === f.pillar) &&
    within(t.o2_percent, f.o2_min, f.o2_max) &&
    within(t.pressure_psi, f.pressure_min, f.pressure_max) &&
    includesText([t.investigation_name, t.fuel, t.result], f.q)
  );
}

/** Stub Ask routing: index into ask.json "answered", or null for "not in the data". */
const STUB_ASK_ROUTES: ReadonlyArray<{ keywords: readonly string[]; answer: 0 | 1 | 2 }> = [
  { keywords: ["moon", "30%"], answer: 0 },
  { keywords: ["saffire", "bass"], answer: 1 },
  { keywords: ["smoke"], answer: 2 },
];

export function routeStubQuestion(question: string): 0 | 1 | 2 | null {
  const q = question.toLowerCase();
  return STUB_ASK_ROUTES.find((r) => r.keywords.some((k) => q.includes(k)))?.answer ?? null;
}

const loadInvestigations = () => import("@/stub/investigations.json");
const loadTests = () => import("@/stub/tests.json");
const loadInsights = () => import("@/stub/insights.json");
const loadAsk = () => import("@/stub/ask.json");

/* -------------------------------------------------------------- public API */

export async function ask(question: string): Promise<ApiResult<AskResponse>> {
  const trimmed = question.trim();
  if (!trimmed) return fail({ kind: "validation", message: "Please type a question first." });

  if (!isStubMode) {
    return liveRequest("/ask", AskResponseSchema, { method: "POST", body: { question: trimmed } });
  }
  const file = await stubLoad(loadAsk, AskStubFileSchema);
  if (!file.ok) return file;
  const route = routeStubQuestion(trimmed);
  return ok(route === null ? file.data.not_in_data : file.data.answered[route], "stub");
}

export async function getInvestigations(
  filters: InvestigationFilters = {},
): Promise<ApiResult<Investigation[]>> {
  if (!isStubMode) {
    return liveRequest(`/investigations${buildQuery(filters)}`, InvestigationListSchema);
  }
  const res = await stubLoad(loadInvestigations, InvestigationListSchema);
  if (!res.ok) return res;
  return ok(
    res.data.filter((inv) => matchInvestigation(inv, filters)),
    "stub",
  );
}

export async function getTests(filters: TestFilters = {}): Promise<ApiResult<TestRecord[]>> {
  if (!isStubMode) {
    return liveRequest(`/tests${buildQuery(filters)}`, TestRecordListSchema);
  }
  const [tests, invs] = await Promise.all([
    stubLoad(loadTests, TestRecordListSchema),
    stubLoad(loadInvestigations, InvestigationListSchema),
  ]);
  if (!tests.ok) return tests;
  if (!invs.ok) return invs;
  const byId = new Map(invs.data.map((inv) => [inv.id, inv]));
  return ok(
    tests.data.filter((t) => matchTest(t, filters, byId)),
    "stub",
  );
}

export async function getInsights(): Promise<ApiResult<Insight[]>> {
  if (!isStubMode) return liveRequest("/insights", InsightListSchema);
  return stubLoad(loadInsights, InsightListSchema);
}

/**
 * URL for the per-test CSV download. In stub mode returns null (no backend to serve it);
 * the UI should then build the CSV client-side from getTests() data, stamped "v0.1, unverified".
 */
export function exportCsvUrl(filters: TestFilters = {}): string | null {
  if (isStubMode || !API_BASE_URL) return null;
  return `${API_BASE_URL}/export/csv${buildQuery(filters)}`;
}
