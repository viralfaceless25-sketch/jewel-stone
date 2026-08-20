"use client";

import { useMemo, useState } from "react";
import {
  ACTIVE_PROMO_KINDS,
  PROMO_SCOPES,
  formatUsd,
  promoLabel,
  type PromoCode,
  type PromoKind,
  type PromoScope,
} from "@/lib/admin/promo-shared";
import styles from "@/app/admin/admin.module.css";

const KIND_LABELS: Record<PromoKind, string> = {
  percent: "Percentage off",
  fixed: "Fixed amount off",
  free_shipping: "Free shipping",
};

const SCOPE_LABELS: Record<PromoScope, string> = {
  all: "Everything",
  category: "Certain categories",
  world: "Certain diamond worlds",
  skus: "Specific SKUs",
};

const BLANK = {
  code: "",
  kind: "percent" as PromoKind,
  value: "10",
  startsAt: "",
  expiresAt: "",
  minSubtotal: "",
  maxRedemptions: "",
  perCustomerLimit: "",
  scope: "all" as PromoScope,
  scopeValues: "",
  firstOrderOnly: false,
  notes: "",
};

function statusOf(promo: PromoCode) {
  const today = new Date().toISOString().slice(0, 10);
  if (promo.kind === "free_shipping") return { label: "Retired", tone: "badgeBad" as const };
  if (!promo.active) return { label: "Paused", tone: "badge" as const };
  if (promo.expiresAt && today > promo.expiresAt) return { label: "Expired", tone: "badgeBad" as const };
  if (promo.startsAt && today < promo.startsAt) return { label: "Scheduled", tone: "badgeWarn" as const };
  if (typeof promo.maxRedemptions === "number" && promo.redemptions >= promo.maxRedemptions) {
    return { label: "Used up", tone: "badgeBad" as const };
  }
  return { label: "Live", tone: "badgeGood" as const };
}

