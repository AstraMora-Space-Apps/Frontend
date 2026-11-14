"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; label: string };

/** Sticky in-page contents with scroll-spy (desktop) and a jump select (mobile). */
function AboutToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const selectId = useId();

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    // Active = last section whose heading has passed the line under the sticky header.
    // At the very bottom of the page the last section wins (it may never reach the line).
    const LINE = 140;
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= LINE) current = s;
      setActive((atBottom ? sections[sections.length - 1] : current).id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    el.focus({ preventScroll: true });
    setActive(id);
  };

  return (
    <>
      <div className="lg:hidden">
        <label htmlFor={selectId} className="text-sm font-semibold">
          Jump to section
        </label>
        <select
          id={selectId}
          value={active}
          onChange={(e) => jump(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base"
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </div>
      <nav aria-label="On this page" className="hidden lg:block">
        <p className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          On this page
        </p>
        <ul className="space-y-1 border-l border-border">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  jump(i.id);
                }}
                aria-current={active === i.id ? "location" : undefined}
                className={cn(
                  "-ml-px block min-h-11 content-center border-l-2 py-1 pl-4 text-base transition-colors",
                  active === i.id
                    ? "border-ember font-semibold text-ember"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export { AboutToc };
