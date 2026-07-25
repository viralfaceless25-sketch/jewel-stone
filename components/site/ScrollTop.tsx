"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * App-Router navigations sometimes keep the previous page's scroll position,
 * which reads as "broken navigation" when the new page opens half-way down.
 * Reset to the top on every route change (but leave in-page #anchor links alone).
 */
export function ScrollTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
