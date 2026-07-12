"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type InquiryItem = Pick<Product, "id" | "name" | "slug" | "category" | "priceLabel" | "image">;

type InquiryState = {
  items: InquiryItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  hasItem: (id: string) => boolean;
};

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }
          const { id, name, slug, category, priceLabel, image } = product;
          return { items: [...state.items, { id, name, slug, category, priceLabel, image }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
      hasItem: (id) => get().items.some((item) => item.id === id)
    }),
    { name: "jewel-stone-inquiry" }
  )
);
