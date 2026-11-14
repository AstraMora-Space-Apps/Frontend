"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Ids that already counted up in this browser session: later mounts show the value at once. */
const counted = new Set<string>();

type CountUpProps = {
  value: number;
  /** Stable id per summary number, so it animates on first view only (not after every reload of data). */
  id: string;
  duration?: number;
};

/**
 * Counts up to `value` the first time it scrolls into view.
 * - While animating: width is reserved by an invisible ::before with the final value (no layout
 *   shift), the moving digits are aria-hidden and screen readers get the final value.
 * - Afterwards, and under reduced motion: a plain inline number (clean text, copy and paste).
 */
function CountUp({ value, id, duration = 0.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [animating, setAnimating] = useState(() => !reduce && !counted.has(id));
  const [shown, setShown] = useState(animating ? 0 : value);

  useEffect(() => {
    if (!animating || !inView) return;
    counted.add(id);
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
      onComplete: () => setAnimating(false),
    });
    return () => {
      controls.stop();
      setAnimating(false);
    };
  }, [animating, inView, value, id, duration]);

  if (!animating) {
    return (
      <span ref={ref} className="tabular-nums">
        {value}
      </span>
    );
  }
  return (
    <span
      ref={ref}
      data-value={value}
      className="relative inline-block tabular-nums before:invisible before:content-[attr(data-value)]"
    >
      <span className="absolute inset-0 text-right" aria-hidden>
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

export { CountUp };
