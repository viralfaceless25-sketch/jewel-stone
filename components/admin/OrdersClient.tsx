"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatMoney,
  type Order,
  type OrderStatus,
} from "@/lib/admin/order-shared";
import admin from "@/app/admin/admin.module.css";
import styles from "./records.module.css";

const date = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const detailRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? "");
  const selected = orders.find((order) => order.id === selectedId);
  const [status, setStatus] = useState<OrderStatus>(selected?.status ?? "paid");
  const [trackingNumber, setTrackingNumber] = useState(selected?.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(selected?.trackingUrl ?? "");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? orders.filter((order) =>
          [
            order.id,
            order.customer.name,
            order.customer.email,
            order.customer.phone,
            order.trackingNumber,
            ...order.items.map((item) => item.name),
          ].some((value) => value?.toLowerCase().includes(needle)),
        )
      : orders;
  }, [orders, query]);

  function choose(order: Order) {
    setSelectedId(order.id);
    setStatus(order.status);
    setTrackingNumber(order.trackingNumber ?? "");
    setTrackingUrl(order.trackingUrl ?? "");
    setError("");
    if (window.matchMedia("(max-width: 900px)").matches) {
      window.setTimeout(
        () => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    }
  }

  async function save() {
    if (!selected) return;
    setBusy("save");
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber, trackingUrl }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not save order.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save order.");
    } finally {
      setBusy("");
    }
  }

  async function refund() {
    if (!selected || !window.confirm(`Issue a full Stripe refund for ${selected.id}?`)) return;
    setBusy("refund");
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(selected.id)}/refund`, { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Refund failed.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Refund failed.");
    } finally {
      setBusy("");
    }
  }

  function exportCsv() {
    const lines = [
      ["Order", "Date", "Customer", "Email", "Phone", "Status", "Total", "Currency", "Tracking"].map(csvCell).join(","),
      ...orders.map((order) =>
        [
          order.id,
          order.createdAt,
          order.customer.name,
          order.customer.email,
          order.customer.phone,
          ORDER_STATUS_LABELS[order.status],
          (order.amountTotal / 100).toFixed(2),
          order.currency,
          order.trackingNumber ?? "",
        ].map(csvCell).join(","),
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jewel-stone-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className={styles.toolbar}>
        <input className={`${admin.input} ${styles.search}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, email, phone, or item" />
        <button className={admin.btn} type="button" onClick={exportCsv}>Export CSV</button>
      </div>
      {!orders.length ? <div className={styles.empty}>No paid website orders yet.</div> : (
        <div className={styles.split}>
          <div className={styles.list}>
            {filtered.map((order) => (
              <button key={order.id} className={`${styles.row} ${selectedId === order.id ? styles.rowActive : ""}`} type="button" onClick={() => choose(order)}>
                <div><strong>{order.id}</strong> <span>· {date(order.createdAt)}</span></div>
                <strong>{formatMoney(order.amountTotal, order.currency)}</strong>
                <span>{order.customer.name} · {order.customer.email}</span>
                <small>{order.items.map((item) => `${item.qty}× ${item.name}`).join(" · ")} · {ORDER_STATUS_LABELS[order.status]}</small>
              </button>
            ))}
          </div>
          {selected ? (
            <aside ref={detailRef} className={styles.detail}>
              <h2>{selected.id}</h2>
              <dl className={styles.facts}>
                <div><dt>Customer</dt><dd>{selected.customer.name}<br />{selected.customer.email}<br />{selected.customer.phone}</dd></div>
                <div><dt>Paid</dt><dd>{date(selected.createdAt)} · {formatMoney(selected.amountTotal, selected.currency)}</dd></div>
                <div><dt>Shipping</dt><dd>{selected.shippingAddress ? [selected.shippingAddress.line1, selected.shippingAddress.line2, `${selected.shippingAddress.city}, ${selected.shippingAddress.state} ${selected.shippingAddress.postalCode}`, selected.shippingAddress.country].filter(Boolean).join(", ") : "Not collected"}</dd></div>
              </dl>
              <ul className={styles.items}>
                {selected.items.map((item, index) => (
                  <li key={`${item.slug}-${index}`}><span>{item.qty} × {item.name}<br /><small>{[item.metal, item.size, item.grade].filter(Boolean).join(" · ")}</small></span><strong>{formatMoney(item.unitPrice * item.qty, selected.currency)}</strong></li>
                ))}
              </ul>
              <div className={styles.form}>
                <label className={admin.field}><span className={admin.label}>Status</span><select className={admin.select} value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>{ORDER_STATUSES.map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>)}</select></label>
                <label className={admin.field}><span className={admin.label}>Tracking number</span><input className={admin.input} value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} /></label>
                <label className={admin.field}><span className={admin.label}>Tracking link</span><input className={admin.input} type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} /></label>
                {error ? <p className={`${admin.notice} ${admin.noticeError}`}>{error}</p> : null}
                <button className={`${admin.btn} ${admin.btnPrimary}`} type="button" onClick={save} disabled={Boolean(busy)}>{busy === "save" ? "Saving…" : "Save order"}</button>
                {selected.paymentIntentId && selected.status !== "refunded" ? <button className={`${admin.btn} ${admin.btnDanger}`} type="button" onClick={refund} disabled={Boolean(busy)}>{busy === "refund" ? "Refunding…" : "Full Stripe refund"}</button> : null}
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </>
  );
}
