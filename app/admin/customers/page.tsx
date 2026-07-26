import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listCustomers, listOrders } from "@/lib/admin/orders";
import { formatMoney } from "@/lib/admin/order-shared";
import { CustomersClient } from "@/components/admin/CustomersClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [customers, orders] = await Promise.all([listCustomers().catch(() => []), listOrders().catch(() => [])]);
  const lifetime = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  return (
    <>
      <header className={styles.pageHead}><div><h1 className={styles.pageTitle}>Customers</h1><p className={styles.pageSub}>Contact details, purchase history, lifetime value, and private notes.</p></div></header>
      <TileGrid>
        <StatTile label="Customers" value={customers.length} />
        <StatTile label="Lifetime sales" value={formatMoney(lifetime)} tone="gold" />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}><CustomersClient customers={customers} orders={orders} /></section>
    </>
  );
}
