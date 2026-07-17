"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./brand-home.module.css";

const slides = [
  {
    src: "/images/hero/campaign-01.webp",
    alt: "Jewel Stone campaign model wearing diamond earrings, necklaces, rings, and bracelets",
    label: "The Jewel Stone edit",
    detail: "Natural · PIECUT · Lab-grown",
    cta: "Explore the collection",
    href: "/collections",
  },
  {
    src: "/images/hero/campaign-02.webp",
    alt: "Jewel Stone campaign model layering diamond necklaces, earrings, rings, and bracelets",
    label: "Necklines in light",
    detail: "Tennis · Riviera · Pendant",
    cta: "Discover necklaces",
    href: "/collections/necklaces",
  },
  {
    src: "/images/hero/campaign-03.webp",
    alt: "Jewel Stone campaign model wearing diamond studs, pendant, rings, and bracelets",
    label: "The evening edit",
    detail: "Studs · Drops · Color",
    cta: "Explore earrings",
    href: "/collections/earrings",
  },
] as const;

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused, reduce]);

  const slide = slides[active];

  return (
    <div
      className={styles.heroSlideshow}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((item, index) => (
        <div
          key={item.src}
          className={`${styles.heroSlide} ${active === index ? styles.heroSlideActive : ""}`}
          aria-hidden={active !== index}
        >
          <Image src={item.src} alt={item.alt} fill priority={index === 0} loading={index ? "eager" : undefined} sizes="100vw" />
        </div>
      ))}

      <div className={styles.heroNote} aria-live="polite">
        <span>{String(active + 1).padStart(2, "0")}</span>
        <p>{slide.label}<br />{slide.detail}</p>
      </div>

      <Link href={slide.href} className={styles.slidePrimaryCta}>{slide.cta} <span>↗</span></Link>

      <div className={styles.slideControls} aria-label="Hero images">
        {slides.map((item, index) => (
          <button
            type="button"
            key={item.src}
            onClick={() => setActive(index)}
            aria-label={`Show ${item.label}`}
            aria-current={active === index ? "true" : undefined}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
