"use client";

import { motion } from "framer-motion";

export function SectionHeader({
  eyebrow,
  title,
  copy,
  dark = false
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {/* Eyebrow — small, can fade fully */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.01 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className={dark ? "eyebrow text-champagne/70" : "eyebrow"}
      >
        {eyebrow}
      </motion.p>

      {/* Title — starts at 0.25 opacity so it's never a blank void */}
      <motion.h2
        initial={{ opacity: 0.25, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.01 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
        className={`display-title mt-3 text-[clamp(2.2rem,5.5vw,4rem)] ${dark ? "text-ink" : "text-ink"}`}
      >
        {title}
      </motion.h2>

      {copy ? (
        <motion.p
          initial={{ opacity: 0.15, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }}
          transition={{ duration: 0.55, delay: 0.14, ease: [0.23, 1, 0.32, 1] }}
          className={`mt-5 max-w-2xl text-[0.95rem] leading-8 ${dark ? "text-ink/62" : "text-ink/62"}`}
        >
          {copy}
        </motion.p>
      ) : null}
    </div>
  );
}
