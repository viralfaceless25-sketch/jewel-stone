import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listOrders } from "@/lib/admin/orders";
import { formatMoney } from "@/lib/admin/order-shared";
import { OrdersClient } from "@/components/admin/OrdersClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const orders = await listOrders().catch(() => []);
  const revenue = orders.filter((order) => order.status !== "refunded" && order.status !== "cancelled").reduce((sum, order) => sum + order.amountTotal, 0);
  const open = orders.filter((order) => !["delivered", "refunded", "cancelled"].includes(order.status)).length;
  return (
    <>
      <header className={styles.pageHead}><div><h1 className={styles.pageTitle}>Orders</h1><p className={styles.pageSub}>Paid website orders, fulfillment, tracking, and refunds.</p></div></header>
      <TileGrid>
        <StatTile label="Total orders" value={orders.length} />
        <StatTile label="Open fulfillment" value={open} tone={open ? "warn" : "good"} />
        <StatTile label="Recorded revenue" value={formatMoney(revenue)} tone="gold" />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}><OrdersClient orders={orders} /></section>
    </>
  );
}

