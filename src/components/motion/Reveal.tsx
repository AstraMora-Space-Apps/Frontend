"use client";

import { motion } from "framer-motion";

/**
 * Fades a client-only block (charts) in once it mounts. Opacity only, inside a box of fixed
 * height, so there is no layout shift; instant under reduced motion (MotionProvider).
 */
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export { Reveal };
