"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export function CheckoutSuccessReset() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
