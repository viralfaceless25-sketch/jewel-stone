"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  STATUS_LABELS,
  canMarkShipped,
  canOwnerQuote,
  canStartProduction,
  type CustomRequestRecord,
} from "@/lib/custom-request-types";
import styles from "./request-status.module.css";

type OwnerRequest = Omit<CustomRequestRecord, "ownerToken">;

const CHOICE_LABELS = [
  ["type", "Piece"], ["metal", "Metal"], ["shape", "Stone"], ["origin", "Origin"], ["budget", "Budget"],
] as const;

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function CustomQuoteManager({ token }: { token: string }) {
  const [customRequest, setCustomRequest] = useState<OwnerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/custom-requests/owner/${token}`, { cache: "no-store" });
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

  useEffect(() => { void load(); }, [load]);

  const update = async (payload: Record<string, string>) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/custom-requests/owner/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Request could not be updated.");
      setCustomRequest(result.request);
      setNotice(result.notified ? "Saved. Customer notification sent." : "Saved. Email notification needs Resend configuration.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Request could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const sendQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void update({
      action: "quote",
      estimate: String(form.get("estimate") ?? ""),
      leadTime: String(form.get("leadTime") ?? ""),
      validUntil: String(form.get("validUntil") ?? ""),
      message: String(form.get("message") ?? ""),
    });
  };

  const markShipped = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void update({
      action: "ship",
      carrier: String(form.get("carrier") ?? ""),
      trackingNumber: String(form.get("trackingNumber") ?? ""),
      trackingUrl: String(form.get("trackingUrl") ?? ""),
    });
  };

  if (loading) return <section className={styles.stateCard}><span className={styles.loader} aria-hidden /><h1>Opening owner workspace…</h1></section>;
  if (!customRequest) return <section className={styles.stateCard}><h1>Owner link unavailable.</h1><p>{error || "Open the secure link from the original request email."}</p></section>;

  return (
    <div className={`${styles.portal} ${styles.ownerPortal}`}>
      <header className={styles.portalHead}>
        <div><p className={styles.eyebrow}>Owner workspace · {customRequest.id}</p><h1>Custom quotation.</h1><p>Submitted {dateTime(customRequest.createdAt)}</p></div>
        <span className={`${styles.statusPill} ${styles[`status_${customRequest.status}`]}`}>{STATUS_LABELS[customRequest.status]}</span>
      </header>

      <div className={styles.ownerGrid}>
        <section className={styles.ownerBrief}>
          <header><div><p>Customer</p><h2>{customRequest.name}</h2></div><a href={`mailto:${customRequest.email}`}>{customRequest.email}</a></header>
          {customRequest.phone ? <a className={styles.phone} href={`tel:${customRequest.phone}`}>{customRequest.phone}</a> : null}
          <dl>{CHOICE_LABELS.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{customRequest.choices[key]}</dd></div>)}</dl>
          {customRequest.notes ? <div className={styles.ownerNotes}><strong>Customer notes</strong><p>{customRequest.notes}</p></div> : null}
          <div className={styles.ownerReferences}>
            <strong>References</strong>
            <p>{customRequest.referenceFiles.length ? `${customRequest.referenceFiles.length} image attachments arrived with original request email.` : "No image attachments."}</p>
            {customRequest.referenceFiles.length ? <ul>{customRequest.referenceFiles.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul> : null}
            {customRequest.referenceUrl ? <a href={customRequest.referenceUrl} target="_blank" rel="noreferrer">Open reference link ↗</a> : null}
          </div>
          <Link className={styles.customerView} href={`/custom/request/${customRequest.publicToken}`} target="_blank">Open customer view ↗</Link>
        </section>

        <div className={styles.ownerActions}>
          {canOwnerQuote(customRequest.status) ? (
            <form className={styles.ownerForm} onSubmit={sendQuote}>
              <p>{customRequest.quote ? "Revise quotation" : "Prepare quotation"}</p>
              <h2>Owner estimate</h2>
              <label>Estimated price or range<input required name="estimate" defaultValue={customRequest.quote?.estimate} placeholder="$4,800–$5,400" /></label>
              <label>Estimated production time<input required name="leadTime" defaultValue={customRequest.quote?.leadTime} placeholder="4–6 weeks after approval" /></label>
              <label>Estimate valid until <span>(optional)</span><input name="validUntil" type="date" defaultValue={customRequest.quote?.validUntil} /></label>
              <label>Message to customer <span>(optional)</span><textarea name="message" rows={6} defaultValue={customRequest.quote?.message} placeholder="Materials, stone assumptions, included services, or adjustments…" /></label>
              <button disabled={saving} type="submit">{saving ? "Saving…" : customRequest.quote ? "Send revised quotation" : "Send quotation"}</button>
            </form>
          ) : null}

          {customRequest.decision ? <section className={styles.decisionResult}><p>Customer decision</p><h2>{customRequest.decision.value === "accepted" ? "Accepted" : "Declined"}</h2><span>{customRequest.decision.note || "No note added."}</span><small>{dateTime(customRequest.decision.createdAt)}</small></section> : null}

          {canStartProduction(customRequest.status) ? <section className={styles.ownerStep}><p>Next milestone</p><h2>Ready for production?</h2><span>Use after final specification, sizing, and payment arrangements are confirmed.</span><button disabled={saving} type="button" onClick={() => void update({ action: "start_production" })}>Mark in production</button></section> : null}

          {canMarkShipped(customRequest.status) ? (
            <form className={styles.ownerForm} onSubmit={markShipped}>
              <p>Final milestone</p><h2>Add shipping</h2>
              <label>Carrier<input required name="carrier" placeholder="FedEx" /></label>
              <label>Tracking number<input required name="trackingNumber" /></label>
              <label>Tracking link <span>(optional)</span><input name="trackingUrl" type="url" placeholder="https://…" /></label>
              <button disabled={saving} type="submit">{saving ? "Saving…" : "Mark shipped & notify"}</button>
            </form>
          ) : null}

          {customRequest.status === "shipped" && customRequest.shipment ? <section className={styles.decisionResult}><p>Shipment sent</p><h2>{customRequest.shipment.carrier}</h2><span>{customRequest.shipment.trackingNumber}</span></section> : null}
          {notice ? <p className={styles.successNotice} role="status">{notice}</p> : null}
          {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
