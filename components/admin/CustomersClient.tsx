"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, type Customer, type Order } from "@/lib/admin/order-shared";
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

export function CustomersClient({ customers, orders }: { customers: Customer[]; orders: Order[] }) {
  const router = useRouter();
  const detailRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(customers[0]?.email ?? "");
  const selected = customers.find((customer) => customer.email === selectedEmail);
  const history = selected ? orders.filter((order) => order.customer.email.toLowerCase() === selected.email.toLowerCase()) : [];
  const [notes, setNotes] = useState(selected?.notes ?? "");
  const [paymentTerms, setPaymentTerms] = useState(selected?.paymentTerms ?? "");
  const [memoDays, setMemoDays] = useState(selected?.memoDays?.toString() ?? "");
  const [invoiceDueDays, setInvoiceDueDays] = useState(selected?.invoiceDueDays?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [termsBusy, setTermsBusy] = useState(false);
  const [error, setError] = useState("");
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
    setPaymentTerms(customer.paymentTerms ?? "");
    setMemoDays(customer.memoDays?.toString() ?? "");
    setInvoiceDueDays(customer.invoiceDueDays?.toString() ?? "");
    setError("");
    setTermsError("");
    if (window.matchMedia("(max-width: 900px)").matches) {
      window.setTimeout(
        () => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
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
            {filtered.map((customer) => (
              <button className={`${styles.row} ${selectedEmail === customer.email ? styles.rowActive : ""}`} type="button" key={customer.email} onClick={() => choose(customer)}>
                <strong>{customer.name || customer.email}</strong>
                <strong>{formatMoney(customer.totalSpent)}</strong>
                <span>{customer.email} · {customer.phone}</span>
                <small>{customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} · {customer.orderCount ? `last purchase ${displayDate(customer.lastPurchase)}` : displayDate(customer.lastPurchase)}</small>
              </button>
            ))}
          </div>
          {selected ? (
            <aside ref={detailRef} className={styles.detail}>
              <h2>{selected.name || selected.email}</h2>
              <dl className={styles.facts}>
                <div><dt>Contact</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a><br />{selected.phone}</dd></div>
                <div><dt>History</dt><dd>{selected.orderCount} orders · {formatMoney(selected.totalSpent)} lifetime</dd></div>
              </dl>
              <ul className={styles.items}>
                {history.map((order) => <li key={order.id}><span>{order.id}<br /><small>{new Date(order.createdAt).toLocaleDateString()}</small></span><strong>{formatMoney(order.amountTotal, order.currency)}</strong></li>)}
              </ul>
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
            </aside>
          ) : null}
        </div>
      )}
    </>
  );
}
