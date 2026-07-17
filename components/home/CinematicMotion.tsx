"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function CinematicHome({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scenes = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-lux-scene]") ?? []);
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        Array.from(entry.target.children).forEach((item, index) => {
          item.animate(
            [
              { opacity: 0, transform: "translateY(24px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 780, delay: index * 80, easing: "cubic-bezier(.22,1,.36,1)", fill: "none" },
          );
        });
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    scenes.forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  return <main ref={root} className={className}>{children}</main>;
}

export function CinematicSection({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
  return <section id={id} data-lux-scene className={className}>{children}</section>;
}

export function CinematicArticle({ className, children }: { className: string; children: ReactNode }) {
  return <article data-lux-scene className={className}>{children}</article>;
}
