"use client";

import { useEffect, useRef } from "react";
import type { AssistantChatMessage, ChatMessage } from "./chat-state";
import { AssistantMessage } from "./AssistantMessage";
import { FadeIn } from "./FadeIn";
import { UserMessage } from "./UserMessage";

type MessageListProps = {
  messages: readonly ChatMessage[];
  onRetry: (message: AssistantChatMessage) => void;
  onRephrase: () => void;
};

function MessageList({ messages, onRetry, onRephrase }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  const lastKey = last ? `${last.id}:${last.role === "assistant" ? last.status : "q"}` : "";

  // Keep the newest message in view (above the sticky composer).
  useEffect(() => {
    if (!lastKey) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [lastKey]);

  return (
    <>
      <ol className="flex flex-col gap-5" aria-label="Conversation">
        {messages.map((m) => (
          <li key={m.id}>
            <FadeIn>
              {m.role === "user" ? (
                <UserMessage question={m.question} />
              ) : (
                <AssistantMessage message={m} onRetry={onRetry} onRephrase={onRephrase} />
              )}
            </FadeIn>
          </li>
        ))}
      </ol>
      {/* Scroll anchor; scroll margin keeps it clear of the sticky composer. */}
      <div ref={endRef} className="scroll-mb-40" aria-hidden />
    </>
  );
}

export { MessageList };
