"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { COLOR_CLARITY_LABEL, type Product } from "@/data/products";
import { ActionButton } from "@/components/Buttons";
import { PieceViewer } from "@/components/ar/PieceViewer";
import { modelFor } from "@/lib/models";
import { useInquiryStore } from "@/store/inquiry";

export function ProductQuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const addItem = useInquiryStore((state) => state.addItem);
  const [i, setI] = useState(0);
  const [showModel, setShowModel] = useState(false);

  const shots = useMemo(
    () => (product ? [product.image, ...(product.gallery ?? [])].filter(Boolean) : []),
    [product],
  );
  const model = product ? modelFor(product.slug) : undefined;

  // Reset the reel whenever a different piece is opened.
  useEffect(() => {
    setI(0);
    setShowModel(false);
  }, [product?.slug]);

  const step = (d: number) => {
    setShowModel(false);
    setI((v) => (v + d + shots.length) % shots.length);
  };

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-rose/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} quick view`}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="grid w-full max-w-4xl gap-6 border border-rose/25 bg-ivory p-5 shadow-2xl md:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="relative grid min-h-72 place-items-center overflow-hidden bg-black">
              {showModel && model ? (
                <PieceViewer src={model} alt={product.name} poster={product.image} className="h-full min-h-72 w-full" />
              ) : (
                <Image
                  src={shots[i]}
                  alt={product.name}
                  width={520}
                  height={430}
                  className="h-full max-h-96 w-full object-contain p-6"
                />
              )}

              {!showModel && shots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-pearl/25 bg-black/45 text-pearl backdrop-blur-sm transition hover:bg-black/65"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-pearl/25 bg-black/45 text-pearl backdrop-blur-sm transition hover:bg-black/65"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {shots.map((s, n) => (
                      <span key={s} className={`h-1 rounded-full transition-all ${n === i ? "w-4 bg-champagne" : "w-1 bg-pearl/35"}`} />
                    ))}
                  </div>
                </>
              )}

              {model && (
                <button
                  type="button"
                  onClick={() => setShowModel((v) => !v)}
                  aria-pressed={showModel}
                  className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-pearl/25 bg-black/45 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-pearl backdrop-blur-sm transition hover:bg-black/65"
                >
                  <Box size={12} aria-hidden="true" />
                  {showModel ? "Photos" : "3D · AR"}
                </button>
              )}
            </div>

            <div className="relative p-1 md:p-5">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-0 top-0 grid size-10 place-items-center rounded-full border border-rose/25"
                aria-label="Close quick view"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <p className="eyebrow">{product.category}</p>
              <h2 className="mt-3 pr-10 font-display text-4xl">{product.name}</h2>
              <p className="mt-5 text-sm leading-7 text-ink/70">{product.description}</p>
              <dl className="mt-6 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-rose/15 pb-3"><dt>Material</dt><dd className="text-right text-ink/64">{product.material}</dd></div>
                <div className="flex justify-between gap-4 border-b border-rose/15 pb-3"><dt>Diamond</dt><dd className="text-right text-ink/64">{product.centerStone} · {product.carats}CT</dd></div>
                <div className="flex justify-between gap-4 border-b border-rose/15 pb-3"><dt>Color / Clarity</dt><dd className="text-right text-ink/64">{COLOR_CLARITY_LABEL}</dd></div>
              </dl>
              <div className="mt-7 flex flex-wrap gap-3">
                <ActionButton onClick={() => addItem(product)}>Add to inquiry</ActionButton>
                <Link href={`/products/${product.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-rose/35 px-5 text-sm">
                  Full details
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