export function PromoClient({ initialPromos }: { initialPromos: PromoCode[] }) {
  const [promos, setPromos] = useState(initialPromos);
  const [form, setForm] = useState({ ...BLANK });
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return promos;
    return promos.filter((promo) =>
      promo.code.toLowerCase().includes(term) || promo.notes.toLowerCase().includes(term));
  }, [promos, search]);

  function field<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editPromo(promo: PromoCode) {
    setEditing(promo.code);
    setForm({
      code: promo.code,
      kind: promo.kind === "free_shipping" ? "percent" : promo.kind,
      value:
        promo.kind === "free_shipping"
          ? "10"
          : promo.kind === "fixed"
            ? String(promo.value / 100)
            : String(promo.value),
      startsAt: promo.startsAt ?? "",
      expiresAt: promo.expiresAt ?? "",
      minSubtotal: promo.minSubtotal ? String(promo.minSubtotal / 100) : "",
      maxRedemptions: promo.maxRedemptions ? String(promo.maxRedemptions) : "",
      perCustomerLimit: promo.perCustomerLimit ? String(promo.perCustomerLimit) : "",
      scope: promo.scope,
      scopeValues: promo.scopeValues.join(", "),
      firstOrderOnly: promo.firstOrderOnly,
      notes: promo.notes,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          kind: form.kind,
          // Money is entered in dollars and stored in cents.
          value: form.kind === "fixed" ? Math.round(Number(form.value) * 100) : Number(form.value),
          startsAt: form.startsAt || undefined,
          expiresAt: form.expiresAt || undefined,
          minSubtotal: form.minSubtotal ? Math.round(Number(form.minSubtotal) * 100) : undefined,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
          perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : undefined,
          scope: form.scope,
          scopeValues: form.scopeValues.split(",").map((value) => value.trim()).filter(Boolean),
          firstOrderOnly: form.firstOrderOnly,
          notes: form.notes,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the code.");
      setPromos((current) => {
        const rest = current.filter((promo) => promo.code !== result.promo.code);
        return [result.promo, ...rest];
      });
      setNotice(editing ? `${result.promo.code} updated.` : `${result.promo.code} created.`);
      setForm({ ...BLANK });
      setEditing(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the code.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(promo: PromoCode) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo.code, active: !promo.active }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update.");
      setPromos((current) => current.map((item) => (item.code === promo.code ? result.promo : item)));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(promo: PromoCode) {
    if (!window.confirm(`Delete ${promo.code}? Redemption history is removed with it.`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/promo-codes?code=${encodeURIComponent(promo.code)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete the code.");
      setPromos((current) => current.filter((item) => item.code !== promo.code));
      setNotice(`${promo.code} deleted.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      {/* Create / edit */}
      <section className={styles.panel}>
        <div className={styles.panelPad}>
          <h2 className={styles.sectionTitle}>{editing ? `Edit ${editing}` : "New promotion code"}</h2>
          {notice ? <p className={`${styles.notice} ${styles.noticeGood}`}>{notice}</p> : null}
          {error ? <p className={`${styles.notice} ${styles.noticeError}`}>{error}</p> : null}
          <form onSubmit={save}>
            <div className={styles.kycFieldGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Code</span>
                <input className={styles.input} value={form.code} disabled={Boolean(editing)}
                  onChange={(event) => field("code", event.target.value.toUpperCase())}
                  placeholder="WELCOME10" required />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Discount type</span>
                <select className={styles.select} value={form.kind}
                  onChange={(event) => field("kind", event.target.value as PromoKind)}>
                  {ACTIVE_PROMO_KINDS.map((kind) => <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>)}
                </select>
              </label>
              {form.kind !== "free_shipping" ? (
                <label className={styles.field}>
                  <span className={styles.label}>{form.kind === "percent" ? "Percent off" : "Amount off ($)"}</span>
                  <input className={styles.input} type="number" min="1" step={form.kind === "percent" ? "1" : "0.01"}
                    max={form.kind === "percent" ? "100" : undefined}
                    value={form.value} onChange={(event) => field("value", event.target.value)} required />
                </label>
              ) : null}
              <label className={styles.field}>
                <span className={styles.label}>Starts</span>
                <input className={styles.input} type="date" value={form.startsAt}
                  onChange={(event) => field("startsAt", event.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Expires</span>
                <input className={styles.input} type="date" value={form.expiresAt}
                  onChange={(event) => field("expiresAt", event.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Minimum spend ($)</span>
                <input className={styles.input} type="number" min="0" step="0.01" value={form.minSubtotal}
                  onChange={(event) => field("minSubtotal", event.target.value)} placeholder="No minimum" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Total uses allowed</span>
                <input className={styles.input} type="number" min="1" value={form.maxRedemptions}
                  onChange={(event) => field("maxRedemptions", event.target.value)} placeholder="Unlimited" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Uses per customer</span>
                <input className={styles.input} type="number" min="1" value={form.perCustomerLimit}
                  onChange={(event) => field("perCustomerLimit", event.target.value)} placeholder="Unlimited" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Applies to</span>
                <select className={styles.select} value={form.scope}
                  onChange={(event) => field("scope", event.target.value as PromoScope)}>
                  {PROMO_SCOPES.map((scope) => <option key={scope} value={scope}>{SCOPE_LABELS[scope]}</option>)}
                </select>
              </label>
              {form.scope !== "all" ? (
                <label className={`${styles.field} ${styles.kycFieldWide}`}>
                  <span className={styles.label}>
                    {form.scope === "category" ? "Categories (Rings, Earrings…)"
                      : form.scope === "world" ? "Worlds (lab-grown, natural-piecut, natural)"
                      : "SKUs or slugs"}
                  </span>
                  <input className={styles.input} value={form.scopeValues}
                    onChange={(event) => field("scopeValues", event.target.value)}
                    placeholder="Comma separated" />
                </label>
              ) : null}
              <label className={`${styles.field} ${styles.kycFieldWide}`}>
                <span className={styles.label}>Internal note</span>
                <input className={styles.input} value={form.notes}
                  onChange={(event) => field("notes", event.target.value)}
                  placeholder="Where this code is being used" />
              </label>
              <label className={styles.field} style={{ flexDirection: "row", alignItems: "center", gap: ".5rem" }}>
                <input type="checkbox" checked={form.firstOrderOnly}
                  onChange={(event) => field("firstOrderOnly", event.target.checked)} />
                <span className={styles.label} style={{ margin: 0 }}>First order only</span>
              </label>
            </div>
            <div className={styles.actions} style={{ marginTop: ".9rem" }}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create code"}
              </button>
              {editing ? (
                <button type="button" className={styles.btn}
                  onClick={() => { setEditing(null); setForm({ ...BLANK }); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      {/* Existing codes */}
      <section className={styles.panel}>
        <div className={styles.panelPad}>
          <h2 className={styles.sectionTitle}>Codes</h2>
          <input className={styles.input} placeholder="Search code or note" value={search}
            onChange={(event) => setSearch(event.target.value)} />
          {rows.length ? (
            <div className={styles.tableWrap} style={{ marginTop: ".8rem" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th><th>Discount</th><th>Applies to</th><th>Window</th>
                    <th>Used</th><th>Status</th><th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((promo) => {
                    const status = statusOf(promo);
                    return (
                      <tr key={promo.code}>
                        <td data-label="Code"><strong>{promo.code}</strong>{promo.notes ? <><br /><small>{promo.notes}</small></> : null}</td>
                        <td data-label="Discount">
                          {promoLabel(promo)}
                          {promo.minSubtotal ? <><br /><small>min {formatUsd(promo.minSubtotal)}</small></> : null}
                          {promo.firstOrderOnly ? <><br /><small>first order only</small></> : null}
                        </td>
                        <td data-label="Applies to">
                          {SCOPE_LABELS[promo.scope]}
                          {promo.scopeValues.length ? <><br /><small>{promo.scopeValues.join(", ")}</small></> : null}
                        </td>
                        <td data-label="Window">
                          {promo.startsAt || "—"} → {promo.expiresAt || "—"}
                        </td>
                        <td data-label="Used">
                          {promo.redemptions}{typeof promo.maxRedemptions === "number" ? ` / ${promo.maxRedemptions}` : ""}
                          {typeof promo.perCustomerLimit === "number" ? <><br /><small>{promo.perCustomerLimit} per customer</small></> : null}
                        </td>
                        <td data-label="Status"><span className={styles[status.tone]}>{status.label}</span></td>
                        <td data-label="Action">
                          <div className={styles.actions}>
                            <button type="button" className={`${styles.btn} ${styles.btnSmall}`} onClick={() => editPromo(promo)}>Edit</button>
                            <button type="button" className={`${styles.btn} ${styles.btnSmall}`} disabled={busy} onClick={() => void toggle(promo)}>
                              {promo.active ? "Pause" : "Resume"}
                            </button>
                            <button type="button" className={`${styles.btn} ${styles.btnSmall}`} disabled={busy} onClick={() => void remove(promo)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>No promotion codes yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
