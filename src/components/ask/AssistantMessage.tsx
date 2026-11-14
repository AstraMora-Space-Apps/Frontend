"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, PenLine, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EvidenceBadge } from "@/components/ui/evidence-badge";
import { NotInData } from "@/components/ui/not-in-data";
import type { ApiError, DataSource } from "@/lib/api";
import type { AskResponse, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { AssistantChatMessage } from "./chat-state";
import { QuoteList } from "./QuoteList";

const PLATFORM_LABEL: Record<Platform, string> = {
  iss: "ISS",
  drop_tower: "Drop tower",
  other: "Other platform",
};

const NOT_IN_DATA_TEXT =
  "FlameSight found no supporting evidence in the PSI research it has indexed, so it will not guess.";

type Actions = {
  onRetry: (message: AssistantChatMessage) => void;
  onRephrase: () => void;
};

function AssistantShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card variant="raised" className={cn("p-5 sm:p-6", className)}>
      <span className="sr-only">FlameSight answered: </span>
      {children}
    </Card>
  );
}

/* --------------------------------------------------------------- loading */

function LoadingCard() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
    <AssistantShell>
      <p
        className="flex items-center gap-2 text-base font-medium text-foreground"
        aria-live="polite"
      >
        <Sparkles className="size-5 animate-pulse text-ember-glow" aria-hidden />
        Searching NASA PSI research…
        {slow ? (
          <span className="text-muted-foreground">
            {" "}
            Still working, grounded answers can take up to 10 s.
          </span>
        ) : null}
      </p>
      <div className="mt-4 space-y-3" aria-hidden>
        {["w-11/12", "w-full", "w-9/12"].map((w) => (
          <div key={w} className={cn("h-4 animate-pulse rounded bg-surface", w)} />
        ))}
        <div className="flex gap-2 pt-2">
          <div className="h-9 w-40 animate-pulse rounded-pill bg-surface" />
          <div className="h-9 w-32 animate-pulse rounded-pill bg-surface" />
        </div>
      </div>
    </AssistantShell>
  );
}

/* ----------------------------------------------------------------- error */

const ERROR_COPY: Record<ApiError["kind"], string> = {
  timeout: "This is taking too long. Try again.",
  network: "Cannot reach the FlameSight service.",
  http: "The FlameSight service returned an error.",
  validation: "Unexpected response from the service.",
};

function ErrorCard({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  return (
    <AssistantShell className="border-risk-high/40">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-6 shrink-0 text-risk-high" aria-hidden />
        <div>
          <p className="text-lg font-bold text-foreground">{ERROR_COPY[error.kind]}</p>
          {error.kind === "http" && error.status ? (
            <p className="mt-1 text-base text-muted-foreground">Status code {error.status}.</p>
          ) : null}
          <Button onClick={onRetry} variant="outline" size="xl" className="mt-4 rounded-xl">
            <RotateCcw aria-hidden />
            Retry
          </Button>
        </div>
      </div>
    </AssistantShell>
  );
}

/* ---------------------------------------------------------- not in data */

function NotInDataCard({ onRephrase }: { onRephrase: () => void }) {
  return (
    <AssistantShell className="p-0 sm:p-0">
      <NotInData detail={NOT_IN_DATA_TEXT} className="border-0 bg-transparent p-5 sm:p-6" />
      <div className="flex flex-col gap-2 px-5 pb-5 sm:flex-row sm:px-6 sm:pb-6">
        <Button onClick={onRephrase} variant="outline" size="xl" className="rounded-xl">
          <PenLine aria-hidden />
          Rephrase your question
        </Button>
        <Link
          href="/explore"
          className={cn(
            buttonVariants({ variant: "outline", size: "xl" }),
            "rounded-xl border-cyan/50 bg-transparent text-cyan hover:bg-cyan/10 hover:text-cyan",
          )}
        >
          <Compass aria-hidden />
          Explore the research
        </Link>
      </div>
    </AssistantShell>
  );
}

/* ----------------------------------------------------------------- answer */

function formatLatency(ms: number) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function AnswerCard({ data, source }: { data: AskResponse; source: DataSource }) {
  return (
    <AssistantShell>
      {source === "stub" ? (
        <Badge variant="risk-medium" className="mb-3">
          [SAMPLE] stub answer
        </Badge>
      ) : null}
      <p className="max-w-[70ch] text-lg leading-relaxed whitespace-pre-line text-foreground">
        {data.answer}
      </p>

      {data.evidence ? (
        <div className="mt-4">
          <EvidenceBadge
            testCount={data.evidence.test_count}
            platform={PLATFORM_LABEL[data.evidence.platform]}
            repeats={data.evidence.repeats}
          />
          <span className="ml-2 text-sm text-muted-foreground">
            Evidence strength: {data.evidence.strength}
          </span>
        </div>
      ) : null}

      {data.citations.length > 0 ? (
        <section className="mt-5" aria-label="Sources for this answer">
          <h3 className="mb-2 text-base font-bold text-foreground">Sources</h3>
          <QuoteList citations={data.citations} />
        </section>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
        {data.latency_ms !== null ? (
          <span>Answered in {formatLatency(data.latency_ms)}</span>
        ) : null}
        <span>Source: {source}</span>
        <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
      </div>
    </AssistantShell>
  );
}

/* ------------------------------------------------------------- dispatcher */

function AssistantMessage({
  message,
  onRetry,
  onRephrase,
}: { message: AssistantChatMessage } & Actions) {
  if (message.status === "loading" || !message.result) return <LoadingCard />;
  const { result } = message;
  if (!result.ok) return <ErrorCard error={result.error} onRetry={() => onRetry(message)} />;
  // Hard rule 4: no answer text, citations or evidence when not grounded.
  if (!result.data.grounded) return <NotInDataCard onRephrase={onRephrase} />;
  return <AnswerCard data={result.data} source={result.source} />;
}

export { AssistantMessage };
