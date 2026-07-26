import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getDocument } from "@/lib/admin/documents";
import { statusLabel } from "@/lib/admin/document-math";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { DocumentPreview } from "@/components/admin/DocumentPreview";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: { number: string } }) {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const document = await getDocument(params.number);
  if (!document) notFound();
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <p style={{ margin: "0 0 0.35rem" }}><Link href="/admin/invoices">← All documents</Link></p>
          <h1 className={styles.pageTitle}>{document.number}</h1>
          <p className={styles.pageSub}>{document.kind === "memo" ? "Memorandum" : "Invoice"} · {statusLabel(document.status)}</p>
        </div>
      </header>
      <DocumentActions document={document} />
      <div style={{ marginTop: "1.2rem" }}>
        <DocumentPreview document={document} />
      </div>
    </>
  );
}

