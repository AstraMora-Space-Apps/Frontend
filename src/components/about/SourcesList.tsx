import { ExternalLink } from "lucide-react";
import { SOURCES } from "@/lib/about-content";

/** External sources. Entries with url === null are placeholders: hidden, with a dev warning. */
function SourcesList() {
  const pending = SOURCES.filter((s) => s.url === null);
  if (pending.length && process.env.NODE_ENV !== "production") {
    console.warn(
      `[about] ${pending.length} source placeholder(s) hidden: ${pending.map((p) => p.label).join("; ")}`,
    );
  }
  return (
    <ul className="space-y-3">
      {SOURCES.flatMap((s) =>
        s.url === null
          ? []
          : [
              <li key={s.url} className="rounded-xl border border-border bg-surface p-4">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-cyan underline-offset-4 hover:underline"
                >
                  {s.label}
                  <ExternalLink className="size-4" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <p className="text-base text-muted-foreground">{s.note}</p>
              </li>,
            ],
      )}
    </ul>
  );
}

export { SourcesList };
