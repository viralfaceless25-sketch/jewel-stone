"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling (Lenis) integrated with GSAP ScrollTrigger.
 * Without this integration, ScrollTrigger reads the native scroll position while
 * Lenis animates it — so scroll-reveal triggers fire late or not at all.
 */
export function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      // Reduced motion: no smooth scroll, but make sure triggers still resolve.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({ lerp: 0.13, wheelMultiplier: 1.0, touchMultiplier: 1.8 });

    // Keep ScrollTrigger in sync with every Lenis scroll frame.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker so both share one rAF loop.
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 400);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      window.removeEventListener("load", refresh);
      clearTimeout(t);
    };
  }, []);

  return null;
}
