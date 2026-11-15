# API assumptions (M2, reconciled in M7)

Written in M2 as best guesses, then checked in M7 against the Backend repo (`AstraMora-Space-Apps/Backend`, `app/schemas.py` and `app/main.py`) and a local run of it. Status: `confirmed` = backend matches, `corrected` = value changed, `gap` = open question for the owner, `assumed` = not yet checked.

Fix mismatches **only** in `src/lib/types.ts`, `src/lib/api.ts` and `src/stub/*.json` (Hard rule 9).

## How to switch to live

1. Set `NEXT_PUBLIC_USE_STUB=false` and `NEXT_PUBLIC_API_BASE_URL=<deployed FastAPI URL, no trailing slash>` (in `.env.local` locally, and in Vercel project settings for production). Optional: `NEXT_PUBLIC_API_TIMEOUT_MS` (default 10000). Optional: `NEXT_PUBLIC_SITE_URL` (public site URL) so Open Graph images, robots and the sitemap use absolute URLs; without it the sitemap is empty and Next uses its default base URL.
2. CORS: the backend allows `*`, `https://*.vercel.app` and `http://localhost:*` (checked in M7). If a custom domain is blocked, add it to the Backend's `ALLOWED_ORIGINS`.
3. CORS fallback (off by default): set `API_PROXY_TARGET=<backend URL>` (server env) and `NEXT_PUBLIC_API_BASE_URL=/api`. Next.js then proxies `/api/*` to the backend.
4. Open `/dev/contract` locally (`npm run dev`). Every row should pass with `source: live`.
5. For a failing row, fix the field name, enum or unit in `src/lib/types.ts` (and the query param in `src/lib/api.ts`). Update the stub JSON so stub and live stay identical. Update this table.

Stub mode is **on** unless `NEXT_PUBLIC_USE_STUB` is exactly `false`, so a missing env var never makes silent live calls.

## Endpoints

| Item | Assumed value | Status |
|---|---|---|
| Ask endpoint | `POST /ask`, JSON body `{ "question": string }`, returns `AskResponse` | confirmed (Backend `app/schemas.py`, M7) |
| Investigations endpoint | `GET /investigations`, returns `Investigation[]` | confirmed (Backend `app/schemas.py`, M7) |
| Tests endpoint | `GET /tests`, returns `TestRecord[]` | confirmed (Backend `app/schemas.py`, M7) |
| Insights endpoint | `GET /insights`, returns `Insight[]` | confirmed (Backend `app/schemas.py`, M7) |
| CSV export | `GET /export/csv`, same params as `/tests`. File `flamesight_per_test_v0.1_unverified.csv`; first line is a `# FlameSight Per-Test Dataset (v0.1, unverified extraction ...)` comment, then the header. Columns `id`, `investigation_name`, `citation_quote` differ from the stub CSV | corrected (M7) |
| Auth | None. No headers, no keys. | confirmed (Backend `app/schemas.py`, M7) |
| Errors | Non-2xx means error. Backend sends a JSON body `{ error, message, version, disclaimer }` on 500; the front end ignores the body and shows the typed http error | confirmed (M7) |
| Timeout | 10 s client-side, configurable via `NEXT_PUBLIC_API_TIMEOUT_MS`. Backend proxies the AI service with an 8 s timeout and answers inside that | confirmed (M7) |

## Filter query params (`/investigations`, `/tests`, `/export/csv`)

| Item | Assumed value | Status |
|---|---|---|
| `fuel_class` | `solid` \| `gas` \| `liquid` | confirmed (Backend `app/schemas.py`, M7) |
| `hardware` | exact hardware name, case-insensitive | confirmed (Backend `app/schemas.py`, M7) |
| `pillar` | `prevention` \| `detection` \| `suppression` \| `supporting` | confirmed (Backend `app/schemas.py`, M7) |
| `o2_min`, `o2_max` | oxygen, percent by volume | confirmed (Backend `app/schemas.py`, M7) |
| `pressure_min`, `pressure_max` | total pressure, psi | confirmed (Backend `app/schemas.py`, M7) |
| `q` | free-text search | confirmed (Backend `app/schemas.py`, M7) |
| `investigation_id` | `/tests` and `/export/csv` only | confirmed (Backend `app/schemas.py`, M7) |
| Investigation range filters | match when the investigation's range **overlaps** the filter range | confirmed (Backend `app/schemas.py`, M7) |
| Test range filters | match when the test value is **inside** the filter range (inclusive) | confirmed (Backend `app/schemas.py`, M7) |

