"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessDocument } from "@/lib/admin/documents";
import admin from "@/app/admin/admin.module.css";
import styles from "./documents.module.css";

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>;
};

export function DocumentActions({ document }: { document: BusinessDocument }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"save" | "send" | "status" | "void" | "delete" | "">("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const pdfUrl = `/api/admin/documents/${encodeURIComponent(document.number)}/pdf`;

  async function saveToFolder() {
    setBusy("save");
    setError("");
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Could not generate PDF.");
      const blob = await response.blob();
      const picker = (window as SavePickerWindow).showSaveFilePicker;
      if (picker) {
        const handle = await picker({
          suggestedName: `${document.number}.pdf`,
          types: [{ description: "PDF document", accept: { "application/pdf": [".pdf"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        setNotice(`Saved ${document.number}.pdf.`);
      } else {
        const href = URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = href;
        anchor.download = `${document.number}.pdf`;
        anchor.click();
        URL.revokeObjectURL(href);
        setNotice(`Downloaded ${document.number}.pdf.`);
      }
    } catch (caught) {
      if ((caught as DOMException)?.name !== "AbortError") {
        setError(caught instanceof Error ? caught.message : "Could not save PDF.");
      }
    } finally {
      setBusy("");
    }
  }

  async function sendEmail() {
    setBusy("send");
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(document.number)}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; sentTo?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not send email.");
      setNotice(`PDF emailed to ${result.sentTo}.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send email.");
    } finally {
      setBusy("");
    }
  }

  async function changeStatus(status: "paid" | "returned") {
    setBusy("status");
    setError("");
    try {
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(document.number)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Could not update status.");
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update status.");
    } finally {
      setBusy("");
    }
  }

  async function voidRecord() {
    if (!window.confirm(`Void ${document.number}? Its number will remain in the records.`)) return;
    setBusy("void");
    setError("");
    try {
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(document.number)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not void document.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not void document.");
    } finally {
      setBusy("");
    }
  }

  async function deleteRecord() {
    const warning = document.status === "paid" || document.status === "returned"
      ? `Delete ${document.number} permanently? It's marked ${document.status} - this removes it from your records entirely, including revenue history. This cannot be undone. If you just want to cancel it, use Void instead.`
      : `Delete ${document.number} permanently? This removes it entirely and cannot be undone.`;
    if (!window.confirm(warning)) return;
    setBusy("delete");
    setError("");
    try {
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(document.number)}?hard=1`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete document.");
      router.push("/admin/invoices");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete document.");
      setBusy("");
    }
  }

  return (
    <>
      <div className={styles.docActions}>
        <button className={`${admin.btn} ${admin.btnPrimary}`} type="button" onClick={saveToFolder} disabled={Boolean(busy)}>
          {busy === "save" ? "Preparing PDF…" : "Save PDF to file"}
        </button>
        <a className={admin.btn} href={`${pdfUrl}?inline=1`} target="_blank" rel="noreferrer">Open PDF</a>
        <a className={admin.btn} href={`/admin/invoices/${encodeURIComponent(document.number)}/edit`}>Edit</a>
        {document.kind === "invoice" && document.status !== "paid" && document.status !== "void" ? (
          <button className={admin.btn} type="button" onClick={() => changeStatus("paid")} disabled={Boolean(busy)}>Mark paid</button>
        ) : null}
        {document.kind === "memo" && document.status !== "returned" && document.status !== "void" ? (
          <button className={admin.btn} type="button" onClick={() => changeStatus("returned")} disabled={Boolean(busy)}>Mark returned</button>
        ) : null}
        {document.status !== "void" ? (
          <button className={`${admin.btn} ${admin.btnDanger}`} type="button" onClick={voidRecord} disabled={Boolean(busy)}>Void</button>
        ) : null}
        <button className={`${admin.btn} ${admin.btnDanger}`} type="button" onClick={deleteRecord} disabled={Boolean(busy)}>
          {busy === "delete" ? "Deleting…" : "Delete permanently"}
        </button>
      </div>

      {document.status !== "void" ? (
        <div className={styles.sendBox}>
          <p>Email address: <strong>{document.customer.email || "Missing"}</strong>. PDF attaches automatically.</p>
          <textarea className={admin.textarea} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Optional message to customer" />
          <div>
            <button className={admin.btn} type="button" onClick={sendEmail} disabled={Boolean(busy) || !document.customer.email}>
              {busy === "send" ? "Sending…" : "Email PDF"}
            </button>
          </div>
        </div>
      ) : null}
      {notice ? <p className={`${admin.notice} ${admin.noticeGood}`}>{notice}</p> : null}
      {error ? <p className={`${admin.notice} ${admin.noticeError}`} role="alert">{error}</p> : null}
    </>
  );
}
