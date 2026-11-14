"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAsk } from "@/lib/hooks";
import {
  announceResult,
  nextId,
  parseQuestionParam,
  type AssistantChatMessage,
  type ChatMessage,
} from "./chat-state";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";

function AskChat() {
  const { askAsync } = useAsk();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const busyRef = useRef(false); // sync guard against double submits within one frame
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resolve = useCallback(
    async (assistantId: string, question: string) => {
      busyRef.current = true;
      setBusy(true);
      const result = await askAsync(question);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && m.role === "assistant" ? { ...m, status: "done", result } : m,
        ),
      );
      setAnnouncement(announceResult(result));
      busyRef.current = false;
      setBusy(false);
    },
    [askAsync],
  );

  const send = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || busyRef.current) return;
      const assistantId = nextId("a");
      setMessages((prev) => [
        ...prev,
        { id: nextId("u"), role: "user", question },
        { id: assistantId, role: "assistant", question, status: "loading" },
      ]);
      setDraft("");
      setAnnouncement("");
      textareaRef.current?.focus();
      void resolve(assistantId, question);
    },
    [resolve],
  );

  const retry = useCallback(
    (message: AssistantChatMessage) => {
      if (busyRef.current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...message, status: "loading", result: undefined } : m,
        ),
      );
      void resolve(message.id, message.question);
    },
    [resolve],
  );

  const focusComposer = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.scrollIntoView({ block: "nearest" });
  }, []);

  const clear = () => {
    if (busyRef.current) return;
    setMessages([]);
    setAnnouncement("");
    focusComposer();
  };

  // Deep link: /ask?q=<question> sends once on load (pitch mode).
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current) return;
    deepLinked.current = true;
    const q = parseQuestionParam(new URLSearchParams(window.location.search).get("q"));
    if (q) send(q);
  }, [send]);

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
        <h2 className="text-xl">Conversation</h2>
        {messages.length > 0 ? (
          <Button
            variant="ghost"
            onClick={clear}
            disabled={busy}
            className="min-h-11 gap-2 px-3 text-sm"
          >
            <RotateCcw className="size-4" aria-hidden />
            New question
          </Button>
        ) : null}
      </div>

      <div className="flex-1">
        {messages.length === 0 ? (
          <EmptyState onPick={send} disabled={busy} />
        ) : (
          <MessageList messages={messages} onRetry={retry} onRephrase={focusComposer} />
        )}
      </div>

      <p className="sr-only" aria-live="polite" role="status">
        {announcement}
      </p>

      {/* Sticky composer: stays above the iOS safe area; the viewport resizes for the keyboard. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 bg-gradient-to-t from-background via-background to-background/0 px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:mx-0 sm:px-0">
        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={send}
          busy={busy}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );
}

export { AskChat };
