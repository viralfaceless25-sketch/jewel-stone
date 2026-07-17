"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hasSeenIntro, markIntroSeen } from "@/lib/site/intro-state";
import { getIntroDuration } from "@/lib/site/intro-timing";
import styles from "./brand-preloader.module.css";

const EXIT_MS = 480;
const SKIP_DELAY_MS = 650;

export function BrandPreloader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const closed = useRef(false);
  const restoreOverflow = useRef<(() => void) | null>(null);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (skipTimer.current) clearTimeout(skipTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const close = useCallback(() => {
    if (closed.current) return;

    closed.current = true;
    clearTimers();
    markIntroSeen(window.sessionStorage);
    restoreOverflow.current?.();
    setLeaving(true);

    exitTimer.current = setTimeout(() => {
      document.documentElement.dataset.introSeen = "true";
      setVisible(false);
    }, EXIT_MS);
  }, [clearTimers]);

  useEffect(() => {
    if (hasSeenIntro(window.sessionStorage)) {
      document.documentElement.dataset.introSeen = "true";
      setVisible(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    restoreOverflow.current = () => {
      document.body.style.overflow = originalOverflow;
      restoreOverflow.current = null;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);
    skipTimer.current = setTimeout(() => setSkipAvailable(true), SKIP_DELAY_MS);
    closeTimer.current = setTimeout(() => close(), getIntroDuration(reduce));

    return () => {
      clearTimers();
      restoreOverflow.current?.();
    };
  }, [clearTimers, close]);

  if (!visible) return null;

  return (
    <section
      className={`${styles.root} ${leaving ? styles.leaving : ""}`}
      aria-busy={!leaving}
      aria-label="Preparing Jewel Stone"
    >
      <div className={styles.ambient} aria-hidden="true" />
      <div className={`${styles.content} ${reducedMotion ? styles.reducedMotion : ""}`} aria-hidden="true">
        <svg className={styles.diamond} viewBox="0 0 100 100" focusable="false">
          <path className={styles.outline} d="M50 5 92 32 76 86 24 86 8 32 50 5Z" />
          <path className={`${styles.facet} ${styles.facetTop}`} d="M8 32h84L50 57 8 32Z" />
          <path className={`${styles.facet} ${styles.facetLeft}`} d="m8 32 42 25-26 29L8 32Z" />
          <path className={`${styles.facet} ${styles.facetRight}`} d="m92 32-42 25 26 29 16-54Z" />
          <path className={`${styles.facet} ${styles.facetCenter}`} d="m50 57 26 29H24l26-29Z" />
        </svg>
        <p className={styles.kicker}>Crafted in light</p>
        <p className={styles.wordmark}>Jewel <span>Stone</span></p>
        <div className={styles.progress}><span /></div>
      </div>
      {skipAvailable ? (
        <button className={styles.skip} type="button" onClick={close}>Skip intro</button>
      ) : null}
    </section>
  );
}