## Shared shapes

| Item | Assumed value | Status |
|---|---|---|
| `Citation.paper_title` | string | confirmed (Backend `app/schemas.py`, M7) |
| `Citation.investigation` | investigation name, string | confirmed (Backend `app/schemas.py`, M7) |
| `Citation.page` | integer or `null`. Backend has no lower bound; front end now accepts `>= 0` (was `> 0`) so one odd page cannot fail a whole list | corrected (M7) |
| `Citation.quote` | verbatim source passage | confirmed (Backend `app/schemas.py`, M7) |
| `Citation.source_url` | string or `null` | confirmed (Backend `app/schemas.py`, M7) |
| `Evidence.test_count`, `repeats` | non-negative integers | confirmed (Backend `app/schemas.py`, M7) |
| `Evidence.platform` | `iss` \| `drop_tower` \| `other` | confirmed (Backend `app/schemas.py`, M7) |
| `Evidence.strength` | `low` \| `medium` \| `high` | confirmed (Backend `app/schemas.py`, M7) |
| Range object | `{ min: number, max: number }`, `min <= max` | confirmed (Backend `app/schemas.py`, M7) |

## AskResponse

| Item | Assumed value | Status |
|---|---|---|
| `answer` | string (empty when not grounded) | confirmed (Backend `app/schemas.py`, M7) |
| `grounded` | boolean; `false` = "Not in the data" | confirmed (Backend `app/schemas.py`, M7) |
| `citations` | `Citation[]`, 0 to 4 | confirmed (Backend `app/schemas.py`, M7) |
| `evidence` | `Evidence` or `null` | confirmed (Backend `app/schemas.py`, M7) |
| `latency_ms` | number or `null` | confirmed (Backend `app/schemas.py`, M7) |

## Investigation

| Item | Assumed value | Status |
|---|---|---|
| `id` | string | confirmed (Backend `app/schemas.py`, M7) |
| `name`, `hardware`, `objective` | strings | confirmed (Backend `app/schemas.py`, M7) |
| `pillar` | `prevention` \| `detection` \| `suppression` \| `supporting` | confirmed (Backend `app/schemas.py`, M7) |
| `fuels[]` | `{ name, fuel_class, sample_shape, sample_size }` | confirmed (Backend `app/schemas.py`, M7) |
| `fuels[].sample_size` | free text including units | confirmed (Backend `app/schemas.py`, M7) |
| `conditions.o2_percent` | range, percent, or `null` (not reported; 11 of 30 live investigations). Missing `conditions` becomes all-null ranges | corrected (deployed backend, M7) |
| `conditions.pressure_psi` | range, psi, or `null` (17 of 30 live investigations) | corrected (deployed backend, M7) |
| `conditions.flow_speed_cm_s` | range, cm/s, or `null` (19 of 30 live investigations) | corrected (deployed backend, M7) |
| `variables`, `sensors` | `string[]` | confirmed (Backend `app/schemas.py`, M7) |
| `citations` | `Citation[]` | confirmed (Backend `app/schemas.py`, M7) |
| `sample` | boolean. Backend meaning: `true` = served from its seed fallback (no SQLite), `false` = from SQLite. Front end shows `[SAMPLE]` whenever `true` | corrected (M7) |

## TestRecord

