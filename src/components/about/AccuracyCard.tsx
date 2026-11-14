import { Hourglass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ACCURACY, ACCURACY_COPY } from "@/lib/about-content";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-5xl font-extrabold text-ember tabular-nums">{value}%</p>
    </div>
  );
}

/** Shows measured accuracy only when real numbers exist. Never shows placeholder numbers. */
function AccuracyCard() {
  const { plain_rag, table_filtered_rag, measured_on, questions } = ACCURACY;
  const measured = plain_rag !== null && table_filtered_rag !== null;
  return (
    <Card className="space-y-4">
      <p className="max-w-[70ch] text-base text-muted-foreground">{ACCURACY_COPY.method}</p>
      {measured ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label={ACCURACY_COPY.plainLabel} value={plain_rag} />
            <Stat label={ACCURACY_COPY.filteredLabel} value={table_filtered_rag} />
          </div>
          <p className="text-sm text-muted-foreground">
            {questions} questions{measured_on ? `, measured on ${measured_on}` : ""}.
          </p>
        </>
      ) : (
        <p className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4 text-lg font-semibold">
          <Hourglass className="mt-1 size-5 shrink-0 text-ember-glow" aria-hidden />
          {ACCURACY_COPY.pending}
        </p>
      )}
    </Card>
  );
}

export { AccuracyCard };
