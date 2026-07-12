"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useInquiryStore } from "@/store/inquiry";
import { useWishlistStore } from "@/store/wishlist";
import { products } from "@/data/products";

export function WishlistClient() {
  const wishlistIds = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addItem = useInquiryStore((state) => state.addItem);

  const wishlistProducts = products.filter((product) => wishlistIds.includes(product.id));
  const missingCount = wishlistIds.length - wishlistProducts.length;

  function addAllToInquiry() {
    wishlistProducts.forEach((product) => addItem(product));
  }

  if (wishlistProducts.length === 0) {
    return (
      <section className="luxury-shell py-16">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-rose/14 bg-pearl/50 px-6 py-14 text-center shadow-[0_20px_70px_rgba(12,14,16,0.08)] sm:px-10">
          <div className="mx-auto grid size-14 place-items-center rounded-full border border-rose/18 bg-rose/6 text-rose">
            <Heart size={22} aria-hidden="true" />
          </div>
          <h1 className="display-title mt-6 text-[clamp(2.4rem,6vw,4.5rem)] text-ink">
            Your wishlist is waiting.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/70">
            Save diamond studs, tennis bracelets, rings, necklaces, and custom inspiration here
            before sending your inquiry.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/collections"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose px-7 text-sm font-medium text-ink transition-colors hover:bg-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Browse Collections
            </Link>
            <Link
              href="/diamonds"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-rose/30 bg-pearl/60 px-7 text-sm font-medium text-ink/75 transition-colors hover:border-rose/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
            >
              Search Diamonds
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="luxury-shell py-16">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Saved pieces</p>
          <h1 className="display-title mt-3 text-[clamp(2.8rem,7vw,6rem)] text-ink">
            Your wishlist.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink/70">
            Review your shortlist, move favorites into an inquiry, or clear the list when your
            consultation direction changes.
          </p>
          {missingCount > 0 ? (
            <p className="mt-2 text-xs text-rose">
              {missingCount} saved item is no longer available in the current catalog.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={addAllToInquiry}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose px-6 text-sm font-medium text-ink transition-colors hover:bg-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <ShoppingBag size={15} aria-hidden="true" />
            Add all to inquiry
          </button>
          <button
            type="button"
            onClick={clearWishlist}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose/25 bg-pearl/55 px-6 text-sm font-medium text-ink/65 transition-colors hover:border-rose/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
          >
            <Trash2 size={15} aria-hidden="true" />
            Clear wishlist
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
