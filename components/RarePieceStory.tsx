"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/Buttons";

const SPECS = [
  { label: "Cut", value: "Emerald & baguette" },
  { label: "Origin", value: "Lab-grown or natural" },
  { label: "Metal", value: "18K white gold" },
  { label: "Edition", value: "One of one" },
] as const;

export function RarePieceStory() {
  const reduce = useReducedMotion();
  const entrance = reduce ? {} : { initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .25 } };
  return (
    <section className="editorial-section bg-[#0A0A0B]" aria-labelledby="rarepiece-heading">
      <div className="luxury-shell grid items-center gap-12 lg:grid-cols-[1.18fr_.82fr] lg:gap-20">
        <motion.figure {...entrance} transition={{ duration: .9 }} className="relative border border-[var(--hair2)] bg-[#141416] p-5 sm:p-10 lg:p-16">
          <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(243,206,122,.48),rgba(183,228,242,.18)_42%,transparent_70%)] blur-3xl" />
          <div className="relative aspect-[4/5]">
            <Image src="/images/turntable/drops-poster.webp" alt="Emerald-Cut Cascade diamond drop earrings" fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-contain p-4 sm:p-8" priority />
          </div>
          <figcaption className="mt-5 flex justify-between border-t border-[var(--hair)] pt-4 text-[.58rem] uppercase tracking-[.2em] text-ink/50"><span>Piece 01 / 11</span><span>Drag view in the Vault</span></figcaption>
        </motion.figure>
        <motion.div {...entrance} transition={{ duration: .8, delay: .08 }}>
          <p className="eyebrow">Piece of the season</p>
          <h2 id="rarepiece-heading" className="mt-5 font-display text-[clamp(3rem,5.4vw,5.6rem)] leading-[.94] tracking-[-.02em]">The Emerald-Cut <em className="editorial-italic">Cascade.</em></h2>
          <p className="mt-8 max-w-lg leading-8 text-ink/62">A ladder of emerald- and baguette-cut diamonds, hand-matched for step and colour, articulated so each stone moves with the light. Step-cuts hide nothing — every inclusion has to be flawless, which is why so few are ever made. This is the one we made.</p>
          <p className="mt-8 font-display text-3xl text-ink">Price on request</p>
          <dl className="mt-8 grid grid-cols-2 border-y border-[var(--hair)]">
            {SPECS.map((item, index) => <div key={item.label} className={`py-4 ${index % 2 ? "border-l border-[var(--hair)] pl-5" : "pr-5"} ${index > 1 ? "border-t border-[var(--hair)]" : ""}`}><dt className="text-[.55rem] uppercase tracking-[.2em] text-champagne">{item.label}</dt><dd className="mt-1 font-display text-base">{item.value}</dd></div>)}
          </dl>
          <div className="mt-9 flex flex-wrap gap-4"><ButtonLink href="/contact" variant="gold">Enquire privately</ButtonLink><ButtonLink href="#vault" variant="secondary">See the Vault</ButtonLink></div>
        </motion.div>
      </div>
    </section>
  );
}
