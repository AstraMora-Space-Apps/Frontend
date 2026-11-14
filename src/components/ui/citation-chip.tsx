"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CitationChipProps = {
  /** Full paper title. Shortened in the chip, shown in full in the tooltip. */
  paper: string;
  /** null or omitted when the source has no page number. */
  page?: number | string | null;
  className?: string;
  /**
   * Optional disclosure mode: when `onToggle` is given the chip becomes a toggle button
   * for a quote panel with id `controlsId` (aria-expanded / aria-controls).
   */
  expanded?: boolean;
  onToggle?: () => void;
  controlsId?: string;
};

function shorten(title: string, max = 32) {
  return title.length > max ? `${title.slice(0, max - 1).trimEnd()}…` : title;
}

/** Compact source citation (Hard rule 4). Keyboard-focusable; tooltip shows the full title. */
function CitationChip({
  paper,
  page,
  className,
  expanded,
  onToggle,
  controlsId,
}: CitationChipProps) {
  const hasPage = page !== null && page !== undefined && page !== "";
  const full = hasPage ? `${paper}, page ${page}` : paper;
  const disclosure = onToggle !== undefined;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={
              disclosure
                ? `${expanded ? "Hide" : "Show"} quote from source: ${full}`
                : `Source: ${full}`
            }
            aria-expanded={disclosure ? Boolean(expanded) : undefined}
            aria-controls={disclosure ? controlsId : undefined}
            onClick={onToggle}
            className={cn(
              "inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-pill border border-border bg-surface-raised px-3 py-1 text-sm text-foreground transition-colors hover:border-cyan/60",
              expanded && "border-cyan/70 bg-cyan/10",
              className,
            )}
          />
        }
      >
        <BookOpen className="size-4 shrink-0 text-cyan" aria-hidden />
        <span className="max-w-[16rem] min-w-0 truncate">{shorten(paper)}</span>
        {hasPage ? <span className="text-muted-foreground">p.&nbsp;{page}</span> : null}
        {disclosure ? (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        ) : null}
      </TooltipTrigger>
      <TooltipContent className="max-w-sm bg-popover text-sm text-popover-foreground">
        {full}
      </TooltipContent>
    </Tooltip>
  );
}

export { CitationChip };
export type { CitationChipProps };
