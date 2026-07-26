import type { Metadata } from "next";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminNav } from "./AdminNav";
import { SignIn } from "./SignIn";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: { default: "Owner panel", template: "%s | Jewel Stone Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = isAdminAuthenticated();
  return (
    <div className={`${styles.adminRoot} admin-root`}>
      {authenticated ? (
        <div className={styles.shell}>
          <AdminNav />
          <main className={styles.main}>{children}</main>
        </div>
      ) : (
        <SignIn configured={adminConfigured()} />
      )}
    </div>
  );
}
