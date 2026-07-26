import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getDocument } from "@/lib/admin/documents";
import { DocumentComposer } from "@/components/admin/DocumentComposer";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({ params }: { params: { number: string } }) {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const document = await getDocument(params.number);
  if (!document) notFound();
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Edit {document.number}</h1>
          <p className={styles.pageSub}>Number and document type stay fixed for a clean paper trail.</p>
        </div>
      </header>
      <DocumentComposer defaultKind={document.kind} existing={document} />
    </>
  );
}
