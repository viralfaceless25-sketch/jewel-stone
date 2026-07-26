"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import pages from "@/components/pages/pages.module.css";
import styles from "@/components/pages/enquiry.module.css";

type OrderRow = { id: string; date: string; total: string; status: string; items: string[] };
type DocumentRow = {
  number: string;
  kind: string;
  issueDate: string;
  dueDate: string;
  total: string;
  status: string;
  terms: string;
};

function dateLabel(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function AccountPortal({
  email,
  name,
  orders,
  documents,
  kycStatus,
  invoiceTerms,
  memoDays,
}: {
  email: string;
  name: string;
  orders: OrderRow[];
  documents: DocumentRow[];
  kycStatus: string;
  invoiceTerms: string;
  memoDays: number;
}) {
  const router = useRouter();
  const [changing, setChanging] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const cell: React.CSSProperties = { padding: ".7rem .4rem", borderBottom: "1px solid var(--js-line)", fontSize: ".92rem" };
  const head: React.CSSProperties = { ...cell, fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--js-platinum)" };

  return (
    <div style={{ display: "grid", gap: "2.4rem" }}>
      {/* Account summary */}
      <section>
        <h2 className={pages.h2}>Account</h2>
        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "1.2rem", margin: 0 }}>
          <div><dt style={head}>Name</dt><dd style={{ margin: ".3rem 0 0" }}>{name || "—"}</dd></div>
          <div><dt style={head}>E-mail</dt><dd style={{ margin: ".3rem 0 0" }}>{email}</dd></div>
          <div><dt style={head}>Account paperwork</dt><dd style={{ margin: ".3rem 0 0" }}>{kycStatus}</dd></div>
          <div><dt style={head}>Payment terms</dt><dd style={{ margin: ".3rem 0 0" }}>{invoiceTerms}</dd></div>
          <div><dt style={head}>Memo period</dt><dd style={{ margin: ".3rem 0 0" }}>{memoDays} days</dd></div>
        </dl>
      </section>

      {/* Documents */}
      <section>
        <h2 className={pages.h2}>Invoices &amp; memoranda</h2>
        {documents.length ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><th style={head}>Number</th><th style={head}>Type</th><th style={head}>Issued</th><th style={head}>Due / return by</th><th style={head}>Terms</th><th style={head}>Total</th><th style={head}>Status</th></tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.number}>
                    <td style={cell}>{document.number}</td>
                    <td style={cell}>{document.kind === "memo" ? "Memorandum" : "Invoice"}</td>
                    <td style={cell}>{dateLabel(document.issueDate)}</td>
                    <td style={cell}>{dateLabel(document.dueDate)}</td>
                    <td style={cell}>{document.terms}</td>
                    <td style={cell}>{document.total}</td>
                    <td style={cell}>{document.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={pages.p}>Nothing issued yet. Invoices and memoranda appear here as soon as they are sent.</p>
        )}
      </section>

      {/* Orders */}
      <section>
        <h2 className={pages.h2}>Orders</h2>
        {orders.length ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><th style={head}>Order</th><th style={head}>Date</th><th style={head}>Items</th><th style={head}>Total</th><th style={head}>Status</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={cell}>{order.id}</td>
                    <td style={cell}>{dateLabel(order.date)}</td>
                    <td style={cell}>{order.items.join(", ") || "—"}</td>
                    <td style={cell}>{order.total}</td>
                    <td style={cell}>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={pages.p}>No orders on your account yet.</p>
        )}
      </section>

      {/* Security */}
      <section>
        <h2 className={pages.h2}>Password</h2>
        <form
          className={styles.form}
          style={{ maxWidth: 460 }}
          onSubmit={async (event) => {
            event.preventDefault();
            setChanging(true); setError(""); setNotice("");
            const form = new FormData(event.currentTarget);
            try {
              const response = await fetch("/api/account/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: String(form.get("password") ?? "") }),
              });
              const result = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(result.error || "Could not change your password.");
              setNotice("Password updated.");
              event.currentTarget.reset();
            } catch (changeError) {
              setError(changeError instanceof Error ? changeError.message : "Could not change your password.");
            } finally {
              setChanging(false);
            }
          }}
        >
          <label htmlFor="new-password">
            New password
            <input id="new-password" name="password" type="password" minLength={8} required autoComplete="new-password" />
          </label>
          <button type="submit" className={styles.submit} disabled={changing}>
            {changing ? "Saving…" : "Change password"}
          </button>
          {notice ? <p className={styles.note}>{notice}</p> : null}
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
        </form>
        <button
          type="button"
          className={pages.btnGhost}
          style={{ marginTop: "1.2rem" }}
          onClick={async () => {
            await fetch("/api/account/logout", { method: "POST" });
            router.push("/account/login");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
