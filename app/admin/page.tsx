import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listInventory } from "@/lib/admin/inventory";
import { listCustomers, listOrders } from "@/lib/admin/orders";
import { listDocuments } from "@/lib/admin/documents";
import { formatMoney } from "@/lib/admin/order-shared";
import { StatTile, TileGrid } from "./StatTile";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [inventory, orders, customers, documents] = await Promise.all([
    listInventory().catch(() => []),
    listOrders().catch(() => []),
    listCustomers().catch(() => []),
    listDocuments().catch(() => []),
  ]);
  const soldOut = inventory.filter((row) => row.stock <= 0).length;
  const openOrders = orders.filter((order) => !["delivered", "refunded", "cancelled"].includes(order.status)).length;
  const revenue = orders.filter((order) => !["refunded", "cancelled"].includes(order.status)).reduce((sum, order) => sum + order.amountTotal, 0);
  const drafts = documents.filter((document) => document.status === "draft").length;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSub}>Jewel Stone operations at a glance.</p>
        </div>
        <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/admin/invoices/new">Create invoice</Link>
      </header>
      <TileGrid>
        <StatTile label="Products" value={inventory.length} href="/admin/inventory" />
        <StatTile label="Sold out" value={soldOut} tone={soldOut ? "warn" : "good"} href="/admin/inventory" />
        <StatTile label="Open orders" value={openOrders} tone={openOrders ? "warn" : "good"} href="/admin/orders" />
        <StatTile label="Recorded revenue" value={formatMoney(revenue)} tone="gold" href="/admin/orders" />
        <StatTile label="Customers" value={customers.length} href="/admin/customers" />
        <StatTile label="Document drafts" value={drafts} tone={drafts ? "warn" : "good"} href="/admin/invoices" />
      </TileGrid>
      <section className={`${styles.panel} ${styles.panelPad}`} style={{ marginTop: "1.2rem" }}>
        <h2 className={styles.sectionTitle}>Quick actions</h2>
        <div className={styles.actions}>
          <Link className={styles.btn} href="/admin/inventory">Update inventory</Link>
          <Link className={styles.btn} href="/admin/orders">Fulfill orders</Link>
          <Link className={styles.btn} href="/admin/invoices/new?kind=invoice">New invoice</Link>
          <Link className={styles.btn} href="/admin/invoices/new?kind=memo">New memo</Link>
        </div>
      </section>
    </>
  );
}
