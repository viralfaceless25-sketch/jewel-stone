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

function sameAddress(left: string, right: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return Boolean(left.trim() && right.trim() && normalize(left) === normalize(right));
}

export function DocumentPreview({ document }: { document: BusinessDocument }) {
  const issuer = document.issuer ?? {
    displayName: brand.name,
    legalName: brand.name,
    tagline: brand.tagline,
    address: brand.address,
    phone: brand.phone,
    email: brand.email,
    website: brand.website,
  };
  const heading = document.kind === "memo" ? "Memorandum" : "Invoice";
  const dueLabel = document.kind === "memo" ? "Return by" : "Due date";
  const shippingAddress =
    !document.customer.shippingAddress.trim() ||
    sameAddress(document.customer.address, document.customer.shippingAddress)
      ? "Same as billing address"
      : document.customer.shippingAddress;
  const terms =
    document.kind === "memo"
      ? `Goods are supplied for examination and approval only and remain the property of ${issuer.displayName} until invoiced.`
      : "Payment is subject to the terms shown above. Jewelry and diamond specifications should be read with any accompanying certificates or product records.";

  return (
    <article className={styles.preview}>
      <div className={styles.previewTopRule} />
      <header className={styles.previewHeader}>
        <div>
          <div className={styles.previewBrand}>{issuer.displayName}</div>
          <div className={styles.previewTag}>{issuer.tagline}</div>
        </div>
        <div className={styles.previewTitle}>
          <h1>{heading}</h1>
          <p>{document.number}</p>
          <small>{document.kind === "memo" ? "Goods on approval" : "Commercial document"}</small>
        </div>
      </header>

      <div className={styles.previewIssuer}>
        <strong>{issuer.legalName ?? issuer.displayName}</strong>
        <span>{issuer.address}</span>
        <span>{[issuer.phone, issuer.email, issuer.website].filter(Boolean).join(" · ")}</span>
      </div>

      <div className={styles.previewMetaStrip}>
        <div><span>Issued</span><strong>{formatDocumentDate(document.issueDate)}</strong></div>
        <div><span>{dueLabel}</span><strong>{formatDocumentDate(document.dueDate)}</strong></div>
        <div><span>Terms</span><strong>{document.terms}</strong></div>
        <div><span>Status</span><strong>{document.status.toUpperCase()}</strong></div>
      </div>

      <div className={styles.previewParties}>
        <div>
          <span>Bill to</span>
          <strong>{document.customer.name}</strong>
          <small>{document.customer.address || "No billing address"}<br />{[document.customer.phone, document.customer.email].filter(Boolean).join(" · ")}</small>
        </div>
        <div>
          <span>Ship to</span>
          <strong>{document.customer.name}</strong>
          <small>{shippingAddress}</small>
        </div>
      </div>

      <div className={styles.previewTableWrap}>
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
      </div>

      <div className={styles.previewTotals}>
        <div className={styles.previewTotalsHead}><span>Financial summary</span><small>USD</small></div>
        <table className={styles.totals}>
          <tbody>
            <tr><th>Subtotal</th><td>{formatUsd(document.subtotal)}</td></tr>
            {document.taxAmount ? <tr><th>Sales tax ({document.taxRate}%)</th><td>{formatUsd(document.taxAmount)}</td></tr> : null}
            {document.shipping ? <tr><th>Shipping</th><td>{formatUsd(document.shipping)}</td></tr> : null}
          </tbody>
        </table>
        <div className={styles.previewGrand}>
          <span>{document.kind === "memo" ? "Declared value" : "Amount due"}</span>
          <strong>{formatUsd(document.total)}</strong>
        </div>
      </div>

      <div className={styles.previewSupport}>
        {document.notes ? <section><span>Notes</span><p>{document.notes}</p></section> : null}
        {document.kind === "invoice" && document.paymentInstructions ? (
          <section><span>Payment instructions</span><p>{document.paymentInstructions}</p></section>
        ) : null}
        <section><span>{document.kind === "memo" ? "Memorandum terms" : "Terms"}</span><p>{terms}</p></section>
      </div>

      <div className={styles.previewSignatures}>
        <span>Authorized signature / date</span>
        <span>{document.kind === "memo" ? "Customer acceptance / date" : "Customer receipt / date"}</span>
      </div>

      <footer className={styles.previewFooter}>
        <span>{issuer.displayName} · {issuer.address} · {issuer.phone}</span>
        <span>{document.number}</span>
      </footer>
    </article>
  );
}
