"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import styles from "./cart.module.css";

export function CartDrawer() {
  const { items, open, closeCart, remove, setQty } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;


  return (
    <>
      <div
        className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`}
        onClick={closeCart}
        aria-hidden={!open}
      />
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-label="Shopping bag"
        aria-hidden={!open}
      >
        <header className={styles.head}>
          <h2>Your Bag</h2>
          <button onClick={closeCart} aria-label="Close bag" className={styles.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your bag is empty.</p>
            <span>Signature pieces and made-to-order designs, selected your way.</span>
            <Link href="/collections" onClick={closeCart} className={styles.emptyBtn}>
              Browse the collection
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((i) => (
                <div key={`${i.slug}-${i.metal}-${i.size ?? ""}`} className={styles.item}>
                  <Link href={`/products/${i.slug}`} onClick={closeCart} className={styles.itemImg}>
                    <Image src={i.image} alt={i.name} fill sizes="88px" />
                  </Link>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTop}>
                      <Link href={`/products/${i.slug}`} onClick={closeCart} className={styles.itemName}>
                        {i.name}
                      </Link>
                      <button
                        onClick={() => remove(i)}
                        aria-label={`Remove ${i.name}`}
                        className={styles.itemRemove}
                      >
                        Remove
                      </button>
                    </div>
                    <p className={styles.itemMeta}>
                      {i.metal}
                      {i.size ? ` · Size ${i.size}` : ""}
                    </p>
                    <div className={styles.itemBottom}>
                      <div className={styles.qty}>
                        <button onClick={() => setQty(i, i.qty - 1)} aria-label="Decrease quantity">−</button>
                        <span>{i.qty}</span>
                        <button onClick={() => setQty(i, i.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className={styles.foot}>
              <p className={styles.footNote}>Pricing confirmed at checkout · insured FedEx</p>
              <Link href="/checkout" onClick={closeCart} className={styles.checkout}>
                Secure checkout
              </Link>
              <Link href="/collections" onClick={closeCart} className={styles.keep}>
                Continue browsing
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
