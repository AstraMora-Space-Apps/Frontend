import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowRight, Check, CircleAlert, Code2 } from "lucide-react";
import { AboutToc } from "@/components/about/AboutToc";
import { AccuracyCard } from "@/components/about/AccuracyCard";
import { PipelineDiagram } from "@/components/about/PipelineDiagram";
import { SourcesList } from "@/components/about/SourcesList";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  AI_MODEL_NAME,
  AI_SECTION,
  LIMITS,
  OBJECTIVES,
  RANKING,
  REPO_URL,
  TOC,
  TRUST,
  VERSION_STATEMENT,
  WHAT,
} from "@/lib/about-content";
import { FACTORS, MAX_SCORE, recomputeScore } from "@/lib/insights";

export const metadata: Metadata = pageMetadata({
  title: "About FlameSight",
  description:
    "How FlameSight works, how insights are ranked, its accuracy, limits and data sources.",
});

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 outline-none"
    >
      <h2 id={`${id}-title`} className="text-2xl sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const title = (id: (typeof TOC)[number]["id"]) => TOC.find((t) => t.id === id)?.label ?? id;

export default function AboutPage() {
  const ex = RANKING.example;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <PageHeader
        title="About FlameSight"
        subtitle="How it works, how insights are ranked, what it can and cannot tell you, and where the data comes from."
        actions={<Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AboutToc items={TOC} />
        </aside>

        <div className="min-w-0 space-y-14">
          <Section id="what" title={title("what")}>
            <p className="max-w-[70ch] text-lg">{WHAT.paragraphs.join(" ")}</p>
            <ol className="grid gap-3 sm:grid-cols-3">
              {WHAT.steps.map((s, i) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="group flex h-full flex-col rounded-card border border-border bg-surface p-4 hover:border-ember/60"
                  >
                    <span className="flex items-center gap-2 text-lg font-bold">
                      <span className="flex size-8 items-center justify-center rounded-pill bg-ember/15 text-ember">
                        {i + 1}
                      </span>
                      {s.label}
                      <ArrowRight
                        className="ml-auto size-5 text-ember transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-2 text-base text-muted-foreground">{s.body}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="objectives" title={title("objectives")}>
            <ol className="grid gap-4 md:grid-cols-3">
              {OBJECTIVES.map((o, i) => (
                <li key={o.title}>
                  <Card className="h-full p-5">
                    <p className="text-sm font-semibold text-muted-foreground">Objective {i + 1}</p>
                    <h3 className="mt-1 text-xl">{o.title}</h3>
                    <p className="mt-2 text-base text-muted-foreground">{o.body}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {o.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            className="inline-flex min-h-11 items-center rounded-pill border border-cyan/50 px-3 text-sm font-semibold text-cyan hover:bg-cyan/10"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="how" title={title("how")}>
            <PipelineDiagram />
          </Section>

          <Section id="trust" title={title("trust")}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {TRUST.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-base"
                >
                  <Check className="mt-1 size-5 shrink-0 text-risk-low" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="ranking" title={title("ranking")}>
            <p className="max-w-[70ch] text-lg">{RANKING.intro}</p>
            <p className="text-xl font-bold">
              Score = {FACTORS.map((f) => f.label).join(" × ")}{" "}
              <span className="text-muted-foreground">(max {MAX_SCORE})</span>
            </p>
            <dl className="grid gap-3 md:grid-cols-3">
              {FACTORS.map((f) => (
                <div key={f.key} className="rounded-xl border border-border bg-surface p-4">
                  <dt className="font-bold">{f.label} (1–5)</dt>
                  <dd className="mt-1 text-base text-muted-foreground">{f.definition}</dd>
                </div>
              ))}
            </dl>
            <Card variant="raised" className="p-5">
              <Badge variant="risk-medium">{RANKING.exampleLabel}</Badge>
              <p className="mt-3 text-2xl font-bold tabular-nums">
                {ex.safety_impact} × {ex.evidence_strength} × {ex.mission_relevance} ={" "}
                <span className="text-ember">{recomputeScore(ex)}</span>
                <span className="text-base font-normal text-muted-foreground"> / {MAX_SCORE}</span>
              </p>
              <p className="mt-1 text-base text-muted-foreground">
                Safety impact {ex.safety_impact}, evidence strength {ex.evidence_strength}, mission
                relevance {ex.mission_relevance}.
              </p>
            </Card>
          </Section>

          <Section id="accuracy" title={title("accuracy")}>
            <AccuracyCard />
          </Section>

          <Section id="limits" title={title("limits")}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {LIMITS.map((l) => (
                <li
                  key={l}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-base"
                >
                  <CircleAlert className="mt-1 size-5 shrink-0 text-risk-medium" aria-hidden />
                  {l}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="sources" title={title("sources")}>
            <SourcesList />
          </Section>

          <Section id="ai" title={title("ai")}>
            {AI_SECTION.paragraphs.map((p) => (
              <p key={p} className="max-w-[70ch] text-lg">
                {p}
              </p>
            ))}
            {AI_MODEL_NAME ? (
              <p className="text-base text-muted-foreground">Model: {AI_MODEL_NAME}</p>
            ) : null}
            <Card className="max-w-[70ch] p-5 text-base">{AI_SECTION.independence}</Card>
          </Section>

          <Section id="code" title={title("code")}>
            {REPO_URL ? (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-cyan underline-offset-4 hover:underline"
              >
                <Code2 className="size-5" aria-hidden />
                Source code on GitHub
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
            <p className="text-lg">{VERSION_STATEMENT}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
