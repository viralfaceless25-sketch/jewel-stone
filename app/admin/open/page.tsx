import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listDocuments } from "@/lib/admin/documents";
import { formatDocumentDate, formatUsd } from "@/lib/admin/document-math";
import { isDocumentOverdue } from "@/lib/admin/terms";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

function byDueDate(a: { dueDate?: string }, b: { dueDate?: string }) {
  return (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99");
}

export default async function OpenItemsPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const documents = await listDocuments().catch(() => []);
  const openMemos = documents
    .filter((document) => document.kind === "memo" && document.status === "sent")
    .sort(byDueDate);
  const openInvoices = documents
    .filter((document) => document.kind === "invoice" && document.status === "sent")
    .sort(byDueDate);
  const openInvoiceTotal = openInvoices.reduce((sum, document) => sum + document.total, 0);
  const overdueCount =
    openMemos.filter((d) => isDocumentOverdue(d.dueDate, d.status)).length +
    openInvoices.filter((d) => isDocumentOverdue(d.dueDate, d.status)).length;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Open items</h1>
          <p className={styles.pageSub}>Memos still out and invoices still unpaid, soonest due first.</p>
        </div>
      </header>

      <TileGrid>
        <StatTile label="Open memos" value={openMemos.length} tone={openMemos.length ? "warn" : "good"} />
        <StatTile label="Open invoices" value={openInvoices.length} tone={openInvoices.length ? "warn" : "good"} />
        <StatTile label="Open invoice total" value={formatUsd(openInvoiceTotal)} tone={openInvoiceTotal ? "warn" : "good"} />
        <StatTile label="Overdue" value={overdueCount} tone={overdueCount ? "bad" : "good"} />
      </TileGrid>

      <section className={styles.panel} style={{ marginTop: "1.2rem" }}>
        <h2 className={styles.sectionTitle}>Open memos</h2>
        <p className={styles.pageSub} style={{ margin: "0 0 .8rem" }}>Goods out on approval, not yet returned or invoiced.</p>
        {openMemos.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Number</th><th>Customer</th><th>Contents</th><th>Issued</th><th>Due back</th><th /></tr></thead>
              <tbody>
                {openMemos.map((document) => {
                  const overdue = isDocumentOverdue(document.dueDate, document.status);
                  return (
                    <tr key={document.number}>
                      <td data-label="Number"><strong>{document.number}</strong></td>
                      <td data-label="Customer">{document.customer.name}<br /><small>{document.customer.email}</small></td>
                      <td data-label="Contents">{document.lineItems.map((item) => item.description).join(", ") || "-"}</td>
                      <td data-label="Issued">{formatDocumentDate(document.issueDate)}</td>
                      <td data-label="Due back">
                        <span className={`${styles.badge} ${overdue ? styles.badgeBad : styles.badgeWarn}`}>
                          {document.dueDate ? formatDocumentDate(document.dueDate) : "-"}{overdue ? " · overdue" : ""}
                        </span>
                      </td>
                      <td data-label="Action"><Link className={`${styles.btn} ${styles.btnSmall}`} href={`/admin/invoices/${encodeURIComponent(document.number)}`}>Open</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>No memos currently out.</div>
        )}
      </section>

      <section className={styles.panel} style={{ marginTop: "1.2rem" }}>
        <h2 className={styles.sectionTitle}>Open invoices</h2>
        <p className={styles.pageSub} style={{ margin: "0 0 .8rem" }}>Sent, unpaid — due date follows the customer&rsquo;s payment terms.</p>
        {openInvoices.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Number</th><th>Customer</th><th>Issued</th><th>Due</th><th>Amount</th><th /></tr></thead>
              <tbody>
                {openInvoices.map((document) => {
                  const overdue = isDocumentOverdue(document.dueDate, document.status);
                  return (
                    <tr key={document.number}>
                      <td data-label="Number"><strong>{document.number}</strong></td>
                      <td data-label="Customer">{document.customer.name}<br /><small>{document.customer.email}</small></td>
                      <td data-label="Issued">{formatDocumentDate(document.issueDate)}</td>
                      <td data-label="Due">
                        <span className={`${styles.badge} ${overdue ? styles.badgeBad : styles.badgeWarn}`}>
                          {document.dueDate ? formatDocumentDate(document.dueDate) : "-"}{overdue ? " · overdue" : ""}
                        </span>
                      </td>
                      <td data-label="Amount">{formatUsd(document.total)}</td>
                      <td data-label="Action"><Link className={`${styles.btn} ${styles.btnSmall}`} href={`/admin/invoices/${encodeURIComponent(document.number)}`}>Open</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>No invoices currently due.</div>
        )}
      </section>
    </>
  );
}
