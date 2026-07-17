"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  priceLabel: string;
  image: string;
  metal: string;
  size?: string;
  /** Chosen colour/clarity, e.g. "F/VS1" — part of the variant identity. */
  grade?: string;
  qty: number;
};

function keyOf(i: Pick<CartItem, "slug" | "metal" | "size" | "grade">) {
  return `${i.slug}__${i.metal}__${i.size ?? ""}__${i.grade ?? ""}`;
}

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (item: Pick<CartItem, "slug" | "metal" | "size" | "grade">) => void;
  setQty: (item: Pick<CartItem, "slug" | "metal" | "size" | "grade">, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item, qty = 1) =>
        set((state) => {
          const k = keyOf(item);
          const existing = state.items.find((i) => keyOf(i) === k);
          const items = existing
            ? state.items.map((i) => (keyOf(i) === k ? { ...i, qty: i.qty + qty } : i))
            : [...state.items, { ...item, qty }];
          return { items, open: true };
        }),
      remove: (item) =>
        set((state) => ({ items: state.items.filter((i) => keyOf(i) !== keyOf(item)) })),
      setQty: (item, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (keyOf(i) === keyOf(item) ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      toggleCart: () => set((s) => ({ open: !s.open })),
    }),
    {
      name: "jewel-stone-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.qty, 0);
