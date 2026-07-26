import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/orders";
import { listKyc } from "@/lib/admin/kyc";
import { listAccounts } from "@/lib/account/customer-auth";
import { KycClient } from "@/components/admin/KycClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [customers, records, accounts] = await Promise.all([
    listCustomers().catch(() => []),
    listKyc().catch(() => []),
    listAccounts().catch(() => []),
  ]);
  const approved = records.filter((record) => record.status === "approved").length;
  const pending = records.filter((record) => record.status === "sent" || record.status === "received").length;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>KYC</h1>
          <p className={styles.pageSub}>
            Send the Jewel Stone KYC form, collect the signed copy and two proofs of identity,
            then approve the account before goods go out on memo.
          </p>
        </div>
      </header>
      <TileGrid>
        <StatTile label="Approved" value={approved} tone="gold" />
        <StatTile label="Awaiting paperwork" value={pending} />
        <StatTile label="Records" value={records.length} />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}>
        <KycClient
          customers={customers.map((customer) => ({ name: customer.name, email: customer.email, phone: customer.phone }))}
          initialRecords={records}
          initialAccounts={accounts.map((account) => ({
            email: account.email,
            phone: account.phone,
            name: account.name,
            disabled: account.disabled,
            ...(account.lastLoginAt ? { lastLoginAt: account.lastLoginAt } : {}),
          }))}
        />
      </section>
    </>
  );
}
