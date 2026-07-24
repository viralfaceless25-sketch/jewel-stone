"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const titleSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.16,
    },
  },
};

const titleWord: Variants = {
  hidden: { opacity: 0, y: "0.58em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.82, ease: EDITORIAL_EASE },
  },
};

const typedWord: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const typedGlyph: Variants = {
  hidden: { opacity: 0, y: "0.22em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EDITORIAL_EASE },
  },
};

const typingCursor: Variants = {
  hidden: { opacity: 0, scaleY: 0.25 },
  visible: {
    opacity: [0, 1, 1, 0],
    scaleY: [0.25, 1, 1, 0.25],
    transition: { duration: 0.9, times: [0, 0.14, 0.7, 1], ease: EDITORIAL_EASE },
  },
};

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

export function CinematicArticle({ className, children, id }: { className: string; children: ReactNode; id?: string }) {
  return <article id={id} data-lux-scene className={className}>{children}</article>;
}

export function AnimatedStoryTitle({ title, className }: { title: string; className: string }) {
  const reduceMotion = useReducedMotion();
  const words = title.trim().split(/\s+/);
  const typed = words.at(-1) ?? "";
  const lead = words.slice(0, -1);

  return (
    <motion.h3
      aria-label={title}
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.65 }}
      variants={titleSequence}
    >
      <span aria-hidden="true">
        {lead.map((word, index) => (
          <motion.span data-title-word key={`${word}-${index}`} variants={titleWord}>
            {word}
          </motion.span>
        ))}
        <motion.span data-title-typed variants={typedWord}>
          {Array.from(typed).map((glyph, index) => (
            <motion.span data-title-glyph key={`${glyph}-${index}`} variants={typedGlyph}>
              {glyph}
            </motion.span>
          ))}
          <motion.i data-title-cursor variants={typingCursor} />
        </motion.span>
      </span>
    </motion.h3>
  );
}
