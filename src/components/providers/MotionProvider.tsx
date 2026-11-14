"use client";

import { MotionConfig } from "framer-motion";

/** Every Framer animation follows the OS "reduce motion" setting (no transforms, instant changes). */
function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export { MotionProvider };
