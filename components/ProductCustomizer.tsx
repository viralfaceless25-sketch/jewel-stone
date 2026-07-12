"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Truck, Shield, Check } from "lucide-react";
import type { Product, MetalVariant } from "@/data/products";
import { useInquiryStore } from "@/store/inquiry";

// ── Types ──────────────────────────────────────────────

const METAL_OPTIONS: { key: MetalVariant; label: string; swatch: string }[] = [
  { key: "white",  label: "White Gold",  swatch: "#C7C2B8" },
  { key: "yellow", label: "Yellow Gold", swatch: "#8B877E" },
  { key: "rose",   label: "Rose Gold",   swatch: "#8B877E" },
];

const STUD_SIZES: { ct: number; price: number }[] = [
  { ct: 1,  price: 350  },
  { ct: 2,  price: 700  },
  { ct: 3,  price: 1050 },
  { ct: 4,  price: 1400 },
  { ct: 5,  price: 1750 },
  { ct: 6,  price: 2100 },
  { ct: 8,  price: 2800 },
  { ct: 10, price: 3500 },
  { ct: 12, price: 4200 },
  { ct: 15, price: 5250 },
  { ct: 20, price: 7000 },
];

const RING_SIZES = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
const BRACELET_LENGTHS = ['6.5"', '7"', '7.5"'];
const NECKLACE_LENGTHS = ['16"', '18"', '20"'];

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US")}`;
}

// ── Accordion ──────────────────────────────────────────

