"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { ButtonLink } from "@/components/Buttons";
import { useInquiryStore } from "@/store/inquiry";

export function InquiryCart() {
  const items = useInquiryStore((state) => state.items);
  const removeItem = useInquiryStore((state) => state.removeItem);
  const clear = useInquiryStore((state) => state.clear);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-4xl">Selected Pieces</h2>
          {items.length > 0 ? (
            <button type="button" onClick={clear} className="text-sm text-velvet underline underline-offset-4">
              Clear all
            </button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <div className="mt-8 border border-dashed border-rose/30 bg-pearl/40 p-8">
            <p className="text-sm leading-7 text-ink/68">Your inquiry list is empty. Add jewelry or diamond options to send a focused request.</p>
            <ButtonLink href="/collections" className="mt-6">Browse collections</ButtonLink>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map((item) => (
              <article key={item.id} className="grid grid-cols-[84px_1fr_auto] gap-4 border border-rose/15 bg-pearl/50 p-3">
                <Image src={item.image} alt={item.name} width={96} height={96} className="aspect-square bg-marble object-contain p-2" />
                <div>
                  <Link href={`/products/${item.slug}`} className="font-display text-2xl hover:text-velvet">{item.name}</Link>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rose">{item.category}</p>
                  <p className="mt-2 text-sm text-ink/62">{item.priceLabel}</p>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} className="grid size-10 place-items-center rounded-full border border-rose/25" aria-label={`Remove ${item.name}`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="glass-panel p-5 md:p-7">
        <p className="eyebrow">Inquiry details</p>
        <h2 className="mt-3 font-display text-4xl">Request availability and consultation.</h2>
        <p className="mt-4 text-sm leading-7 text-ink/66">
          This form is prepared for backend or email integration. For now it confirms the inquiry locally and preserves selected pieces.
        </p>
        <div className="mt-7">
          <ContactForm selectedProducts={items.map((item) => `${item.name} (${item.id})`)} />
        </div>
      </section>
    </div>
  );
}
