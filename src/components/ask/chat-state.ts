/**
 * Local UI state for the Ask chat (not part of the data contract; that lives in src/lib/types.ts).
 */
import type { ApiResult } from "@/lib/api";
import type { AskResponse } from "@/lib/types";

export const MAX_QUESTION_LENGTH = 500;

export type UserChatMessage = { id: string; role: "user"; question: string };

export type AssistantChatMessage = {
  id: string;
  role: "assistant";
  question: string;
  status: "loading" | "done";
  result?: ApiResult<AskResponse>;
};

export type ChatMessage = UserChatMessage | AssistantChatMessage;

// Each one checked against the live /ask service (flamesight ai/eval_ask.py) for a cited, on-topic answer,
// and each matches a stub route in src/lib/api.ts ("30%", "smoke", "saffire") so stub mode still answers.
export const EXAMPLE_QUESTIONS = [
  "Does a fire grow faster at 30% oxygen even if the pressure is lower?",
  "Did the ISS smoke detector detect Kapton and Teflon smoke?",
  "How do smoke particles behave in microgravity?",
  "How much carbon monoxide did the Saffire fires produce?",
] as const;

/** Validates a ?q= deep-link value. Returns the trimmed question or null. */
export function parseQuestionParam(raw: string | null): string | null {
  if (raw === null) return null;
  const q = raw.trim();
  if (!q || q.length > MAX_QUESTION_LENGTH) return null;
  return q;
}

/** One-line summary for the screen-reader live region. */
export function announceResult(result: ApiResult<AskResponse>): string {
  if (!result.ok) return `The question could not be answered: ${result.error.message}`;
  if (!result.data.grounded) return "Not in the data. FlameSight found no supporting evidence.";
  const n = result.data.citations.length;
  return `Answer ready with ${n} source${n === 1 ? "" : "s"}.`;
}

let counter = 0;
export const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;
