"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import type { Selection } from "@/lib/commerce/variants";
import styles from "@/components/pages/enquiry.module.css";

function originLabel(product: Product) {
  if (product.diamondWorld === "natural-piecut") return "Natural PIECUT";
  if (product.diamondWorld === "natural") return "Natural";
  if (product.diamondWorld === "lab-grown") return "Lab-grown";
  return product.source === "signature" ? "Natural PIECUT" : "Lab-grown";
}

/**
 * Shown when a shopper configures a piece beyond its listed Excel spec. Sends the
 * exact custom specification into the existing custom-request pipeline (Redis +
 * owner email + tracking page), so the owner can price it and the customer can
 * later accept & pay the quotation.
 */
export function QuoteRequestForm({
  product,
  selection,
  sizeLabel,
}: {
  product: Product;
  selection: Selection;
  sizeLabel?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [statusUrl, setStatusUrl] = useState("");

  const specLines = [
    `Piece: ${product.name} (SKU ${product.sku})`,
    `Requested carat: ${selection.carat} ct`,
    `Requested shape: ${selection.shape}`,
    `Requested setting: ${selection.setting}`,
    `Requested metal: ${selection.metal}`,
    selection.clarity ? `Requested colour/clarity: ${selection.color} / ${selection.clarity}` : `Requested colour: ${selection.color}`,
    sizeLabel ? `Size / length: ${sizeLabel}` : "",
    "",
    `Listed as: ${product.material} · ${product.colorClarity} · ${product.carats} ct · ${product.priceLabel}`,
  ].filter(Boolean);

  if (status === "sent") {
    return (
      <div className={styles.sent}>
        <div className={styles.check}>✓</div>
        <h3>Quotation requested.</h3>
        <p>Ishan will price your custom {product.name.toLowerCase()} and email you, usually the same day.</p>
        {statusUrl ? <p style={{ marginTop: ".6rem" }}><a href={statusUrl}>Track your request →</a></p> : null}
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      style={{ marginTop: "1.2rem" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        setError("");
        const f = new FormData(e.currentTarget);
        const body = new FormData();
        body.set("name", String(f.get("name") ?? ""));
        body.set("email", String(f.get("email") ?? ""));
        body.set("phone", String(f.get("phone") ?? ""));
        body.set("company", String(f.get("company") ?? "")); // honeypot
        body.set("type", product.category);
        body.set("metal", selection.metal);
        body.set("shape", selection.shape);
        body.set("origin", originLabel(product));
        body.set("budget", "Quotation requested");
        body.set("notes", [`Custom quotation for a listed piece.`, "", ...specLines, "", String(f.get("message") ?? "")].join("\n").trim());
        if (typeof window !== "undefined") body.set("referenceUrl", `${window.location.origin}/products/${product.slug}`);
        const res = await fetch("/api/custom-requests", { method: "POST", body });
        const result = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatusUrl(result.statusUrl ? `${window.location.origin}${result.statusUrl}` : "");
          setStatus("sent");
        } else {
          setError(result.error || "Could not send the request. Please try again or call us.");
          setStatus("error");
        }
      }}
    >
      <p className={styles.note} style={{ marginTop: 0 }}>◆ Custom: {selection.carat} ct · {selection.shape} · {selection.setting} · {selection.metal}{selection.clarity ? ` · ${selection.color}/${selection.clarity}` : ""}</p>
      <label className={styles.honeypot} htmlFor="quote-company" aria-hidden="true">Company<input id="quote-company" name="company" tabIndex={-1} autoComplete="off" /></label>
      <div className={styles.row}>
        <label htmlFor="quote-name">Name<input id="quote-name" required name="name" autoComplete="name" /></label>
        <label htmlFor="quote-email">Email<input id="quote-email" required name="email" type="email" autoComplete="email" /></label>
      </div>
      <label htmlFor="quote-phone">Phone <span>(optional)</span><input id="quote-phone" name="phone" type="tel" autoComplete="tel" /></label>
      <label htmlFor="quote-message">Anything to add? <span>(optional)</span><textarea id="quote-message" name="message" rows={3} placeholder="Occasion, timeline, budget range…" /></label>
      <button type="submit" className={styles.submit} disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Request quotation"}</button>
      {status === "error" ? <p className={styles.error} role="alert" aria-live="assertive">{error}</p> : null}
    </form>
  );
}
