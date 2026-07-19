"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { cartTotal, useCartStore } from "@/store/cart";
import styles from "./checkout.module.css";

type CheckoutClientProps = {
  paymentsEnabled: boolean;
};

export function CheckoutClient({ paymentsEnabled }: CheckoutClientProps) {
  const { items, clear } = useCartStore();
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [forceReservation, setForceReservation] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const total = cartTotal(items);
  // Persisted carts created before product-source tracking are treated safely as
  // reservations. Only known made-to-order products may enter instant checkout.
  const needsInventoryReview = items.some((item) => item.source !== "lab-grown");
  const canPayNow = paymentsEnabled && !needsInventoryReview && !forceReservation;

  async function beginPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await response.json();

      if (response.ok && data?.enabled && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (response.ok && data?.reservationRequired) {
        setForceReservation(true);
        setNotice("Online payment is unavailable for this bag. Send the reservation request below and our team will confirm availability.");
        return;
      }
      throw new Error("Secure payment could not be started. Please try again.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Secure payment is temporarily unavailable.");
    } finally {
      setSending(false);
    }
  }

  async function sendReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    setSending(true);
    setError("");

    const order = items.map((item) => [
      `${item.qty} × ${item.name}`,
      item.metal,
      item.size,
      item.grade,
      `$${(item.price * item.qty).toLocaleString("en-US")}`,
    ].filter(Boolean).join(" · ")).join("\n");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.get("firstName") ?? ""} ${formData.get("lastName") ?? ""}`.trim(),
          email,
          phone: String(formData.get("phone") ?? ""),
          context: "Bag reservation",
          message: [
            "Reservation request",
            order,
            `Total: $${total.toLocaleString("en-US")}`,
            "",
            `Ship to: ${formData.get("address")}, ${formData.get("city")}, ${formData.get("state")} ${formData.get("postalCode")}`,
            `Notes: ${formData.get("notes") || "—"}`,
          ].join("\n"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Reservation could not be delivered.");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reservation is temporarily unavailable.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className={styles.confirm}>
        <div className={styles.check}>✓</div>
        <h1>Request received.</h1>
        <p>
          Thank you. We personally confirm availability and send a secure payment
          link within 24 hours — often the same day. Watch your inbox.
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
        <p>Add a signature piece or made-to-order design to begin your reservation.</p>
        <Link href="/collections" className={styles.primary}>Browse the collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {canPayNow ? (
        <form className={styles.form} onSubmit={beginPayment}>
          <h1 className={styles.title}>Secure payment</h1>
          <p className={styles.lede}>
            Continue to Stripe to enter your contact, billing, card, and shipping
            details. Jewel Stone never receives or stores your card number.
          </p>
          <div className={styles.paymentNote}>
            <strong>Hosted by Stripe</strong>
            <span>Encrypted payment · address collection · receipt confirmation</span>
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? "Opening Stripe…" : `Continue to secure payment · $${total.toLocaleString("en-US")}`}
          </button>
          <p className={styles.secure}>◆ SSL secured · GIA/IGI certified · fully insured shipping</p>
        </form>
      ) : (
        <form className={styles.form} onSubmit={sendReservation}>
          <h1 className={styles.title}>Reserve your piece</h1>
          <p className={styles.lede}>
            {needsInventoryReview
              ? "One-of-one pieces receive a personal availability check before payment. No card details are entered here."
              : "Send your details and we will issue a secure payment link after confirming the order."}
          </p>
          {notice ? <p className={styles.notice} role="status">{notice}</p> : null}

          <fieldset className={styles.field}>
            <legend>Contact</legend>
            <div className={styles.row}>
              <label>First name<input required name="firstName" autoComplete="given-name" /></label>
              <label>Last name<input required name="lastName" autoComplete="family-name" /></label>
            </div>
            <label>Email<input required name="email" type="email" autoComplete="email" /></label>
            <label>Phone<input required name="phone" type="tel" autoComplete="tel" /></label>
          </fieldset>

          <fieldset className={styles.field}>
            <legend>Shipping (insured FedEx)</legend>
            <label>Address<input required name="address" autoComplete="address-line1" /></label>
            <div className={styles.row}>
              <label>City<input required name="city" autoComplete="address-level2" /></label>
              <label>State<input required name="state" autoComplete="address-level1" /></label>
              <label>ZIP<input required name="postalCode" autoComplete="postal-code" /></label>
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend>Notes (optional)</legend>
            <label>Sizing, engraving, or timing requests<textarea name="notes" rows={3} /></label>
          </fieldset>

          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? "Sending securely…" : `Reserve & request payment link · $${total.toLocaleString("en-US")}`}
          </button>
          <p className={styles.secure}>◆ SSL secured · GIA/IGI certified · fully insured shipping</p>
        </form>
      )}

      <aside className={styles.summary}>
        <h2>Your order</h2>
        <div className={styles.lines}>
          {items.map((item) => (
            <div key={`${item.slug}-${item.metal}-${item.size ?? ""}-${item.grade ?? ""}`} className={styles.line}>
              <div className={styles.lineImg}>
                <Image src={item.image} alt={item.name} fill sizes="72px" />
                <span>{item.qty}</span>
              </div>
              <div className={styles.lineBody}>
                <strong>{item.name}</strong>
                <span>{item.metal}{item.size ? ` · ${item.size}` : ""}</span>
              </div>
              <em>${(item.price * item.qty).toLocaleString("en-US")}</em>
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
