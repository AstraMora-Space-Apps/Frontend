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
  // Backend types this as Optional[int] with no lower bound; allow 0 so one odd page
  // cannot fail validation of a whole list. (M7 reconciliation)
  page: z.number().int().nonnegative().nullable().default(null),
  /** Verbatim source passage. */
  quote: z.string(),
  source_url: z.string().nullable().default(null),
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
  citations: z.array(CitationSchema).max(4).default([]),
  evidence: EvidenceSchema.nullable().default(null),
  latency_ms: z.number().nonnegative().nullable().default(null),
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

/**
 * Each range is null when the source does not report it (M7: the live backend sends null
 * for many investigations). The UI shows "Not reported"; never fill in a value.
 */
export const ConditionsSchema = z.object({
  o2_percent: RangeSchema.nullable().default(null),
  pressure_psi: RangeSchema.nullable().default(null),
  /** null for quiescent-only investigations or when not reported. */
  flow_speed_cm_s: RangeSchema.nullable().default(null),
});
export type Conditions = z.infer<typeof ConditionsSchema>;

export const InvestigationSchema = z.object({
  id: z.string(),
  name: z.string(),
  hardware: z.string(),
  pillar: PillarSchema,
  objective: z.string(),
  fuels: z.array(FuelSchema).default([]),
  /** A missing or null conditions object becomes all-null ranges (shown as "Not reported"). */
  conditions: z.preprocess((v) => v ?? {}, ConditionsSchema),
  variables: z.array(z.string()).default([]),
  sensors: z.array(z.string()).default([]),
  citations: z.array(CitationSchema).default([]),
  /** true for stub/seed records (Hard rule 10). Absent means real data. */
  sample: z.boolean().default(false),
});
export type Investigation = z.infer<typeof InvestigationSchema>;

/* ------------------------------------------------------------- TestRecord */

export const TestRecordSchema = z.object({
  id: z.string(),
  investigation_id: z.string(),
  investigation_name: z.string(),
  fuel: z.string(),
  fuel_class: FuelClassSchema,
  /** null when not reported (M7: most live tests). */
  flow_direction: FlowDirectionSchema.nullable().default(null),
  /** null when not reported; such tests are listed but cannot be placed on the Coverage Map. */
  o2_percent: z.number().min(0).max(100).nullable().default(null),
  pressure_psi: z.number().nonnegative().nullable().default(null),
  flow_speed_cm_s: z.number().nonnegative().nullable().default(null),
  platform: PlatformSchema,
  /**
   * true when the flame was still burning at the end of the run (censored): hollow marker.
   * null = censoring not reported; shown as "outcome not reported", never as observed.
   */
  ended_early: z.boolean().nullable().default(null),
  result: z.string(),
  /** Flame spread rate, mm/s (assumed unit). */
  spread_rate: z.number().nonnegative().nullable().default(null),
  citation: CitationSchema.nullable().default(null),
  sample: z.boolean().default(false),
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
    citations: z.array(CitationSchema).default([]),
    reviewed: z.boolean().default(false),
    sample: z.boolean().default(false),
  })
  .refine((i) => i.score === i.safety_impact * i.evidence_strength * i.mission_relevance, {
    message: "score must equal safety_impact x evidence_strength x mission_relevance",
    path: ["score"],
  });
export type Insight = z.infer<typeof InsightSchema>;

/* ----------------------------------------------------------- SafetyMargin */

/**
 * One material's oxygen limit in normal gravity (1-g) vs microgravity (M8, preliminary).
 * Limit = lowest O2 (percent) at which a flame was sustained in the tests.
 * *_is_bound = the true limit was not reached (flame still burning at the lowest O2 tested),
 * so the true limit is at or below the value shown (Hard rule 3: drawn hatched, labelled "≤").
 */
export const SafetyMarginSchema = z.object({
  id: z.string(),
  material: z.string().min(1),
  /** Material family as sent by the source, e.g. "Fabric". null when not reported. */
  category: z.string().nullable().default(null),
  /** Solid materials only: gas flames are never compared with solids (Hard rule 2). */
  fuel_class: z.literal("solid"),
  pressure_psi: z.number().nonnegative().nullable().default(null),
  flow_speed_cm_s: z.number().nonnegative().nullable().default(null),
  loc_1g_percent: z.number().min(0).max(100).nullable().default(null),
  loc_microgravity_percent: z.number().min(0).max(100).nullable().default(null),
  loc_1g_is_bound: z.boolean().default(false),
  loc_microgravity_is_bound: z.boolean().default(false),
  /** null when not reported (the deployed backend does not send it yet). */
  platform_microgravity: PlatformSchema.nullable().default(null),
  evidence: EvidenceSchema.nullable().default(null),
  citations: z.array(CitationSchema).default([]),
  note: z.string().nullable().default(null),
  sample: z.boolean().default(false),
});
export type SafetyMargin = z.infer<typeof SafetyMarginSchema>;

/** What the page receives: solid-fuel margins plus how many non-solid rows were left out. */
export type SafetyMarginSet = {
  margins: SafetyMargin[];
  /** Rows dropped because they are not solid fuels (Hard rule 2). */
  excluded_non_solid: number;
};

/**
 * Shape actually served by the deployed backend at GET /api/safety-margins (M8).
 * Mapped to SafetyMargin in src/lib/api.ts; mapping documented in docs/API_ASSUMPTIONS.md.
 */
export const LiveSafetyMarginSchema = z.object({
  material: z.string().min(1),
  category: z.string().nullable().default(null),
  limit_1g_o2_percent: z.number().nullable().default(null),
  limit_ug_o2_percent: z.number().nullable().default(null),
  /** Backend sign convention: microgravity minus 1-g. Not used; the front end computes its own. */
  delta_o2_percent: z.number().nullable().default(null),
  pressure_psi: z.number().nullable().default(null),
  flow_speed_cm_s: z.number().nullable().default(null),
  danger_direction: z.string().nullable().default(null),
  /** Free text such as "BASS-II_001, p. 4". */
  citation: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
});
export type LiveSafetyMargin = z.infer<typeof LiveSafetyMarginSchema>;

/* ------------------------------------------------------------ list schemas */

export const InvestigationListSchema = z.array(InvestigationSchema);
export const TestRecordListSchema = z.array(TestRecordSchema);
export const InsightListSchema = z.array(InsightSchema);
export const SafetyMarginListSchema = z.array(SafetyMarginSchema);
export const LiveSafetyMarginListSchema = z.array(LiveSafetyMarginSchema);

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
/** A test with both coordinates reported, so it can be placed on the O2 vs pressure map. */
export type PlottableTest = TestRecord & { o2_percent: number; pressure_psi: number };

export function isPlottable(t: TestRecord): t is PlottableTest {
  return t.o2_percent !== null && t.pressure_psi !== null;
}

/**
 * Unique key for a test. Backend test ids are only unique within an investigation
 * (e.g. "1" exists in BASS and SAME), so pair them with the investigation id. (M7)
 */
export function testKey(t: Pick<TestRecord, "id" | "investigation_id">): string {
  return `${t.investigation_id}:${t.id}`;
}

export function splitByFuelClass(tests: readonly TestRecord[]): TestsByFuelClass {
  const out: TestsByFuelClass = { solid: [], gas: [], liquid: [] };
  for (const t of tests) out[t.fuel_class].push(t);
  return out;
}