| Item | Assumed value | Status |
|---|---|---|
| `id`, `investigation_id`, `investigation_name`, `fuel` | strings. Test `id` is only unique within an investigation; the front end keys tests by `investigation_id:id` (`testKey`) | corrected (deployed backend, M7) |
| `fuel_class` | `solid` \| `gas` \| `liquid` | confirmed (Backend `app/schemas.py`, M7) |
| `flow_direction` | `opposed` \| `concurrent` \| `quiescent` \| `null` (null for 1947 of 1979 live tests; plotted grey as "Flow not reported") | corrected (deployed backend, M7) |
| `o2_percent` | number, percent, 0 to 100, or `null` (825 live tests). Tests without O₂ or pressure are listed but not plotted | corrected (deployed backend, M7) |
| `pressure_psi` | number, psi, or `null` (690 live tests). Live values reach about 73 psi; the Coverage Map axis extends beyond 16 psi when needed | corrected (deployed backend, M7) |
| `flow_speed_cm_s` | number, cm/s, or `null` | confirmed (Backend `app/schemas.py`, M7) |
| `platform` | `iss` \| `drop_tower` \| `other` | confirmed (Backend `app/schemas.py`, M7) |
| `ended_early` | boolean or `null`. `null` = censoring not reported (all 1979 live tests): shown as "Outcome not reported" (diamond marker), never as burned or ended early | corrected (deployed backend, M7) |
| `result` | free text | confirmed (Backend `app/schemas.py`, M7) |
| `spread_rate` | number or `null`, **unit assumed mm/s** | confirmed (Backend `app/schemas.py`, M7) |
| `citation` | `Citation` or `null` | confirmed (Backend `app/schemas.py`, M7) |
| `sample` | boolean | confirmed (Backend `app/schemas.py`, M7) |

## Insight

| Item | Assumed value | Status |
|---|---|---|
| `id`, `title`, `summary`, `score_reason` | strings | confirmed (Backend `app/schemas.py`, M7) |
| `recommendation` | one-line string | confirmed (Backend `app/schemas.py`, M7) |
| `risk_level` | `high` \| `medium` \| `low` | confirmed (Backend `app/schemas.py`, M7) |
| `safety_impact`, `evidence_strength`, `mission_relevance` | integers 1 to 5 | confirmed (Backend `app/schemas.py`, M7) |
| `score` | integer = product of the three factors (1 to 125); validated client-side | confirmed (Backend `app/schemas.py`, M7) |
| `citations` | `Citation[]` | confirmed (Backend `app/schemas.py`, M7) |
| `reviewed` | boolean | confirmed (Backend `app/schemas.py`, M7) |
| `sample` | boolean | confirmed (Backend `app/schemas.py`, M7) |

## Front-end only decisions

| Item | Decision |
|---|---|
| CSV in stub mode | `exportCsvUrl()` returns `null`; the UI builds the CSV from `getTests()` data, stamped "v0.1, unverified" |
| Stub Ask routing | keywords: "moon" or "30%" → answer 1, "saffire" or "bass" → answer 2, "smoke" → answer 3, anything else → not in the data |
| Stub latency | random 400 to 900 ms |
| Stub content | every record has `"sample": true`; finding-like text starts with `[SAMPLE]`; all numbers are invented placeholders |

## Explore filter gaps (M4)

The Explore page applies every filter client-side as well (`src/lib/filters.ts`), so results are correct even where the backend has no matching param. Gaps to confirm or close on the backend:

| Item | Assumed value | Status |
|---|---|---|
| Multi-select `pillar` | Backend takes one value. Front end sends `pillar` only when exactly one is selected; multi-select filtered client-side. Could become `pillar=a,b` | confirmed (M7) |
| Multi-select `fuel_class` | Same as pillar: sent only when exactly one is selected | confirmed (M7) |
| `platform` filter | No backend param. Investigations have no platform field, so an investigation matches when any of its tests ran on the selected platform (derived from `/tests`). Could become `platform=iss,drop_tower` | confirmed (M7) |
| Facets (hardware list, pressure bounds) | Derived client-side from unfiltered `/investigations` and `/tests` | confirmed (M7, no facet endpoint; client-side is correct) |
| CSV stamp | Backend stamps with a leading `#` comment line instead of a `dataset_status` column. Stamp is present; the comment line shows as a junk first row in Excel. Ask: add `dataset_status` column or drop the comment | gap (M7) |
| CSV fuel-class view | When the per-test fuel-class switch is set, the CSV request sends that `fuel_class` | confirmed (M7, `/export/csv` accepts `fuel_class`) |

