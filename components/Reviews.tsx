"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const REVIEWS = [
  { name: "Amara Okafor", text: "They had a piecut pendant I couldn't find anywhere else in the district. Certified, gorgeous, and half what I expected to pay. This is the one." },
  { name: "David Rosen", text: "Designed an engagement ring from scratch with them. They walked me through lab vs natural honestly, no pressure. She said yes." },
  { name: "Priya Nair", text: "The 360 view online is exactly what showed up in the box. Set by hand, and you can tell. Cluster studs are unreal in person." },
] as const;

export function Reviews() {
  const reduce = useReducedMotion();
  return (
    <section className="editorial-section bg-[#0A0A0B]" aria-labelledby="reviews-heading">
      <div className="luxury-shell grid border-y border-[var(--hair)] lg:grid-cols-[.82fr_1.18fr]">
        <motion.figure initial={reduce ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="border-b border-[var(--hair)] p-4 lg:border-b-0 lg:border-r lg:p-8">
          <div className="relative aspect-[4/5] bg-[#141416]">
            <Image src="/images/lifestyle/model-cluster-studs.jpg" alt="Client wearing Jewel Stone diamond cluster studs" fill sizes="(min-width:1024px) 38vw, 92vw" className="object-contain p-2" />
          </div>
          <figcaption className="pt-4 text-[.58rem] uppercase tracking-[.2em] text-ink/45">Loved in real life · New York</figcaption>
        </motion.figure>
        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-20 lg:py-20">
          <p className="eyebrow">4.9 on Google · 300+ reviews</p>
          <h2 id="reviews-heading" className="sr-only">Client testimonials</h2>
          <blockquote className="mt-8 font-display text-[clamp(2.3rem,4.5vw,4.7rem)] leading-[1.04] tracking-[-.02em]">“{REVIEWS[0].text}”</blockquote>
          <p className="mt-7 text-[.65rem] uppercase tracking-[.22em] text-champagne">★★★★★ &nbsp; {REVIEWS[0].name}</p>
          <div className="mt-12 grid gap-8 border-t border-[var(--hair)] pt-8 sm:grid-cols-2">
            {REVIEWS.slice(1).map((review) => <blockquote key={review.name}><p className="font-display text-xl leading-7">“{review.text}”</p><footer className="mt-4 text-[.58rem] uppercase tracking-[.2em] text-ink/45">{review.name}</footer></blockquote>)}
          </div>
        </div>
      </div>
    </section>
  );
}
