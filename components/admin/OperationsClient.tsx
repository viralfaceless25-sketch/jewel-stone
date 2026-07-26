"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import admin from "@/app/admin/admin.module.css";
import records from "./records.module.css";
import {
  SERVICE_STATUSES,
  SERVICE_STATUS_LABELS,
  type ServiceStatus,
  type ServiceTicket,
} from "@/lib/admin/service-shared";
import type { PaymentLinkRecord } from "@/lib/admin/payment-links";
import type { ActivityRecord } from "@/lib/admin/activity";
import { formatMoney } from "@/lib/admin/order-shared";

const today = () => new Date().toISOString().slice(0, 10);
const shortDate = (value: string) => new Date(value).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type TicketForm = {
  customerName: string;
  email: string;
  phone: string;
  item: string;
  service: string;
  intakeDate: string;
  dueDate: string;
  estimatedCost: string;
  status: ServiceStatus;
  notes: string;
};

const blankTicket: TicketForm = {
  customerName: "",
  email: "",
  phone: "",
  item: "",
  service: "",
  intakeDate: today(),
  dueDate: "",
  estimatedCost: "",
  status: "received",
  notes: "",
};

export function OperationsClient({
  tickets,
  paymentLinks,
  activity,
}: {
  tickets: ServiceTicket[];
  paymentLinks: PaymentLinkRecord[];
  activity: ActivityRecord[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"repairs" | "payments" | "activity">("repairs");
  const [ticket, setTicket] = useState<TicketForm>(blankTicket);
  const [selectedId, setSelectedId] = useState("");
  const [payment, setPayment] = useState({ customerName: "", email: "", description: "", amount: "" });
  const [createdUrl, setCreatedUrl] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filteredTickets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? tickets.filter((item) => [item.id, item.customerName, item.email, item.phone, item.item, item.service]
          .some((value) => value.toLowerCase().includes(needle)))
      : tickets;
  }, [tickets, query]);

  function choose(item: ServiceTicket) {
    setSelectedId(item.id);
    setTicket({
      customerName: item.customerName,
      email: item.email,
      phone: item.phone,
      item: item.item,
      service: item.service,
      intakeDate: item.intakeDate,
      dueDate: item.dueDate,
      estimatedCost: (item.estimatedCost / 100).toFixed(2),
      status: item.status,
      notes: item.notes,
    });
    setError("");
    setNotice("");
  }

  function newTicket() {
    setSelectedId("");
    setTicket({ ...blankTicket, intakeDate: today() });
    setError("");
    setNotice("");
  }

  async function saveTicket(event: FormEvent) {
    event.preventDefault();
    setBusy("ticket");
    setError("");
    setNotice("");
    try {
      const response = await fetch(selectedId ? `/api/admin/services/${encodeURIComponent(selectedId)}` : "/api/admin/services", {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ticket, estimatedCost: Math.round((Number(ticket.estimatedCost) || 0) * 100) }),
      });
      const body = (await response.json().catch(() => ({}))) as { ticket?: ServiceTicket; error?: string };
      if (!response.ok || !body.ticket) throw new Error(body.error ?? "Could not save ticket.");
      setSelectedId(body.ticket.id);
      setNotice(`${body.ticket.id} saved.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save ticket.");
    } finally {
      setBusy("");
    }
  }

  async function createPayment(event: FormEvent) {
    event.preventDefault();
    setBusy("payment");
    setError("");
    setNotice("");
    setCreatedUrl("");
    try {
      const response = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
      const body = (await response.json().catch(() => ({}))) as { link?: PaymentLinkRecord; error?: string };
      if (!response.ok || !body.link) throw new Error(body.error ?? "Could not create payment link.");
      setCreatedUrl(body.link.url);
      setNotice(`${body.link.id} created. Copy and send secure link to customer.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create payment link.");
    } finally {
      setBusy("");
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setNotice("Payment link copied.");
  }

  return (
    <>
      <div className={admin.actions} style={{ marginBottom: "1rem" }}>
        <button className={`${admin.btn} ${tab === "repairs" ? admin.btnPrimary : ""}`} type="button" onClick={() => setTab("repairs")}>Repairs & services</button>
        <button className={`${admin.btn} ${tab === "payments" ? admin.btnPrimary : ""}`} type="button" onClick={() => setTab("payments")}>Payment links</button>
        <button className={`${admin.btn} ${tab === "activity" ? admin.btnPrimary : ""}`} type="button" onClick={() => setTab("activity")}>Activity</button>
      </div>

      {notice ? <p className={`${admin.notice} ${admin.noticeGood}`} style={{ marginBottom: "1rem" }}>{notice}</p> : null}
      {error ? <p className={`${admin.notice} ${admin.noticeError}`} style={{ marginBottom: "1rem" }}>{error}</p> : null}

      {tab === "repairs" ? (
        <>
          <div className={records.toolbar}>
            <input className={`${admin.input} ${records.search}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ticket, customer, item, or service" />
            <button className={admin.btn} type="button" onClick={newTicket}>New ticket</button>
          </div>
          <div className={records.split}>
            <div className={records.list}>
              {filteredTickets.length ? filteredTickets.map((item) => (
                <button className={`${records.row} ${selectedId === item.id ? records.rowActive : ""}`} key={item.id} type="button" onClick={() => choose(item)}>
                  <div><strong>{item.id}</strong> <span>· {item.customerName}</span></div>
                  <span>{SERVICE_STATUS_LABELS[item.status]}</span>
                  <small>{item.item} · {item.service} · received {item.intakeDate}</small>
                </button>
              )) : <div className={records.empty}>No repair or service tickets yet.</div>}
            </div>
            <form className={records.detail} onSubmit={saveTicket}>
              <h2>{selectedId || "New service ticket"}</h2>
              <div className={records.form} style={{ borderTop: 0, paddingTop: 0 }}>
                <label className={admin.field}><span className={admin.label}>Customer</span><input className={admin.input} value={ticket.customerName} onChange={(event) => setTicket({ ...ticket, customerName: event.target.value })} required /></label>
                <label className={admin.field}><span className={admin.label}>Email</span><input className={admin.input} type="email" value={ticket.email} onChange={(event) => setTicket({ ...ticket, email: event.target.value })} /></label>
                <label className={admin.field}><span className={admin.label}>Phone</span><input className={admin.input} value={ticket.phone} onChange={(event) => setTicket({ ...ticket, phone: event.target.value })} /></label>
                <label className={admin.field}><span className={admin.label}>Item received</span><input className={admin.input} value={ticket.item} onChange={(event) => setTicket({ ...ticket, item: event.target.value })} required /></label>
                <label className={admin.field}><span className={admin.label}>Service needed</span><textarea className={admin.textarea} value={ticket.service} onChange={(event) => setTicket({ ...ticket, service: event.target.value })} required /></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
                  <label className={admin.field}><span className={admin.label}>Received</span><input className={admin.input} type="date" value={ticket.intakeDate} onChange={(event) => setTicket({ ...ticket, intakeDate: event.target.value })} /></label>
                  <label className={admin.field}><span className={admin.label}>Due</span><input className={admin.input} type="date" value={ticket.dueDate} onChange={(event) => setTicket({ ...ticket, dueDate: event.target.value })} /></label>
                </div>
                <label className={admin.field}><span className={admin.label}>Estimate ($)</span><input className={admin.input} type="number" min="0" step="0.01" value={ticket.estimatedCost} onChange={(event) => setTicket({ ...ticket, estimatedCost: event.target.value })} /></label>
                <label className={admin.field}><span className={admin.label}>Status</span><select className={admin.select} value={ticket.status} onChange={(event) => setTicket({ ...ticket, status: event.target.value as ServiceStatus })}>{SERVICE_STATUSES.map((value) => <option key={value} value={value}>{SERVICE_STATUS_LABELS[value]}</option>)}</select></label>
                <label className={admin.field}><span className={admin.label}>Internal notes</span><textarea className={admin.textarea} value={ticket.notes} onChange={(event) => setTicket({ ...ticket, notes: event.target.value })} /></label>
                <button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={Boolean(busy)}>{busy === "ticket" ? "Saving…" : "Save ticket"}</button>
              </div>
            </form>
          </div>
        </>
      ) : tab === "payments" ? (
        <div className={records.split}>
          <form className={`${admin.panel} ${admin.panelPad}`} onSubmit={createPayment}>
            <h2 className={admin.sectionTitle}>New secure Stripe link</h2>
            <div className={records.form}>
              <label className={admin.field}><span className={admin.label}>Customer</span><input className={admin.input} value={payment.customerName} onChange={(event) => setPayment({ ...payment, customerName: event.target.value })} required /></label>
              <label className={admin.field}><span className={admin.label}>Customer email</span><input className={admin.input} type="email" value={payment.email} onChange={(event) => setPayment({ ...payment, email: event.target.value })} /></label>
              <label className={admin.field}><span className={admin.label}>Item or purpose</span><textarea className={admin.textarea} value={payment.description} onChange={(event) => setPayment({ ...payment, description: event.target.value })} required /></label>
              <label className={admin.field}><span className={admin.label}>Charge amount ($)</span><input className={admin.input} type="number" min=".50" step=".01" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} required /></label>
              <button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={Boolean(busy)}>{busy === "payment" ? "Creating…" : "Create payment link"}</button>
              {createdUrl ? <button className={admin.btn} type="button" onClick={() => copy(createdUrl)}>Copy new link</button> : null}
              {!paymentLinks.length ? <p className={admin.pageSub}>Stripe must be configured before links can be created.</p> : null}
            </div>
          </form>
          <section className={`${admin.panel} ${admin.panelPad}`}>
            <h2 className={admin.sectionTitle}>Recent links</h2>
            <div className={records.list} style={{ marginTop: "1rem" }}>
              {paymentLinks.map((item) => (
                <button className={records.row} key={item.id} type="button" onClick={() => copy(item.url)}>
                  <div><strong>{item.id}</strong> <span>· {item.customerName}</span></div>
                  <strong>{formatMoney(item.amount)}</strong>
                  <small>{shortDate(item.createdAt)} · {item.description} · click to copy</small>
                </button>
              ))}
              {!paymentLinks.length ? <div className={records.empty}>No payment links yet.</div> : null}
            </div>
          </section>
        </div>
      ) : (
        <section className={admin.panel}>
          <div className={admin.tableWrap}>
            <table className={admin.table}>
              <thead><tr><th>Date</th><th>Action</th><th>Record</th><th>Detail</th></tr></thead>
              <tbody>{activity.map((item) => (
                <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString()}</td><td>{item.action}</td><td><strong>{item.subject}</strong></td><td>{item.detail}</td></tr>
              ))}</tbody>
            </table>
            {!activity.length ? <div className={admin.empty}>New admin changes will appear here.</div> : null}
          </div>
        </section>
      )}
    </>
  );
}
