import * as React from "react";
import { cn } from "@/lib/utils";

type FadeUpProps = {
  children: React.ReactNode;
  /** Delay in seconds. */
  delay?: number;
  className?: string;
};

/**
 * Subtle entrance (see .fade-up in globals.css).
 * CSS, not Framer Motion, on purpose: Framer server-renders `opacity: 0`, so the hero
 * headline would be invisible until JS hydrates (bad for LCP, no-JS, and screen recordings).
 * Static when the user prefers reduced motion.
 */
function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  return (
    <div
      className={cn("fade-up", className)}
      style={{ "--fade-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export { FadeUp };
