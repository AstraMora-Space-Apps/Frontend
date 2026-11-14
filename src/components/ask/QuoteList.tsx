"use client";

import { useId, useState } from "react";
import { ExternalLink, Quote } from "lucide-react";
import { CitationChip } from "@/components/ui/citation-chip";
import type { Citation } from "@/lib/types";

/** Source chips; each toggles an inline panel with the quoted passage (one open at a time). */
function QuoteList({ citations }: { citations: readonly Citation[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <ul className="flex flex-wrap gap-2" aria-label="Sources">
        {citations.map((c, i) => (
          <li key={`${c.paper_title}-${i}`} className="max-w-full min-w-0">
            <CitationChip
              paper={c.paper_title}
              page={c.page}
              expanded={open === i}
              controlsId={`${baseId}-quote-${i}`}
              onToggle={() => setOpen((cur) => (cur === i ? null : i))}
            />
          </li>
        ))}
      </ul>
      {citations.map((c, i) => (
        <div
          key={`${c.paper_title}-panel-${i}`}
          id={`${baseId}-quote-${i}`}
          role="region"
          aria-label={`Quote from ${c.paper_title}`}
          hidden={open !== i}
          className="mt-3 rounded-lg border border-cyan/30 bg-background/60 p-4"
        >
          <blockquote className="flex gap-3 text-base text-foreground">
            <Quote className="mt-1 size-5 shrink-0 text-cyan" aria-hidden />
            {c.quote ? (
              <p className="max-w-[70ch]">{c.quote}</p>
            ) : (
              <p className="max-w-[70ch] text-muted-foreground italic">
                No quoted passage was provided for this source.
              </p>
            )}
          </blockquote>
          <p className="mt-3 text-sm text-muted-foreground">
            {c.paper_title}
            {c.investigation ? ` · ${c.investigation}` : ""}
            {c.page !== null ? ` · page ${c.page}` : ""}
          </p>
          {c.source_url ? (
            <a
              href={c.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-cyan underline-offset-4 hover:underline"
            >
              Open source
              <ExternalLink className="size-4" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export { QuoteList };
