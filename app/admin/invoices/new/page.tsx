import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminSettings } from "@/lib/admin/settings";
import { DocumentComposer } from "@/components/admin/DocumentComposer";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage({ searchParams }: { searchParams: { kind?: string } }) {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const kind = searchParams.kind === "memo" ? "memo" : "invoice";
  const settings = await getAdminSettings();
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>New {kind === "memo" ? "memorandum" : "invoice"}</h1>
          <p className={styles.pageSub}>Document number is assigned automatically when saved.</p>
        </div>
      </header>
      <DocumentComposer
        defaultKind={kind}
        defaults={{
          taxRate: settings.defaultTaxRate,
          shipping: settings.defaultShipping,
          paymentInstructions: settings.defaultPaymentInstructions,
        }}
      />
    </>
  );
}
