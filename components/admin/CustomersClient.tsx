"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, type Customer, type Order } from "@/lib/admin/order-shared";
import admin from "@/app/admin/admin.module.css";
import styles from "./records.module.css";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function CustomersClient({ customers, orders }: { customers: Customer[]; orders: Order[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(customers[0]?.email ?? "");
  const selected = customers.find((customer) => customer.email === selectedEmail);
  const history = selected ? orders.filter((order) => order.customer.email.toLowerCase() === selected.email.toLowerCase()) : [];
  const [notes, setNotes] = useState(selected?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? customers.filter((customer) => [customer.name, customer.email, customer.phone].some((value) => value.toLowerCase().includes(needle)))
      : customers;
  }, [customers, query]);

  function choose(customer: Customer) {
    setSelectedEmail(customer.email);
    setNotes(customer.notes);
    setError("");
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
                <small>{customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} · last purchase {new Date(customer.lastPurchase).toLocaleDateString()}</small>
              </button>
            ))}
          </div>
          {selected ? (
            <aside className={styles.detail}>
              <h2>{selected.name || selected.email}</h2>
              <dl className={styles.facts}>
                <div><dt>Contact</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a><br />{selected.phone}</dd></div>
                <div><dt>History</dt><dd>{selected.orderCount} orders · {formatMoney(selected.totalSpent)} lifetime</dd></div>
              </dl>
              <ul className={styles.items}>
                {history.map((order) => <li key={order.id}><span>{order.id}<br /><small>{new Date(order.createdAt).toLocaleDateString()}</small></span><strong>{formatMoney(order.amountTotal, order.currency)}</strong></li>)}
              </ul>
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

