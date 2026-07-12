"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { homeFeaturedProducts } from "@/data/products";

export function FeaturedCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    const firstSlide = track.firstElementChild as HTMLElement | null;
    const amount = (firstSlide?.offsetWidth ?? track.clientWidth * 0.78) + 16;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.scrollBy({
      left: direction * amount,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <section className="featured-pin editorial-section overflow-hidden bg-ivory" aria-labelledby="featured-carousel-heading">
      <div className="reveal luxury-shell flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">The signature collection</p>
          <h2 id="featured-carousel-heading" className="mt-3 font-display text-[clamp(2.8rem,5vw,5rem)] leading-[.96]">Our most <em className="editorial-italic">loved pieces.</em></h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/collections"
            className="mr-2 inline-flex min-h-11 items-center text-xs uppercase tracking-[.18em] text-champagne transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            View all →
          </Link>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous featured products"
            className="grid size-11 place-items-center rounded-full border border-champagne/30 text-ink transition-colors hover:bg-pearl/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next featured products"
            className="grid size-11 place-items-center rounded-full border border-champagne/30 text-ink transition-colors hover:bg-pearl/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
          >
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="featured-track no-scrollbar luxury-shell mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth lg:w-max lg:max-w-none lg:snap-none lg:overflow-visible"
        aria-label="Featured jewelry"
      >
        {homeFeaturedProducts.map((product) => (
          <div
            key={product.id}
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30%] xl:w-[23%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
