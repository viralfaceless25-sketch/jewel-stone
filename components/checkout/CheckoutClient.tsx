"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { cartTotal, useCartStore } from "@/store/cart";
import { checkoutMode } from "@/lib/commerce/checkout-policy";
import styles from "./checkout.module.css";

type CheckoutClientProps = {
  paymentsEnabled: boolean;
  /** Mirrors STRIPE_ALLOW_SIGNATURE_CHECKOUT so the button matches what the API will do. */
  allowSignatureCheckout?: boolean;
};

export function CheckoutClient({ paymentsEnabled, allowSignatureCheckout = false }: CheckoutClientProps) {
  const { items, clear } = useCartStore();
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [forceReservation, setForceReservation] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const total = cartTotal(items);
  // Promotion code — validated on the server, then re-checked at payment time.
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; amountOff: number; label: string } | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const discount = promo ? promo.amountOff / 100 : 0;
  const payable = Math.max(0, total - discount);

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    const email = checkoutEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setPromoError("Enter your e-mail before applying a promotion code.");
      return;
    }
    setPromoBusy(true);
    setPromoError("");
    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          email,
          items: items.map((item) => ({ slug: item.slug, qty: item.qty })),
        }),
      });
      const result = await response.json();
      if (!result.ok) {
        setPromo(null);
        setPromoError(result.reason || "That code can't be used.");
        return;
      }
      setPromo({ code: result.code, amountOff: result.amountOff, label: result.label });
      setPromoInput("");
    } catch {
      setPromoError("Could not check that code. Try again.");
    } finally {
      setPromoBusy(false);
    }
  }
  // Persisted carts created before product-source tracking are treated safely as
  // reservations. Only known made-to-order products may enter instant checkout.
  // Same rule the checkout API applies, so the button never promises something
  // the server will refuse (or hide payment the server would have allowed).
  const needsInventoryReview =
    checkoutMode(
      items.map((item) => item.source ?? "lab-grown"),
      allowSignatureCheckout,
    ) === "reservation";
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
        body: JSON.stringify({
          items,
          email: checkoutEmail.trim().toLowerCase(),
          ...(promo ? { promoCode: promo.code } : {}),
        }),
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
            ...(promo ? [`Promotion code: ${promo.code} (${promo.label}) -$${discount.toLocaleString("en-US")}`] : []),
            `Total: $${payable.toLocaleString("en-US")}`,
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
          <label>
            E-mail
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              value={checkoutEmail}
              onChange={(event) => setCheckoutEmail(event.target.value)}
            />
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? "Opening Stripe…" : `Continue to secure payment · $${payable.toLocaleString("en-US")}`}
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
            <label>
              Email
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                value={checkoutEmail}
                onChange={(event) => setCheckoutEmail(event.target.value)}
              />
            </label>
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
            {sending ? "Sending securely…" : `Reserve & request payment link · $${payable.toLocaleString("en-US")}`}
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
        <div className={styles.promoRow}>
          {promo ? (
            <div className={styles.promoApplied}>
              <span><strong>{promo.code}</strong> · {promo.label}</span>
              <button type="button" onClick={() => { setPromo(null); setPromoError(""); }}>Remove</button>
            </div>
          ) : (
            <>
              <label className={styles.srOnlyLabel} htmlFor="promo-code">Promotion code</label>
              <div className={styles.promoInputRow}>
                <input
                  id="promo-code"
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void applyPromo(); } }}
                  placeholder="Promotion code"
                  autoComplete="off"
                />
                <button type="button" onClick={() => void applyPromo()} disabled={promoBusy || !promoInput.trim()}>
                  {promoBusy ? "Checking…" : "Apply"}
                </button>
              </div>
            </>
          )}
          {promoError ? <p className={styles.promoError}>{promoError}</p> : null}
        </div>
        <dl className={styles.totals}>
          <div><dt>Subtotal</dt><dd>${total.toLocaleString("en-US")}</dd></div>
          {promo ? <div><dt>Discount</dt><dd>−${discount.toLocaleString("en-US")}</dd></div> : null}
          <div><dt>Shipping</dt><dd>Insured · complimentary</dd></div>
          <div className={styles.grand}><dt>Total</dt><dd>${payable.toLocaleString("en-US")}</dd></div>
        </dl>
        <Link href="/collections" className={styles.keep}>Continue browsing</Link>
      </aside>
    </div>
  );
}
