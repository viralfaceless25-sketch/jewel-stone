"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Turntable3D } from "@/components/Turntable3D";
import { ButtonLink } from "@/components/Buttons";

// Real photographed turntable — 75 frames of one full rotation.
const FRAMES = Array.from(
  { length: 75 },
  (_, i) => `/images/turntable/hero-ring/frame-${String(i).padStart(3, "0")}.webp`,
);
const POSTER = "/images/turntable/hero-ring-poster.webp";

const SPECS = [
  { label: "View", value: "Full 360°" },
  { label: "Setting", value: "Shared-prong eternity" },
  { label: "Cut", value: "Round brilliant" },
  { label: "Metal", value: "18K white gold" },
] as const;

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
};

export function Showcase3D() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-transparent py-24 text-ink lg:py-32"
      aria-labelledby="showcase3d-heading"
    >
      {/* Depth glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[38rem] w-[38rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,124,54,0.22), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[42rem] w-[42rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,124,54,0.18), transparent 70%)" }}
      />

      <div className="luxury-shell relative z-10 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Interactive object */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: [0.23, 1, 0.32, 1] }}
          className="glass-stage relative order-1 rounded-[2rem] p-5 sm:p-8"
        >
          <Turntable3D
            frames={FRAMES}
            poster={POSTER}
            priority
            alt="Diamond eternity band shown rotating in a full 360-degree view — drag to rotate"
            className="mx-auto w-full max-w-[520px]"
          />
        </motion.div>

        {/* Copy */}
        <div className="order-2">
          <motion.p
            {...(reduceMotion ? {} : reveal)}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="eyebrow text-champagne/70"
          >
            Hold it in your hand
          </motion.p>

          <motion.h2
            {...(reduceMotion ? {} : reveal)}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
            id="showcase3d-heading"
            className="chrome-text display-title mt-4 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.96]"
          >
            Every angle,<br />in the round.
          </motion.h2>

          <motion.p
            {...(reduceMotion ? {} : reveal)}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 max-w-md text-[0.95rem] leading-8 text-ink/60"
          >
            No renders, no stock. This is the actual piece — photographed frame by frame on our
            bench, so you can turn it in the light and read every facet before it&rsquo;s ever boxed.
            Grab it and spin.
          </motion.p>

          <motion.dl
            {...(reduceMotion ? {} : reveal)}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="mt-9 grid max-w-md grid-cols-2 gap-3"
          >
            {SPECS.map((spec) => (
              <div
                key={spec.label}
                className="glass rounded-xl px-4 py-3"
              >
                <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-champagne/60">{spec.label}</dt>
                <dd className="mt-1 font-display text-lg leading-none text-ink">{spec.value}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div
            {...(reduceMotion ? {} : reveal)}
            transition={{ duration: 0.7, delay: 0.32, ease: [0.23, 1, 0.32, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <ButtonLink href="/diamonds" variant="gold">
              Explore the collection
            </ButtonLink>
            <ButtonLink href="/custom" variant="secondary">
              Design your own
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
