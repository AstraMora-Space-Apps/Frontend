@AGENTS.md

# FlameSight Front End

## Project summary

1. FlameSight is a dashboard over NASA PSI microgravity combustion data, built by Team AstraMora for NASA Space Apps Colombo 2026 (Flame in Freefall, Virtual Track).
2. This repo is the front end only: Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui + Plotly.
3. The backend is a separate FastAPI service (owner: Thejitha). Data and RAG: Samadhi, Dhinanjaya, Senindu.
4. Main features: Ask (grounded RAG chat with citations), Explore/Compare, Coverage Map (O2 vs pressure), Ranked Insights.
5. The full milestone plan lives in `docs/MILESTONES.md`. Implement one milestone at a time.

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

## Conventions

- TypeScript strict. No `any` (use `unknown` + zod parsing instead).
- Server components by default. Add `"use client"` only when a component needs state, effects, or browser APIs.
- Charts are client-only. Always render Plotly through `@/components/charts/Plot` (uses `next/dynamic` with `ssr: false` and the `plotly.js-basic-dist-min` bundle). Never import `plotly.js` or `react-plotly.js` directly in pages.
- All API access goes through `src/lib/api.ts` only. No `fetch` calls to the backend anywhere else.
- Shared types and zod schemas live only in `src/lib/types.ts`.
- No hardcoded colours outside the design tokens in `src/app/globals.css`. Use Tailwind token classes (`bg-background`, `text-primary`, ...).
- Class names: merge with `cn()` from `@/lib/utils`.
- Env vars: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_STUB`. See `.env.example`. Never commit `.env*` files other than `.env.example`, and never commit API keys.
- Do not add dependencies beyond those in `package.json` without asking first.
- Data hooks live in `src/lib/hooks.ts` (React Query over `src/lib/api.ts`). Pages use the hooks, never `api.ts` fetch internals. Charts take one bucket from `splitByFuelClass()`, never the raw test list.
- `/dev/contract` is a local-only check of the data layer (404 in production). Never link it from the nav.
- Stub mode is on unless `NEXT_PUBLIC_USE_STUB=false`. Assumptions about backend fields live in `docs/API_ASSUMPTIONS.md`.
- Never show "Built with AI assistance" or any AI-use disclosure anywhere in the UI (footer, About page, metadata). This overrides `docs/MILESTONES.md`.
- Folders: `src/app` (routes), `src/components/{ui,layout,charts,ask,explore}`, `src/lib`, `src/stub` (sample JSON), `public`.

## Milestone workflow

- `main` holds M0. Every later milestone gets its own branch `feat/<name>` (names in `docs/MILESTONES.md`) and one pull request into `main`.
- Thejitha reviews and merges.
- Before every commit, all of these must pass: `npm run build`, `npm run lint`, `npm run typecheck`.
- Treat each milestone's "Done" list as acceptance criteria. Report pass/fail for each item.
- If a field name or number is not in the milestone or schema, log it in `docs/API_ASSUMPTIONS.md` instead of inventing it.
- Feature freeze Sun 05:00. After that, bug fixes only.
