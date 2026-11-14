"use client";

import { Columns3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Investigation } from "@/lib/types";

type CompareTrayProps = {
  selected: readonly Investigation[];
  message: string;
  onRemove: (id: string) => void;
  onCompare: () => void;
};

/** Sticky selection bar: bottom of the viewport on mobile, top of the results on desktop. */
function CompareTray({ selected, message, onRemove, onCompare }: CompareTrayProps) {
  const canCompare = selected.length >= 2;
  return (
    <div
      role="region"
      aria-label="Compare tray"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:sticky lg:top-20 lg:bottom-auto lg:mb-5 lg:rounded-card lg:border lg:px-4 lg:py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">
          Compare <span className="text-foreground">{selected.length}/3</span>
        </span>
        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground">Select 2 or 3 investigations.</span>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {selected.map((inv) => (
              <li key={inv.id}>
                <span className="inline-flex min-h-11 items-center gap-1 rounded-pill border border-ember/50 bg-ember/10 pl-3 text-sm font-medium text-foreground">
                  {inv.name}
                  <button
                    type="button"
                    onClick={() => onRemove(inv.id)}
                    aria-label={`Remove ${inv.name} from compare`}
                    className="flex size-11 items-center justify-center rounded-pill text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="ml-auto flex items-center gap-3">
          {!canCompare && selected.length === 1 ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">Select one more.</span>
          ) : null}
          <Button
            onClick={onCompare}
            disabled={!canCompare}
            className="min-h-11 gap-2 rounded-xl px-4 text-base"
            aria-describedby={message ? "compare-message" : undefined}
          >
            <Columns3 className="size-5" aria-hidden />
            Compare (2–3)
          </Button>
        </div>
      </div>
      <p
        id="compare-message"
        role="status"
        aria-live="polite"
        className="text-sm text-risk-medium empty:hidden"
      >
        {message}
      </p>
    </div>
  );
}

export { CompareTray };
