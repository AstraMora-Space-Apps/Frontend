"use client";

/**
 * React Query hooks over src/lib/api.ts. Components use these, never fetch directly.
 * Each hook unwraps ApiResult into { data, source, isLoading, error } with a typed error.
 */
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ask,
  getInsights,
  getInvestigations,
  getTests,
  type ApiError,
  type ApiResult,
  type DataSource,
} from "@/lib/api";
import type { AskResponse, InvestigationFilters, TestFilters } from "@/lib/types";

export type QueryState<T> = {
  data: T | undefined;
  source: DataSource | undefined;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
};

function unwrap<T>(
  result: ApiResult<T> | undefined,
  isLoading: boolean,
  refetch: () => void,
): QueryState<T> {
  return {
    data: result?.ok ? result.data : undefined,
    source: result?.ok ? result.source : undefined,
    isLoading,
    error: result && !result.ok ? result.error : null,
    refetch,
  };
}

/** Error results are not cached as fresh data, so the next mount retries. */
const staleOnError = <T>(q: { state: { data: ApiResult<T> | undefined } }) =>
  q.state.data?.ok === false ? 0 : 5 * 60 * 1000;

export function useInvestigations(filters: InvestigationFilters = {}) {
  const q = useQuery({
    queryKey: ["investigations", filters],
    queryFn: () => getInvestigations(filters),
    staleTime: staleOnError,
  });
  return unwrap(q.data, q.isPending, () => void q.refetch());
}

export function useTests(filters: TestFilters = {}) {
  const q = useQuery({
    queryKey: ["tests", filters],
    queryFn: () => getTests(filters),
    staleTime: staleOnError,
  });
  return unwrap(q.data, q.isPending, () => void q.refetch());
}

export function useInsights() {
  const q = useQuery({
    queryKey: ["insights"],
    queryFn: () => getInsights(),
    staleTime: staleOnError,
  });
  return unwrap(q.data, q.isPending, () => void q.refetch());
}

/* --------------------------------------------------------------------- Ask */

/** Session cache: identical questions (case/space-insensitive) return instantly. */
const askCache = new Map<string, Extract<ApiResult<AskResponse>, { ok: true }>>();
const normalizeQuestion = (q: string) => q.trim().replace(/\s+/g, " ").toLowerCase();

async function askCached(question: string): Promise<ApiResult<AskResponse>> {
  const key = normalizeQuestion(question);
  const hit = askCache.get(key);
  if (hit) return hit;
  const result = await ask(question);
  if (result.ok) askCache.set(key, result);
  return result;
}

export type AskState = QueryState<AskResponse> & {
  /** The question that produced the current state. */
  question: string | undefined;
  submit: (question: string) => void;
  /**
   * Same request and cache as `submit`, but resolves with the ApiResult (never rejects).
   * For UIs that keep their own list of answers, e.g. the Ask chat.
   */
  askAsync: (question: string) => Promise<ApiResult<AskResponse>>;
  reset: () => void;
};

export function useAsk(): AskState {
  const m = useMutation({ mutationFn: askCached });
  const [question, setQuestion] = useState<string>();
  const { mutate, mutateAsync, reset: resetMutation } = m;

  const askAsync = useCallback(
    (q: string) => {
      setQuestion(q);
      return mutateAsync(q);
    },
    [mutateAsync],
  );

  const submit = useCallback(
    (q: string) => {
      setQuestion(q);
      mutate(q);
    },
    [mutate],
  );
  const reset = useCallback(() => {
    setQuestion(undefined);
    resetMutation();
  }, [resetMutation]);
  const retry = useCallback(() => {
    if (question) mutate(question);
  }, [mutate, question]);

  return { ...unwrap(m.data, m.isPending, retry), question, submit, askAsync, reset };
}
