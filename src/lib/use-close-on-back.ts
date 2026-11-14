"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Lets the phone back gesture close an open drawer instead of leaving the page.
 * While `open`, adds one history entry (keeping the router's state); popping it calls `close`.
 * Closing another way (Esc, close button, backdrop) removes the entry again.
 *
 * Returns `release`: call it right before closing because of a navigation (a link, or an
 * action that updates the URL), so the cleanup does not step back and undo that navigation.
 */
export function useCloseOnBack(open: boolean, close: () => void): () => void {
  const released = useRef(false);

  useEffect(() => {
    if (!open) return;
    released.current = false;
    const marker = `fs-drawer-${Date.now()}`;
    const current: unknown = window.history.state;
    const base = current !== null && typeof current === "object" ? current : {};
    window.history.pushState({ ...base, fsDrawer: marker }, "");
    const onPop = () => close();
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (released.current) return;
      const state: unknown = window.history.state;
      if (
        state !== null &&
        typeof state === "object" &&
        "fsDrawer" in state &&
        state.fsDrawer === marker
      ) {
        window.history.back();
      }
    };
  }, [open, close]);

  return useCallback(() => {
    released.current = true;
  }, []);
}
