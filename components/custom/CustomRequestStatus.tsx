"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STATUS_LABELS, canCustomerDecide, type CustomerCustomRequest } from "@/lib/custom-request-types";
import styles from "./request-status.module.css";

const CHOICE_LABELS = [
  ["type", "Piece"],
  ["metal", "Metal"],
  ["shape", "Stone"],
  ["origin", "Origin"],
  ["budget", "Budget"],
] as const;

const STAGES = ["Request", "Quotation", "Production", "Shipping"];

function stageIndex(status: CustomerCustomRequest["status"]) {
  if (status === "shipped") return 3;
  if (["accepted", "in_production"].includes(status)) return 2;
  if (["quoted", "declined"].includes(status)) return 1;
  return 0;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function CustomRequestStatus({ token }: { token: string }) {
  const [customRequest, setCustomRequest] = useState<CustomerCustomRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionState, setDecisionState] = useState<"idle" | "saving">("idle");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`/api/custom-requests/${token}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Request could not be loaded.");
      setCustomRequest(result.request);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Request could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [load]);

  const decide = async (formElement: HTMLFormElement, action: "accept" | "decline") => {
    setDecisionState("saving");
    setError("");
    setNotice("");
    const form = new FormData(formElement);
    try {
      const response = await fetch(`/api/custom-requests/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: String(form.get("decisionNote") ?? "") }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Decision could not be saved.");
      if (action === "accept" && result.paymentUrl) {
        window.location.href = result.paymentUrl as string; // → Stripe checkout
        return;
      }
      setCustomRequest(result.request);
      setNotice(result.notified
        ? `Quotation ${action === "accept" ? "accepted" : "declined"}. Confirmation sent.`
        : `Quotation ${action === "accept" ? "accepted" : "declined"}. Owner notification is queued once email delivery is connected.`);
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Decision could not be saved.");
    } finally {
      setDecisionState("idle");
    }
  };

  if (loading) return <section className={styles.stateCard}><span className={styles.loader} aria-hidden /><h1>Loading private request…</h1></section>;
  if (!customRequest) return <section className={styles.stateCard}><h1>Request unavailable.</h1><p>{error || "Check the private link in your confirmation email."}</p><Link href="/custom">Start a new request</Link></section>;

  const activeStage = stageIndex(customRequest.status);
  const quoted = Boolean(customRequest.quote);
  const amountCents = customRequest.quote?.amountCents;
  const payable = Boolean(amountCents);
  const amountLabel = amountCents ? `$${(amountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "";
  const paid = Boolean(customRequest.paidAt) || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("paid") === "1");

  return (
    <div className={styles.portal}>
      <header className={styles.portalHead}>
        <div>
          <p className={styles.eyebrow}>Private commission · {customRequest.id}</p>
          <h1>Your custom piece.</h1>
          <p>Submitted {dateLabel(customRequest.createdAt)} · updates sent to {customRequest.notificationEmail}</p>
        </div>
        <span className={`${styles.statusPill} ${styles[`status_${customRequest.status}`]}`}>{STATUS_LABELS[customRequest.status]}</span>
      </header>

      <ol className={styles.timeline} aria-label="Request progress">
        {STAGES.map((label, index) => (
          <li key={label} className={`${index < activeStage ? styles.stageDone : ""} ${index === activeStage ? styles.stageActive : ""}`}>
            <span>{index < activeStage ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      {customRequest.status === "awaiting_quote" ? (
        <section className={styles.waitingCard}>
          <span className={styles.pulse} aria-hidden />
          <div><p>Owner review in progress</p><h2>Estimated quotation is being prepared.</h2><small>Your reference, materials, stone choice, and budget are reviewed before pricing. This page refreshes automatically.</small></div>
        </section>
      ) : null}

      {quoted && customRequest.quote ? (
        <section className={styles.quoteCard} aria-labelledby="quote-title">
          <div className={styles.quoteIntro}>
            <p>Owner&apos;s estimated quotation</p>
            <h2 id="quote-title">{customRequest.quote.estimate}</h2>
            <span>Estimated production · {customRequest.quote.leadTime}</span>
            {payable ? <span><strong>Amount due on acceptance · {amountLabel}</strong></span> : null}
          </div>
          <div className={styles.quoteMessage}>
            <p>{customRequest.quote.message || "Final specifications will be confirmed with you before production."}</p>
            {customRequest.quote.validUntil ? <small>Estimate valid through {dateLabel(customRequest.quote.validUntil)}</small> : null}
          </div>
        </section>
      ) : null}

      {canCustomerDecide(customRequest.status) ? (
        <form className={styles.decisionCard} onSubmit={(event) => { event.preventDefault(); void decide(event.currentTarget, "accept"); }}>
          <div><p>Your decision</p><h2>Ready to move forward?</h2><span>{payable ? `Accepting takes you to secure Stripe checkout to pay ${amountLabel}. Your card is charged only there.` : "Accepting confirms the quotation, not a card charge. The owner contacts you before production."}</span></div>
          <label htmlFor="decision-note">Note for owner <span>(optional)</span><textarea id="decision-note" name="decisionNote" rows={3} placeholder="Sizing, deadline, or a requested adjustment…" /></label>
          <div className={styles.decisionButtons}>
            <button type="submit" disabled={decisionState === "saving"}>{decisionState === "saving" ? "Working…" : payable ? `Accept & pay ${amountLabel}` : "Accept quotation"}</button>
            <button type="button" disabled={decisionState === "saving"} onClick={(event) => {
              if (event.currentTarget.form) void decide(event.currentTarget.form, "decline");
            }}>Decline / request revision</button>
          </div>
        </form>
      ) : null}

      {paid ? <section className={styles.noticeCard}><strong>Payment received ✓</strong><span>Thank you — your custom piece is confirmed and enters production. Ishan will be in touch with final details.</span></section> : null}
      {customRequest.status === "accepted" && !paid ? <section className={styles.noticeCard}><strong>Quotation accepted.</strong><span>Owner has your confirmation and will finalize details before marking piece in production.</span></section> : null}
      {customRequest.status === "declined" ? <section className={styles.noticeCard}><strong>Quotation declined.</strong><span>Owner received your response and may post a revised estimate here.</span></section> : null}
      {customRequest.status === "in_production" ? <section className={styles.noticeCard}><strong>At the bench.</strong><span>Your piece is being made. Shipping details appear here after final inspection.</span></section> : null}
      {customRequest.status === "shipped" && customRequest.shipment ? (
        <section className={styles.shipCard}><div><p>Shipment</p><h2>{customRequest.shipment.carrier}</h2><span>{customRequest.shipment.trackingNumber}</span></div>{customRequest.shipment.trackingUrl ? <a href={customRequest.shipment.trackingUrl} target="_blank" rel="noreferrer">Track parcel ↗</a> : null}</section>
      ) : null}

      {notice ? <p className={styles.successNotice} role="status">{notice}</p> : null}
      {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}

      <section className={styles.summaryCard}>
        <header><div><p>Submitted brief</p><h2>Design direction</h2></div><button type="button" onClick={() => void load()}>Refresh status ↻</button></header>
        <dl>{CHOICE_LABELS.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{customRequest.choices[key]}</dd></div>)}</dl>
        {customRequest.referenceUrl || customRequest.referenceFiles.length ? <div className={styles.referenceSummary}><strong>References</strong><span>{customRequest.referenceFiles.length ? `${customRequest.referenceFiles.length} uploaded ${customRequest.referenceFiles.length === 1 ? "image" : "images"}` : "No uploaded images"}</span>{customRequest.referenceUrl ? <a href={customRequest.referenceUrl} target="_blank" rel="noreferrer">Open attached link ↗</a> : null}</div> : null}
      </section>
    </div>
  );
}
