"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function CinematicHome({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const scenes = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-lux-scene]") ?? []);
    const videos = Array.from(root.current?.querySelectorAll<HTMLVideoElement>("[data-lux-video]") ?? []);
    const parallaxItems = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-lux-parallax]") ?? []);
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

    const videoObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      }
    }, { threshold: 0.22, rootMargin: "8% 0px 8% 0px" });
    videos.forEach((video) => videoObserver.observe(video));

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      for (const item of parallaxItems) {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > window.innerHeight + 80) continue;
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const depth = Number(item.dataset.luxParallax ?? 18);
        item.style.setProperty("--lux-y", `${(progress - 0.5) * depth}px`);
      }
    };
    const requestParallax = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);

    return () => {
      observer.disconnect();
      videoObserver.disconnect();
      videos.forEach((video) => video.pause());
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <main ref={root} className={className}>{children}</main>;
}

export function CinematicSection({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
  return <section id={id} data-lux-scene className={className}>{children}</section>;
}

export function CinematicArticle({ className, children }: { className: string; children: ReactNode }) {
  return <article data-lux-scene className={className}>{children}</article>;
}
