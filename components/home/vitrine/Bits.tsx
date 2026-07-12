"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./vitrine.module.css";

/** Infinite trust marquee. */
export function Marquee({ words }: { words: string[] }) {
  const row = [...words, ...words];
  return (
    <div className={styles.marquee} aria-hidden>
      <div className={styles.marqueeTrack}>
        {row.map((w, i) => (
          <span key={i} className={styles.marqueeItem}>
            {w}
            <i>◆</i>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Count-up number that fires when scrolled into view. */
export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const dur = 1400;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className={styles.stat}>
      <strong>{prefix}{n.toLocaleString("en-US")}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}