## Habitats and Coverage Map (M5)

Habitat numbers live only in `src/lib/habitats.ts`.

| Item | Assumed value | Status |
|---|---|---|
| Earth | 21 % O₂, 14.7 psi | confirmed (project plan) |
| Moon Base | 30 % O₂, 10.2 psi | confirmed (project plan) |
| Pressurised rover | Same atmosphere as Moon Base; drawn and ranked as one shared zone "Moon Base / pressurised rover" | confirmed (project plan) |
| Spacesuit | 100 % O₂, 4.3 psi | confirmed (project plan) |
| ISS | No values; listed as "values pending", not drawn or ranked | TBC |
| Mars habitat | No values; listed as "values pending", not drawn or ranked | TBC |
| Display band half-widths | O₂ ±2 % (spacesuit ±3 %, clamped at 100 %), pressure ±0.5 psi. Illustrative only: size the shaded boxes and the "tests in band" count. Not specifications | assumed (front end) |
| Relevance distance | d = √(((O₂ − O₂ₕ)/100)² + ((p − pₕ)/16)²), normalised by chart range; investigation distance = closest test | assumed (front end) |
| "Nearby" radius and labels | d ≤ 0.15 nearby; Very close ≤ 0.03, Close ≤ 0.08, Nearby ≤ 0.15, else Far | assumed (front end) |
| Default habitat on /coverage | Moon Base (demo scene) when no `?habitat=` is given | front-end decision |

## Safety margins (M8)

The plan assumed `GET /safety-margins` returning the canonical `SafetyMargin` shape below. The deployed backend already serves equivalent data at `GET /api/safety-margins` in a different shape, so `src/lib/api.ts` maps it (`mapLiveSafetyMargin`). The page never synthesises margins from other tables. A 404 or an empty list shows "Safety-margin data is not available yet".

| Canonical field (`types.ts`) | Meaning | Live source (`/api/safety-margins`) | Status |
|---|---|---|---|
| Endpoint | `SafetyMargin[]` | `GET /api/safety-margins` (not `/safety-margins`) | corrected (deployed backend, M8) |
| `id` | string, unique | not sent; front end uses `<row index>-<material slug>` | gap |
| `material` | string | `material` | confirmed (M8) |
| `category` | string or `null` | `category` (e.g. "Fabric", "Gaseous Simulant") | confirmed (M8) |
| `fuel_class` | `solid` only; other classes rejected (Hard rule 2) | not sent; derived: a category containing "gas" means gas. Non-solid rows are dropped and counted on the page | assumed |
| `pressure_psi` | number, psi, or `null` | `pressure_psi` (backend default 14.7) | confirmed (M8) |
| `flow_speed_cm_s` | number, cm/s, or `null` | `flow_speed_cm_s` | confirmed (M8) |
| `loc_1g_percent` | lowest O₂ (%) with a sustained flame in 1-g, or `null` | `limit_1g_o2_percent` | confirmed (M8) |
| `loc_microgravity_percent` | same, in microgravity, or `null` | `limit_ug_o2_percent` | confirmed (M8) |
| `loc_1g_is_bound`, `loc_microgravity_is_bound` | true = limit not reached (flame still burning at the lowest O₂ tested); true limit at or below the value | not sent; mapped to `false` (values treated as measured limits) | gap |
| `platform_microgravity` | `iss` | `drop_tower` | `other`, or `null` (shown "Not reported") | not sent; `null` | gap |
| `evidence` | `Evidence` or `null` | not sent; `null` ("Evidence strength not reported") | gap |
| `citations` | `Citation[]` | `citation` free text such as "BASS-II_001, p. 4", parsed into title and page; no quote, no URL | gap |
| `note` | string or `null` | `notes` | confirmed (M8) |
| `sample` | boolean | not sent; `false` | confirmed (M8) |
| (not used) | | `delta_o2_percent` (microgravity minus 1-g, negative = more flammable) and `danger_direction`. The front end computes its own reduction (1-g minus microgravity) | front-end decision |

