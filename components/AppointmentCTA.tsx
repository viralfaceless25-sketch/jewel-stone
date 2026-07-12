"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Mail, MapPin, Phone, Clock } from "lucide-react";
import { brand } from "@/data/site";

export function AppointmentCTA() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`;

  return (
    <section className="relative overflow-hidden py-24 lg:py-28">
      <div
        className="pointer-events-none absolute right-0 top-0 h-[28rem] w-[28rem] translate-x-1/3 -translate-y-1/4 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,124,54,0.14), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="luxury-shell relative z-10 grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left — framed showroom image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="bezel-outer relative mx-auto max-w-sm lg:max-w-none"
        >
          <div className="bezel-inner relative aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/products/emerald-halo-stud-earrings/cover.jpg"
              alt="Emerald halo stud earrings — Jewel Stone signature collection"
              className="h-full w-full object-cover"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="glass-panel absolute -right-4 top-6 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 lg:-right-6"
          >
            <MapPin size={14} className="shrink-0 text-rose" aria-hidden="true" />
            <div>
              <p className="text-[0.68rem] font-semibold leading-none text-ink/80">Suite 505</p>
              <p className="mt-0.5 text-[0.6rem] leading-none text-ink/45">By appointment</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — copy + appointment options */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="eyebrow text-rose/70">Private appointment · Suite 505</p>
          <h2 className="display-title mt-5 text-[clamp(2.8rem,5.5vw,5rem)] leading-[0.9] text-ink">
            Visit our<br />Diamond District<br />showroom.
          </h2>
          <p className="mt-7 max-w-md text-[0.95rem] leading-7 text-ink/55">
            Meet with {brand.owner} for diamond selection, custom design direction, and private
            jewelry consultation. By appointment only.
          </p>

          {/* Location details */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <div className="flex items-center gap-2 text-[0.85rem] text-ink/60">
              <MapPin size={15} className="shrink-0 text-rose" aria-hidden="true" />
              <span>{brand.address}</span>
            </div>
            <div className="flex items-center gap-2 text-[0.85rem] text-ink/60">
              <Clock size={15} className="shrink-0 text-rose" aria-hidden="true" />
              <span>{brand.hours}</span>
            </div>
          </div>

          {/* Appointment options */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-gradient-to-br from-aurora2 to-aurora1 px-7 text-sm font-medium text-ivory shadow-[0_8px_26px_rgba(180,132,47,.4)] transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 hover:shadow-[0_10px_34px_rgba(180,132,47,.48)] active:scale-[0.97]"
            >
              <Calendar size={15} aria-hidden="true" />
              Book a private consultation
            </Link>
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-rose/30 bg-marble/80 px-5 text-sm text-ink transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-rose/60 hover:bg-pearl active:scale-[0.97]"
            >
              Get directions →
            </Link>
          </div>

          {/* Direct contact chips */}
          <div className="mt-4 flex flex-wrap gap-4 text-[0.85rem] text-ink/50">
            <Link href={`tel:${brand.phone.replaceAll(" ", "")}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-rose">
              <Phone size={13} aria-hidden="true" />
              {brand.phone}
            </Link>
            <Link href={`mailto:${brand.email}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-rose">
              <Mail size={13} aria-hidden="true" />
              {brand.email}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
