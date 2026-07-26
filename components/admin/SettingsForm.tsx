"use client";

import { useState, type FormEvent } from "react";
import type { AdminSettings } from "@/lib/admin/settings";
import admin from "@/app/admin/admin.module.css";
import docStyles from "./documents.module.css";

export function SettingsForm({ initial }: { initial: AdminSettings }) {
  const [settings, setSettings] = useState(initial);
  const [shippingDollars, setShippingDollars] = useState((initial.defaultShipping / 100).toFixed(2));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const field = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) =>
    setSettings({ ...settings, [key]: value });

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, defaultShipping: Math.round((Number(shippingDollars) || 0) * 100) }),
      });
      const body = (await response.json().catch(() => ({}))) as { settings?: AdminSettings; error?: string };
      if (!response.ok || !body.settings) throw new Error(body.error ?? "Could not save settings.");
      setSettings(body.settings);
      setShippingDollars((body.settings.defaultShipping / 100).toFixed(2));
      setNotice("Settings saved. New documents will use these details.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={docStyles.composer} onSubmit={save}>
      <section className={`${admin.panel} ${admin.panelPad}`}>
        <div className={docStyles.grid2}>
          <label className={admin.field}><span className={admin.label}>Brand name</span><input className={admin.input} value={settings.displayName} onChange={(event) => field("displayName", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Legal business name</span><input className={admin.input} value={settings.legalName} onChange={(event) => field("legalName", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Email</span><input className={admin.input} type="email" value={settings.email} onChange={(event) => field("email", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Phone</span><input className={admin.input} value={settings.phone} onChange={(event) => field("phone", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Website</span><input className={admin.input} type="url" value={settings.website} onChange={(event) => field("website", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Tagline</span><input className={admin.input} value={settings.tagline} onChange={(event) => field("tagline", event.target.value)} /></label>
          <label className={admin.field} style={{ gridColumn: "1 / -1" }}><span className={admin.label}>Business address</span><textarea className={admin.textarea} value={settings.address} onChange={(event) => field("address", event.target.value)} /></label>
        </div>
      </section>
      <section className={`${admin.panel} ${admin.panelPad}`}>
        <div className={docStyles.grid2}>
          <label className={admin.field}><span className={admin.label}>Invoice prefix</span><input className={admin.input} value={settings.invoicePrefix} onChange={(event) => field("invoicePrefix", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Memo prefix</span><input className={admin.input} value={settings.memoPrefix} onChange={(event) => field("memoPrefix", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Default tax rate (%)</span><input className={admin.input} type="number" min="0" max="100" step="0.001" value={settings.defaultTaxRate} onChange={(event) => field("defaultTaxRate", Number(event.target.value) || 0)} /></label>
          <label className={admin.field}><span className={admin.label}>Default shipping ($)</span><input className={admin.input} type="number" min="0" step="0.01" value={shippingDollars} onChange={(event) => setShippingDollars(event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Default invoice terms</span><input className={admin.input} value={settings.defaultInvoiceTerms} onChange={(event) => field("defaultInvoiceTerms", event.target.value)} placeholder="Advance payment" /></label>
          <label className={admin.field}><span className={admin.label}>Default memo days</span><input className={admin.input} type="number" min="0" max="365" value={settings.defaultMemoDays} onChange={(event) => field("defaultMemoDays", Number(event.target.value))} /></label>
          <label className={admin.field}><span className={admin.label}>Bank name</span><input className={admin.input} value={settings.bankName} onChange={(event) => field("bankName", event.target.value)} placeholder="Bank of America" /></label>
          <label className={admin.field}><span className={admin.label}>Bank account number</span><input className={admin.input} value={settings.bankAccountNumber} onChange={(event) => field("bankAccountNumber", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Routing number</span><input className={admin.input} value={settings.bankRoutingNumber} onChange={(event) => field("bankRoutingNumber", event.target.value)} /></label>
          <label className={admin.field}><span className={admin.label}>Zelle ID</span><input className={admin.input} value={settings.zelleId} onChange={(event) => field("zelleId", event.target.value)} /></label>
          <label className={admin.field} style={{ gridColumn: "1 / -1" }}><span className={admin.label}>Default invoice payment instructions</span><textarea className={admin.textarea} value={settings.defaultPaymentInstructions} onChange={(event) => field("defaultPaymentInstructions", event.target.value)} placeholder="Leave blank until bank/check/card instructions are approved." /></label>
        </div>
      </section>
      {notice ? <p className={`${admin.notice} ${admin.noticeGood}`}>{notice}</p> : null}
      {error ? <p className={`${admin.notice} ${admin.noticeError}`}>{error}</p> : null}
      <div><button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