function AccordionItem({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-rose/14">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink transition-colors hover:text-velvet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink/40 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-7 text-ink/62">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────

export function ProductCustomizer({ product }: { product: Product }) {
  const addItem = useInquiryStore((state) => state.addItem);
  const hasItem = useInquiryStore((state) => state.hasItem(product.id));

  // Metal selection only applies to made-to-order lab-grown lines that offer a metal choice
  const offersMetalChoice = product.source === "lab-grown" && !!product.images;
  const availableMetals = product.images
    ? METAL_OPTIONS.filter((m) => product.images!.some((img) => img.metal === m.key))
    : [];
  const defaultMetal: MetalVariant = (product.images?.[0]?.metal) ?? "white";
  const [selectedMetal, setSelectedMetal] = useState<MetalVariant>(defaultMetal);

  // Image gallery state — real multi-angle photography takes priority, then metal-variant sets
  const imageSet = product.images?.find((img) => img.metal === selectedMetal) ?? product.images?.[0];
  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : imageSet
      ? [imageSet.front, imageSet.angle45, imageSet.side, imageSet.back]
      : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const mainImage = galleryImages[activeIndex] ?? galleryImages[0];
  const [viewMode, setViewMode] = useState<"photo" | "360">("photo");
  const has360 = !!product.videoUrl;

  // When metal changes, reset to first angle
  function handleMetalChange(metal: MetalVariant) {
    setSelectedMetal(metal);
    setActiveIndex(0);
  }

  // Size selectors
  const isEarring     = product.category === "Earrings";
  const isClassicStud = isEarring && product.style === "Classic Studs";
  const isRing        = product.category === "Rings";
  const isBracelet    = product.category === "Bracelets";
  const isNecklace    = product.category === "Necklaces" || product.category === "Pendants";

  const [selectedStudSize, setSelectedStudSize] = useState<number>(product.carats);
  const [selectedRingSize, setSelectedRingSize] = useState<number>(6.5);
  const [selectedBracelet, setSelectedBracelet] = useState<string>('7"');
  const [selectedNecklace, setSelectedNecklace] = useState<string>('18"');

  // Dynamic price
  const displayPrice: number = isClassicStud
    ? (STUD_SIZES.find((s) => s.ct === selectedStudSize)?.price ?? product.price)
    : product.price;

  const angleLabels = product.gallery && product.gallery.length > 0
    ? product.gallery.map((_, i) => `View ${i + 1}`)
    : ["Front", "45°", "Side", "Back"];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-start">
      {/* ── LEFT: Image gallery ───────────────────────────── */}
      <div className="lg:sticky lg:top-28 space-y-3">
        {/* View mode tabs */}
        {has360 && (
          <div className="mb-3 flex gap-5 border-b border-rose/12 pb-3">
            {(["photo", "360"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200 pb-2 -mb-3 border-b-2 ${
                  viewMode === mode
                    ? "border-ink text-ink"
                    : "border-transparent text-ink/35 hover:text-ink/65"
                }`}
              >
                {mode === "photo" ? "Photos" : "360° View"}
              </button>
            ))}
          </div>
        )}

        {/* Main image / 360 viewer */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-rose/16 bg-marble shadow-case">
          {viewMode === "360" && has360 ? (
            <>
              <video
                src={product.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div className="pointer-events-none absolute left-4 top-4 z-10">
                <span className="rounded-full border border-rose/25 bg-ivory/85 px-3 py-1 text-xs text-velvet backdrop-blur-sm">
                  Video
                </span>
              </div>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedMetal}-${activeIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image
                  src={mainImage}
                  alt={`${product.name} — ${angleLabels[activeIndex] ?? "view"}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-contain p-6"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Category badge */}
          {viewMode === "photo" && (
            <div className="pointer-events-none absolute left-4 top-4 z-10">
              <span className="rounded-full border border-rose/25 bg-ivory/85 px-3 py-1 text-xs text-velvet backdrop-blur-sm">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Product angles">
          {galleryImages.map((src, i) => (
            <button
              key={`${selectedMetal}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={angleLabels[i]}
              aria-pressed={activeIndex === i}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose active:scale-[0.97] ${
                activeIndex === i
                  ? "border-rose shadow-[0_0_0_3px_rgba(168,124,54,0.18)]"
                  : "border-rose/15 hover:border-rose/45"
              }`}
            >
              <Image
                src={src}
                alt={angleLabels[i] ?? ""}
                fill
                sizes="15vw"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Product customizer ─────────────────────── */}
      <div>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink/45">
          <Link href="/collections" className="hover:text-ink transition-colors">Collections</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/collections/${product.category.toLowerCase()}`} className="hover:text-ink transition-colors">{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/70">{product.name}</span>
        </nav>

        {/* Name */}
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.92] tracking-[-0.01em]">
          {product.name}
        </h1>

        {/* Price */}
        <p className="mt-5 font-display text-[2rem] leading-none text-velvet">
          {isClassicStud ? formatPrice(displayPrice) : product.priceLabel}
        </p>
        {displayPrice >= 100 && (
          <p className="mt-1 text-xs text-ink/40">
            From ${Math.ceil(displayPrice / 12)}/mo with Affirm
          </p>
        )}

        {/* Availability messaging */}
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-rose/80">
          {product.source === "signature" ? "One of a kind — only one available" : "Made to order — ships in 3–4 weeks"}
        </p>

        {/* Description */}
        <p className="mt-4 text-sm leading-7 text-ink/72">{product.description}</p>

        {/* ── Metal selector — made-to-order lines with a metal choice only ── */}
        {offersMetalChoice && availableMetals.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
              Metal — <span className="normal-case tracking-normal font-normal text-ink/80">{METAL_OPTIONS.find((m) => m.key === selectedMetal)?.label}</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select metal">
              {availableMetals.map(({ key, label, swatch }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMetalChange(key)}
                  aria-pressed={selectedMetal === key}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                    selectedMetal === key
                      ? "border-rose/70 bg-rose/8 text-ink shadow-[0_0_0_3px_rgba(168,124,54,0.14)]"
                      : "border-rose/20 bg-pearl/60 text-ink/65 hover:border-rose/45 hover:text-ink"
                  }`}
                >
                  <span
                    className="size-3.5 rounded-full border border-champagne/40 shadow-sm"
                    style={{ background: swatch }}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stud carat selector — Classic Studs made-to-order line only ── */}
        {isEarring && product.style === "Classic Studs" && (
          <div className="mt-7">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
              Carat Total Weight — <span className="normal-case tracking-normal font-normal text-ink/80">{selectedStudSize}CT</span>
            </p>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label="Select carat size">
              {STUD_SIZES.map(({ ct, price }) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setSelectedStudSize(ct)}
                  aria-pressed={selectedStudSize === ct}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border py-3 text-xs transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                    selectedStudSize === ct
                      ? "border-rose/70 bg-rose/8 text-velvet shadow-[0_0_0_3px_rgba(168,124,54,0.14)]"
                      : "border-rose/16 bg-pearl/50 text-ink/65 hover:border-rose/40 hover:text-ink"
                  }`}
                >
                  <span className="font-medium">{ct}CT</span>
                  <span className="text-[0.65rem] text-ink/45">{formatPrice(price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Ring size selector ── */}
        {isRing && (
          <div className="mt-7">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
              Ring Size — <span className="normal-case tracking-normal font-normal text-ink/80">US {selectedRingSize}</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select ring size">
              {RING_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedRingSize(size)}
                  aria-pressed={selectedRingSize === size}
                  className={`min-w-[3rem] rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                    selectedRingSize === size
                      ? "border-rose/70 bg-rose/8 text-velvet shadow-[0_0_0_3px_rgba(168,124,54,0.14)]"
                      : "border-rose/16 bg-pearl/50 text-ink/65 hover:border-rose/40 hover:text-ink"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.7rem] text-ink/40">Resizable 4–10. Complimentary resize within 30 days.</p>
          </div>
        )}

        {/* ── Bracelet length ── */}
        {isBracelet && (
          <div className="mt-7">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
              Length — <span className="normal-case tracking-normal font-normal text-ink/80">{selectedBracelet}</span>
            </p>
            <div className="flex gap-2" role="group" aria-label="Select bracelet length">
              {BRACELET_LENGTHS.map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSelectedBracelet(len)}
                  aria-pressed={selectedBracelet === len}
                  className={`rounded-lg border px-5 py-2.5 text-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                    selectedBracelet === len
                      ? "border-rose/70 bg-rose/8 text-velvet shadow-[0_0_0_3px_rgba(168,124,54,0.14)]"
                      : "border-rose/16 bg-pearl/50 text-ink/65 hover:border-rose/40 hover:text-ink"
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Necklace length ── */}
        {isNecklace && (
          <div className="mt-7">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
              Length — <span className="normal-case tracking-normal font-normal text-ink/80">{selectedNecklace}</span>
            </p>
            <div className="flex gap-2" role="group" aria-label="Select necklace length">
              {NECKLACE_LENGTHS.map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSelectedNecklace(len)}
                  aria-pressed={selectedNecklace === len}
                  className={`rounded-lg border px-5 py-2.5 text-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                    selectedNecklace === len
                      ? "border-rose/70 bg-rose/8 text-velvet shadow-[0_0_0_3px_rgba(168,124,54,0.14)]"
                      : "border-rose/16 bg-pearl/50 text-ink/65 hover:border-rose/40 hover:text-ink"
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Shipping info ── */}
        <div className="mt-7 flex items-center gap-2.5 rounded-xl border border-rose/14 bg-rose/4 px-4 py-3">
          <Truck size={15} className="shrink-0 text-rose/70" aria-hidden="true" />
          <p className="text-xs text-ink/65">
            Free insured shipping · Ships in 3–5 business days
          </p>
        </div>

        {/* ── CTAs ── */}
        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex w-full min-h-12 items-center justify-center gap-2.5 rounded-full bg-rose px-6 text-sm font-medium text-ink shadow-glow transition-all duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-rose active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {hasItem ? (
              <>
                <Check size={16} aria-hidden="true" />
                Added to Inquiry List
              </>
            ) : (
              "Add to Inquiry List"
            )}
          </button>
          <Link
            href="/contact"
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-full border border-rose/35 bg-pearl/60 px-6 text-sm font-medium text-ink/80 transition-all duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-rose/70 hover:bg-rose/6 hover:text-ink active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
          >
            Book Private Viewing
          </Link>
        </div>

        {/* ── Trust row ── */}
        <div className="mt-7 flex flex-wrap gap-3">
          {["GIA/IGI Certified", "Lab-Grown", "14K Gold", "30-Day Returns"].map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-1.5 rounded-full border border-rose/18 bg-pearl/50 px-3 py-1.5 text-[0.68rem] text-ink/60"
            >
              <Shield size={10} className="shrink-0 text-rose/60" aria-hidden="true" />
              {badge}
            </span>
          ))}
        </div>

        {/* ── Product details accordion ── */}
        <div className="mt-8">
          <AccordionItem label="Stone Details">
            <dl className="grid gap-2.5">
              <div className="flex justify-between">
                <dt className="text-ink/50">Center Stone</dt>
                <dd>{product.centerStone} · {product.carats}CT</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Color / Clarity</dt>
                <dd>{product.colorClarity}</dd>
              </div>
            </dl>
          </AccordionItem>

          <AccordionItem label="Material & Craftsmanship">
            <dl className="grid gap-2.5">
              <div className="flex justify-between">
                <dt className="text-ink/50">Material</dt>
                <dd>{product.material}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Style</dt>
                <dd>{product.style}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Size</dt>
                <dd>{product.sizeInfo}</dd>
              </div>
            </dl>
          </AccordionItem>

          <AccordionItem label="Certification & Returns">
            <p>All Jewel Stone diamonds are certified by GIA or IGI and sourced as conflict-free lab-grown stones. We offer complimentary insured shipping and a 30-day return window for unworn pieces.</p>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}
