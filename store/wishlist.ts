"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistItemInput = string | ({ id: string } & Record<string, unknown>);

type WishlistState = {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  toggle: (item: WishlistItemInput) => void;
  has: (item: WishlistItemInput) => boolean;
  clearWishlist: () => void;
};

const getWishlistItemId = (item: WishlistItemInput) => (typeof item === "string" ? item : item.id);

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (id) =>
        set((state) => {
          if (state.items.includes(id)) {
            return state;
          }

          return { items: [...state.items, id] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((itemId) => itemId !== id)
        })),
      toggleItem: (id) => {
        if (get().hasItem(id)) {
          get().removeItem(id);
          return;
        }

        get().addItem(id);
      },
      hasItem: (id) => get().items.includes(id),
      toggle: (item) => get().toggleItem(getWishlistItemId(item)),
      has: (item) => get().hasItem(getWishlistItemId(item)),
      clearWishlist: () => set({ items: [] })
    }),
    { name: "jewel-wishlist" }
  )
);
