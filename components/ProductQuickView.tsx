"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/data/products";
import { ActionButton } from "@/components/Buttons";
import { useInquiryStore } from "@/store/inquiry";

export function ProductQuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const addItem = useInquiryStore((state) => state.addItem);

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
            <div className="grid min-h-72 place-items-center bg-marble">
              <Image src={product.image} alt={product.name} width={520} height={430} className="h-full max-h-96 w-full object-contain p-6" />
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
                <div className="flex justify-between gap-4 border-b border-rose/15 pb-3"><dt>Color / Clarity</dt><dd className="text-right text-ink/64">{product.colorClarity}</dd></div>
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
