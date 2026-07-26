import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listAppointments, listInquiries } from "@/lib/admin/leads";
import { listCustomRequests } from "@/lib/custom-request-store";
import { InboxClient } from "@/components/admin/InboxClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [customRequests, appointments, inquiries] = await Promise.all([
    listCustomRequests().catch(() => []),
    listAppointments().catch(() => []),
    listInquiries().catch(() => []),
  ]);
  const newCount =
    customRequests.filter((request) => request.status === "awaiting_quote").length +
    appointments.filter((appointment) => appointment.status === "new").length +
    inquiries.filter((inquiry) => inquiry.status === "new").length;
  return (
    <>
      <header className={styles.pageHead}><div><h1 className={styles.pageTitle}>Inbox</h1><p className={styles.pageSub}>Quotation requests, appointments, and website messages in one place.</p></div></header>
      <TileGrid>
        <StatTile label="Needs attention" value={newCount} tone={newCount ? "warn" : "good"} />
        <StatTile label="Custom requests" value={customRequests.length} />
        <StatTile label="Appointments" value={appointments.length} />
        <StatTile label="Messages" value={inquiries.length} />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}><InboxClient customRequests={customRequests} appointments={appointments} inquiries={inquiries} /></section>
    </>
  );
}
