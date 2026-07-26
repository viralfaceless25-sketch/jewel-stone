import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listDocuments } from "@/lib/admin/documents";
import { formatDocumentDate, formatUsd, statusLabel } from "@/lib/admin/document-math";
import { StatTile, TileGrid } from "../StatTile";
import { DocumentsExportButton } from "@/components/admin/DocumentsExportButton";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const documents = await listDocuments().catch(() => []);
  const invoices = documents.filter((document) => document.kind === "invoice");
  const memos = documents.filter((document) => document.kind === "memo");
  const open = documents.filter((document) => document.status === "draft" || document.status === "sent");

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Invoices & memos</h1>
          <p className={styles.pageSub}>Create, save, email, edit, and track every issued document.</p>
        </div>
        <div className={styles.actions}>
          <DocumentsExportButton documents={documents} />
          <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/admin/invoices/new?kind=invoice">New invoice</Link>
          <Link className={styles.btn} href="/admin/invoices/new?kind=memo">New memo</Link>
        </div>
      </header>

      <TileGrid>
        <StatTile label="Invoices" value={invoices.length} tone="gold" />
        <StatTile label="Memos" value={memos.length} />
        <StatTile label="Open documents" value={open.length} tone={open.length ? "warn" : "good"} />
      </TileGrid>

      <section className={styles.panel} style={{ marginTop: "1.2rem" }}>
        {documents.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Number</th><th>Customer</th><th>Issued</th><th>Type</th><th>Status</th><th>Total</th><th /></tr></thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.number}>
                    <td><strong>{document.number}</strong></td>
                    <td>{document.customer.name}<br /><small>{document.customer.email}</small></td>
                    <td>{formatDocumentDate(document.issueDate)}</td>
                    <td>{document.kind === "memo" ? "Memorandum" : "Invoice"}</td>
                    <td><span className={`${styles.badge} ${document.status === "paid" || document.status === "returned" ? styles.badgeGood : document.status === "void" ? styles.badgeBad : styles.badgeWarn}`}>{statusLabel(document.status)}</span></td>
                    <td>{formatUsd(document.total)}</td>
                    <td><Link className={`${styles.btn} ${styles.btnSmall}`} href={`/admin/invoices/${encodeURIComponent(document.number)}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>No documents yet. Create an invoice or memorandum.</div>
        )}
      </section>
    </>
  );
}
