"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { hasModel } from "@/lib/models";
import { useWishlistStore } from "@/store/wishlist";
import styles from "./wishlist.module.css";

export function WishlistView() {
  const { items, removeItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = mounted ? products.filter((p) => items.includes(p.id)) : [];

  if (mounted && saved.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Nothing saved yet.</h2>
        <p>Tap the heart on any piece to keep it here while you decide.</p>
        <Link href="/collections" className={styles.primary}>Browse the collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {saved.map((p) => (
        <div key={p.id} className={styles.card}>
          <Link href={`/products/${p.slug}`} className={styles.frame}>
            <Image src={p.image} alt={p.name} fill sizes="(max-width:640px) 92vw, 30vw" className={styles.img} />
            {hasModel(p.slug) ? <span className={styles.badge}>3D · AR</span> : null}
          </Link>
          <div className={styles.meta}>
            <div>
              <Link href={`/products/${p.slug}`} className={styles.name}>{p.name}</Link>
              <p>{p.material} · {p.carats} ct</p>
            </div>
            <strong>{p.priceLabel}</strong>
          </div>
          <button className={styles.remove} onClick={() => removeItem(p.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
