"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ImagePlus } from "lucide-react";
import { ActionButton } from "@/components/Buttons";
import { getProductDiamondMetadata } from "@/data/products";
import type { Product, ProductCategory } from "@/data/products";

const PIECE_TYPES = ["Ring", "Necklace", "Bracelet", "Earrings", "Pendant", "Chain"] as const;
type PieceType = (typeof PIECE_TYPES)[number];

const SHAPES = [
  "Round",
  "Oval",
  "Cushion",
  "Emerald",
  "Pear",
  "Heart",
  "Radiant",
  "Marquise",
  "Cushion Brilliant",
  "Princess",
  "Baguette",
  "Half Moon",
  "Piecut",
] as const;

const METALS = [
  { name: "White Gold", swatch: "bg-[#C7C2B8]" },
  { name: "Yellow Gold", swatch: "bg-[#C7C2B8]" },
  { name: "Rose Gold", swatch: "bg-[#8B877E]" },
  { name: "Platinum", swatch: "bg-[#C7C2B8]" },
  { name: "Sterling Silver", swatch: "bg-[#BFC3C5]" },
] as const;

const UPGRADES = [
  { name: "Engraving", note: "Add a date, initials, or private inscription." },
  { name: "Higher clarity (VVS+)", note: "Prioritize VVS, IF, or FL clarity stones." },
  { name: "Larger halo", note: "Increase the halo's scale and visual presence." },
  { name: "Hidden accent stone", note: "Set a discreet diamond or gemstone beneath the center." },
  { name: "Gift packaging", note: "Present the finished piece in elevated gift packaging." },
] as const;

const FIELD_CLASS =
  "min-h-12 w-full rounded-xl border border-rose/25 bg-pearl/70 px-4 text-base text-ink transition-colors focus:border-rose/70 focus:outline-none focus:ring-2 focus:ring-rose/15";

function range(start: number, end: number, step: number) {
  return Array.from({ length: Math.round((end - start) / step) + 1 }, (_, index) => start + index * step);
}

function sizeConfig(pieceType: PieceType) {
  if (pieceType === "Ring") return { label: "Ring size", values: range(3, 13, 0.5), suffix: " US" };
  if (pieceType === "Necklace" || pieceType === "Pendant")
    return { label: "Neck size / chain length", values: range(14, 24, 1), suffix: '"' };
  if (pieceType === "Bracelet")
    return { label: "Bracelet size / hand size", values: range(5, 9, 0.5), suffix: '"' };
  if (pieceType === "Chain") return { label: "Chain length", values: range(16, 30, 1), suffix: '"' };
  return null;
}

function categoryFor(pieceType: PieceType): ProductCategory {
  const categories: Record<PieceType, ProductCategory> = {
    Ring: "Rings",
    Necklace: "Necklaces",
    Bracelet: "Bracelets",
    Earrings: "Earrings",
    Pendant: "Pendants",
    Chain: "Necklaces",
  };
  return categories[pieceType];
}

function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
        active
          ? "border-rose/70 bg-rose/10 text-velvet shadow-[0_0_0_3px_rgba(168,124,54,0.12)]"
          : "border-rose/25 bg-pearl/55 text-ink/70 hover:border-rose/55 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function SectionHeading({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <div className="mb-6 flex gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-champagne/60 bg-rose text-xs text-champagne">
        {number}
      </span>
      <div>
        <h2 className="font-display text-3xl text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">{copy}</p>
      </div>
    </div>
  );
}

