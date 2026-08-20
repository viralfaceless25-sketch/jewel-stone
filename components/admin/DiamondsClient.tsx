"use client";

import { useMemo, useState } from "react";
import admin from "@/app/admin/admin.module.css";
import records from "./records.module.css";

type Diamond = {
  id: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  lab: string;
  price: number;
  certified: boolean;
};

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const PAGE_SIZE = 50;

export function DiamondsClient({ diamonds }: { diamonds: Diamond[] }) {
  const [query, setQuery] = useState("");
  const [shape, setShape] = useState("");
  const [lab, setLab] = useState("");
  const [page, setPage] = useState(1);
  const shapes = useMemo(() => [...new Set(diamonds.map((item) => item.shape).filter((value) => value.trim()))].sort(), [diamonds]);
  const labs = useMemo(() => [...new Set(diamonds.map((item) => item.lab).filter((value) => value.trim()))].sort(), [diamonds]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return diamonds.filter((item) => {
      if (shape && item.shape !== shape) return false;
      if (lab && item.lab !== lab) return false;
      return !needle || [item.id, item.shape, item.color, item.clarity, item.lab]
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [diamonds, query, shape, lab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function exportCsv() {
    const fields = ["id", "shape", "carat", "color", "clarity", "cut", "polish", "symmetry", "lab", "price", "certified"] as const;
    const lines = [
      fields.map(csvCell).join(","),
      ...filtered.map((item) => fields.map((field) => csvCell(item[field])).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jewel-stone-loose-diamonds-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className={records.toolbar}>
        <input className={`${admin.input} ${records.search}`} value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search certificate, shape, color, clarity, or lab" />
        <select className={admin.select} value={shape} onChange={(event) => updateFilter(setShape, event.target.value)}>
          <option value="">All shapes</option>
          {shapes.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className={admin.select} value={lab} onChange={(event) => updateFilter(setLab, event.target.value)}>
          <option value="">All labs</option>
          {labs.map((value) => <option key={value}>{value}</option>)}
        </select>
        <button className={admin.btn} type="button" onClick={exportCsv}>Export shown CSV</button>
      </div>
      <section className={admin.panel}>
        <div className={admin.tableWrap}>
          <table className={admin.table}>
            <thead><tr><th>Certificate / ID</th><th>Shape</th><th>Carat</th><th>Color</th><th>Clarity</th><th>Cut / polish / symmetry</th><th>Lab</th><th>Price</th></tr></thead>
            <tbody>{paged.map((item) => (
              <tr key={item.id}>
                <td data-label="Certificate / ID"><strong>{item.id}</strong></td>
                <td data-label="Shape">{item.shape}</td>
                <td data-label="Carat">{item.carat.toFixed(2)}</td>
                <td data-label="Color">{item.color}</td>
                <td data-label="Clarity">{item.clarity}</td>
                <td data-label="Cut / polish / symmetry">{[item.cut, item.polish, item.symmetry].filter(Boolean).join(" / ") || "—"}</td>
                <td data-label="Lab">{item.lab}</td>
                <td data-label="Price">${item.price.toLocaleString("en-US")}</td>
              </tr>
            ))}</tbody>
          </table>
          {!filtered.length ? <div className={admin.empty}>No diamonds match these filters.</div> : null}
        </div>
        {filtered.length ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".6rem", marginTop: "1rem" }}>
            <span className={admin.pageSub} style={{ margin: 0 }}>
              {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <button className={admin.btn} type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>
                Previous
              </button>
              <span className={admin.pageSub} style={{ margin: 0, alignSelf: "center" }}>Page {currentPage} of {totalPages}</span>
              <button className={admin.btn} type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
