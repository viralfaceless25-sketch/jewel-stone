"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Variant = "fade-up" | "zoom" | "fade";

const FROM: Record<Variant, gsap.TweenVars> = {
  "fade-up": { opacity: 0, y: 44 },
  zoom: { opacity: 0, scale: 1.12 },
  fade: { opacity: 0 },
};

/**
 * Scroll-reveal wrapper. Elements animate in as they enter the viewport and
 * reverse out as they leave (fade in / fade out), driven by GSAP ScrollTrigger
 * (synced with Lenis via SmoothScroll). Honours prefers-reduced-motion by
 * rendering static. Animate only transform/opacity — GPU-composited.
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  once = false,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        FROM[variant],
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: variant === "zoom" ? 1.1 : 0.8,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [variant, delay, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
