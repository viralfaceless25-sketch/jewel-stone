"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cart";
import styles from "./cart.module.css";

export function CartDrawer() {
  const { items, open, closeCart, remove, setQty } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const priorFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    priorFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      priorFocus.current?.focus();
    };
  }, [closeCart, open]);

  if (!mounted || !open) return null;

  return (
    <>
      <div
        className={`${styles.scrim} ${styles.scrimOpen}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${styles.drawerOpen}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shopping-bag-title"
      >
        <div className={styles.head}>
          <h2 id="shopping-bag-title">Your Bag</h2>
          <button ref={closeRef} onClick={closeCart} aria-label="Close bag" className={styles.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

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
                        <button
                          onClick={() => setQty(i, i.qty + 1)}
                          aria-label="Increase quantity"
                          disabled={i.source === "signature" && i.qty >= 1}
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.foot}>
              <p className={styles.footNote}>Pricing confirmed at checkout · insured FedEx</p>
              <Link href="/checkout" onClick={closeCart} className={styles.checkout}>
                Secure checkout
              </Link>
              <Link href="/collections" onClick={closeCart} className={styles.keep}>
                Continue browsing
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
