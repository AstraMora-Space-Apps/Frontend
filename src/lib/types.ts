/**
 * FlameSight data contract. The ONLY place that defines data shapes (Hard rule 9).
 *
 * Field names mirror the ASSUMED FastAPI backend (snake_case) so the live swap edits
 * this file only. Every assumption is logged in docs/API_ASSUMPTIONS.md.
 * Units live in field names (o2_percent, pressure_psi, flow_speed_cm_s) or doc comments.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ enums */

export const PlatformSchema = z.enum(["iss", "drop_tower", "other"]);
export type Platform = z.infer<typeof PlatformSchema>;

export const FuelClassSchema = z.enum(["solid", "gas", "liquid"]);
export type FuelClass = z.infer<typeof FuelClassSchema>;

export const FlowDirectionSchema = z.enum(["opposed", "concurrent", "quiescent"]);
export type FlowDirection = z.infer<typeof FlowDirectionSchema>;

export const PillarSchema = z.enum(["prevention", "detection", "suppression", "supporting"]);
export type Pillar = z.infer<typeof PillarSchema>;

export const StrengthSchema = z.enum(["low", "medium", "high"]);
export type Strength = z.infer<typeof StrengthSchema>;

export const RiskLevelSchema = z.enum(["high", "medium", "low"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/* ------------------------------------------------------------- building blocks */

/** Inclusive numeric range. Unit comes from the field that holds it. */
export const RangeSchema = z
  .object({ min: z.number(), max: z.number() })
  .refine((r) => r.min <= r.max, { message: "range.min must be <= range.max" });
export type Range = z.infer<typeof RangeSchema>;

export const CitationSchema = z.object({
  paper_title: z.string().min(1),
  investigation: z.string(),
  /** null when the source has no page numbers. */
  page: z.number().int().positive().nullable(),
  /** Verbatim source passage. */
  quote: z.string(),
  source_url: z.string().nullable(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const EvidenceSchema = z.object({
  test_count: z.number().int().nonnegative(),
  platform: PlatformSchema,
  repeats: z.number().int().nonnegative(),
  strength: StrengthSchema,
});
export type Evidence = z.infer<typeof EvidenceSchema>;

/* ------------------------------------------------------------------ Ask */

export const AskRequestSchema = z.object({ question: z.string().min(1) });
export type AskRequest = z.infer<typeof AskRequestSchema>;

export const AskResponseSchema = z.object({
  answer: z.string(),
  /** false = "Not in the data": UI must show NotInData and no answer text. */
  grounded: z.boolean(),
  citations: z.array(CitationSchema).max(4),
  evidence: EvidenceSchema.nullable(),
  latency_ms: z.number().nonnegative().nullable(),
});
export type AskResponse = z.infer<typeof AskResponseSchema>;

/* ------------------------------------------------------------ Investigation */

export const FuelSchema = z.object({
  name: z.string(),
  fuel_class: FuelClassSchema,
  sample_shape: z.string(),
  /** Free text with units, e.g. "10 x 1 cm". */
  sample_size: z.string(),
});
export type Fuel = z.infer<typeof FuelSchema>;

export const ConditionsSchema = z.object({
  o2_percent: RangeSchema,
  pressure_psi: RangeSchema,
  /** null for quiescent-only investigations. */
  flow_speed_cm_s: RangeSchema.nullable(),
});
export type Conditions = z.infer<typeof ConditionsSchema>;

export const InvestigationSchema = z.object({
  id: z.string(),
  name: z.string(),
  hardware: z.string(),
  pillar: PillarSchema,
  objective: z.string(),
  fuels: z.array(FuelSchema),
  conditions: ConditionsSchema,
  variables: z.array(z.string()),
  sensors: z.array(z.string()),
  citations: z.array(CitationSchema),
  /** true for stub records (Hard rule 10). */
  sample: z.boolean(),
});
export type Investigation = z.infer<typeof InvestigationSchema>;

/* ------------------------------------------------------------- TestRecord */

export const TestRecordSchema = z.object({
  id: z.string(),
  investigation_id: z.string(),
  investigation_name: z.string(),
  fuel: z.string(),
  fuel_class: FuelClassSchema,
  flow_direction: FlowDirectionSchema,
  o2_percent: z.number().min(0).max(100),
  pressure_psi: z.number().nonnegative(),
  flow_speed_cm_s: z.number().nonnegative().nullable(),
  platform: PlatformSchema,
  /** true when the flame was still burning at the end of the run (censored). Hollow marker. */
  ended_early: z.boolean(),
  result: z.string(),
  /** Flame spread rate, mm/s (assumed unit). */
  spread_rate: z.number().nonnegative().nullable(),
  citation: CitationSchema.nullable(),
  sample: z.boolean(),
});
export type TestRecord = z.infer<typeof TestRecordSchema>;

/* ---------------------------------------------------------------- Insight */

const Factor = z.number().int().min(1).max(5);

export const InsightSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    /** One line. */
    recommendation: z.string(),
    risk_level: RiskLevelSchema,
    safety_impact: Factor,
    evidence_strength: Factor,
    mission_relevance: Factor,
    /** safety_impact x evidence_strength x mission_relevance (1 to 125). */
    score: z.number().int().min(1).max(125),
    score_reason: z.string(),
    citations: z.array(CitationSchema),
    reviewed: z.boolean(),
    sample: z.boolean(),
  })
  .refine((i) => i.score === i.safety_impact * i.evidence_strength * i.mission_relevance, {
    message: "score must equal safety_impact x evidence_strength x mission_relevance",
    path: ["score"],
  });
export type Insight = z.infer<typeof InsightSchema>;

/* ------------------------------------------------------------ list schemas */

export const InvestigationListSchema = z.array(InvestigationSchema);
export const TestRecordListSchema = z.array(TestRecordSchema);
export const InsightListSchema = z.array(InsightSchema);

/** Shape of src/stub/ask.json. Stub-only. */
export const AskStubFileSchema = z.object({
  answered: z.array(AskResponseSchema).length(3),
  not_in_data: AskResponseSchema,
});
export type AskStubFile = z.infer<typeof AskStubFileSchema>;

/* ---------------------------------------------------------------- filters */

/** Query params for GET /investigations (assumed names). Units: percent, psi. */
export type InvestigationFilters = {
  fuel_class?: FuelClass;
  hardware?: string;
  pillar?: Pillar;
  o2_min?: number;
  o2_max?: number;
  pressure_min?: number;
  pressure_max?: number;
  /** Free-text search. */
  q?: string;
};

/** Query params for GET /tests and GET /export/csv. */
export type TestFilters = InvestigationFilters & {
  investigation_id?: string;
};

/* ------------------------------------------------------------ rule helpers */

export type TestsByFuelClass = Record<FuelClass, TestRecord[]>;

/**
 * Hard rule 2: gas-flame and solid-fuel tests never share axes.
 * Charts must take one bucket from this, never the raw list.
 */
export function splitByFuelClass(tests: readonly TestRecord[]): TestsByFuelClass {
  const out: TestsByFuelClass = { solid: [], gas: [], liquid: [] };
  for (const t of tests) out[t.fuel_class].push(t);
  return out;
}
