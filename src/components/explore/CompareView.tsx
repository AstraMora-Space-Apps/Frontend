"use client";

import { useState } from "react";
import { Info, MoveHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { buildCompareRows, mixesFuelClasses, similarities } from "@/lib/compare";
import type { Investigation } from "@/lib/types";
import { cn } from "@/lib/utils";

type CompareViewProps = {
  open: boolean;
  investigations: readonly Investigation[];
  onOpenChange: (open: boolean) => void;
};

const joinOrNone = (items: readonly string[]) => (items.length ? items.join(", ") : "none");

/** Side-by-side comparison. Dialog on desktop, full-screen sheet on mobile. Base UI handles focus trap, Esc, focus return. */
function CompareView({ open, investigations, onOpenChange }: CompareViewProps) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const rows = buildCompareRows(investigations);
  const visible = onlyDiff ? rows.filter((r) => r.differs) : rows;
  const sim = similarities(investigations);
  const mixed = mixesFuelClasses(investigations);
  const valid = investigations.length >= 2 && investigations.length <= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-surface p-0 text-base sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[88dvh] sm:w-[min(72rem,calc(100%-3rem))] sm:max-w-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border [&>[data-slot=dialog-close]]:top-3 [&>[data-slot=dialog-close]]:right-3 [&>[data-slot=dialog-close]]:size-11">
        <div className="border-b border-border px-5 py-4 pr-16 sm:px-6">
          <DialogTitle className="text-2xl font-bold">
            Compare {investigations.map((i) => i.name).join(" vs ")}
          </DialogTitle>
          <DialogDescription className="mt-1 text-base text-muted-foreground">
            {valid
              ? `Shared fuels: ${joinOrNone(sim.fuels)}. Shared sensors: ${joinOrNone(sim.sensors)}. Shared variables: ${joinOrNone(sim.variables)}.`
              : "Choose 2 or 3 investigations to compare."}
          </DialogDescription>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={onlyDiff}
                onChange={(e) => setOnlyDiff(e.target.checked)}
                className="size-5 accent-[var(--fs-ember)]"
              />
              Show only differences
            </label>
            <Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>
          </div>
          {mixed ? (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-cyan/40 bg-cyan/10 p-3 text-base text-foreground">
              <Info className="mt-0.5 size-5 shrink-0 text-cyan" aria-hidden />
              These investigations use different fuel classes. Compare conditions, not flame results
              directly.
            </p>
          ) : null}
        </div>

        <p className="flex items-center gap-2 px-5 pt-3 text-sm text-muted-foreground sm:hidden">
          <MoveHorizontal className="size-4" aria-hidden />
          Scroll sideways to see every column.
        </p>

        <div
          className="min-h-0 flex-1 overflow-auto px-0 pb-4 sm:px-2"
          tabIndex={0}
          aria-label="Comparison table"
        >
          {valid ? (
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-base">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 left-0 z-20 w-40 border-b border-border bg-surface px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
                  >
                    Field
                  </th>
                  {investigations.map((inv) => (
                    <th
                      key={inv.id}
                      scope="col"
                      className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3 text-left text-lg font-bold"
                    >
                      {inv.name}
                      {inv.sample ? (
                        <span className="ml-2 text-sm font-semibold text-risk-medium">
                          [SAMPLE]
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={investigations.length + 1}
                      className="px-4 py-6 text-muted-foreground"
                    >
                      No differences: every compared field is identical.
                    </td>
                  </tr>
                ) : (
                  visible.map((row) => (
                    <tr key={row.key}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-b border-border bg-surface px-4 py-3 text-left align-top text-sm font-semibold text-muted-foreground"
                      >
                        {row.label}
                        {row.differs ? <span className="sr-only"> (differs)</span> : null}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={investigations[i]?.id ?? i}
                          className={cn(
                            "border-b border-border px-4 py-3 align-top break-words",
                            row.differs && "bg-ember/[0.06] shadow-[inset_3px_0_0_var(--fs-ember)]",
                          )}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-6 text-muted-foreground">
              Select 2 or 3 investigations, then open Compare again.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CompareView };
