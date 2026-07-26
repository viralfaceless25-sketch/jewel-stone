"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ID_DOCUMENT_TYPES,
  KYC_STATUS_LABELS,
  type KycBusiness,
  type KycRecord,
  type KycStatus,
} from "@/lib/admin/kyc-shared";
import styles from "@/app/admin/admin.module.css";

type CustomerLite = { name: string; email: string; phone: string };
type AccountLite = { email: string; phone: string; name: string; disabled: boolean; lastLoginAt?: string };

const FIELD_GROUPS: { title: string; fields: { key: keyof KycBusiness; label: string; wide?: boolean }[] }[] = [
  {
    title: "Business",
    fields: [
      { key: "businessName", label: "Business name", wide: true },
      { key: "yearEstablished", label: "Year established" },
      { key: "natureOfBusiness", label: "Wholesale / retail" },
      { key: "address", label: "Address", wide: true },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zip", label: "ZIP" },
      { key: "country", label: "Country" },
      { key: "telephone", label: "Telephone" },
      { key: "website", label: "Website" },
      { key: "taxId", label: "Business registration / Tax ID" },
    ],
  },
  {
    title: "Contacts",
    fields: [
      { key: "ownerName", label: "Owner name" },
      { key: "ownerEmail", label: "Owner e-mail" },
      { key: "ownerMobile", label: "Owner mobile" },
      { key: "contactName", label: "Contact name" },
      { key: "contactEmail", label: "Contact e-mail" },
      { key: "contactMobile", label: "Contact mobile" },
      { key: "accountingName", label: "Accounting name" },
      { key: "accountingEmail", label: "Accounting e-mail" },
      { key: "accountingMobile", label: "Accounting mobile" },
    ],
  },
  {
    title: "Bank & signature",
    fields: [
      { key: "bankName", label: "Bank name" },
      { key: "bankAccount", label: "Account number" },
      { key: "bankAddress", label: "Bank address", wide: true },
      { key: "signedName", label: "Signed by" },
      { key: "signedTitle", label: "Title" },
      { key: "signedDate", label: "Date signed" },
    ],
  },
];

function statusTone(status: KycStatus) {
  if (status === "approved") return styles.badgeGood;
  if (status === "rejected") return styles.badgeBad;
  if (status === "not_started") return styles.badge;
  return styles.badgeWarn;
}

