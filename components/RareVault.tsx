"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Turntable3D } from "@/components/Turntable3D";
import { ButtonLink } from "@/components/Buttons";

const framesFor = (dir: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/images/turntable/${dir}/frame-${String(i).padStart(3, "0")}.webp`);

const PIECES = [
  {
    dir: "studs",
    count: 94,
    tag: "Piecut cluster",
    name: "Illusion Cluster Studs",
    spec: "Multi-stone piecut illusion · 18K white gold",
    href: "/collections",
  },
  {
    dir: "pendant",
    count: 94,
    tag: "One of a kind",
    name: "Cascade Drop Pendant",
    spec: "Mixed-cut piecut cascade · hand-strung",
    href: "/collections",
  },
  {
    dir: "drops",
    count: 94,
    tag: "Antique cut",
    name: "Baguette Cascade Drops",
    spec: "Straight & taper baguette · articulated",
    href: "/collections",
  },
] as const;

export function RareVault() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-espresso py-24 text-ivory lg:py-32"
      aria-labelledby="vault-heading"
    >
      {/* Blended background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(180,132,47,.18),transparent_48%)]" />

      <div className="luxury-shell relative z-10">
        {/* Sub-brand lockup */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto max-w-4xl border-y border-champagne/30 py-10 text-center sm:py-14"
        >
          <span className="inline-flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.34em] text-champagne/80">
            ◆ The Piecut Vault
          </span>
          <p className="mt-7 font-display text-xl italic text-ivory/70">Eleven pieces. Never repeated.</p>
          <h2
            id="vault-heading"
            className="display-title mt-3 bg-[linear-gradient(180deg,#F2F0EB,#C7C2B8_52%,#C7C2B8)] bg-clip-text text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.96] text-transparent drop-shadow-[0_4px_26px_rgba(243,206,122,.35)]"
          >
            Pieces you won&rsquo;t<br />find twice.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[0.95rem] leading-8 text-ivory/65">
            Our specialty: rare <em className="not-italic text-champagne/90">piecut</em> and antique diamond
            work — lab-grown and natural — built one at a time and never restocked. When it&rsquo;s gone,
            it&rsquo;s gone.
          </p>
          <p className="mt-5 text-[0.6rem] uppercase tracking-[0.34em] text-ivory/40">
            Rare · One of a kind · Not restocked
          </p>
        </motion.div>

        {/* Three rotatable vault pieces */}
        <div className="mt-16 grid gap-8 md:grid-cols-3 lg:mt-20 lg:gap-10">
          {PIECES.map((piece, i) => (
            <motion.article
              key={piece.dir}
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="aurora-card group relative rounded-3xl border border-champagne/20 bg-white/[0.07] p-5 backdrop-blur-xl"
            >
              <div className="absolute right-5 top-5 z-20 rounded-full border border-champagne/20 bg-marble/40 px-3 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-champagne/70">
                {piece.tag}
              </div>
              <Turntable3D
                frames={framesFor(piece.dir, piece.count)}
                poster={`/images/turntable/${piece.dir}-poster.webp`}
                alt={`${piece.name} — drag to rotate and view every angle`}
                className="w-full"
              />
              <div className="mt-4 px-1 pb-1">
                <h3 className="font-display text-2xl text-ivory">{piece.name}</h3>
                <p className="mt-1.5 text-[0.8rem] leading-6 text-ivory/55">{piece.spec}</p>
                <a
                  href={piece.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-champagne/80 transition-colors hover:text-champagne"
                >
                  Enquire
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <ButtonLink href="/collections" variant="gold">Enter the vault</ButtonLink>
        </div>
      </div>
    </section>
  );
}
