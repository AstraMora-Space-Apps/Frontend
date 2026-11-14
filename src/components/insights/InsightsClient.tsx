"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/explore/States";
import { NotInData } from "@/components/ui/not-in-data";
import { useInsights } from "@/lib/hooks";
import {
  DEFAULT_INSIGHT_FILTERS,
  parseInsightFilters,
  rankInsights,
  writeInsightFilters,
  type InsightFilters,
} from "@/lib/insights";
import { InsightCard, insightAnchor } from "./InsightCard";
import { InsightControls } from "./InsightControls";

const HIGHLIGHT_MS = 2200;

function InsightsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramString = params.toString();
  const filters = useMemo(
    () => parseInsightFilters(new URLSearchParams(paramString)),
    [paramString],
  );

  const setFilters = useCallback(
    (f: InsightFilters) => {
      const qs = writeInsightFilters(new URLSearchParams(paramString), f).toString();
      // Keep any #insight-... hash out of filter changes; replace avoids flooding history.
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [paramString, pathname, router],
  );

  const q = useInsights();
  const ranked = useMemo(() => rankInsights(q.data ?? [], filters), [q.data, filters]);

  // Deep link: /insights#insight-<id> scrolls to the card and highlights it briefly.
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const dataReady = q.data !== undefined;
  useEffect(() => {
    if (!dataReady) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const focusHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash.startsWith("insight-")) return;
      const el = document.getElementById(hash);
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      el.focus({ preventScroll: true });
      setHighlighted(hash);
      clearTimeout(timer);
      timer = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    };
    const first = requestAnimationFrame(focusHash);
    window.addEventListener("hashchange", focusHash);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("hashchange", focusHash);
      clearTimeout(timer);
    };
  }, [dataReady]);

  if (q.error) return <ErrorState error={q.error} onRetry={q.refetch} />;
  if (q.isLoading || q.data === undefined) {
    return (
      <div className="space-y-5" aria-busy="true">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  if (q.data.length === 0) return <NotInData detail="No insights have been generated yet." />;

  return (
    <div className="space-y-5">
      <InsightControls value={filters} onChange={setFilters} count={ranked.length} />
      {ranked.length === 0 ? (
        <EmptyState what="insights" onReset={() => setFilters(DEFAULT_INSIGHT_FILTERS)} />
      ) : (
        <ol className="space-y-5" aria-label="Ranked insights">
          {ranked.map((r, i) => (
            <li
              key={r.insight.id}
              className="stagger-item"
              style={{ "--i": i } as React.CSSProperties}
            >
              <InsightCard ranked={r} highlighted={highlighted === insightAnchor(r.insight.id)} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export { InsightsClient };
