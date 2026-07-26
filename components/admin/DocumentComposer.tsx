"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BusinessDocument } from "@/lib/admin/documents";
import type { DocumentItemKind, DocumentKind } from "@/lib/admin/document-math";
import admin from "@/app/admin/admin.module.css";
import styles from "./documents.module.css";

type EditableItem = {
  kind: DocumentItemKind;
  description: string;
  code: string;
  category: string;
  metal: string;
  metalWeight: string;
  diamondCarats: string;
  grossWeight: string;
  shape: string;
  color: string;
  clarity: string;
  cutPolishSymmetry: string;
  certificateNumber: string;
  quantity: string;
  unitPrice: string;
};

function blankItem(kind: DocumentItemKind = "jewelry"): EditableItem {
  return {
    kind,
    description: "",
    code: "",
    category: "",
    metal: "",
    metalWeight: "",
    diamondCarats: "",
    grossWeight: "",
    shape: "",
    color: "",
    clarity: "",
    cutPolishSymmetry: "",
    certificateNumber: "",
    quantity: "1",
    unitPrice: "",
  };
}

function dollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function DocumentComposer({
  defaultKind,
  existing,
  defaults,
}: {
  defaultKind: DocumentKind;
  existing?: BusinessDocument;
  defaults?: {
    taxRate: number;
    shipping: number;
    paymentInstructions: string;
  };
}) {
  const router = useRouter();
  const [kind, setKind] = useState<DocumentKind>(existing?.kind ?? defaultKind);
  const [customer, setCustomer] = useState({
    name: existing?.customer.name ?? "",
    email: existing?.customer.email ?? "",
    phone: existing?.customer.phone ?? "",
    address: existing?.customer.address ?? "",
    shippingAddress: existing?.customer.shippingAddress ?? "",
  });
  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? dateAfter(kind === "memo" ? 15 : 0));
  const [terms, setTerms] = useState(existing?.terms ?? (kind === "memo" ? "15 days" : "Due on receipt"));
  const [taxRate, setTaxRate] = useState(
    existing ? String(existing.taxRate) : defaults?.taxRate ? String(defaults.taxRate) : "",
  );
  const [shipping, setShipping] = useState(
    existing ? dollars(existing.shipping) : defaults?.shipping ? dollars(defaults.shipping) : "",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [paymentInstructions, setPaymentInstructions] = useState(
    existing?.paymentInstructions ?? defaults?.paymentInstructions ?? "",
  );
  const [items, setItems] = useState<EditableItem[]>(
    existing?.lineItems.map((item) => ({
      ...blankItem(item.kind),
      ...item,
      code: item.code ?? "",
      category: item.category ?? "",
      metal: item.metal ?? "",
      metalWeight: item.metalWeight ?? "",
      diamondCarats: item.diamondCarats ?? "",
      grossWeight: item.grossWeight ?? "",
      shape: item.shape ?? "",
      color: item.color ?? "",
      clarity: item.clarity ?? "",
      cutPolishSymmetry: item.cutPolishSymmetry ?? "",
      certificateNumber: item.certificateNumber ?? "",
      quantity: String(item.quantity),
      unitPrice: dollars(item.unitPrice),
    })) ?? [blankItem()],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.unitPrice) || 0);
      return sum + qty * price;
    }, 0);
    const tax = kind === "invoice" ? subtotal * Math.max(0, Number(taxRate) || 0) / 100 : 0;
    const ship = kind === "invoice" ? Math.max(0, Number(shipping) || 0) : 0;
    return { subtotal, tax, shipping: ship, total: subtotal + tax + ship };
  }, [items, kind, shipping, taxRate]);

  function changeKind(next: DocumentKind) {
    if (existing) return;
    setKind(next);
    setTerms(next === "memo" ? "15 days" : "Due on receipt");
    setDueDate(dateAfter(next === "memo" ? 15 : 0));
  }

  function updateItem(index: number, patch: Partial<EditableItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = existing
        ? `/api/admin/documents/${encodeURIComponent(existing.number)}`
        : "/api/admin/documents";
      const response = await fetch(endpoint, {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          customer,
          issueDate,
          dueDate,
          terms,
          taxRate,
          shipping,
          notes,
          paymentInstructions,
          lineItems: items,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        document?: BusinessDocument;
        error?: string;
      };
      if (!response.ok || !result.document) {
        throw new Error(result.error ?? "Could not save document.");
      }
      router.push(`/admin/invoices/${encodeURIComponent(result.document.number)}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save document.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.composer} onSubmit={submit}>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Document</h2>
        </div>
        <div className={styles.grid3}>
          <label className={admin.field}>
            <span className={admin.label}>Type</span>
            <select className={admin.select} value={kind} onChange={(event) => changeKind(event.target.value as DocumentKind)} disabled={Boolean(existing)}>
              <option value="invoice">Invoice</option>
              <option value="memo">Memorandum</option>
            </select>
          </label>
          <label className={admin.field}>
            <span className={admin.label}>Issue date</span>
            <input className={admin.input} type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required />
          </label>
          <label className={admin.field}>
            <span className={admin.label}>{kind === "memo" ? "Return by" : "Due date"}</span>
            <input className={admin.input} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><h2>Customer</h2></div>
        <div className={styles.grid3}>
          <label className={admin.field}>
            <span className={admin.label}>Customer / company name</span>
            <input className={admin.input} value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} required />
          </label>
          <label className={admin.field}>
            <span className={admin.label}>Email</span>
            <input className={admin.input} type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
          </label>
          <label className={admin.field}>
            <span className={admin.label}>Phone</span>
            <input className={admin.input} type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
          </label>
        </div>
        <div className={styles.grid2} style={{ marginTop: "0.85rem" }}>
          <label className={admin.field}>
            <span className={admin.label}>Billing address</span>
            <textarea className={admin.textarea} value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
          </label>
          <label className={admin.field}>
            <span className={admin.label}>Shipping address</span>
            <textarea className={admin.textarea} value={customer.shippingAddress} onChange={(event) => setCustomer({ ...customer, shippingAddress: event.target.value })} placeholder="Leave blank when same as billing" />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Items</h2>
          <button className={`${admin.btn} ${admin.btnSmall}`} type="button" onClick={() => setItems((current) => [...current, blankItem()])}>
            Add item
          </button>
        </div>
        <div className={styles.composer}>
          {items.map((item, index) => (
            <article className={styles.lineCard} key={index}>
              <div className={styles.lineHead}>
                <strong>Item {index + 1}</strong>
                {items.length > 1 ? (
                  <button className={styles.remove} type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                ) : null}
              </div>
              <div className={styles.grid4}>
                <label className={admin.field}>
                  <span className={admin.label}>Item type</span>
                  <select className={admin.select} value={item.kind} onChange={(event) => updateItem(index, { kind: event.target.value as DocumentItemKind })}>
                    <option value="jewelry">Jewelry</option>
                    <option value="loose_stone">Loose diamond</option>
                    <option value="service">Service / other</option>
                  </select>
                </label>
                <label className={admin.field} style={{ gridColumn: "span 2" }}>
                  <span className={admin.label}>Description</span>
                  <input className={admin.input} value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} required />
                </label>
                <label className={admin.field}>
                  <span className={admin.label}>SKU / code</span>
                  <input className={admin.input} value={item.code} onChange={(event) => updateItem(index, { code: event.target.value })} />
                </label>
              </div>

              {item.kind === "jewelry" ? (
                <div className={styles.grid4} style={{ marginTop: "0.75rem" }}>
                  <label className={admin.field}><span className={admin.label}>Category</span><input className={admin.input} value={item.category} onChange={(event) => updateItem(index, { category: event.target.value })} placeholder="Ring, necklace…" /></label>
                  <label className={admin.field}><span className={admin.label}>Metal</span><input className={admin.input} value={item.metal} onChange={(event) => updateItem(index, { metal: event.target.value })} placeholder="14K white gold" /></label>
                  <label className={admin.field}><span className={admin.label}>Metal weight</span><input className={admin.input} value={item.metalWeight} onChange={(event) => updateItem(index, { metalWeight: event.target.value })} placeholder="6.118 g" /></label>
                  <label className={admin.field}><span className={admin.label}>Diamond carats</span><input className={admin.input} value={item.diamondCarats} onChange={(event) => updateItem(index, { diamondCarats: event.target.value })} placeholder="2.21 ct" /></label>
                  <label className={admin.field}><span className={admin.label}>Gross weight</span><input className={admin.input} value={item.grossWeight} onChange={(event) => updateItem(index, { grossWeight: event.target.value })} placeholder="6.56 g" /></label>
                  <label className={admin.field}><span className={admin.label}>Certificate</span><input className={admin.input} value={item.certificateNumber} onChange={(event) => updateItem(index, { certificateNumber: event.target.value })} /></label>
                </div>
              ) : item.kind === "loose_stone" ? (
                <div className={styles.grid4} style={{ marginTop: "0.75rem" }}>
                  <label className={admin.field}><span className={admin.label}>Shape</span><input className={admin.input} value={item.shape} onChange={(event) => updateItem(index, { shape: event.target.value })} /></label>
                  <label className={admin.field}><span className={admin.label}>Carat</span><input className={admin.input} value={item.diamondCarats} onChange={(event) => updateItem(index, { diamondCarats: event.target.value })} /></label>
                  <label className={admin.field}><span className={admin.label}>Color</span><input className={admin.input} value={item.color} onChange={(event) => updateItem(index, { color: event.target.value })} /></label>
                  <label className={admin.field}><span className={admin.label}>Clarity</span><input className={admin.input} value={item.clarity} onChange={(event) => updateItem(index, { clarity: event.target.value })} /></label>
                  <label className={admin.field}><span className={admin.label}>Cut · polish · symmetry</span><input className={admin.input} value={item.cutPolishSymmetry} onChange={(event) => updateItem(index, { cutPolishSymmetry: event.target.value })} /></label>
                  <label className={admin.field}><span className={admin.label}>Certificate</span><input className={admin.input} value={item.certificateNumber} onChange={(event) => updateItem(index, { certificateNumber: event.target.value })} /></label>
                </div>
              ) : null}

              <div className={styles.grid3} style={{ marginTop: "0.75rem" }}>
                <label className={admin.field}><span className={admin.label}>Quantity</span><input className={admin.input} type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} required /></label>
                <label className={admin.field}><span className={admin.label}>Unit price ($)</span><input className={admin.input} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} required /></label>
                <label className={admin.field}><span className={admin.label}>Line total</span><input className={admin.input} readOnly value={`$${((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)).toFixed(2)}`} /></label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.grid3}>
          <label className={admin.field}>
            <span className={admin.label}>Terms</span>
            <input className={admin.input} value={terms} onChange={(event) => setTerms(event.target.value)} />
          </label>
          {kind === "invoice" ? (
            <>
              <label className={admin.field}><span className={admin.label}>Sales tax (%)</span><input className={admin.input} type="number" min="0" max="100" step="0.001" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} placeholder="8.875" /></label>
              <label className={admin.field}><span className={admin.label}>Shipping ($)</span><input className={admin.input} type="number" min="0" step="0.01" value={shipping} onChange={(event) => setShipping(event.target.value)} /></label>
            </>
          ) : null}
        </div>
        <div className={styles.grid2} style={{ marginTop: "0.85rem" }}>
          <label className={admin.field}><span className={admin.label}>Notes</span><textarea className={admin.textarea} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          {kind === "invoice" ? (
            <label className={admin.field}><span className={admin.label}>Payment instructions</span><textarea className={admin.textarea} value={paymentInstructions} onChange={(event) => setPaymentInstructions(event.target.value)} placeholder="Add only approved bank, wire, check, or card instructions." /></label>
          ) : null}
        </div>
        <table className={styles.totals}>
          <tbody>
            <tr><th>Subtotal</th><td>${totals.subtotal.toFixed(2)}</td></tr>
            {kind === "invoice" && totals.tax ? <tr><th>Tax</th><td>${totals.tax.toFixed(2)}</td></tr> : null}
            {kind === "invoice" && totals.shipping ? <tr><th>Shipping</th><td>${totals.shipping.toFixed(2)}</td></tr> : null}
            <tr className={styles.grand}><th>{kind === "memo" ? "Declared value" : "Total"}</th><td>${totals.total.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </section>

      {error ? <p className={`${admin.notice} ${admin.noticeError}`} role="alert">{error}</p> : null}
      <div className={styles.submitBar}>
        <button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={busy}>
          {busy ? "Saving…" : existing ? `Save ${existing.number}` : `Create ${kind === "memo" ? "memorandum" : "invoice"}`}
        </button>
      </div>
    </form>
  );
}
