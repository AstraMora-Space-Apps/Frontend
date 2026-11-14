"use client";

import { BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CitationChipProps = {
  /** Full paper title. Shortened in the chip, shown in full in the tooltip. */
  paper: string;
  page: number | string;
  className?: string;
};

function shorten(title: string, max = 32) {
  return title.length > max ? `${title.slice(0, max - 1).trimEnd()}…` : title;
}

/** Compact source citation (Hard rule 4). Keyboard-focusable; tooltip shows the full title. */
function CitationChip({ paper, page, className }: CitationChipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={`Source: ${paper}, page ${page}`}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-border bg-surface-raised px-3 py-1 text-sm text-foreground transition-colors hover:border-cyan/60",
              className,
            )}
          />
        }
      >
        <BookOpen className="size-4 shrink-0 text-cyan" aria-hidden />
        <span className="max-w-[16rem] truncate">{shorten(paper)}</span>
        <span className="text-muted-foreground">p.&nbsp;{page}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm bg-popover text-sm text-popover-foreground">
        {paper}, page {page}
      </TooltipContent>
    </Tooltip>
  );
}

export { CitationChip };
export type { CitationChipProps };
