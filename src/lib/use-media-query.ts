"use client";

import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query. Server snapshot is `false` (desktop-first markup is not assumed). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
