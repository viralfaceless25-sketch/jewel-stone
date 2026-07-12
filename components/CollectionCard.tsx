"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { collections } from "@/data/products";

type Collection = (typeof collections)[number];

export function CollectionCard({
  collection,
  featured = false,
}: {
  collection: Collection;
  /** Bento hero tile — fills its grid cell instead of a fixed ratio, larger type, signature badge. */
  featured?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Image moves 14% vertically relative to scroll — creates depth within the card
  const imgY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <Link
      ref={ref}
      href={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden lg:h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
    >
      {/* Below `lg` the grid stacks to 1–2 columns, so each card needs its own
          aspect ratio. At `lg` the bento grid sets explicit row tracks, so every
          card (featured or not) should stretch to fill its cell instead — fixing
          an aspect-ratio here would make short cells overflow into the row below.
          Earring photography is shot as a wide pair with empty space between the
          two pieces, so a narrow portrait crop can land right in that gap — use a
          squarer ratio there below `lg`. */}
      <div
        className={`relative overflow-hidden lg:h-full lg:aspect-auto ${
          featured ? "min-h-[22rem]" : collection.category === "Earrings" ? "aspect-square" : "aspect-[4/5]"
        }`}
      >
        <motion.div
          style={{ y: imgY, position: "absolute", inset: "-8% 0", height: "116%" }}
          className="will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collection.image}
            alt={`${collection.title} by Jewel Stone`}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
            style={{ objectPosition: "center 25%" }}
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-marble/90 via-black/40 to-marble/10" />

        {/* Top row — signature badge (featured only) + price badge */}
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          {featured ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-rose/40 bg-marble/40 px-3.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-champagne backdrop-blur-sm">
              <span className="size-1 rounded-full bg-rose" aria-hidden="true" />
              Signature
            </div>
          ) : (
            <span />
          )}
          {collection.priceFrom && (
            <div className="rounded-full border border-champagne/20 bg-marble/40 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-chromehi/85 backdrop-blur-sm">
              {collection.priceFrom}
            </div>
          )}
        </div>

        {/* Bottom content */}
        <div className={`absolute bottom-0 left-0 right-0 ${featured ? "p-7 lg:p-9" : "p-6"}`}>
          <div className="flex items-end justify-between gap-3">
            <div className={featured ? "max-w-md" : undefined}>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-chromehi/55">
                {collection.category}
              </p>
              <h3 className={`mt-1 font-display leading-tight text-chromehi ${featured ? "text-3xl lg:text-4xl" : "text-2xl"}`}>
                {collection.title}
              </h3>
              <p className={`mt-1.5 text-chromehi/60 ${featured ? "text-[0.85rem] leading-6 line-clamp-3" : "text-[0.78rem] leading-5 line-clamp-2"}`}>
                {collection.description}
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-champagne/25 bg-pearl/10 text-chromehi transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-rose group-hover:border-rose backdrop-blur-sm">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
