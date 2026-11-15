/**
 * All About-page copy and team-editable constants. Edit words here, not in components.
 * Team rule (CLAUDE.md): no "built with AI assistance" disclosure anywhere in the UI.
 * The AI section below describes how the PRODUCT uses a language model, which is part of
 * its method, plus the NASA non-affiliation statement.
 */

/* ----------------------------------------------------- team-editable values */

/** 20-question evaluation. Leave null until measured. NEVER pre-fill or estimate. */
export const ACCURACY: {
  questions: number;
  /** Percent correct, 0-100. */
  plain_rag: number | null;
  table_filtered_rag: number | null;
  /** ISO date, e.g. "2026-11-15". */
  measured_on: string | null;
} = { questions: 20, plain_rag: null, table_filtered_rag: null, measured_on: null };

// Owner (AI/ML): set the backend model name. While null the page omits it.
export const AI_MODEL_NAME: string | null = null;

// Owner (team): set the public GitHub repository URL. While null the link is hidden.
export const REPO_URL: string | null = null;

export const VERSION_STATEMENT = "v0.1-hackathon, preliminary / unverified";

/** Shown on /insights. Owner (team): confirm this matches the review process. */
export const INSIGHTS_PROCESS_NOTE =
  "Insights are proposed by an AI model and ranked by the formula above. Items marked Reviewed were checked by a human: an AI model proposes the safety-impact score and the wording, the other two scores are computed by rules, and a team member reviewed the top 33 by hand.";

/* ---------------------------------------------------------------- sections */

export const TOC = [
  { id: "what", label: "What FlameSight is" },
  { id: "objectives", label: "How it answers the challenge" },
  { id: "how", label: "How it works" },
  { id: "trust", label: "Why you can trust it" },
  { id: "ranking", label: "How insights are ranked" },
  { id: "accuracy", label: "Measured accuracy" },
  { id: "limits", label: "Limits and honesty" },
  { id: "sources", label: "Data and resources" },
  { id: "ai", label: "AI in FlameSight and independence" },
  { id: "code", label: "Code and version" },
] as const;

export const WHAT = {
  paragraphs: [
    "FlameSight is a research dashboard over public NASA microgravity combustion data.",
    "It helps teams planning Moon and Mars habitats find which fire experiments matter for their crew environments.",
    "Every answer and insight points back to the paper and page it came from.",
  ],
  steps: [
    { label: "Ask", href: "/ask", body: "Ask a question and get an answer with sources." },
    { label: "Explore", href: "/explore", body: "Filter, compare and download the test data." },
    { label: "Act", href: "/insights", body: "Read ranked, transparent safety insights." },
  ],
} as const;

export const OBJECTIVES = [
  {
    title: "Relevance to crew environments",
    body: "Shows where tests were run in oxygen and pressure and how close they are to habitat atmospheres.",
    links: [
      { label: "Coverage Map", href: "/coverage" },
      { label: "Habitat Finder", href: "/coverage#finder" },
      { label: "Ask", href: "/ask" },
    ],
  },
  {
    title: "Data for predictive modelling",
    body: "Exposes per-test conditions and outcomes in a sortable table that can be downloaded as CSV.",
    links: [
      { label: "Per-test table", href: "/explore?tab=tests" },
      { label: "CSV export", href: "/explore?tab=tests" },
    ],
  },
  {
    title: "Next-generation equipment",
    body: "Ranks insights across prevention, detection and suppression research to inform equipment choices.",
    links: [
      { label: "Ranked Insights", href: "/insights" },
      { label: "Explore by pillar", href: "/explore" },
    ],
  },
] as const;

export const PIPELINE = [
  { title: "NASA sources", caption: "Public research papers and PSI experiment data." },
  {
    title: "Extract and clean",
    caption: "Text and test conditions are pulled out and normalised.",
  },
  { title: "Two stores", caption: "A searchable text index and a structured test table." },
  { title: "Retrieve", caption: "The most relevant passages are found for each question." },
  { title: "Write from passages", caption: "The answer is written only from those passages." },
  { title: "Show citations", caption: "Paper and page are shown so you can check the source." },
] as const;

export const TRUST = [
  "Answers are written only from retrieved passages.",
  "Every answer cites the paper and page.",
  "It says “Not in the data” when evidence is missing instead of guessing.",
  "Evidence badges show test count, platform and repeats.",
  "Tests that ended early are hollow markers, because the true limit may be lower.",
  "Gas-flame and solid-fuel tests are never plotted together.",
  "Top insights are reviewed by a human.",
] as const;

export const RANKING = {
  intro:
    "Each insight gets three scores from 1 to 5. Multiplying them gives a score out of 125, so an insight needs all three to rank highly.",
  example: { safety_impact: 4, evidence_strength: 3, mission_relevance: 5 },
  exampleLabel: "Illustrative example, not a real finding",
} as const;

export const ACCURACY_COPY = {
  pending: "Measurement in progress. Results will appear here after the 20-question evaluation.",
  plainLabel: "Plain RAG",
  filteredLabel: "Table-filtered RAG",
  method:
    "The same 20 questions are answered with plain retrieval and with retrieval filtered by the structured test table, then checked against the sources.",
} as const;

export const LIMITS = [
  "No partial-gravity (Moon, Mars) data is in PSI yet.",
  "Microgravity and 1-g results are shown only as bounds, not as predictions for partial gravity.",
  "Future data such as LUCI and FM2 could be added.",
  "Rockets and propellants are out of scope.",
  "This is v0.1: preliminary and unverified.",
  "AI can make mistakes. Check the cited sources.",
  "Some tests ended before the flame went out (censored), so their limits are uncertain.",
  "Coverage depends on which documents were indexed.",
] as const;

export type SourceLink = { label: string; url: string | null; note: string };

export const SOURCES: readonly SourceLink[] = [
  {
    label: "NASA Physical Sciences Informatics (PSI)",
    url: "https://psi.nasa.gov",
    note: "Experiment data from microgravity combustion investigations.",
  },
  {
    label: "NASA Technical Reports Server (NTRS)",
    url: "https://ntrs.nasa.gov",
    note: "Public research papers and technical reports.",
  },
  {
    // Owner (team): add the Space Apps challenge Resources tab links. Hidden while url is null.
    label: "Space Apps challenge Resources tab links: to be added",
    url: null,
    note: "Placeholder.",
  },
];

export const AI_SECTION = {
  paragraphs: [
    "FlameSight uses a language model to write answers, and it may only use passages retrieved from the indexed research.",
    "The same model proposes the three insight scores; the science lead reviews the top insights by hand.",
  ],
  independence:
    "FlameSight is an independent hackathon project. It is not affiliated with or endorsed by NASA. NASA data is public; no NASA logos or insignia are used.",
} as const;
