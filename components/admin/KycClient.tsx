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

function dateLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

type ModalState = {
  open: boolean;
  /** manual = blank form; review = pre-filled from an uploaded PDF. */
  mode: "manual" | "review";
  email: string;
  business: Partial<KycBusiness>;
  notes: string;
  /** The uploaded form, attached to the record when the modal is saved. */
  file: File | null;
  fieldsFound: number;
};

const MODAL_CLOSED: ModalState = { open: false, mode: "manual", email: "", business: {}, notes: "", file: null, fieldsFound: 0 };

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
  const [selected, setSelected] = useState<string>("");
  const [record, setRecord] = useState<KycRecord | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [issuedPassword, setIssuedPassword] = useState("");
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);
  const [extracting, setExtracting] = useState(false);
  const formFileRef = useRef<HTMLInputElement>(null);
  const idFileRef = useRef<HTMLInputElement>(null);
  const filledFormRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modal.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal.open]);

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
      updatedAt: byEmail.get(customer.email.toLowerCase())?.updatedAt ?? "",
      files: byEmail.get(customer.email.toLowerCase())?.files.length ?? 0,
    }));
    for (const item of records) {
      if (!merged.some((row) => row.email.toLowerCase() === item.email.toLowerCase())) {
        merged.push({
          name: item.business.businessName || item.business.ownerName || item.email,
          email: item.email,
          phone: item.business.ownerMobile || "",
          status: item.status,
          updatedAt: item.updatedAt,
          files: item.files.length,
        });
      }
    }
    return merged.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [customers, records, byEmail]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allRows;
    return allRows.filter((row) =>
      row.name.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term) ||
      row.phone.toLowerCase().includes(term));
  }, [allRows, search]);

  const selectedRow = allRows.find((row) => row.email.toLowerCase() === selected.toLowerCase());
  const account = accounts.find((item) => item.email.toLowerCase() === selected.toLowerCase());
  const approved = record?.status === "approved";

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

  function openCard(email: string) {
    setSelected(email);
    setNotice("");
    window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  function absorb(result: { record: KycRecord; blockers?: string[] }) {
    setRecord(result.record);
    setBlockers(result.blockers ?? []);
    setRecords((current) => {
      const rest = current.filter((item) => item.email.toLowerCase() !== result.record.email.toLowerCase());
      return [result.record, ...rest];
    });
  }

  async function patch(email: string, body: Record<string, unknown>, successMessage: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) { setBlockers(result.blockers ?? []); throw new Error(result.error || "Could not save."); }
      absorb(result);
      setNotice(successMessage);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function uploadDocument(email: string, kind: "kyc_form" | "id_document", file: File, label: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      body.set("label", label);
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(email)}/files`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      absorb(result);
      setNotice(`${label} uploaded.`);
      return true;
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      return false;
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

  /** "Upload filled form" — read the PDF, open the review modal pre-filled. */
  async function extractFilledForm(file: File) {
    setExtracting(true); setError(""); setNotice("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/kyc/extract", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not read the form.");
      setModal({
        open: true,
        mode: "review",
        email: result.guessedEmail ?? "",
        business: result.business ?? {},
        notes: "",
        file,
        fieldsFound: result.fieldsFound ?? 0,
      });
    } catch (extractError) {
      setError(extractError instanceof Error ? extractError.message : "Could not read the form.");
    } finally {
      setExtracting(false);
    }
  }

  /** Saving the modal writes the details, attaches the form, opens the card. */
  async function saveModal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("kycEmail") ?? "").trim();
    if (!email.includes("@")) { setError("A customer e-mail is required."); return; }
    const business: Record<string, string> = {};
    for (const group of FIELD_GROUPS) {
      for (const field of group.fields) business[field.key] = String(data.get(`m-${field.key}`) ?? "");
    }
    const saved = await patch(email, { business, notes: String(data.get("m-notes") ?? "") },
      modal.mode === "review" ? "Form read and details saved." : "KYC record created.");
    if (!saved) return;
    if (modal.file) await uploadDocument(email, "kyc_form", modal.file, "Signed KYC form");
    setModal(MODAL_CLOSED);
    openCard(email);
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
    <div style={{ display: "grid", gap: "1.1rem" }}>
      {/* ── Toolbar: universal search · add new · upload filled form ── */}
      <div className={styles.kycToolbar}>
        <input
          type="search"
          className={styles.kycSearch}
          placeholder="Search customers — name, e-mail, or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => { setModal({ ...MODAL_CLOSED, open: true, mode: "manual" }); setError(""); }}
        >
          + Add new
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={extracting}
          onClick={() => filledFormRef.current?.click()}
        >
          {extracting ? "Reading form…" : "Upload filled KYC form"}
        </button>
        <input
          ref={filledFormRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void extractFilledForm(file);
            if (filledFormRef.current) filledFormRef.current.value = "";
          }}
        />
        <a className={styles.btn} href="/api/admin/kyc/form" target="_blank" rel="noreferrer">
          Blank form PDF
        </a>
      </div>

      {notice && !modal.open ? <p className={`${styles.notice} ${styles.noticeGood}`} style={{ margin: 0 }}>{notice}</p> : null}
      {error && !modal.open ? <p className={`${styles.notice} ${styles.noticeError}`} style={{ margin: 0 }}>{error}</p> : null}

      {/* ── Customer cards ── */}
      <div className={styles.kycCards}>
        {rows.map((row) => (
          <button
            key={row.email}
            type="button"
            className={`${styles.kycCard} ${row.email.toLowerCase() === selected.toLowerCase() ? styles.kycCardActive : ""}`}
            onClick={() => openCard(row.email)}
          >
            <span className={styles.kycCardId}>
              <span className={styles.kycCardName}>{row.name || row.email}</span>
              <span className={styles.kycCardMeta}>{row.email}{row.phone ? ` · ${row.phone}` : ""}</span>
            </span>
            <span className={styles.kycCardRight}>
              {row.files ? <span className={styles.kycCardStat}>{row.files} document{row.files === 1 ? "" : "s"}</span> : null}
              {row.updatedAt ? <span className={styles.kycCardStat}>{dateLabel(row.updatedAt)}</span> : null}
              <span className={statusTone(row.status)}>{KYC_STATUS_LABELS[row.status]}</span>
            </span>
          </button>
        ))}
        {!rows.length ? <p className={styles.empty}>No customers match — add one with “+ Add new”.</p> : null}
      </div>

      {/* ── Detail card ── */}
      <div ref={detailRef}>
        {selected && record ? (
          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <header className={styles.kycHead}>
                <div>
                  <p className={styles.kycHeadMail}>{selectedRow?.name || selected}</p>
                  <span className={statusTone(record.status)}>{KYC_STATUS_LABELS[record.status]}</span>
                  {record.approvedAt && approved ? (
                    <span className={styles.kycCardStat} style={{ marginLeft: ".6rem" }}>approved {dateLabel(record.approvedAt)}</span>
                  ) : null}
                </div>
                <div className={styles.actions}>
                  <a className={styles.btn} href={`/api/admin/kyc/form?email=${encodeURIComponent(selected)}`} target="_blank" rel="noreferrer">
                    Download form
                  </a>
                  <button type="button" className={styles.btn} disabled={busy}
                    onClick={() => void patch(selected, { status: "sent" }, "Marked as sent to the customer.")}>
                    Mark sent
                  </button>
                  <button type="button" className={styles.modalClose} aria-label="Close" onClick={() => setSelected("")}>×</button>
                </div>
              </header>

              {/* Approve / disapprove */}
              <div className={styles.actions} style={{ marginTop: "1rem" }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy || approved || blockers.length > 0}
                  onClick={() => void patch(selected, { status: "approved" }, "KYC approved.")}>
                  {approved ? "Approved ✓" : "Approve KYC"}
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy || record.status === "rejected"}
                  onClick={() => void patch(selected, { status: "rejected" }, "KYC disapproved.")}>
                  Disapprove
                </button>
              </div>
              {blockers.length && !approved ? (
                <p className={`${styles.notice} ${styles.noticeWarn}`}>{blockers.join(" ")}</p>
              ) : null}

              {/* Client login — appears only once the KYC is approved */}
              {approved ? (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: "1.2rem" }}>Client login</h3>
                  <div className={styles.kycLoginBox}>
                    {account ? (
                      <>
                        <p style={{ margin: 0, fontSize: ".88rem" }}>
                          Login active for <strong>{account.email}</strong>
                          {account.phone ? <> · mobile {account.phone}</> : null}
                          {account.lastLoginAt ? <> · last signed in {dateLabel(account.lastLoginAt)}</> : <> · not signed in yet</>}
                          {account.disabled ? <> · <strong>disabled</strong></> : null}
                        </p>
                        <div className={styles.actions} style={{ marginTop: ".7rem" }}>
                          <button type="button" className={styles.btn} disabled={busy} onClick={() => void issueLogin()}>
                            Issue new password
                          </button>
                          <button type="button" className={`${styles.btn} ${account.disabled ? "" : styles.btnDanger}`} disabled={busy}
                            onClick={() => void toggleLogin(!account.disabled)}>
                            {account.disabled ? "Re-enable login" : "Disable login"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={{ margin: 0, fontSize: ".88rem" }}>
                          KYC approved — create this customer&apos;s website login. They sign in at
                          {" "}<strong>thejewelstone.com/account</strong> with their e-mail or mobile.
                        </p>
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: ".7rem" }} disabled={busy}
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
                </>
              ) : null}

              {/* Paperwork */}
              <h3 className={styles.sectionTitle} style={{ marginTop: "1.2rem" }}>Required paperwork</h3>
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

              <div className={styles.kycUploads}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="kyc-form-file">Upload signed form</label>
                  <input id="kyc-form-file" ref={formFileRef} className={styles.input} type="file"
                    accept="application/pdf,image/*" disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadDocument(selected, "kyc_form", file, "Signed KYC form");
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
                      if (file) void uploadDocument(selected, "id_document", file, select?.value ?? "Identity document");
                      if (idFileRef.current) idFileRef.current.value = "";
                    }} />
                </div>
              </div>

              {record.files.length ? (
                <div className={styles.tableWrap} style={{ marginTop: ".9rem" }}>
                  <table className={styles.table}>
                    <thead><tr><th>Document</th><th>File</th><th>Uploaded</th><th /></tr></thead>
                    <tbody>
                      {record.files.map((file) => (
                        <tr key={file.id}>
                          <td>{file.label}</td>
                          <td><a href={`/api/admin/kyc/files/${file.id}`} target="_blank" rel="noreferrer">{file.fileName}</a></td>
                          <td>{dateLabel(file.uploadedAt)}</td>
                          <td>
                            <button type="button" className={`${styles.btn} ${styles.btnSmall}`} disabled={busy} onClick={() => void removeFile(file.id)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Details */}
              <h3 className={styles.sectionTitle} style={{ marginTop: "1.3rem" }}>Details from the form</h3>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const business: Record<string, string> = {};
                  for (const group of FIELD_GROUPS) {
                    for (const field of group.fields) business[field.key] = String(data.get(field.key) ?? "");
                  }
                  void patch(selected, { business, notes: String(data.get("notes") ?? "") }, "Details saved.");
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
                            defaultValue={record.business[field.key] ?? ""}
                            key={`${selected}-${field.key}-${record.updatedAt}`}
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="kyc-notes">Private notes</label>
                  <textarea id="kyc-notes" name="notes" className={styles.textarea} rows={3}
                    defaultValue={record.notes} key={`${selected}-notes-${record.updatedAt}`} />
                </div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy}>
                  {busy ? "Saving…" : "Save details"}
                </button>
              </form>
            </div>
          </section>
        ) : null}
      </div>

      {/* ── Add-new / review modal ── */}
      {modal.open ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="KYC form">
          <div className={styles.modalCard}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>
                {modal.mode === "review" ? "Review the uploaded form" : "New KYC — manual entry"}
              </h2>
              <button type="button" className={styles.modalClose} aria-label="Close" onClick={() => setModal(MODAL_CLOSED)}>×</button>
            </div>
            {modal.mode === "review" ? (
              <p className={`${styles.notice} ${modal.fieldsFound ? styles.noticeGood : styles.noticeWarn}`}>
                {modal.fieldsFound
                  ? `Read ${modal.fieldsFound} field${modal.fieldsFound === 1 ? "" : "s"} from the PDF — check them and fill in the gaps.`
                  : "Nothing could be read automatically (scans and photos have no text layer) — the form will still be attached; enter the details below."}
              </p>
            ) : null}
            {error ? <p className={`${styles.notice} ${styles.noticeError}`}>{error}</p> : null}
            <form onSubmit={saveModal}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="kyc-modal-email">Customer e-mail (account key) *</label>
                <input id="kyc-modal-email" className={styles.input} name="kycEmail" type="email"
                  defaultValue={modal.email} placeholder="buyer@company.com" required />
              </div>
              {FIELD_GROUPS.map((group) => (
                <fieldset key={group.title} className={styles.kycFieldset} style={{ marginTop: ".9rem" }}>
                  <legend className={styles.label}>{group.title}</legend>
                  <div className={styles.kycFieldGrid}>
                    {group.fields.map((field) => (
                      <div key={field.key} className={`${styles.field} ${field.wide ? styles.kycFieldWide : ""}`}>
                        <label className={styles.label} htmlFor={`m-${field.key}`}>{field.label}</label>
                        <input id={`m-${field.key}`} className={styles.input} name={`m-${field.key}`}
                          defaultValue={modal.business[field.key] ?? ""} />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
              <div className={styles.field} style={{ marginTop: ".6rem" }}>
                <label className={styles.label} htmlFor="m-notes">Private notes</label>
                <textarea id="m-notes" name="m-notes" className={styles.textarea} rows={2} defaultValue={modal.notes} />
              </div>
              {modal.file ? (
                <p className={styles.tileHint} style={{ marginTop: ".6rem" }}>
                  “{modal.file.name}” will be attached as the signed KYC form.
                </p>
              ) : null}
              <div className={styles.actions} style={{ marginTop: "1rem" }}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy}>
                  {busy ? "Saving…" : "Save KYC record"}
                </button>
                <button type="button" className={styles.btn} onClick={() => setModal(MODAL_CLOSED)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
