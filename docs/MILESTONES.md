# FlameSight Front End: Milestone Plan (Dinith, M5)

Team AstraMora, NASA Space Apps Colombo 2026, Flame in Freefall (Virtual Track).
Stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Plotly.
Repo: org repo `flamesight`, folder `frontend/`. Backend (FastAPI) is Thejitha's. Data and RAG are Samadhi, Dhinanjaya, Senindu.

## How to work

- Milestone 0 is done on `main`. Every later milestone gets its own branch `feat/<name>`, one pull request into `main`.
- Thejitha (M4) reviews and merges. Merge to `main` only when `npm run build` passes and the Done checklist is true.
- Push every hour. Never commit `.env*` (except `.env.example`) or API keys.
- Start coding only at Sat 14 Nov 09:00 (event start). Before that: wireframes, palette, logo, accounts only.
- Feature freeze Sun 05:00. After that: bug fixes only.
- Cut order if behind (from the team roadmap): (1) Where-to-test-next, (2) dual RAG score comparison, (3) Safety-Margin Explorer. Never cut: Ask, Cards/Compare, Coverage Map, public deployment.

## Hard rules (apply to every milestone)

1. No NASA logos, flags, insignia, or mission patches anywhere. Original FlameSight logo only.
2. Never plot gas-flame tests (ACME CFI-G) on the same axes as solid-fuel tests. Separate by fuel class; colour by flow direction (opposed, concurrent, quiescent).
3. Tests that ended early (flame still burning at end of run) = hollow markers. Habitat references = shaded boxes.
4. Every answer and insight shows citations (paper, page), an evidence-strength badge (test count, platform, repeats), and a "Not in the data" state when evidence is missing.
5. Badge "v0.1, preliminary / unverified" on research panels, CSV export, and footer.
6. No login wall anywhere. Must work logged out and on a phone.
7. High contrast, large type (body >= 18px, chart text >= 16px): judges watch a recorded video.
8. No minors in any screenshot or video.
9. Field names and units come from the frozen SQLite schema / data dictionary. Change them in one file only (`src/lib/types.ts` + `src/lib/api.ts`).
10. Stub data must be visibly fake ("SAMPLE, not real data") and a banner shows while stub mode is on.

## Milestones

| # | Branch | Target time | Result |
|---|--------|-------------|--------|
| M0 | `main` | Sat 09:00-10:00 | Project configured, hello page deployed |
| M1 | `feat/design-system-shell` | Sat 10:00-11:30 | Theme, logo, layout, nav, footer, badges |
| M2 | `feat/data-contract-stub` | Sat 11:30-12:30 | Types, API client, stub mode |
| M3 | `feat/ask-flamesight` | Sat 12:30-15:00 | Chat with citations. Checkpoint 1 (15:00) |
| M4 | `feat/explore-compare` | Sat 15:00-16:30 | Cards, filters, compare, CSV |
| M5 | `feat/coverage-map-habitat` | Sat 16:30-18:30 | O2 vs pressure map, Habitat Finder |
| M6 | `feat/insights-about` | Sat 18:30-19:30 | Ranked insights, About page |
| M7 | `feat/live-data` | Sat 14:15-18:00 in parallel, finish by 19:30 | Switch stub to real API |
| M8 | `feat/safety-margin` | Sat 19:30-20:30 | Preliminary O2 margin explorer (cuttable) |
| M9 | `feat/polish-mobile` | Sat 20:30-22:00 | Polish, mobile, a11y. Checkpoint 2 (22:00) |
| M10 | `feat/pitch-mode` | Sun 03:00-06:30 | Demo scenario, screenshots, freeze |

M7 (live data) starts as soon as Thejitha's real endpoints exist (target 18:00) but the stub layer from M2 lets M3 to M6 proceed first.

---

### M0: Project configuration (on `main`)

Do:
- `create-next-app` in `frontend/`: TypeScript, Tailwind, ESLint, App Router, `src/` dir, alias `@/*`.
- Install: `shadcn/ui` (init, dark theme), `react-plotly.js` + `plotly.js-basic-dist-min` + `@types/react-plotly.js`, `framer-motion`, `lucide-react`, `@tanstack/react-query`, `zod`, `clsx`, `tailwind-merge`, `prettier`.
- Folders: `src/app`, `src/components/{ui,layout,charts,ask,explore}`, `src/lib`, `src/stub`, `public`.
- `.env.example` with `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_USE_STUB=true`.
- `frontend/CLAUDE.md` with the Hard rules above and conventions (see prompt).
- `docs/MILESTONES.md` = this file.
- Scripts: `dev`, `build`, `lint`, `typecheck`, `format`.
- Deploy hello page to Vercel (project root `frontend`), public, no password protection.

Done: `npm run build`, `npm run lint`, `npm run typecheck` pass. Public hello URL opens logged out. Pushed to `main`.

### M1: Design system and shell (`feat/design-system-shell`)

