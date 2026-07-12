"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cartTotal, useCartStore } from "@/store/cart";
import styles from "./checkout.module.css";

export function CheckoutClient() {
  const { items, clear } = useCartStore();
  const [done, setDone] = useState(false);
  const total = cartTotal(items);

  if (done) {
    return (
      <div className={styles.confirm}>
        <div className={styles.check}>✓</div>
        <h1>Request received.</h1>
        <p>
          Thank you. Because every Jewel Stone piece is one of one, we personally
          confirm availability and send a secure payment link within 24 hours —
          often the same day. Watch your inbox.
        </p>
        <Link href="/collections" className={styles.primary} onClick={() => clear()}>
          Back to the collection
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Your bag is empty.</h1>
        <p>Add a one-of-a-kind piece to begin your reservation.</p>
        <Link href="/collections" className={styles.primary}>Browse the collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
          try {
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items, email }),
            });
            const data = await res.json();
            if (data?.enabled && data.url) {
              window.location.href = data.url; // → Stripe Checkout
              return;
            }
          } catch {
            /* fall through to reservation flow */
          }
          setDone(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <h1 className={styles.title}>Secure checkout</h1>
        <p className={styles.lede}>
          Reserve your piece. We confirm availability and send an encrypted payment
          link — no card details are entered here.
        </p>

        <fieldset className={styles.field}>
          <legend>Contact</legend>
          <div className={styles.row}>
            <label>First name<input required autoComplete="given-name" /></label>
            <label>Last name<input required autoComplete="family-name" /></label>
          </div>
          <label>Email<input required name="email" type="email" autoComplete="email" /></label>
          <label>Phone<input required type="tel" autoComplete="tel" /></label>
        </fieldset>

        <fieldset className={styles.field}>
          <legend>Shipping (insured FedEx)</legend>
          <label>Address<input required autoComplete="address-line1" /></label>
          <div className={styles.row}>
            <label>City<input required autoComplete="address-level2" /></label>
            <label>State<input required autoComplete="address-level1" /></label>
            <label>ZIP<input required autoComplete="postal-code" /></label>
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend>Notes (optional)</legend>
          <label>Sizing, engraving, or timing requests<textarea rows={3} /></label>
        </fieldset>

        <button type="submit" className={styles.submit}>
          Reserve &amp; request payment link · ${total.toLocaleString("en-US")}
        </button>
        <p className={styles.secure}>◆ SSL secured · GIA/IGI certified · fully insured shipping</p>
      </form>

      <aside className={styles.summary}>
        <h2>Your order</h2>
        <div className={styles.lines}>
          {items.map((i) => (
            <div key={`${i.slug}-${i.metal}-${i.size ?? ""}`} className={styles.line}>
              <div className={styles.lineImg}>
                <Image src={i.image} alt={i.name} fill sizes="72px" />
                <span>{i.qty}</span>
              </div>
              <div className={styles.lineBody}>
                <strong>{i.name}</strong>
                <span>{i.metal}{i.size ? ` · ${i.size}` : ""}</span>
              </div>
              <em>${(i.price * i.qty).toLocaleString("en-US")}</em>
            </div>
          ))}
        </div>
        <dl className={styles.totals}>
          <div><dt>Subtotal</dt><dd>${total.toLocaleString("en-US")}</dd></div>
          <div><dt>Shipping</dt><dd>Insured · complimentary</dd></div>
          <div className={styles.grand}><dt>Total</dt><dd>${total.toLocaleString("en-US")}</dd></div>
        </dl>
        <Link href="/collections" className={styles.keep}>Continue browsing</Link>
      </aside>
    </div>
  );
}
