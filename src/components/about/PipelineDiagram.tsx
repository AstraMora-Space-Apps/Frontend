import {
  ArrowDown,
  ArrowRight,
  Database,
  FileSearch,
  FileText,
  Quote,
  Search,
  Sparkles,
} from "lucide-react";
import { PIPELINE } from "@/lib/about-content";

const ICONS = [FileText, Sparkles, Database, Search, FileSearch, Quote] as const;

/** Six-step pipeline, CSS + inline SVG icons only. Vertical on mobile, 3×2 grid on desktop. */
function PipelineDiagram() {
  return (
    <figure aria-labelledby="pipeline-caption">
      <ol className="grid gap-2 md:grid-cols-3 md:gap-x-4 md:gap-y-6">
        {PIPELINE.map((step, i) => {
          const Icon = ICONS[i] ?? FileText;
          const last = i === PIPELINE.length - 1;
          return (
            <li key={step.title} className="relative flex flex-col items-stretch">
              <div className="flex h-full items-start gap-3 rounded-card border border-border bg-surface-raised p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-ember/15 text-ember">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-bold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-base text-muted-foreground">{step.caption}</p>
                </div>
              </div>
              {!last ? (
                <>
                  <ArrowDown className="mx-auto my-1 size-6 text-cyan md:hidden" aria-hidden />
                  {(i + 1) % 3 !== 0 ? (
                    <ArrowRight
                      className="absolute top-1/2 -right-4 z-10 hidden size-5 -translate-y-1/2 text-cyan md:block"
                      aria-hidden
                    />
                  ) : null}
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
      <figcaption id="pipeline-caption" className="mt-3 text-sm text-muted-foreground">
        From public NASA sources to an answer you can check: retrieval first, then writing only from
        what was retrieved.
      </figcaption>
    </figure>
  );
}

export { PipelineDiagram };