Do:
- Design tokens in `globals.css` and Tailwind config: near-black navy background, ember orange accent, soft cyan secondary, off-white text. WCAG AA contrast.
- Font: Inter (via `next/font`). Body 18px.
- Original FlameSight logo as inline SVG (round, spherical flame).
- Layout: sticky header (logo, nav, "v0.1 preliminary" badge), responsive nav (drawer on mobile), footer with disclosure text and "Built with AI assistance (Claude)".
- Shared components: `Card`, `Badge`, `EvidenceBadge`, `CitationChip`, `StubBanner`, `NotInData`, `PageHeader`.
- Empty routes for: `/ask`, `/explore`, `/coverage`, `/safety-margin`, `/insights`, `/about`. Home `/` = hero + three entry cards (Ask, Explore, Act).

Done: All routes render in dark theme. Looks right at 375px and 1440px. No NASA marks. Lighthouse accessibility >= 90.

### M2: Data contract and stub (`feat/data-contract-stub`)

Do:
- `src/lib/types.ts`: zod schemas and TS types for `AskResponse`, `Investigation`, `TestRecord`, `Insight`. Match Thejitha's endpoint models and the data dictionary. If not frozen yet, use best-guess names and list assumptions in `docs/API_ASSUMPTIONS.md`.
- `src/lib/api.ts`: `ask()`, `getInvestigations()`, `getTests()`, `getInsights()`, `exportCsvUrl()`. 10 s timeout, parse with zod, friendly error object (never throw into UI).
- Stub mode: when `NEXT_PUBLIC_USE_STUB=true`, read from `src/stub/*.json`. Stub records carry `"sample": true` and `StubBanner` shows.
- React Query provider, loading and error states.

Done: Types compile. Switching the env flag changes the data source with no component edits. Stub banner visible in stub mode.

### M3: Ask FlameSight (`feat/ask-flamesight`)

Do:
- Chat UI at `/ask`: input, send, message list, loading skeleton, example-question chips (e.g. "Which tested materials are risky at the Moon Base's 30% oxygen?").
- Answer card: answer text, 2-4 citation chips (paper, investigation, page), expandable quoted source passage, evidence badge.
- `NotInData` state when the API says evidence is missing. No guessing text.
- Cache repeated questions client-side. Error state with retry.

Done: Typing a question returns a cited answer end to end on stub, and on live as soon as `/ask` exists (Checkpoint 1, Sat 15:00). `NotInData` shown for a stub unanswerable question.

### M4: Explore and Compare (`feat/explore-compare`)

Do:
- `/explore`: filters (fuel class, hardware, O2 range, pressure, pillar: prevention / detection / suppression), search.
- Investigation card: objective, fuels with sample shape/size, conditions, variables, sensors.
- Select 2-3 cards, open a side-by-side compare view (e.g. BASS vs Saffire).
- Per-test table with sort, CSV download button (file stamped "v0.1, unverified").

Done: Filters change the list. Compare works for 2 and 3 items. CSV downloads with the stamp.

### M5: Coverage Map and Habitat Finder (`feat/coverage-map-habitat`)

Do:
- `/coverage`: Plotly scatter, O2 % (x) vs pressure (y).
- Shaded habitat boxes: Earth (21%, 14.7 psi), ISS, Moon Base (30%, 10.2 psi), Spacesuit (100%, 4.3 psi). Mars and rover values live in `src/lib/habitats.ts` flagged `TBC` until confirmed with Samadhi. Do not invent numbers.
- Hollow markers (`circle-open`) for tests that ended early.
- Fuel-class switch (solid vs gas). Never mix. Colour by flow direction. Hover shows investigation, fuel, O2, pressure, result.
- Habitat Relevance Finder: pick a habitat, see nearest experiments ranked by distance in O2/pressure space, each linking to its card.

Done: Map shows hollow vs solid markers correctly, gas never on solid axes, Moon Base box visible, finder ranks consistently.

### M6: Ranked Insights and About (`feat/insights-about`)

Do:
- `/insights`: list with risk level, evidence strength, one-line recommendation, score breakdown (Safety impact x Evidence strength x Mission relevance, each 1-5), and "Reviewed" badge when the review flag is true.
- `/about`: how grounded RAG works, ranking formula, slot for the 20-question accuracy score (plain vs table-filtered RAG), limitations (no partial-gravity data in PSI yet, rockets out of scope), data sources with links, preliminary status, AI-use disclosure.

Done: Score breakdown visible per insight. About page covers method, accuracy slot, limits.

### M7: Live data integration (`feat/live-data`)

Do:
- Point `NEXT_PUBLIC_API_BASE_URL` at Thejitha's deployed API. Confirm CORS allows the Vercel domain (ask Thejitha).
- Reconcile field names and units with the frozen schema. Fix only in `types.ts` / `api.ts`.
- Test all pages on live data. Log mismatches in `docs/API_ASSUMPTIONS.md`.
- Set `NEXT_PUBLIC_USE_STUB=false` for production.

Done: All MVP pages run on real data on the public URL. Stub banner gone.

### M8: Safety-Margin Explorer (`feat/safety-margin`) (cuttable)

