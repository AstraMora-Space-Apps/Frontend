import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type NotInDataProps = {
  /** Optional override for the explanation line. */
  detail?: string;
  className?: string;
};

/** Shown instead of an answer when evidence is missing (Hard rule 4). Never guess. */
function NotInData({ detail, className }: NotInDataProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-4 rounded-card border border-dashed border-border bg-surface p-5",
        className,
      )}
    >
      <SearchX className="mt-0.5 size-7 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-lg font-bold text-foreground">Not in the data</p>
        <p className="mt-1 text-base text-muted-foreground">
          {detail ??
            "No answer is shown because the indexed research has no evidence for this. FlameSight does not guess."}
        </p>
      </div>
    </div>
  );
}

export { NotInData };
export type { NotInDataProps };
