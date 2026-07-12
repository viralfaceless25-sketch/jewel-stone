"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { hasModel } from "@/lib/models";
import styles from "./collections.module.css";

export function CollectionGallery({ items }: { items: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [items]);
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? items : items.filter((p) => p.category === active);

  return (
    <div className={styles.galleryWrap}>
      <div className={styles.filters}>
        <div className={styles.chips}>
          {categories.map((c) => (
            <button
              key={c}
              className={`${styles.chip} ${active === c ? styles.chipActive : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
              <span>
                {c === "All" ? items.length : items.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <p className={styles.count}>
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} · in hand
        </p>
      </div>

      <div className={styles.grid}>
        {filtered.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className={styles.tile}>
            <div className={styles.tileFrame}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                className={styles.tileImg}
              />
              {hasModel(p.slug) ? <span className={styles.badge}>3D · AR</span> : null}
              <span className={styles.view}>View piece →</span>
            </div>
            <div className={styles.meta}>
              <div>
                <h3>{p.name}</h3>
                <p>{p.material} · {p.carats} ct</p>
              </div>
              <strong>{p.priceLabel}</strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
