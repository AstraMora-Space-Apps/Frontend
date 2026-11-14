import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type EvidenceBadgeProps = {
  testCount: number;
  platform: string;
  repeats: number;
  className?: string;
};

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Evidence strength pill, e.g. "12 tests · ISS · 3 repeats" (Hard rule 4). */
function EvidenceBadge({ testCount, platform, repeats, className }: EvidenceBadgeProps) {
  const label = `${plural(testCount, "test")} · ${platform} · ${plural(repeats, "repeat")}`;
  return (
    <Badge variant="cyan" className={className} aria-label={`Evidence strength: ${label}`}>
      <FlaskConical aria-hidden />
      {label}
    </Badge>
  );
}

export { EvidenceBadge };
export type { EvidenceBadgeProps };
