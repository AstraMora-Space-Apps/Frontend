import { Badge } from "@/components/ui/badge";
import { PLATFORM_LABEL } from "@/lib/filters";
import { computeReduction, formatLimit, formatReduction } from "@/lib/margins";
import type { Citation, SafetyMargin } from "@/lib/types";

type MarginTableProps = {
  margins: readonly SafetyMargin[];
  onSelect: (id: string) => void;
};

const sourceText = (c: Citation) => `${c.paper_title}${c.page !== null ? `, p. ${c.page}` : ""}`;

function cells(m: SafetyMargin) {
  return {
    g1: formatLimit(m.loc_1g_percent, m.loc_1g_is_bound),
    ug: formatLimit(m.loc_microgravity_percent, m.loc_microgravity_is_bound),
    reduction: formatReduction(computeReduction(m)),
    pressure: m.pressure_psi === null ? "Not reported" : `${m.pressure_psi} psi`,
    platform:
      m.platform_microgravity === null ? "Not reported" : PLATFORM_LABEL[m.platform_microgravity],
    evidence: m.evidence
      ? `${m.evidence.test_count} tests · ${PLATFORM_LABEL[m.evidence.platform]} · ${m.evidence.repeats} repeats`
      : "Not reported",
    sources: m.citations.length ? m.citations.map(sourceText).join("; ") : "Not in the data",
  };
}

function MaterialName({ m, onSelect }: { m: SafetyMargin; onSelect: (id: string) => void }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(m.id)}
        className="min-h-11 text-left font-semibold text-foreground underline-offset-4 hover:underline"
      >
        {m.material}
      </button>
      {m.sample ? <Badge variant="risk-medium">[SAMPLE]</Badge> : null}
    </span>
  );
}

/** Non-visual alternative to the chart: a real table on md+, stacked cards on phones. */
function MarginTable({ margins, onSelect }: MarginTableProps) {
  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-base">
          <caption className="sr-only">
            Oxygen limits in 1-g and microgravity per material. ≤ marks a bound: the flame was still
            burning at the lowest oxygen tested.
          </caption>
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              {[
                "Material",
                "1-g limit",
                "Microgravity limit",
                "Reduction",
                "Pressure",
                "Platform",
                "Evidence",
                "Sources",
              ].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {margins.map((m) => {
              const c = cells(m);
              return (
                <tr key={m.id} className="border-b border-border/60 align-top">
                  <th scope="row" className="px-3 py-2 font-normal">
                    <MaterialName m={m} onSelect={onSelect} />
                  </th>
                  <td className="px-3 py-3 whitespace-nowrap">{c.g1}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{c.ug}</td>
                  <td className="px-3 py-3">{c.reduction}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{c.pressure}</td>
                  <td className="px-3 py-3">{c.platform}</td>
                  <td className="px-3 py-3">{c.evidence}</td>
                  <td className="px-3 py-3 text-sm break-words">{c.sources}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="Materials">
        {margins.map((m) => {
          const c = cells(m);
          const rows: [string, string][] = [
            ["1-g limit", c.g1],
            ["Microgravity limit", c.ug],
            ["Reduction", c.reduction],
            ["Pressure", c.pressure],
            ["Platform", c.platform],
            ["Evidence", c.evidence],
            ["Sources", c.sources],
          ];
          return (
            <li key={m.id} className="rounded-card border border-border bg-surface p-4">
              <MaterialName m={m} onSelect={onSelect} />
              <dl className="mt-2 space-y-1">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-base">
                    <dt className="w-36 shrink-0 text-muted-foreground">{k}</dt>
                    <dd className="min-w-0 break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { MarginTable };
