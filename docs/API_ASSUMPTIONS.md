# API assumptions (M2)

The backend schema and data dictionary were not frozen when the front-end data layer was built. Everything below is a best guess. Each row stays `assumed` until the owner confirms it; then change Status to `confirmed`, or fix the value.

Fix mismatches **only** in `src/lib/types.ts`, `src/lib/api.ts` and `src/stub/*.json` (Hard rule 9).

## How to switch to live

1. Set `NEXT_PUBLIC_USE_STUB=false` and `NEXT_PUBLIC_API_BASE_URL=<deployed FastAPI URL, no trailing slash>` (in `.env.local` locally, and in Vercel project settings for production).
2. Ask Thejitha to allow the Vercel domain in CORS.
3. Open `/dev/contract` locally (`npm run dev`). Every row should pass with `source: live`.
4. For each failing row, fix the field name, enum or unit in `src/lib/types.ts` (and the query param in `src/lib/api.ts`). Update the stub JSON so stub and live stay identical. Update this table.

Stub mode is **on** unless `NEXT_PUBLIC_USE_STUB` is exactly `false`, so a missing env var never makes silent live calls.

## Endpoints

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| Ask endpoint | `POST /ask`, JSON body `{ "question": string }`, returns `AskResponse` | assumed | Thejitha |
| Investigations endpoint | `GET /investigations`, returns `Investigation[]` | assumed | Thejitha |
| Tests endpoint | `GET /tests`, returns `TestRecord[]` | assumed | Thejitha |
| Insights endpoint | `GET /insights`, returns `Insight[]` | assumed | Thejitha |
| CSV export | `GET /export/csv` with the same query params as `/tests`, returns a CSV file | assumed | Thejitha |
| Auth | None. No headers, no keys. | assumed | Thejitha |
| Errors | Non-2xx status means error; body is not parsed | assumed | Thejitha |
| Timeout | 10 s client-side (`REQUEST_TIMEOUT_MS`) | assumed | Thejitha |

## Filter query params (`/investigations`, `/tests`, `/export/csv`)

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| `fuel_class` | `solid` \| `gas` \| `liquid` | assumed | Thejitha |
| `hardware` | exact hardware name, case-insensitive | assumed | Thejitha |
| `pillar` | `prevention` \| `detection` \| `suppression` \| `supporting` | assumed | Thejitha |
| `o2_min`, `o2_max` | oxygen, percent by volume | assumed | Thejitha |
| `pressure_min`, `pressure_max` | total pressure, psi | assumed | Thejitha |
| `q` | free-text search | assumed | Thejitha |
| `investigation_id` | `/tests` and `/export/csv` only | assumed | Thejitha |
| Investigation range filters | match when the investigation's range **overlaps** the filter range | assumed | Thejitha |
| Test range filters | match when the test value is **inside** the filter range (inclusive) | assumed | Thejitha |

## Shared shapes

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| `Citation.paper_title` | string | assumed | Dhinanjaya |
| `Citation.investigation` | investigation name, string | assumed | Dhinanjaya |
| `Citation.page` | integer or `null` | assumed | Dhinanjaya |
| `Citation.quote` | verbatim source passage | assumed | Dhinanjaya |
| `Citation.source_url` | string or `null` | assumed | Dhinanjaya |
| `Evidence.test_count`, `repeats` | non-negative integers | assumed | Dhinanjaya |
| `Evidence.platform` | `iss` \| `drop_tower` \| `other` | assumed | Dhinanjaya |
| `Evidence.strength` | `low` \| `medium` \| `high` | assumed | Dhinanjaya |
| Range object | `{ min: number, max: number }`, `min <= max` | assumed | Thejitha |

## AskResponse

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| `answer` | string (empty when not grounded) | assumed | Thejitha |
| `grounded` | boolean; `false` = "Not in the data" | assumed | Thejitha |
| `citations` | `Citation[]`, 0 to 4 | assumed | Thejitha |
| `evidence` | `Evidence` or `null` | assumed | Thejitha |
| `latency_ms` | number or `null` | assumed | Thejitha |

## Investigation

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| `id` | string | assumed | Dhinanjaya |
| `name`, `hardware`, `objective` | strings | assumed | Dhinanjaya |
| `pillar` | `prevention` \| `detection` \| `suppression` \| `supporting` | assumed | Dhinanjaya |
| `fuels[]` | `{ name, fuel_class, sample_shape, sample_size }` | assumed | Dhinanjaya |
| `fuels[].sample_size` | free text including units | assumed | Dhinanjaya |
| `conditions.o2_percent` | range, percent | assumed | Dhinanjaya |
| `conditions.pressure_psi` | range, psi | assumed | Dhinanjaya |
| `conditions.flow_speed_cm_s` | range, cm/s, or `null` | assumed | Dhinanjaya |
| `variables`, `sensors` | `string[]` | assumed | Dhinanjaya |
| `citations` | `Citation[]` | assumed | Dhinanjaya |
| `sample` | boolean, `true` only for stub records | assumed | Thejitha |

