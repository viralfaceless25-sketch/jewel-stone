"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./brand-home.module.css";

type Slide = {
  id: string;
  kind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  kicker: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
};

const slides: Slide[] = [
  {
    id: "campaign",
    kind: "image",
    src: "/images/hero/campaign-01.webp",
    alt: "Jewel Stone campaign model wearing diamond earrings, necklace, rings, and bracelets",
    kicker: "New York Diamond District · Since 1980",
    headline: "Diamonds that shine with you",
    body: "Natural rarity, PIECUT geometry, lab-grown freedom — one house, three worlds, every piece finished by hand.",
    cta: "Explore the collections",
    href: "/collections",
  },
  {
    id: "custom",
    kind: "video",
    // Placeholder until the commissioned custom-atelier film is supplied.
    src: "/videos/hero-v3.mp4",
    poster: "/images/new/custom-design-editorial.jpg",
    alt: "Jewel Stone atelier film: a custom piece taking shape from sketch to finished jewel",
    kicker: "Custom design · Made to your story",
    headline: "Your piece, made from the first sketch",
    body: "Bring a reference, a stone, or an idea. We draw it, cut it, set it, and finish it in our own atelier.",
    cta: "Start a custom piece",
    href: "/custom",
  },
  {
    id: "evening",
    kind: "image",
    src: "/images/hero/campaign-03.webp",
    alt: "Jewel Stone campaign model wearing diamond studs, pendant, rings, and bracelets",
    kicker: "The evening edit",
    headline: "Light, worn close to the skin",
    body: "Studs, drops, and pendants cut to catch a room — selected across all three diamond worlds.",
    cta: "Explore earrings",
    href: "/collections/earrings",
  },
];

const SLIDE_MS = 6400;

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (paused || reduce) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduce]);

  // Only the visible film plays; the rest stay parked at their first frame.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && !reduce) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [active, reduce]);

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
          key={item.id}
          className={`${styles.heroSlide} ${active === index ? styles.heroSlideActive : ""}`}
          aria-hidden={active !== index}
        >
          {item.kind === "image" ? (
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={index === 0}
              sizes="100vw"
            />
          ) : (
            <video
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              src={item.src}
              poster={item.poster}
              aria-label={item.alt}
              muted
              loop
              playsInline
              preload="metadata"
            />
          )}
        </div>
      ))}

      <div className={styles.heroShade} />

      <div className={styles.heroStage}>
        <div className={styles.heroCopy} key={slide.id}>
          <p className={styles.heroKicker}>{slide.kicker}</p>
          <span className={styles.heroRule} aria-hidden="true" />
          <h1>{slide.headline}</h1>
          <p className={styles.heroBody}>{slide.body}</p>
          <div className={styles.heroActions}>
            <Link href={slide.href} className={styles.heroCta}>
              {slide.cta}
            </Link>
            <Link href="/contact" className={styles.heroCtaGhost}>
              Book an appointment
            </Link>
          </div>
        </div>

        <div className={styles.heroFoot}>
          <span className={styles.heroSignature}>Ishan Vaghani · Founder &amp; Diamond Consultant</span>
          <div className={styles.slideControls} aria-label="Hero slides">
            {slides.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActive(index)}
                aria-label={`Show ${item.headline}`}
                aria-current={active === index ? "true" : undefined}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
