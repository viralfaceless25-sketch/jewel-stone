import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminSettings } from "@/lib/admin/settings";
import { DocumentComposer } from "@/components/admin/DocumentComposer";
import { customerOptions, productOptions } from "@/lib/admin/document-lookups";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage({ searchParams }: { searchParams: { kind?: string } }) {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const kind = searchParams.kind === "memo" ? "memo" : "invoice";
  const [settings, customers, products] = await Promise.all([
    getAdminSettings(),
    customerOptions().catch(() => []),
    productOptions().catch(() => []),
  ]);
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>New {kind === "memo" ? "memorandum" : "invoice"}</h1>
          <p className={styles.pageSub}>Document number is assigned automatically when saved.</p>
        </div>
      </header>
      <DocumentComposer
        customers={customers}
        productOptions={products}
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