## TestRecord

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| `id`, `investigation_id`, `investigation_name`, `fuel` | strings | assumed | Dhinanjaya |
| `fuel_class` | `solid` \| `gas` \| `liquid` | assumed | Dhinanjaya |
| `flow_direction` | `opposed` \| `concurrent` \| `quiescent` | assumed | Dhinanjaya |
| `o2_percent` | number, percent, 0 to 100 | assumed | Dhinanjaya |
| `pressure_psi` | number, psi | assumed | Dhinanjaya |
| `flow_speed_cm_s` | number, cm/s, or `null` | assumed | Dhinanjaya |
| `platform` | `iss` \| `drop_tower` \| `other` | assumed | Dhinanjaya |
| `ended_early` | boolean; `true` = flame still burning at end of run (censored) | assumed | Dhinanjaya |
| `result` | free text | assumed | Dhinanjaya |
| `spread_rate` | number or `null`, **unit assumed mm/s** | assumed | Dhinanjaya |
| `citation` | `Citation` or `null` | assumed | Dhinanjaya |
| `sample` | boolean | assumed | Thejitha |

## Insight

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| `id`, `title`, `summary`, `score_reason` | strings | assumed | Thejitha |
| `recommendation` | one-line string | assumed | Thejitha |
| `risk_level` | `high` \| `medium` \| `low` | assumed | Thejitha |
| `safety_impact`, `evidence_strength`, `mission_relevance` | integers 1 to 5 | assumed | Thejitha |
| `score` | integer = product of the three factors (1 to 125); validated client-side | assumed | Thejitha |
| `citations` | `Citation[]` | assumed | Thejitha |
| `reviewed` | boolean | assumed | Thejitha |
| `sample` | boolean | assumed | Thejitha |

## Front-end only decisions

| Item | Decision |
|---|---|
| CSV in stub mode | `exportCsvUrl()` returns `null`; the UI builds the CSV from `getTests()` data, stamped "v0.1, unverified" |
| Stub Ask routing | keywords: "moon" or "30%" → answer 1, "saffire" or "bass" → answer 2, "smoke" → answer 3, anything else → not in the data |
| Stub latency | random 400 to 900 ms |
| Stub content | every record has `"sample": true`; finding-like text starts with `[SAMPLE]`; all numbers are invented placeholders |

## Explore filter gaps (M4)

The Explore page applies every filter client-side as well (`src/lib/filters.ts`), so results are correct even where the backend has no matching param. Gaps to confirm or close on the backend:

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| Multi-select `pillar` | Backend takes one value. Front end sends `pillar` only when exactly one is selected; multi-select filtered client-side. Could become `pillar=a,b` | assumed | Thejitha |
| Multi-select `fuel_class` | Same as pillar: sent only when exactly one is selected | assumed | Thejitha |
| `platform` filter | No backend param. Investigations have no platform field, so an investigation matches when any of its tests ran on the selected platform (derived from `/tests`). Could become `platform=iss,drop_tower` | assumed | Thejitha |
| Facets (hardware list, pressure bounds) | Derived client-side from unfiltered `/investigations` and `/tests` | assumed | Thejitha |
| CSV `dataset_status` column | Stub CSV adds `dataset_status = "v0.1, preliminary / unverified"` on every row. Live `/export/csv` should add the same column | assumed | Thejitha |
| CSV fuel-class view | When the per-test fuel-class switch is set, the CSV request sends that `fuel_class` | assumed | Thejitha |

## Habitats and Coverage Map (M5)

Habitat numbers live only in `src/lib/habitats.ts`.

| Item | Assumed value | Status | Owner to confirm |
|---|---|---|---|
| Earth | 21 % O₂, 14.7 psi | confirmed (project plan) | Samadhi |
| Moon Base | 30 % O₂, 10.2 psi | confirmed (project plan) | Samadhi |
| Pressurised rover | Same atmosphere as Moon Base; drawn and ranked as one shared zone "Moon Base / pressurised rover" | confirmed (project plan) | Samadhi |
| Spacesuit | 100 % O₂, 4.3 psi | confirmed (project plan) | Samadhi |
| ISS | No values; listed as "values pending", not drawn or ranked | TBC | Samadhi |
| Mars habitat | No values; listed as "values pending", not drawn or ranked | TBC | Samadhi |
| Display band half-widths | O₂ ±2 % (spacesuit ±3 %, clamped at 100 %), pressure ±0.5 psi. Illustrative only: size the shaded boxes and the "tests in band" count. Not specifications | assumed (front end) | Samadhi |
| Relevance distance | d = √(((O₂ − O₂ₕ)/100)² + ((p − pₕ)/16)²), normalised by chart range; investigation distance = closest test | assumed (front end) | Samadhi |
| "Nearby" radius and labels | d ≤ 0.15 nearby; Very close ≤ 0.03, Close ≤ 0.08, Nearby ≤ 0.15, else Far | assumed (front end) | Samadhi |
| Default habitat on /coverage | Moon Base (demo scene) when no `?habitat=` is given | front-end decision | Dinith |
