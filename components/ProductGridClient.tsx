"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductQuickView } from "@/components/ProductQuickView";

export function ProductGridClient({ products }: { products: Product[] }) {
  const [quickView, setQuickView] = useState<Product | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
        ))}
      </div>
      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
