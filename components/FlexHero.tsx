"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { MagneticCTA } from "@/components/MagneticCTA";

const HEADLINE = ["cut, cast,", "set by hand."];

export function FlexHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !root.current) return;

    const ctx = root.current;
    const q = <T extends Element>(sel: string) => Array.from(ctx.querySelectorAll<T>(sel));

    // Grotesque headline words: rise + fade in, staggered.
    animate(q(".flex-letter"), {
      y: [64, 0],
      opacity: [0, 1],
      duration: 1100,
      delay: stagger(90, { start: 200 }),
      ease: "out(4)",
    });
    // Eyebrow, lede, CTAs, stat row, cue drift up after.
    animate(q(".flex-fade"), {
      y: [24, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(110, { start: 650 }),
      ease: "out(3)",
    });
  }, []);

  return (
    <section
      ref={root}
      className="cinematic-hero relative grid min-h-[100svh] items-center overflow-hidden bg-transparent text-ink lg:grid-cols-[.88fr_1.12fr]"
      aria-label="Jewel Stone — rare piecut and diamond jewelry, NYC Diamond District"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(199,194,184,.12),transparent_28%),linear-gradient(120deg,#0A0A0B_15%,transparent_66%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-pearl/10" />
      </div>

      {/* LEFT — editorial column */}
      <div className="relative z-10 px-6 py-24 lg:max-w-[38rem] lg:py-0 lg:pl-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] lg:pr-12">
        <p className="flex-fade hero-copy eyebrow text-champagne/80">
          NYC Diamond District · Set by hand
        </p>

        <h1 className="hero-wordmark mt-6 font-display font-bold lowercase leading-[0.84] tracking-[-0.075em]">
          {HEADLINE.map((word, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <span className="flex-letter chrome-text inline-block text-[clamp(3.5rem,8.2vw,7.5rem)]">
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p className="flex-fade hero-copy mt-7 max-w-md text-[1.05rem] leading-8 text-ink/78">
          Lab-grown &amp; signature diamonds — cut, graded and set at our bench. One-of-a-kind
          piecut pieces, and made-to-order brilliance.
        </p>

        <div className="flex-fade mt-9 flex flex-wrap gap-4">
          <MagneticCTA
            href="/collections"
            className="magnetic-cta inline-flex items-center gap-2 rounded-full border border-champagne/50 bg-champagne px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-espresso shadow-glow transition-transform duration-300 hover:-translate-y-1"
          >
            Shop the collection
          </MagneticCTA>
          <Link
            href="#vault"
            className="group relative inline-flex items-center gap-2 overflow-hidden border border-champagne/30 px-8 py-4 text-[0.76rem] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-champagne hover:text-chromehi"
          >
            The Signature Vault
          </Link>
        </div>

        <div className="flex-fade mt-14 flex gap-10 border-t border-champagne/12 pt-7">
          {[
            { b: "69", s: "Signature pieces" },
            { b: "GIA", s: "Certified stones" },
            { b: "∞", s: "Lifetime service" },
          ].map((x) => (
            <div key={x.s}>
              <span className="block font-display text-[1.7rem] leading-none text-chromehi">{x.b}</span>
              <span className="mt-2 block text-[0.6rem] uppercase tracking-[0.18em] text-ink/65">{x.s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — dark plinth aperture; the persistent, environment-lit diamond shows through. */}
      <div className="relative hidden h-full items-center justify-center lg:flex">
        <div
          aria-hidden
          className="hero-diamond-aperture pointer-events-none relative aspect-square w-[38vw] max-w-[38rem]"
        >
          <span className="hero-diamond-stage absolute inset-[8%] rounded-full" />
          <span className="hero-diamond-caustic absolute bottom-[18%] left-1/2 h-[12%] w-[46%] -translate-x-1/2 rounded-[50%]" />
          <span className="hero-diamond-rim absolute inset-[8%] rounded-full" />
          <span className="halo-ring absolute inset-[6%] rounded-full" />
          <span className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(243,206,122,.18),transparent_70%)] blur-2xl" />
          <span className="absolute inset-[27%] rounded-full bg-[radial-gradient(circle,rgba(183,228,242,.22),transparent_68%)] blur-xl" />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="flex-fade absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
        <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-ink/65">Scroll</span>
        <span className="mx-auto mt-2 block h-8 w-px animate-pulse bg-gradient-to-b from-champagne to-transparent" />
      </div>
    </section>
  );
}
