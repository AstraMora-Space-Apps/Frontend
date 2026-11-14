"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_QUESTION_LENGTH } from "./chat-state";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  busy: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

const MAX_ROWS = 5;
const COUNTER_FROM = MAX_QUESTION_LENGTH - 100;

/** Auto-growing question box. Enter sends, Shift+Enter adds a newline. */
function Composer({ value, onChange, onSubmit, busy, textareaRef }: ComposerProps) {
  const trimmed = value.trim();
  const canSend = !busy && trimmed.length > 0 && value.length <= MAX_QUESTION_LENGTH;

  // Grow with content up to MAX_ROWS, then scroll.
  React.useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 28;
    const padding = parseFloat(getComputedStyle(el).paddingTop) * 2 || 0;
    el.style.height = `${Math.min(el.scrollHeight, line * MAX_ROWS + padding)}px`;
  }, [value, textareaRef]);

  const send = () => {
    if (canSend) onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="flex items-end gap-2 rounded-card border border-input bg-surface-raised p-2 shadow-lg shadow-black/40 focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/40"
    >
      <label htmlFor="ask-input" className="sr-only">
        Your question
      </label>
      <textarea
        id="ask-input"
        ref={textareaRef}
        rows={1}
        value={value}
        maxLength={MAX_QUESTION_LENGTH}
        placeholder="Ask about fire safety in microgravity…"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        aria-describedby={value.length >= COUNTER_FROM ? "ask-counter" : undefined}
        className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-base leading-7 text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
      />
      <div className="flex shrink-0 flex-col items-end gap-1">
        {value.length >= COUNTER_FROM ? (
          <span
            id="ask-counter"
            className={cn(
              "text-xs tabular-nums",
              value.length >= MAX_QUESTION_LENGTH ? "text-risk-high" : "text-muted-foreground",
            )}
          >
            {value.length}/{MAX_QUESTION_LENGTH}
          </span>
        ) : null}
        <Button
          type="submit"
          size="touch"
          disabled={!canSend}
          aria-label="Send question"
          className="rounded-xl"
        >
          <SendHorizontal aria-hidden />
        </Button>
      </div>
    </form>
  );
}

export { Composer };
