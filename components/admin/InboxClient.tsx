"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentRecord, InquiryRecord } from "@/lib/admin/leads";
import type { CustomRequestRecord } from "@/lib/custom-request-types";
import admin from "@/app/admin/admin.module.css";

export function InboxClient({
  customRequests,
  appointments,
  inquiries,
}: {
  customRequests: CustomRequestRecord[];
  appointments: AppointmentRecord[];
  inquiries: InquiryRecord[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"custom" | "appointments" | "inquiries">("custom");
  const [busy, setBusy] = useState("");
  const emptyMessage = tab === "custom"
    ? (!customRequests.length ? "No custom requests yet." : "")
    : tab === "appointments"
      ? (!appointments.length ? "No appointment requests yet." : "")
      : (!inquiries.length ? "No customer messages yet." : "");

  async function update(type: "appointment" | "inquiry", id: string, status: string) {
    setBusy(id);
    await fetch(`/api/admin/leads/${type}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy("");
    router.refresh();
  }

  async function remove(type: "appointment" | "inquiry" | "custom", id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    setBusy(id);
    const url = type === "custom"
      ? `/api/admin/inbox/custom-requests/${encodeURIComponent(id)}`
      : `/api/admin/leads/${type}/${encodeURIComponent(id)}`;
    await fetch(url, { method: "DELETE" });
    setBusy("");
    router.refresh();
  }

  return (
    <>
      <div className={admin.actions} style={{ marginBottom: "1rem" }}>
        <button className={`${admin.btn} ${tab === "custom" ? admin.btnPrimary : ""}`} type="button" onClick={() => setTab("custom")}>Custom requests ({customRequests.length})</button>
        <button className={`${admin.btn} ${tab === "appointments" ? admin.btnPrimary : ""}`} type="button" onClick={() => setTab("appointments")}>Appointments ({appointments.length})</button>
        <button className={`${admin.btn} ${tab === "inquiries" ? admin.btnPrimary : ""}`} type="button" onClick={() => setTab("inquiries")}>Messages ({inquiries.length})</button>
      </div>
      <section className={admin.panel}>
        {emptyMessage ? <div className={admin.empty}>{emptyMessage}</div> : <div className={admin.tableWrap}>
          {tab === "custom" ? (
            <table className={admin.table}>
              <thead><tr><th>Date</th><th>Customer</th><th>Design</th><th>Status</th><th /><th /></tr></thead>
              <tbody>{customRequests.map((request) => (
                <tr key={request.id}>
                  <td data-label="Date">{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td data-label="Customer"><strong>{request.name}</strong><br /><small>{request.email} · {request.phone}</small></td>
                  <td data-label="Design">{request.choices.type}<br /><small>{request.choices.metal} · {request.choices.shape} · {request.choices.origin} · {request.choices.budget}</small></td>
                  <td data-label="Status"><span className={`${admin.badge} ${request.status === "awaiting_quote" ? admin.badgeWarn : admin.badgeGood}`}>{request.status.replaceAll("_", " ")}</span></td>
                  <td data-label="Portal"><a className={`${admin.btn} ${admin.btnSmall}`} href={`/custom/owner/${request.ownerToken}`} target="_blank">Open quote portal</a></td>
                  <td data-label="Action"><button className={`${admin.btn} ${admin.btnSmall} ${admin.btnDanger}`} type="button" onClick={() => remove("custom", request.id, request.name)} disabled={busy === request.id}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          ) : tab === "appointments" ? (
            <table className={admin.table}>
              <thead><tr><th>Requested</th><th>Customer</th><th>Interest</th><th>Status</th><th /></tr></thead>
              <tbody>{appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td data-label="Requested">{appointment.requestedDate} {appointment.requestedTime}</td>
                  <td data-label="Customer"><strong>{appointment.name}</strong><br /><small>{appointment.email} · {appointment.phone}</small></td>
                  <td data-label="Interest">{appointment.interest}<br /><small>{appointment.notes}</small></td>
                  <td data-label="Status"><select className={admin.select} value={appointment.status} onChange={(event) => update("appointment", appointment.id, event.target.value)} disabled={busy === appointment.id}>{["new", "confirmed", "completed", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td data-label="Action"><button className={`${admin.btn} ${admin.btnSmall} ${admin.btnDanger}`} type="button" onClick={() => remove("appointment", appointment.id, appointment.name)} disabled={busy === appointment.id}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className={admin.table}>
              <thead><tr><th>Date</th><th>Customer</th><th>Message</th><th>Status</th><th /></tr></thead>
              <tbody>{inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td data-label="Date">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                  <td data-label="Customer"><strong>{inquiry.name}</strong><br /><small>{inquiry.email} · {inquiry.phone}</small></td>
                  <td data-label="Message">{inquiry.context}<br /><small>{inquiry.message}</small></td>
                  <td data-label="Status"><select className={admin.select} value={inquiry.status} onChange={(event) => update("inquiry", inquiry.id, event.target.value)} disabled={busy === inquiry.id}>{["new", "contacted", "closed"].map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td data-label="Action"><button className={`${admin.btn} ${admin.btnSmall} ${admin.btnDanger}`} type="button" onClick={() => remove("inquiry", inquiry.id, inquiry.name)} disabled={busy === inquiry.id}>Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>}
      </section>
    </>
  );
}
