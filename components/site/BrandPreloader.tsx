"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasSeenIntro, markIntroSeen } from "@/lib/site/intro-state";
import styles from "./brand-preloader.module.css";

const EXIT_MS = 560;
const SKIP_DELAY_MS = 1000;
const VIDEO_FAILSAFE_MS = 8500;
const REDUCED_MOTION_MS = 650;

export function BrandPreloader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const closed = useRef(false);
  const video = useRef<HTMLVideoElement | null>(null);
  const restoreOverflow = useRef<(() => void) | null>(null);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (skipTimer.current) clearTimeout(skipTimer.current);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
  };

  const close = useCallback(() => {
    if (closed.current) return;

    closed.current = true;
    if (skipTimer.current) clearTimeout(skipTimer.current);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    markIntroSeen(window.sessionStorage);
    restoreOverflow.current?.();
    setLeaving(true);

    setTimeout(() => {
      document.documentElement.dataset.introSeen = "true";
      setVisible(false);
    }, EXIT_MS);
  }, []);

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

    if (reduce) video.current?.pause();
    else void video.current?.play().catch(close);

    skipTimer.current = setTimeout(() => setSkipAvailable(true), SKIP_DELAY_MS);
    fallbackTimer.current = setTimeout(close, reduce ? REDUCED_MOTION_MS : VIDEO_FAILSAFE_MS);

    return () => {
      clearTimers();
      restoreOverflow.current?.();
    };
  }, [close]);

  if (!visible) return null;

  return (
    <section
      className={`${styles.root} ${leaving ? styles.leaving : ""}`}
      aria-busy={!leaving}
      aria-label="Preparing Jewel Stone"
    >
      <video
        ref={video}
        className={`${styles.video} ${reducedMotion ? styles.videoHidden : ""}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={close}
        onError={close}
      >
        <source src="/videos/diamond-gold-intro.mp4" type="video/mp4" />
      </video>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.brand}>
        <Image
          src="/brand/jewel-stone-nav-wordmark.webp"
          alt="Jewel Stone"
          width={166}
          height={23}
          priority
        />
      </div>
      {skipAvailable ? (
        <button className={styles.skip} type="button" onClick={close}>Skip intro</button>
      ) : null}
    </section>
  );
}
