"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Eye, Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { COLOR_CLARITY_LABEL, type Product } from "@/data/products";
import { useInquiryStore } from "@/store/inquiry";
import { useWishlistStore } from "@/store/wishlist";

const SLIDE_MS = 2600;

/**
 * Cycles the card's hero image through the product's gallery. Only runs while
 * the card is on screen, and never for users who asked for reduced motion.
 */
function useSlideshow(count: number, hostRef: React.RefObject<HTMLElement>) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      timer ??= setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.25 });
    io.observe(host);
    return () => {
      io.disconnect();
      stop();
    };
  }, [count, hostRef]);

  return index;
}

export function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (product: Product) => void }) {
  const addItem = useInquiryStore((state) => state.addItem);
  const hasItem = useInquiryStore((state) => state.hasItem(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(product.id));

  const isEarring = product.category === "Earrings";
  const isSignature = product.source === "signature";

  // Studio shots only: the on-body `model.jpg` sits on ivory silk, and mixing it
  // into the reel would break the uniform black background across the grid.
  // It still appears in the gallery on the product page.
  const slides = useMemo(
    () =>
      [product.image, ...(product.gallery ?? [])]
        .filter(Boolean)
        .filter((s) => !s.endsWith("/model.jpg"))
        .slice(0, 5),
    [product],
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const slide = useSlideshow(slides.length, frameRef);

  return (
    <motion.article
      initial={{ opacity: 0.25, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="aurora-card glass group relative overflow-hidden rounded-3xl"
    >
      {/* Image area */}
      <Link href={`/products/${product.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose">
        <div
          ref={frameRef}
          className={`relative overflow-hidden bg-black ${isEarring ? "aspect-square" : "aspect-[3/4]"}`}
        >
          {slides.map((src, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={src}
              src={src}
              alt={i === 0 ? product.name : ""}
              aria-hidden={i === 0 ? undefined : true}
              loading={i === 0 ? "lazy" : "lazy"}
              className={`absolute inset-0 h-full w-full object-contain p-6 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05] ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
              style={{ objectPosition: "center" }}
            />
          ))}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/40 via-transparent to-transparent" />

          {slides.length > 1 && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((src, i) => (
                <span
                  key={src}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === slide ? "w-4 bg-champagne/90" : "w-1 bg-pearl/35"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-full border border-champagne/15 bg-marble/40 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-chromehi/70 backdrop-blur-sm">
              {product.category}
            </span>
            {isSignature && (
              <span className="rounded-full border border-rose/40 bg-rose/20 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-champagne backdrop-blur-sm">
                One of a Kind
              </span>
            )}
            {product.comingSoon && (
              <span className="rounded-full border border-champagne/15 bg-marble/40 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-chromehi/55 backdrop-blur-sm">
                Coming Soon
              </span>
            )}
            {product.videoUrl && (
              <span className="rounded-full border border-champagne/15 bg-marble/40 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-champagne/80 backdrop-blur-sm">
                Video
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.16em] text-champagne/50">
              {product.carats} ct · {product.centerStone}
            </p>
            <Link href={`/products/${product.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              <h3 className="chrome-text mt-1.5 font-display text-xl leading-tight">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1.5 text-[0.68rem] text-ink/60">{COLOR_CLARITY_LABEL}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  priceLabel: product.priceLabel,
                  image: product.image
                })
              }
              aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isWishlisted
                  ? "border-rose/60 bg-rose/10 text-rose"
                  : "border-champagne/15 text-chromehi/50 hover:border-champagne/40 hover:text-chromehi"
              }`}
            >
              <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} aria-hidden="true" />
            </button>
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                aria-label={`Quick view ${product.name}`}
                className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-champagne/15 text-chromehi/50 transition-all duration-200 hover:border-champagne/40 hover:text-chromehi active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Eye size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => addItem(product)}
            className={`product-add mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium transition-all duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            hasItem
              ? "border border-champagne/40 bg-champagne/10 text-champagne"
              : "bg-pearl/10 text-ink hover:bg-pearl/18"
          }`}
        >
          {hasItem ? <Check size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />}
          {hasItem ? "Added to inquiry" : product.comingSoon ? "Join the waitlist" : "Add to inquiry"}
        </button>
      </div>
    </motion.article>
  );
}
