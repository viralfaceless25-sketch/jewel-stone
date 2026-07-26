import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminSettings } from "@/lib/admin/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  return (
    <>
      <header className={styles.pageHead}><div><h1 className={styles.pageTitle}>Settings</h1><p className={styles.pageSub}>Business identity and defaults used on newly created invoices and memos.</p></div></header>
      <SettingsForm initial={await getAdminSettings()} />
    </>
  );
}