export function CustomDesignForm({ products }: { products: Product[] }) {
  const [pieceType, setPieceType] = useState<PieceType>("Ring");
  const [metal, setMetal] = useState("White Gold");
  const [shape, setShape] = useState<(typeof SHAPES)[number]>("Round");
  const [origin, setOrigin] = useState<"Lab-Grown" | "Natural">("Lab-Grown");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const suggestions = useMemo(() => {
    const category = categoryFor(pieceType);
    return products
      .filter((product) => product.category !== "Custom Jewelry")
      .map((product) => {
        const metadata = getProductDiamondMetadata(product);
        const shapeMatch =
          shape === "Piecut"
            ? metadata.piecut
            : shape === "Baguette"
              ? product.centerStone.toLowerCase().includes("baguette")
              : metadata.shape === shape;
        return {
          product,
          score: (product.category === category ? 4 : 0) + (shapeMatch ? 3 : 0) + (product.featured ? 1 : 0),
        };
      })
      .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
      .slice(0, 4)
      .map(({ product }) => product);
  }, [pieceType, products, shape]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="glass-panel mx-auto max-w-3xl px-6 py-14 text-center sm:px-10" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose text-champagne">
          <Check size={24} aria-hidden="true" />
        </span>
        <p className="eyebrow mt-6">Brief received</p>
        <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Your private design consultation starts here.</h2>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-ink/65">
          A Jewel Stone diamond consultant will review your selections and contact you to discuss stones, timing, and next steps.
        </p>
        <ActionButton className="mt-7" variant="secondary" onClick={() => setSubmitted(false)}>
          Submit another design
        </ActionButton>
      </section>
    );
  }

  const sizes = sizeConfig(pieceType);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6" aria-label="Custom jewelry design brief">
      <section className="glass-panel p-5 sm:p-8">
        <SectionHeading number="01" title="Choose your piece" copy="Set the foundation and the size we should design around." />
        <fieldset>
          <legend className="sr-only">Piece type</legend>
          <div className="flex flex-wrap gap-2">
            {PIECE_TYPES.map((type) => (
              <ChoiceChip key={type} active={pieceType === type} onClick={() => setPieceType(type)}>
                {type}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>
        {sizes ? (
          <label className="mt-6 grid max-w-sm gap-2 text-sm font-medium text-ink">
            {sizes.label}
            <select required name="size" defaultValue="" className={FIELD_CLASS} key={pieceType}>
              <option value="" disabled>Select a size</option>
              {sizes.values.map((value) => (
                <option key={value} value={value}>{value}{sizes.suffix}</option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <section className="glass-panel p-5 sm:p-8">
        <SectionHeading number="02" title="Metal and center stone" copy="Select the palette, profile, scale, and diamond origin." />
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-ink">Metal color</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {METALS.map((option) => (
              <button
                key={option.name}
                type="button"
                aria-pressed={metal === option.name}
                onClick={() => setMetal(option.name)}
                className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                  metal === option.name ? "border-rose/70 bg-rose/10 text-velvet" : "border-rose/25 bg-pearl/55 text-ink/70"
                }`}
              >
                <span className={`size-5 rounded-full border border-black/10 shadow-inner ${option.swatch}`} aria-hidden="true" />
                {option.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="mb-3 text-sm font-medium text-ink">Center stone shape</legend>
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((option) => (
              <ChoiceChip key={option} active={shape === option} onClick={() => setShape(option)}>
                {option}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Center stone carat
            <select required name="carat" defaultValue="1" className={FIELD_CLASS}>
              {range(0.5, 10, 0.5).map((value) => (
                <option key={value} value={value}>{value.toFixed(1)} CT</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Diamond origin</legend>
            <div className="flex flex-wrap gap-2">
              {(["Lab-Grown", "Natural"] as const).map((option) => (
                <ChoiceChip key={option} active={origin === option} onClick={() => setOrigin(option)}>
                  {option}
                </ChoiceChip>
              ))}
            </div>
          </fieldset>
        </div>
        <input type="hidden" name="pieceType" value={pieceType} />
        <input type="hidden" name="metal" value={metal} />
        <input type="hidden" name="shape" value={shape} />
        <input type="hidden" name="origin" value={origin} />
      </section>

      <section className="glass-panel p-5 sm:p-8">
        <SectionHeading number="03" title="Share your inspiration" copy="Upload a reference and compare it with related Jewel Stone pieces." />
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-rose/45 bg-pearl/45 px-5 py-6 text-center transition-colors hover:bg-pearl/70 focus-within:ring-2 focus-within:ring-rose/40">
          <ImagePlus className="text-rose" size={25} aria-hidden="true" />
          <span className="mt-2 text-sm font-medium text-ink">Upload a reference image</span>
          <span className="mt-1 text-xs text-ink/50">JPG, PNG, HEIC, or another image format</span>
          <input type="file" name="referenceImage" accept="image/*" onChange={handleImageChange} className="sr-only" />
        </label>

        {previewUrl ? (
          <div className="mt-7">
            <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-rose/20 bg-pearl p-2 shadow-case">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Uploaded design reference preview" className="aspect-square w-full rounded-xl object-cover" />
            </div>
            <h3 className="mt-10 font-display text-3xl text-ink">Suggested similar pieces</h3>
            <p className="mt-1 text-sm text-ink/55">Matched by your selected piece type and center-stone shape.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {suggestions.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-2xl border border-rose/15 bg-pearl/65">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="p-4">
                    <h4 className="font-display text-xl leading-tight text-ink">{product.name}</h4>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/55">{product.description}</p>
                    <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-velvet/65">
                      {product.material} · {product.carats} CT
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="glass-panel p-5 sm:p-8">
        <SectionHeading number="04" title="Personalize the finish" copy="Choose any upgrades you want the atelier to consider." />
        <fieldset>
          <legend className="sr-only">Upgrade options</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {UPGRADES.map((upgrade) => (
              <label key={upgrade.name} className="flex cursor-pointer gap-3 rounded-2xl border border-rose/18 bg-pearl/50 p-4 hover:border-rose/40">
                <input type="checkbox" name="upgrades" value={upgrade.name} className="mt-1 size-4 accent-rose" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{upgrade.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink/55">{upgrade.note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="glass-panel p-5 sm:p-8">
        <SectionHeading number="05" title="Your contact details" copy="Tell us how to reach you and anything else the designer should know." />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Name
            <input required name="name" autoComplete="name" className={FIELD_CLASS} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Phone
            <input required name="phone" type="tel" autoComplete="tel" className={FIELD_CLASS} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Email
            <input required name="email" type="email" autoComplete="email" className={FIELD_CLASS} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Preferred contact method
            <select name="contactMethod" className={FIELD_CLASS}>
              <option>Phone</option>
              <option>Email</option>
              <option>Text</option>
              <option>WhatsApp</option>
            </select>
          </label>
        </div>
        <label className="mt-5 grid gap-2 text-sm font-medium text-ink">
          Notes for the designer
          <textarea
            name="notes"
            rows={5}
            className={`${FIELD_CLASS} py-3`}
            placeholder="Share your occasion, timing, budget, inherited stones, or details we should preserve."
          />
        </label>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <ActionButton type="submit">Submit design brief</ActionButton>
          <p className="max-w-md text-xs leading-5 text-ink/50">Submitting this brief does not place an order. We will confirm scope and pricing with you first.</p>
        </div>
      </section>
    </form>
  );
}
