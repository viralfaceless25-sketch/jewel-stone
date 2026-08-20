import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listCustomers, listOrders } from "@/lib/admin/orders";
import { listKyc } from "@/lib/admin/kyc";
import { formatMoney } from "@/lib/admin/order-shared";
import { CustomersClient } from "@/components/admin/CustomersClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [customers, orders, kycRecords] = await Promise.all([
    listCustomers().catch(() => []),
    listOrders().catch(() => []),
    listKyc().catch(() => []),
  ]);
  const lifetime = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const kycByEmail = Object.fromEntries(kycRecords.map((record) => [record.email.toLowerCase(), record.status]));
  return (
    <>
      <header className={styles.pageHead}><div><h1 className={styles.pageTitle}>Customers</h1><p className={styles.pageSub}>Contact details, purchase history, trading terms, KYC status, and private notes.</p></div></header>
      <TileGrid>
        <StatTile label="Customers" value={customers.length} />
        <StatTile label="Lifetime sales" value={formatMoney(lifetime)} tone="gold" />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}><CustomersClient customers={customers} orders={orders} kycByEmail={kycByEmail} /></section>
    </>
  );
}
