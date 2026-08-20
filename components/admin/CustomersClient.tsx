"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, type Customer, type Order } from "@/lib/admin/order-shared";
import { KYC_STATUS_LABELS, type KycStatus } from "@/lib/admin/kyc-shared";
import admin from "@/app/admin/admin.module.css";
import styles from "./records.module.css";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function displayDate(value: string) {
  if (!value) return "No purchases yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No purchases yet" : date.toLocaleDateString();
}

export function CustomersClient({
  customers,
  orders,
  kycByEmail,
  documentTotalsByEmail,
}: {
  customers: Customer[];
  orders: Order[];
  kycByEmail: Record<string, KycStatus>;
  documentTotalsByEmail: Record<string, { invoiced: number; memo: number }>;
}) {
  const router = useRouter();
  const detailRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(customers[0]?.email ?? "");
  const selected = customers.find((customer) => customer.email === selectedEmail);
  const history = selected ? orders.filter((order) => order.customer.email.toLowerCase() === selected.email.toLowerCase()) : [];
  const kycStatus = selected ? kycByEmail[selected.email.toLowerCase()] : undefined;
  const [notes, setNotes] = useState(selected?.notes ?? "");
  const [name, setName] = useState(selected?.name ?? "");
  const [phone, setPhone] = useState(selected?.phone ?? "");
  const [address, setAddress] = useState(selected?.address ?? "");
  const [paymentTerms, setPaymentTerms] = useState(selected?.paymentTerms ?? "");
  const [memoDays, setMemoDays] = useState(selected?.memoDays?.toString() ?? "");
  const [invoiceDueDays, setInvoiceDueDays] = useState(selected?.invoiceDueDays?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [termsBusy, setTermsBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [kycBusy, setKycBusy] = useState(false);
  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [termsError, setTermsError] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? customers.filter((customer) => [customer.name, customer.email, customer.phone].some((value) => value.toLowerCase().includes(needle)))
      : customers;
  }, [customers, query]);

  function choose(customer: Customer) {
    setSelectedEmail(customer.email);
    setNotes(customer.notes);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address ?? "");
    setPaymentTerms(customer.paymentTerms ?? "");
    setMemoDays(customer.memoDays?.toString() ?? "");
    setInvoiceDueDays(customer.invoiceDueDays?.toString() ?? "");
    setError("");
    setProfileError("");
    setTermsError("");
    if (window.matchMedia("(max-width: 900px)").matches) {
      window.setTimeout(
        () => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    }
  }

  async function saveProfile() {
    if (!selected) return;
    setProfileBusy(true);
    setProfileError("");
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(selected.email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      if (!response.ok) throw new Error("Could not save company details.");
      router.refresh();
    } catch (caught) {
      setProfileError(caught instanceof Error ? caught.message : "Could not save company details.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function deleteCustomer() {
    if (!selected) return;
    if (!window.confirm(`Delete the customer record for ${selected.name || selected.email}? Notes and trading terms are removed. Their order history is not affected. This cannot be undone.`)) return;
    setDeleteBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(selected.email)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete customer.");
      setSelectedEmail(customers.find((customer) => customer.email !== selected.email)?.email ?? "");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete customer.");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function deleteKycRecord() {
    if (!selected) return;
    if (!window.confirm(`Delete the KYC record for ${selected.name || selected.email}? All uploaded documents are removed. This cannot be undone.`)) return;
    setKycBusy(true);
    try {
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(selected.email)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete KYC record.");
      router.refresh();
    } catch {
      // Surfaced via the shared error banner below.
      setError("Could not delete KYC record.");
    } finally {
      setKycBusy(false);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(selected.email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error("Could not save customer notes.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save customer notes.");
    } finally {
      setBusy(false);
    }
  }

  async function saveTerms() {
    if (!selected) return;
    setTermsBusy(true);
    setTermsError("");
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(selected.email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentTerms: paymentTerms.trim() || null,
          memoDays: memoDays.trim() === "" ? null : Number(memoDays),
          invoiceDueDays: invoiceDueDays.trim() === "" ? null : Number(invoiceDueDays),
        }),
      });
      if (!response.ok) throw new Error("Could not save trading terms.");
      router.refresh();
    } catch (caught) {
      setTermsError(caught instanceof Error ? caught.message : "Could not save trading terms.");
    } finally {
      setTermsBusy(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Phone", "First purchase", "Last purchase", "Orders", "Lifetime spend", "Notes"].map(csvCell).join(","),
      ...customers.map((customer) => [
        customer.name,
        customer.email,
        customer.phone,
        customer.firstPurchase,
        customer.lastPurchase,
        customer.orderCount,
        (customer.totalSpent / 100).toFixed(2),
        customer.notes,
      ].map(csvCell).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jewel-stone-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className={styles.toolbar}>
        <input className={`${admin.input} ${styles.search}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or phone" />
        <button className={admin.btn} type="button" onClick={exportCsv}>Export CSV</button>
      </div>
      {!customers.length ? <div className={styles.empty}>Customer records appear after first paid order.</div> : (
        <div className={styles.split}>
          <div className={styles.list}>
            {filtered.map((customer) => {
              const totals = documentTotalsByEmail[customer.email.toLowerCase()];
              return (
                <button className={`${styles.row} ${selectedEmail === customer.email ? styles.rowActive : ""}`} type="button" key={customer.email} onClick={() => choose(customer)}>
                  <span>
                    <strong>{customer.name || customer.email}</strong>
                    {totals && (totals.invoiced || totals.memo) ? (
                      <><br /><small>
                        {totals.invoiced ? `Invoiced ${formatMoney(totals.invoiced)}` : null}
                        {totals.invoiced && totals.memo ? " · " : null}
                        {totals.memo ? `Memo ${formatMoney(totals.memo)}` : null}
                      </small></>
                    ) : null}
                  </span>
                  <strong>{formatMoney(customer.totalSpent)}</strong>
                  <span>{customer.email} · {customer.phone}</span>
                  <small>{customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} · {customer.orderCount ? `last purchase ${displayDate(customer.lastPurchase)}` : displayDate(customer.lastPurchase)}</small>
                </button>
              );
            })}
          </div>
          {selected ? (
            <aside ref={detailRef} className={styles.detail}>
              <h2>{selected.name || selected.email}</h2>
              <dl className={styles.facts}>
                <div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                <div><dt>History</dt><dd>{selected.orderCount} orders · {formatMoney(selected.totalSpent)} lifetime</dd></div>
                <div><dt>Invoiced</dt><dd>{formatMoney(documentTotalsByEmail[selected.email.toLowerCase()]?.invoiced ?? 0)}</dd></div>
                <div><dt>Memo</dt><dd>{formatMoney(documentTotalsByEmail[selected.email.toLowerCase()]?.memo ?? 0)}</dd></div>
              </dl>
              <ul className={styles.items}>
                {history.map((order) => <li key={order.id}><span>{order.id}<br /><small>{new Date(order.createdAt).toLocaleDateString()}</small></span><strong>{formatMoney(order.amountTotal, order.currency)}</strong></li>)}
              </ul>

              <div className={styles.form}>
                <span className={admin.label}>Company profile</span>
                <label className={admin.field}><span className={admin.label}>Company / contact name</span><input className={admin.input} value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label className={admin.field}><span className={admin.label}>Phone</span><input className={admin.input} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
                <label className={admin.field}><span className={admin.label}>Address</span><textarea className={admin.textarea} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Mailing / company address" /></label>
                {profileError ? <p className={`${admin.notice} ${admin.noticeError}`}>{profileError}</p> : null}
                <button className={admin.btn} type="button" onClick={saveProfile} disabled={profileBusy}>{profileBusy ? "Saving…" : "Save profile"}</button>
              </div>

              <div className={styles.form}>
                <span className={admin.label}>KYC</span>
                <p className={admin.pageSub} style={{ margin: 0 }}>
                  Status: <strong>{kycStatus ? KYC_STATUS_LABELS[kycStatus] : "Not started"}</strong>
                </p>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                  <a className={admin.btn} href="/admin/kyc">View / update in KYC</a>
                  {kycStatus ? (
                    <button className={`${admin.btn} ${admin.btnDanger}`} type="button" onClick={deleteKycRecord} disabled={kycBusy}>
                      {kycBusy ? "Deleting…" : "Delete KYC record"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className={styles.form}>
                <span className={admin.label}>Trading terms</span>
                <label className={admin.field}><span className={admin.label}>Payment terms (blank = house default)</span><input className={admin.input} value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} placeholder="Net 30" /></label>
                <label className={admin.field}><span className={admin.label}>Invoice due (days)</span><input className={admin.input} type="number" min="0" max="365" value={invoiceDueDays} onChange={(event) => setInvoiceDueDays(event.target.value)} placeholder="30" /></label>
                <label className={admin.field}><span className={admin.label}>Memo hold (days)</span><input className={admin.input} type="number" min="0" max="365" value={memoDays} onChange={(event) => setMemoDays(event.target.value)} placeholder="7" /></label>
                {termsError ? <p className={`${admin.notice} ${admin.noticeError}`}>{termsError}</p> : null}
                <button className={admin.btn} type="button" onClick={saveTerms} disabled={termsBusy}>{termsBusy ? "Saving…" : "Save terms"}</button>
              </div>

              <div className={styles.form}>
                <span className={admin.label}>Account statement</span>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                  <a className={admin.btn} href={`/api/admin/customers/${encodeURIComponent(selected.email)}/statement?type=paid`} target="_blank" rel="noreferrer">Paid invoices (PDF)</a>
                  <a className={admin.btn} href={`/api/admin/customers/${encodeURIComponent(selected.email)}/statement?type=open`} target="_blank" rel="noreferrer">Open invoices (PDF)</a>
                </div>
              </div>

              <div className={styles.form}>
                <label className={admin.field}><span className={admin.label}>Private customer notes</span><textarea className={admin.textarea} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
                {error ? <p className={`${admin.notice} ${admin.noticeError}`}>{error}</p> : null}
                <button className={`${admin.btn} ${admin.btnPrimary}`} type="button" onClick={saveNotes} disabled={busy}>{busy ? "Saving…" : "Save notes"}</button>
              </div>

              <div className={styles.form}>
                <span className={admin.label}>Danger zone</span>
                <button className={`${admin.btn} ${admin.btnDanger}`} type="button" onClick={deleteCustomer} disabled={deleteBusy}>
                  {deleteBusy ? "Deleting…" : "Delete customer record"}
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </>
  );
}
