"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * SectionReveal — colored overlay slides UP off the section to reveal it.
 * The overlay matches the section's OWN background so there is zero blank gap
 * while the section waits to enter the viewport.
 */
export function SectionReveal({
  children,
  className = "",
  overlayColor = "#0A0A0B",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  overlayColor?: string;
  delay?: number;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ backgroundColor: overlayColor }}
        initial={{ y: "0%" }}
        whileInView={{ y: "-100%" }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.88, delay, ease: [0.77, 0, 0.175, 1] }}
      />
    </div>
  );
}

/**
 * ParallaxImage — wraps an <img> with scroll-driven vertical parallax.
 * Use inside a container that has overflow-hidden.
 * speed: 0.1 = subtle, 0.25 = noticeable, 0.4 = dramatic
 */
export function ParallaxImage({
  src,
  alt = "",
  className = "",
  speed = 0.18,
}: {
  src: string;
  alt?: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const range = speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y, position: "absolute", top: `-${range}%`, bottom: `-${range}%`, left: 0, right: 0 }}
        className="will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          aria-hidden={!alt}
          className="h-full w-full object-cover"
        />
      </motion.div>
    </div>
  );
}

/**
 * StaggerReveal + StaggerItem — grid/list children cascade in.
 */
export function StaggerReveal({
  children,
  className = "",
  staggerDelay = 0.07,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      // Fire as soon as first pixel enters viewport — no waiting, no blank gaps
      viewport={{ once: true, amount: 0.01 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        // Position-only — content is always visible, just rises into place
        // Never start at opacity:0 for primary content (causes blank gaps)
        hidden:  { y: 24, opacity: 0.3 },
        visible: { y: 0,  opacity: 1,
          transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
