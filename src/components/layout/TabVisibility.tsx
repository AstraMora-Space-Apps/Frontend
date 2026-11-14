"use client";

import { useEffect } from "react";

/** Marks <html data-tab-hidden> while the tab is hidden so CSS can pause decorative animation. */
function TabVisibility() {
  useEffect(() => {
    const sync = () => {
      if (document.hidden) document.documentElement.setAttribute("data-tab-hidden", "");
      else document.documentElement.removeAttribute("data-tab-hidden");
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return null;
}

export { TabVisibility };
