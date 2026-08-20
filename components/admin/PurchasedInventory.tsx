"use client";

import { useMemo, useState } from "react";
import type { PurchasedMemoSummary, PurchasedRow } from "@/lib/admin/inventory";
import styles from "@/app/admin/admin.module.css";

// Memo (consignment) goods. Admin-only by design — none of this ever reaches
// the website. Retail shown is the memo cost plus 10%; stock is editable and
// marking a piece 0 is how a sale or a return to the vendor is reflected.

function usd(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function dateLabel(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function PurchasedInventory({
  memos,
  initialRows,
}: {
  memos: PurchasedMemoSummary[];
  initialRows: PurchasedRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [busySlug, setBusySlug] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      row.code.includes(term) ||
      row.name.toLowerCase().includes(term) ||
      row.category.toLowerCase().includes(term) ||
      row.metal.toLowerCase().includes(term));
  }, [rows, query]);

  const onHand = rows.filter((row) => row.stock > 0);
  const onHandRetail = onHand.reduce((sum, row) => sum + row.retail, 0);
  const onHandCost = onHand.reduce((sum, row) => sum + row.memoAmount, 0);

  async function saveStock(row: PurchasedRow, stock: number) {
    setBusySlug(row.slug);
    setError("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: row.slug, stock }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Could not save stock.");
      }
      setRows((current) => current.map((item) => (item.slug === row.slug ? { ...item, stock } : item)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save stock.");
    } finally {
      setBusySlug("");
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelPad}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: ".8rem", alignItems: "baseline" }}>
          <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: ".2rem" }}>Purchased inventory · memo goods</h2>
            <p className={styles.tileHint} style={{ margin: 0 }}>
              Held on consignment — not shown on the website. Retail = memo cost + 10%.
            </p>
          </div>
          <div style={{ fontSize: ".85rem", color: "var(--js-ink-soft)" }}>
            {onHand.length} of {rows.length} pieces on hand · cost {usd(onHandCost)} · retail {usd(onHandRetail)}
          </div>
        </header>

        {memos.map((memo) => (
          <p key={memo.memoNumber} className={`${styles.notice} ${styles.noticeWarn}`} style={{ marginTop: ".9rem" }}>
            <strong>{memo.memoNumber}</strong> · {memo.vendor} · received {dateLabel(memo.date)} ·
            {" "}<strong>due back {dateLabel(memo.dueDate)}</strong> ({memo.termsDays} days) ·
            {" "}{memo.itemCount} pieces · {usd(memo.totalAmount)} memo value
            <br /><small>{memo.vendorContact}</small>
          </p>
        ))}

        {error ? <p className={`${styles.notice} ${styles.noticeError}`}>{error}</p> : null}

        <input
          className={styles.input}
          style={{ marginTop: ".8rem", maxWidth: 360 }}
          placeholder="Search code, name, category, metal"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className={styles.tableWrap} style={{ marginTop: ".8rem" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th><th>Item</th><th>Category</th><th>Metal</th>
                <th>Dia. ct</th><th>Gross wt</th><th>Certificate</th>
                <th>Memo cost</th><th>Retail (+10%)</th><th>On hand</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.slug} style={row.stock <= 0 ? { opacity: .55 } : undefined}>
                  <td data-label="Code"><strong>{row.code}</strong></td>
                  <td data-label="Item">{row.name}</td>
                  <td data-label="Category">{row.category}</td>
                  <td data-label="Metal">{row.metal}</td>
                  <td data-label="Dia. ct">{row.diamondCarats.toFixed(2)}</td>
                  <td data-label="Gross wt">{row.grossWeightGm.toFixed(2)} g</td>
                  <td data-label="Certificate">{row.certificate ?? "—"}</td>
                  <td data-label="Memo cost">{usd(row.memoAmount)}</td>
                  <td data-label="Retail (+10%)"><strong>{usd(row.retail)}</strong></td>
                  <td data-label="On hand">
                    <input
                      className={styles.input}
                      style={{ width: 64 }}
                      type="number"
                      min={0}
                      max={99}
                      defaultValue={row.stock}
                      disabled={busySlug === row.slug}
                      key={`${row.slug}-${row.stock}`}
                      onBlur={(event) => {
                        const stock = Math.max(0, Math.round(Number(event.target.value) || 0));
                        if (stock !== row.stock) void saveStock(row, stock);
                      }}
                    />
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr><td colSpan={10}><p className={styles.empty} style={{ margin: ".6rem 0" }}>No memo pieces match.</p></td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
