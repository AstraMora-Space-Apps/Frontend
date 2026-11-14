import { MessageCircleQuestion } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Card } from "@/components/ui/card";
import { EXAMPLE_QUESTIONS } from "./chat-state";

function EmptyState({ onPick, disabled }: { onPick: (q: string) => void; disabled: boolean }) {
  return (
    <Card
      variant="glow"
      className="flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10"
    >
      <Logo size={56} showWordmark={false} />
      <h2 className="mt-4 text-2xl">What do you want to know?</h2>
      <p className="mt-2 max-w-xl text-base text-muted-foreground">
        Ask about fire behaviour in microgravity. Every answer lists the research it came from.
      </p>
      <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2" aria-label="Example questions">
        {EXAMPLE_QUESTIONS.map((q) => (
          <li key={q}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(q)}
              className="flex h-full min-h-14 w-full items-start gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 text-left text-base text-foreground transition-colors hover:border-ember/60 hover:bg-ember/5 disabled:opacity-50"
            >
              <MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-cyan" aria-hidden />
              {q}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export { EmptyState };
