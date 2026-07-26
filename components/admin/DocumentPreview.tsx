import { brand } from "@/data/site";
import type { BusinessDocument } from "@/lib/admin/documents";
import { formatDocumentDate, formatUsd, lineTotal } from "@/lib/admin/document-math";
import styles from "./documents.module.css";

function details(item: BusinessDocument["lineItems"][number]) {
  return [
    item.code ? `Code ${item.code}` : "",
    item.category ?? "",
    item.metal ?? "",
    item.metalWeight ? `Metal wt ${item.metalWeight}` : "",
    item.diamondCarats ? `Diamond ${item.diamondCarats}` : "",
    item.grossWeight ? `Gross wt ${item.grossWeight}` : "",
    item.shape ?? "",
    item.color ? `Color ${item.color}` : "",
    item.clarity ? `Clarity ${item.clarity}` : "",
    item.cutPolishSymmetry ? `Cut/Polish/Sym ${item.cutPolishSymmetry}` : "",
    item.certificateNumber ? `Certificate ${item.certificateNumber}` : "",
  ].filter(Boolean).join(" · ");
}

export function DocumentPreview({ document }: { document: BusinessDocument }) {
  const issuer = document.issuer ?? {
    displayName: brand.name,
    tagline: brand.tagline,
    address: brand.address,
    phone: brand.phone,
  };
  return (
    <article className={styles.preview}>
      <header className={styles.previewHeader}>
        <div>
          <div className={styles.previewBrand}>{issuer.displayName.toUpperCase()}</div>
          <div className={styles.previewTag}>{issuer.tagline}</div>
        </div>
        <div className={styles.previewTitle}>
          <h1>{document.kind === "memo" ? "Memorandum" : "Invoice"}</h1>
          <p>{document.number}</p>
        </div>
      </header>

      <div className={styles.previewMeta}>
        <div>
          <span>Bill to</span>
          <strong>{document.customer.name}</strong>
          <small>{document.customer.address || "No billing address"}<br />{[document.customer.phone, document.customer.email].filter(Boolean).join(" · ")}</small>
        </div>
        <div>
          <span>{document.kind === "memo" ? "Return by" : "Due date"}</span>
          <strong>{formatDocumentDate(document.dueDate)}</strong>
          <small>Issued {formatDocumentDate(document.issueDate)} · {document.terms}</small>
        </div>
      </div>

      <table className={styles.previewTable}>
        <thead>
          <tr><th>#</th><th>Item details</th><th>Qty</th><th>Unit</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {document.lineItems.map((item, index) => (
            <tr key={`${item.code ?? item.description}-${index}`}>
              <td>{index + 1}</td>
              <td><strong>{item.description}</strong><small>{details(item)}</small></td>
              <td>{item.quantity}</td>
              <td>{formatUsd(item.unitPrice)}</td>
              <td>{formatUsd(lineTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className={styles.totals} style={{ marginTop: "1rem" }}>
        <tbody>
          <tr><th>Subtotal</th><td>{formatUsd(document.subtotal)}</td></tr>
          {document.taxAmount ? <tr><th>Sales tax ({document.taxRate}%)</th><td>{formatUsd(document.taxAmount)}</td></tr> : null}
          {document.shipping ? <tr><th>Shipping</th><td>{formatUsd(document.shipping)}</td></tr> : null}
          <tr className={styles.grand}><th>{document.kind === "memo" ? "Declared value" : "Amount due"}</th><td>{formatUsd(document.total)}</td></tr>
        </tbody>
      </table>

      <p style={{ margin: "2rem 0 0", color: "#6d6257", fontSize: "0.75rem", lineHeight: 1.7 }}>
        {document.notes || `${issuer.displayName} · ${issuer.address} · ${issuer.phone}`}
      </p>
    </article>
  );
}