Front-end definitions (`src/lib/margins.ts`):

| Item | Decision | Status |
|---|---|---|
| Reduction | `loc_1g_percent − loc_microgravity_percent`, percentage points; positive = less safety margin in microgravity | assumed |
| Reduction qualifier | both exact → exact; microgravity bound → "at least"; 1-g bound or both bound → cannot be determined (direction shown as "not lower" when certain); missing value → cannot be determined | assumed |
| Habitat comparison | limit ≤ habitat O₂ → "below" (certain even for a bound); exact limit > habitat O₂ → "above"; bound > habitat O₂ → unknown. Habitat O₂ from `habitats.ts` only (Earth 21 %, Moon Base / rover 30 %) | assumed |
| Unpaired | either limit `null`; hidden unless "Show unpaired materials" is on | front-end decision |

## Gaps to report (M7, M8)

Checked against the deployed backend `https://backend-632g.onrender.com` and the Backend repo. The deployed contract is newer than the repo `main`: many fields are now nullable or optional. The front end accepts these and shows "Not reported"; it never fills in values.

| Gap | Detail |
|---|---|
| Repo out of date | Deployed OpenAPI makes `conditions`, its ranges, test `o2_percent`, `pressure_psi`, `flow_direction`, `ended_early` and several list fields nullable or optional; Backend repo `main` (`app/schemas.py`) still marks them required. Please push the deployed schema |
| `/ask` still canned | `/health` reports `ai_service_configured: true`, but answers are word-for-word the `seed_data.py` fallback (about 2 ms), and "What fuels were burned in ACME CFI-G?" returns not-in-data although the database has those tests. The proxy appears to fall back on every call; check the AI service URL and logs |
| Fallback text makes specific claims | The canned Moon Base answer includes figures such as "lowers the required ignition energy by over 40%". Verify or soften before the demo |
| Censoring not reported | `ended_early` is `null` for all 1979 tests, so no hollow markers can be shown. Send it if censoring can be extracted |
| Sparse conditions | `flow_direction` null for 1947 tests; O₂ null for 825 and pressure null for 690 tests (only 1015 of 1979 can be placed on the Coverage Map); 11 to 19 investigations lack O₂, pressure or flow ranges |
| Test ids not globally unique | Ids repeat across investigations (for example `1` in BASS and SAME); the front end now keys by `investigation_id:id`. Consider globally unique ids |
| Service changed and stalled during testing | Response size changed mid-session (redeploy), and one run hit 10 s timeouts on every call before the service recovered. Add a keep-warm ping to `/health` and avoid redeploys close to the demo |
| No human review yet | All 281 insights have `reviewed: false` (an earlier deploy had all `true`). Set the flag only for insights that were actually reviewed |
| CSV stamp format | Leading `#` comment line instead of a `dataset_status` column; Excel shows it as a junk first row |
| Large payload | `/tests` is about 1 MB (1979 records) and loads on Explore and Coverage. Fine for now; server-side pagination would help on phones |
| Safety margins: bound flags missing | `/api/safety-margins` has no censoring flags, so every limit is shown as a measured value and the page reports "9 exact". If any limit was not reached (flame still burning at the lowest O₂ tested), send `loc_*_is_bound` |
| Safety margins: no evidence, platform, id or quote | Rows lack `evidence`, microgravity platform, an id and a verbatim quote; citation is free text ("BASS-II_001, p. 4"). The page shows "Not reported" and "No quoted passage" |
| Safety margins: gas row in a solid list | The list includes "Methane / N2 Circular Burner (BRE Simulant)", category "Gaseous Simulant". The page drops it (Hard rule 2) and says so; better to send `fuel_class` and serve gas separately |
| Safety margins: values to verify | Values and notes read like curated seed data (for example notes such as "posing ignition risk at Moon Base 30% O2"), and the endpoint path differs from the plan. Confirm the limits against the cited papers before the demo |
