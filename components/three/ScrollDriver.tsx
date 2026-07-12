"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/three/scrollState";

gsap.registerPlugin(ScrollTrigger);

/**
 * The GSAP ScrollTrigger that links window scroll → normalized page progress.
 * One trigger spanning the whole document; its `progress` (0 → 1) is written to
 * the shared scrollState, which the R3F camera rig reads each frame. Because
 * SmoothScroll pipes Lenis into ScrollTrigger.update, this stays perfectly in
 * sync with the smooth-scroll position. Renders nothing.
 */
export function ScrollDriver() {
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollState.target = self.progress;
        scrollState.velocity = self.getVelocity();
      },
    });
    return () => st.kill();
  }, []);

  return null;
}
