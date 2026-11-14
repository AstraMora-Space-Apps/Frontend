"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  type ExploreFilters,
  type NumRange,
} from "@/lib/filters";
import { Filters } from "./Filters";

type MobileFiltersProps = {
  value: ExploreFilters;
  onApply: (next: ExploreFilters) => void;
  hardwareOptions: readonly string[];
  pressureBounds: NumRange;
};

/** Below lg: "Filters" button opens a bottom sheet; changes apply on "Apply". */
function MobileFilters({ value, onApply, hardwareOptions, pressureBounds }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const count = activeFilterCount(value);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (o) setDraft(value);
        setOpen(o);
      }}
    >
      <SheetTrigger
        render={
          <Button
            variant="outline"
            className="min-h-11 gap-2 rounded-xl px-4 text-base lg:hidden"
          />
        }
      >
        <SlidersHorizontal className="size-5" aria-hidden />
        Filters
        {count > 0 ? (
          <span className="rounded-pill bg-ember px-2 text-sm font-bold text-primary-foreground">
            {count}
            <span className="sr-only"> active</span>
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] gap-0 rounded-t-2xl border-border bg-surface p-0 text-base [&>[data-slot=sheet-close]]:top-3 [&>[data-slot=sheet-close]]:right-3 [&>[data-slot=sheet-close]]:size-11"
      >
        <div className="border-b border-border px-5 py-4 pr-16">
          <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Narrow the investigations and tests.
          </SheetDescription>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Filters
            value={draft}
            onChange={setDraft}
            hardwareOptions={hardwareOptions}
            pressureBounds={pressureBounds}
          />
        </div>
        <div className="flex gap-3 border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="outline"
            size="xl"
            className="flex-1 rounded-xl"
            onClick={() => setDraft({ ...EMPTY_FILTERS, investigationId: draft.investigationId })}
          >
            Reset
          </Button>
          <Button
            size="xl"
            className="flex-1 rounded-xl"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileFilters };
