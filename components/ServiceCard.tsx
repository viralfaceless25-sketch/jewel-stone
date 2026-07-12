"use client";

import { motion } from "framer-motion";
import { Diamond, Sparkles, Search, Pencil, ShieldCheck, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  "Pavé & natural diamond jewelry": "Expertly sourced natural diamonds in pavé settings — each stone hand-selected for light performance and character.",
  "Lab grown and natural diamond jewelry": "Both lab-grown and natural diamonds available across all categories, with full transparency on origin, certification, and pricing.",
  "Loose diamonds": "Browse certified loose diamonds — round, oval, cushion, emerald, and more — and pair them with a setting of your choice.",
  "Custom jewelry design": "From first sketch to finished heirloom. Bring your vision or start from scratch — we guide you through every decision.",
  "IGI and GIA certified diamonds": "Every certified diamond comes with a grading report from IGI or GIA, verifying cut, color, clarity, and carat weight.",
  "Non-certified diamonds": "High-quality diamonds without the certification premium — ideal for those who trust our team's grading and want maximum value.",
};

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "Pavé & natural diamond jewelry": Diamond,
  "Lab grown and natural diamond jewelry": Sparkles,
  "Loose diamonds": Search,
  "Custom jewelry design": Pencil,
  "IGI and GIA certified diamonds": ShieldCheck,
  "Non-certified diamonds": CheckCircle,
};

export function ServiceCard({ service, index = 0 }: { service: string; index?: number }) {
  const description = SERVICE_DESCRIPTIONS[service] ?? "Premium quality diamonds and jewelry with expert guidance at every step.";
  const Icon = SERVICE_ICONS[service] ?? CheckCircle;

  return (
    <motion.article
      initial={{ opacity: 0.25, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      className="group relative overflow-hidden border border-rose/14 bg-pearl/45 p-7 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-rose/35 hover:bg-pearl/70 hover:shadow-[0_8px_32px_rgba(168,124,54,0.1)]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-rose/25 bg-rose/8 transition-colors duration-200 group-hover:bg-rose/15">
        <Icon size={16} className="text-rose" aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-2xl leading-tight">{service}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/58">{description}</p>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-rose to-champagne transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full" />
    </motion.article>
  );
}
