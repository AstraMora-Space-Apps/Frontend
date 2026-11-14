import { RotateCcw, SearchX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ApiError } from "@/lib/api";

const ERROR_COPY: Record<ApiError["kind"], string> = {
  timeout: "The research service took too long to answer.",
  network: "Cannot reach the FlameSight service.",
  http: "The FlameSight service returned an error.",
  validation: "Unexpected response from the service.",
};

function ErrorState({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  return (
    <Card className="flex items-start gap-3 border-risk-high/40" role="alert">
      <TriangleAlert className="mt-0.5 size-6 shrink-0 text-risk-high" aria-hidden />
      <div>
        <p className="text-lg font-bold">{ERROR_COPY[error.kind]}</p>
        {error.kind === "http" && error.status ? (
          <p className="text-base text-muted-foreground">Status code {error.status}.</p>
        ) : null}
        <Button onClick={onRetry} variant="outline" size="xl" className="mt-4 rounded-xl">
          <RotateCcw aria-hidden />
          Retry
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({ what, onReset }: { what: string; onReset: () => void }) {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden />
      <p className="mt-3 text-lg font-bold">No {what} match these filters</p>
      <p className="mt-1 text-base text-muted-foreground">
        Try widening the ranges or clearing a filter.
      </p>
      <Button onClick={onReset} variant="outline" size="xl" className="mt-5 rounded-xl">
        Reset filters
      </Button>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card className="space-y-4" aria-hidden>
      <div className="h-7 w-1/2 animate-pulse rounded bg-surface-raised" />
      <div className="h-5 w-1/3 animate-pulse rounded bg-surface-raised" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-surface-raised" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-surface-raised" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-raised" />
      </div>
      <div className="h-24 animate-pulse rounded bg-surface-raised" />
    </Card>
  );
}

export { ErrorState, EmptyState, CardSkeleton };
