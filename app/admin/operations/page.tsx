import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listActivity } from "@/lib/admin/activity";
import { listPaymentLinks } from "@/lib/admin/payment-links";
import { listServiceTickets } from "@/lib/admin/service-tickets";
import { OperationsClient } from "@/components/admin/OperationsClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [tickets, paymentLinks, activity] = await Promise.all([
    listServiceTickets().catch(() => []),
    listPaymentLinks().catch(() => []),
    listActivity().catch(() => []),
  ]);
  const open = tickets.filter((ticket) => !["completed", "cancelled"].includes(ticket.status)).length;
  return (
    <>
      <header className={styles.pageHead}>
        <div><h1 className={styles.pageTitle}>Operations</h1><p className={styles.pageSub}>Repairs, service work, off-site payments, and owner-panel history.</p></div>
      </header>
      <TileGrid>
        <StatTile label="Open service tickets" value={open} tone={open ? "warn" : "good"} />
        <StatTile label="Payment links" value={paymentLinks.length} tone="gold" />
        <StatTile label="Recorded changes" value={activity.length} />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}>
        <OperationsClient tickets={tickets} paymentLinks={paymentLinks} activity={activity} />
      </section>
    </>
  );
}