Do: `/safety-margin` grouped bar chart, 1-g vs microgravity O2 limit across 8-12 paired materials. Large "Preliminary" label. Source citations per bar.

Done: Chart readable at video scale. Preliminary label obvious. If behind schedule, skip and remove from nav.

### M9: Polish and mobile (`feat/polish-mobile`)

Do:
- Motion with Framer Motion (subtle: card entrance, chart reveal). Respect reduced motion.
- Mobile pass at 375px for every page. Chart sizes, touch targets >= 44px.
- Accessibility: focus rings, labels, alt text, colour-blind-safe chart palette.
- Footer and badges present on every page. Open Graph image and favicon (original art).
- Test logged out, in incognito, and on a real phone.

Done: Checkpoint 2 (Sat 22:00): all MVP features live on the public URL, usable on phone.

### M10: Pitch mode (`feat/pitch-mode`)

Do:
- Demo scenario route or preset: Moon Base 30% O2 story. Live `/ask` query, then Coverage Map with Moon Base box, then BASS vs Saffire compare, then Ranked Insights. Presets reachable by one click or a `?demo=moon` query.
- Capture high-resolution screenshots for the project page (no NASA marks, no minors).
- Support the 30-second subtitled demo video.
- Freeze features at Sun 05:00.

Done: The 1m45s demo can be run without typing mistakes. Screenshots saved. Public link verified in incognito and on mobile.

---

## Prompts

Before using them: clone the repo, `mkdir -p frontend/docs`, copy this file to `frontend/docs/MILESTONES.md`, and start Claude Code from inside `frontend/`. Do not attach the PDFs. All rules from them are already in this file and in the CLAUDE.md that the M0 prompt creates.

### M0 prompt (run on `main`, after Sat 09:00)

```text
Read @docs/MILESTONES.md, section "M0: Project configuration", plus the "How to work" and "Hard rules" sections. Do only M0.

Context: I am Dinith, front-end lead of Team AstraMora, building FlameSight, a dashboard over NASA PSI microgravity combustion data for NASA Space Apps Colombo 2026. Backend is a separate FastAPI service. This folder (frontend/) is the Next.js app.

Tasks:
1. Scaffold Next.js in this folder (App Router, TypeScript, Tailwind, ESLint, src/ dir, alias @/*) using `npx create-next-app@latest .`. Keep the existing docs/ folder.
2. Install and configure: shadcn/ui (dark, neutral base), react-plotly.js with plotly.js-basic-dist-min and @types/react-plotly.js (always load charts with next/dynamic, ssr: false), framer-motion, lucide-react, @tanstack/react-query, zod, clsx, tailwind-merge, prettier.
3. Create the folder structure from M0 and add scripts: dev, build, lint, typecheck (tsc --noEmit), format.
4. Create .env.example (NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_USE_STUB=true). Make sure .env* other than .env.example is gitignored.
5. Create frontend/CLAUDE.md containing: project summary in 5 lines, the full "Hard rules" list from docs/MILESTONES.md, conventions (TypeScript strict, no any, server components by default, charts client-only, all API access only through src/lib/api.ts, shared types only in src/lib/types.ts, no hardcoded colours outside tokens), and the milestone workflow (one branch per milestone, build/lint/typecheck must pass before commit).
6. Replace the default home page with a minimal "FlameSight" hello page with the text "v0.1, preliminary / unverified". No logo yet, no NASA branding.
7. Run `npm run build`, `npm run lint`, `npm run typecheck` and fix all errors.

Constraints: do not build any feature pages. Do not add dependencies beyond the list. Do not touch folders outside frontend/. Do not commit or push; show me `git status` and a proposed commit message at the end.
```

### Milestone prompt template (M1 to M10, each on its own branch)

First: `git checkout main && git pull && git checkout -b feat/<branch-name-from-plan>`

```text
Read @docs/MILESTONES.md. Implement ONLY milestone <Mn: title> (branch <branch>). Follow its "Do" list exactly and treat its "Done" list as acceptance criteria. Obey every item under "Hard rules" and frontend/CLAUDE.md.

Before coding: reply with a short plan (files to create or change, components, anything ambiguous). If a field name or number is not in the milestone or schema, add it to docs/API_ASSUMPTIONS.md instead of inventing it silently.

While coding: reuse existing components in src/components/ui and tokens from globals.css. No new dependencies unless unavoidable (tell me first). Keep all data access in src/lib/api.ts.

Finish: run `npm run build`, `npm run lint`, `npm run typecheck`; open the pages in the browser at 375px and 1440px and fix visible problems; then list each "Done" item with pass or fail. Do not commit or push; propose a commit message.
```

### Extra prompt for M5 (map details)

```text
Additional constraints for the Coverage Map: use Plotly scatter traces, one trace group per fuel class and flow direction; ended-early tests use marker.symbol "circle-open"; habitat boxes are layout.shapes rectangles with 0.15 opacity fill and a text label; chart font size >= 16; hover text shows investigation, fuel, O2 %, pressure, result. Habitat values come only from src/lib/habitats.ts, with Mars and rover marked TBC.
```