export function KycClient({
  customers,
  initialRecords,
  initialAccounts,
}: {
  customers: CustomerLite[];
  initialRecords: KycRecord[];
  initialAccounts: AccountLite[];
}) {
  const [records, setRecords] = useState<KycRecord[]>(initialRecords);
  const [accounts, setAccounts] = useState<AccountLite[]>(initialAccounts);
  const [record, setRecord] = useState<KycRecord | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [issuedPassword, setIssuedPassword] = useState("");
  const formFileRef = useRef<HTMLInputElement>(null);
  const idFileRef = useRef<HTMLInputElement>(null);

  const byEmail = useMemo(() => {
    const map = new Map<string, KycRecord>();
    for (const item of records) map.set(item.email.toLowerCase(), item);
    return map;
  }, [records]);

  /** Customers plus anyone who only exists as a KYC record. */
  const allRows = useMemo(() => {
    const merged = customers.map((customer) => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: byEmail.get(customer.email.toLowerCase())?.status ?? ("not_started" as KycStatus),
    }));
    for (const item of records) {
      if (!merged.some((row) => row.email.toLowerCase() === item.email.toLowerCase())) {
        merged.push({
          name: item.business.businessName || item.email,
          email: item.email,
          phone: item.business.ownerMobile || "",
          status: item.status,
        });
      }
    }
    return merged;
  }, [customers, records, byEmail]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allRows;
    return allRows.filter((row) =>
      row.name.toLowerCase().includes(term) || row.email.toLowerCase().includes(term));
  }, [allRows, search]);

  const [selected, setSelected] = useState<string>("");
  // Open the first record automatically so the panel is never an empty box.
  useEffect(() => {
    if (!selected && allRows.length) setSelected(allRows[0].email);
  }, [allRows, selected]);

  const selectedRow = allRows.find((row) => row.email.toLowerCase() === selected.toLowerCase());
  const account = accounts.find((item) => item.email.toLowerCase() === selected.toLowerCase());

  const load = useCallback(async (email: string) => {
    if (!email) { setRecord(null); return; }
    setBusy(true); setError(""); setIssuedPassword("");
    try {
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(email)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load this record.");
      setRecord(result.record);
      setBlockers(result.blockers ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this record.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void load(selected); }, [selected, load]);

  function absorb(result: { record: KycRecord; blockers?: string[] }) {
    setRecord(result.record);
    setBlockers(result.blockers ?? []);
    setRecords((current) => {
      const rest = current.filter((item) => item.email.toLowerCase() !== result.record.email.toLowerCase());
      return [result.record, ...rest];
    });
  }

  async function patch(body: Record<string, unknown>, successMessage: string) {
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(selected)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) { setBlockers(result.blockers ?? []); throw new Error(result.error || "Could not save."); }
      absorb(result);
      setNotice(successMessage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(kind: "kyc_form" | "id_document", file: File, label: string) {
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      body.set("label", label);
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(selected)}/files`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      absorb(result);
      setNotice(`${label} uploaded.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function removeFile(fileId: string) {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(selected)}/files?fileId=${fileId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove.");
      absorb(result);
      setNotice("Document removed.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove.");
    } finally {
      setBusy(false);
    }
  }

  /** Issues (or reissues) a client login; the password is shown once. */
  async function issueLogin() {
    if (!selected) return;
    setBusy(true); setError(""); setNotice(""); setIssuedPassword("");
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selected,
          phone: record?.business.ownerMobile || record?.business.telephone || selectedRow?.phone || "",
          name: record?.business.businessName || selectedRow?.name || "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create the login.");
      setIssuedPassword(result.password);
      setAccounts((current) => {
        const rest = current.filter((item) => item.email.toLowerCase() !== result.account.email.toLowerCase());
        return [result.account, ...rest];
      });
      setNotice(result.reissued ? "New password issued." : "Client login created.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not create the login.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleLogin(disabled: boolean) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected, disabled }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the login.");
      setAccounts((current) => current.map((item) =>
        item.email.toLowerCase() === selected.toLowerCase() ? result.account : item));
      setNotice(disabled ? "Login disabled." : "Login re-enabled.");
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update the login.");
    } finally {
      setBusy(false);
    }
  }

  const idDocs = record?.files.filter((file) => file.kind === "id_document") ?? [];
  const hasForm = (record?.files.some((file) => file.kind === "kyc_form")) ?? false;

  return (
    <div className={styles.kycLayout}>
      {/* ── Customer picker ── */}
      <section className={styles.panel}>
        <div className={styles.panelPad}>
          <h2 className={styles.sectionTitle}>Customers</h2>
          <input
            className={styles.input}
            placeholder="Search name or e-mail"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className={styles.kycList}>
            {rows.map((row) => (
              <button
                key={row.email}
                type="button"
                onClick={() => setSelected(row.email)}
                className={`${styles.kycRow} ${row.email.toLowerCase() === selected.toLowerCase() ? styles.kycRowActive : ""}`}
              >
                <span className={styles.kycRowText}>
                  <span className={styles.kycRowName}>{row.name || row.email}</span>
                  <span className={styles.kycRowMail}>{row.email}</span>
                </span>
                <span className={statusTone(row.status)}>{KYC_STATUS_LABELS[row.status]}</span>
              </button>
            ))}
            {!rows.length ? <p className={styles.empty}>No customers match.</p> : null}
          </div>

          <div className={styles.field} style={{ marginTop: "1rem" }}>
            <label className={styles.label} htmlFor="kyc-manual">Start KYC for another e-mail</label>
            <input
              id="kyc-manual"
              className={styles.input}
              type="email"
              placeholder="buyer@company.com"
              value={manualEmail}
              onChange={(event) => setManualEmail(event.target.value)}
            />
            <button
              type="button"
              className={styles.btn}
              style={{ marginTop: ".45rem" }}
              disabled={!manualEmail.includes("@")}
              onClick={() => { setSelected(manualEmail.trim()); setManualEmail(""); }}
            >
              Open record
            </button>
          </div>
        </div>
      </section>

      {/* ── Record ── */}
      <section className={styles.panel}>
        <div className={styles.panelPad}>
          {!selected ? (
            <p className={styles.empty}>Add a customer or enter an e-mail to begin a KYC record.</p>
          ) : (
            <>
              <header className={styles.kycHead}>
                <div>
                  <p className={styles.kycHeadMail}>{selectedRow?.name || selected}</p>
                  <span className={statusTone(record?.status ?? "not_started")}>
                    {KYC_STATUS_LABELS[record?.status ?? "not_started"]}
                  </span>
                </div>
                <div className={styles.actions}>
                  <a className={styles.btn} href={`/api/admin/kyc/form?email=${encodeURIComponent(selected)}`} target="_blank" rel="noreferrer">
                    Download form
                  </a>
                  <button type="button" className={styles.btn} disabled={busy}
                    onClick={() => void patch({ status: "sent" }, "Marked as sent to the customer.")}>
                    Mark sent
                  </button>
                </div>
              </header>

              {notice ? <p className={`${styles.notice} ${styles.noticeGood}`}>{notice}</p> : null}
              {error ? <p className={`${styles.notice} ${styles.noticeError}`}>{error}</p> : null}

              {/* Checklist */}
              <h3 className={styles.sectionTitle} style={{ marginTop: "1.1rem" }}>Required paperwork</h3>
              <ul className={styles.kycChecklist}>
                <li className={`${styles.kycCheck} ${hasForm ? styles.kycCheckDone : ""}`}>
                  <span className={styles.kycCheckMark}>{hasForm ? "✓" : "○"}</span>
                  Signed KYC form
                </li>
                <li className={`${styles.kycCheck} ${idDocs.length >= 1 ? styles.kycCheckDone : ""}`}>
                  <span className={styles.kycCheckMark}>{idDocs.length >= 1 ? "✓" : "○"}</span>
                  Identity document 1 {idDocs[0] ? `— ${idDocs[0].label}` : "(photo ID)"}
                </li>
                <li className={`${styles.kycCheck} ${idDocs.length >= 2 ? styles.kycCheckDone : ""}`}>
                  <span className={styles.kycCheckMark}>{idDocs.length >= 2 ? "✓" : "○"}</span>
                  Identity document 2 {idDocs[1] ? `— ${idDocs[1].label}` : "(tax ID / EIN)"}
                </li>
              </ul>

              {/* Uploads */}
              <div className={styles.kycUploads}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="kyc-form-file">Upload signed form</label>
                  <input id="kyc-form-file" ref={formFileRef} className={styles.input} type="file"
                    accept="application/pdf,image/*" disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void upload("kyc_form", file, "Signed KYC form");
                      if (formFileRef.current) formFileRef.current.value = "";
                    }} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="kyc-id-file">Upload identity document</label>
                  <select className={styles.select} id="kyc-id-type" defaultValue={ID_DOCUMENT_TYPES[0]}>
                    {ID_DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input id="kyc-id-file" ref={idFileRef} className={styles.input} style={{ marginTop: ".4rem" }}
                    type="file" accept="application/pdf,image/*" disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      const select = document.getElementById("kyc-id-type") as HTMLSelectElement | null;
                      if (file) void upload("id_document", file, select?.value ?? "Identity document");
                      if (idFileRef.current) idFileRef.current.value = "";
                    }} />
                </div>
              </div>

              {record?.files.length ? (
                <div className={styles.tableWrap} style={{ marginTop: ".9rem" }}>
                  <table className={styles.table}>
                    <thead><tr><th>Document</th><th>File</th><th>Uploaded</th><th /></tr></thead>
                    <tbody>
                      {record.files.map((file) => (
                        <tr key={file.id}>
                          <td>{file.label}</td>
                          <td><a href={`/api/admin/kyc/files/${file.id}`} target="_blank" rel="noreferrer">{file.fileName}</a></td>
                          <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                          <td>
                            <button type="button" className={styles.btnSmall} disabled={busy} onClick={() => void removeFile(file.id)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Approval */}
              <h3 className={styles.sectionTitle} style={{ marginTop: "1.3rem" }}>Approval</h3>
              {blockers.length ? (
                <p className={`${styles.notice} ${styles.noticeWarn}`}>{blockers.join(" ")}</p>
              ) : (
                <p className={`${styles.notice} ${styles.noticeGood}`}>All required paperwork is on file.</p>
              )}
              <div className={styles.actions}>
                <button type="button" className={styles.btnPrimary} disabled={busy || blockers.length > 0}
                  onClick={() => void patch({ status: "approved" }, "KYC approved.")}>
                  Approve KYC
                </button>
                <button type="button" className={styles.btnDanger} disabled={busy}
                  onClick={() => void patch({ status: "rejected" }, "KYC rejected.")}>
                  Reject
                </button>
              </div>

              {/* Client login */}
              <h3 className={styles.sectionTitle} style={{ marginTop: "1.4rem" }}>Client login</h3>
              <div className={styles.kycLoginBox}>
                {account ? (
                  <>
                    <p style={{ margin: 0, fontSize: ".88rem" }}>
                      Account active for <strong>{account.email}</strong>
                      {account.phone ? <> · mobile {account.phone}</> : null}
                      {account.lastLoginAt ? <> · last signed in {new Date(account.lastLoginAt).toLocaleDateString()}</> : <> · not signed in yet</>}
                      {account.disabled ? <> · <strong>disabled</strong></> : null}
                    </p>
                    <div className={styles.actions} style={{ marginTop: ".7rem" }}>
                      <button type="button" className={styles.btn} disabled={busy} onClick={() => void issueLogin()}>
                        Issue new password
                      </button>
                      <button type="button" className={account.disabled ? styles.btn : styles.btnDanger} disabled={busy}
                        onClick={() => void toggleLogin(!account.disabled)}>
                        {account.disabled ? "Re-enable login" : "Disable login"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0, fontSize: ".88rem" }}>
                      No login yet. Create one so this customer can sign in at
                      {" "}<strong>/account</strong> to see their orders, invoices, and memoranda.
                    </p>
                    <button type="button" className={styles.btnPrimary} style={{ marginTop: ".7rem" }} disabled={busy}
                      onClick={() => void issueLogin()}>
                      Create client login
                    </button>
                  </>
                )}
                {issuedPassword ? (
                  <div style={{ marginTop: ".8rem" }}>
                    <p className={styles.label} style={{ margin: 0 }}>One-time password — shown once, pass it on now</p>
                    <span className={styles.kycPassword}>{issuedPassword}</span>
                  </div>
                ) : null}
              </div>

              {/* Transcribed details */}
              <h3 className={styles.sectionTitle} style={{ marginTop: "1.4rem" }}>Details from the form</h3>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const business: Record<string, string> = {};
                  for (const group of FIELD_GROUPS) {
                    for (const field of group.fields) business[field.key] = String(data.get(field.key) ?? "");
                  }
                  void patch({ business, notes: String(data.get("notes") ?? "") }, "Details saved.");
                }}
              >
                {FIELD_GROUPS.map((group) => (
                  <fieldset key={group.title} className={styles.kycFieldset}>
                    <legend className={styles.label}>{group.title}</legend>
                    <div className={styles.kycFieldGrid}>
                      {group.fields.map((field) => (
                        <div key={field.key} className={`${styles.field} ${field.wide ? styles.kycFieldWide : ""}`}>
                          <label className={styles.label} htmlFor={`kyc-${field.key}`}>{field.label}</label>
                          <input
                            id={`kyc-${field.key}`}
                            className={styles.input}
                            name={field.key}
                            defaultValue={record?.business[field.key] ?? ""}
                            key={`${selected}-${field.key}-${record?.updatedAt ?? ""}`}
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="kyc-notes">Private notes</label>
                  <textarea id="kyc-notes" name="notes" className={styles.textarea} rows={3}
                    defaultValue={record?.notes ?? ""} key={`${selected}-notes-${record?.updatedAt ?? ""}`} />
                </div>
                <button type="submit" className={styles.btnPrimary} disabled={busy}>
                  {busy ? "Saving…" : "Save details"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
