"use client";

import Link from "next/link";
import { Columns3, Compass, X } from "lucide-react";
import { QuoteList } from "@/components/ask/QuoteList";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FUEL_LABEL, PLATFORM_LABEL } from "@/lib/filters";
import { flowLabel } from "@/lib/plot";
import type { TestRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type PointDetailProps = { test: TestRecord; onClose: () => void };

/** Inline panel (not a modal) for a clicked map point. */
function PointDetail({ test, onClose }: PointDetailProps) {
  const rows: [string, string][] = [
    ["Fuel", `${test.fuel} (${FUEL_LABEL[test.fuel_class]})`],
    [
      "Flow direction",
      test.flow_direction === null ? "Not reported" : flowLabel(test.flow_direction),
    ],
    ["O₂", test.o2_percent === null ? "Not reported" : `${test.o2_percent} %`],
    ["Pressure", test.pressure_psi === null ? "Not reported" : `${test.pressure_psi} psi`],
    ["Flow speed", test.flow_speed_cm_s === null ? "Not reported" : `${test.flow_speed_cm_s} cm/s`],
    ["Platform", PLATFORM_LABEL[test.platform]],
    ["Spread rate", test.spread_rate === null ? "Not reported" : `${test.spread_rate}`],
    ["Result", test.result],
  ];
  return (
    <Card variant="raised" className="relative" aria-live="polite">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close test details"
        className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
      >
        <X className="size-5" aria-hidden />
      </button>
      <div className="flex flex-wrap items-center gap-2 pr-12">
        <h3 className="text-2xl">{test.investigation_name}</h3>
        <Badge variant={test.ended_early ? "risk-medium" : "default"}>
          {test.ended_early === null
            ? "Outcome not reported"
            : test.ended_early
              ? "Ended early"
              : "Burned to end"}
        </Badge>
        {test.sample ? <Badge variant="risk-medium">[SAMPLE]</Badge> : null}
      </div>
      {test.ended_early ? (
        <p className="mt-2 text-base text-muted-foreground">
          The flame was still burning when the experiment ended, so the true limit may be lower.
        </p>
      ) : null}
      <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-base">
            <dt className="w-32 shrink-0 text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5">
        <h4 className="mb-2 text-base font-bold">Source</h4>
        {test.citation ? (
          <QuoteList citations={[test.citation]} />
        ) : (
          <p className="text-base text-muted-foreground">No citation recorded for this test.</p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Link
          href={`/explore?tab=investigations&q=${encodeURIComponent(test.investigation_name)}`}
          className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-xl")}
        >
          <Compass aria-hidden />
          View investigation
        </Link>
        <Link
          href={`/explore?sel=${encodeURIComponent(test.investigation_id)}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "xl" }),
            "rounded-xl border-cyan/50 text-cyan hover:bg-cyan/10 hover:text-cyan",
          )}
        >
          <Columns3 aria-hidden />
          Add to compare
        </Link>
        <Badge variant="preliminary" className="self-center">
          v0.1 · preliminary / unverified
        </Badge>
      </div>
    </Card>
  );
}

export { PointDetail };
