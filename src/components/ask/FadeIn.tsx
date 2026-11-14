"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Fade-up for chat messages. Messages only appear after user interaction (client side),
 * so Framer's initial opacity never hides server-rendered content. No motion for reduced-motion users.
 */
function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export { FadeIn };
