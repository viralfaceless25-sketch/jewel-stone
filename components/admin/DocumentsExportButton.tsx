"use client";

import type { BusinessDocument } from "@/lib/admin/documents";
import admin from "@/app/admin/admin.module.css";

function cell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function DocumentsExportButton({ documents }: { documents: BusinessDocument[] }) {
  function download() {
    const lines = [
      ["Number", "Type", "Issue date", "Customer", "Email", "Status", "Subtotal", "Tax", "Shipping", "Total"].map(cell).join(","),
      ...documents.map((item) => [
        item.number,
        item.kind === "memo" ? "Memorandum" : "Invoice",
        item.issueDate,
        item.customer.name,
        item.customer.email,
        item.status,
        (item.subtotal / 100).toFixed(2),
        (item.taxAmount / 100).toFixed(2),
        (item.shipping / 100).toFixed(2),
        (item.total / 100).toFixed(2),
      ].map(cell).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `jewel-stone-documents-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return <button className={admin.btn} type="button" onClick={download} disabled={!documents.length}>Export CSV</button>;
}
