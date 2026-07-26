// Types, labels, and pure helpers for Know Your Customer records. Kept free of
// `server-only` so client components can import them; all storage lives in
// lib/admin/kyc.ts.

export const KYC_STATUSES = ["not_started", "sent", "received", "approved", "rejected"] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  not_started: "Not started",
  sent: "Form sent",
  received: "Documents received",
  approved: "Approved",
  rejected: "Rejected",
};

/** Two proofs are mandatory before an account can be approved. */
export const REQUIRED_ID_DOCUMENTS = 2;

export type KycFileKind = "kyc_form" | "id_document";

export const ID_DOCUMENT_TYPES = [
  "Driver's License",
  "Passport",
  "Company Tax ID / EIN",
  "Business Registration",
  "Other",
] as const;

export type KycFile = {
  id: string;
  kind: KycFileKind;
  /** For ID documents: which proof this is (driver's licence, tax ID, …). */
  label: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

/** Business details transcribed from the returned form. */
export type KycBusiness = {
  businessName: string;
  yearEstablished: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  telephone: string;
  website: string;
  taxId: string;
  natureOfBusiness: string;
  ownerName: string;
  ownerEmail: string;
  ownerMobile: string;
  contactName: string;
  contactEmail: string;
  contactMobile: string;
  accountingName: string;
  accountingEmail: string;
  accountingMobile: string;
  bankName: string;
  bankAccount: string;
  bankAddress: string;
  signedName: string;
  signedTitle: string;
  signedDate: string;
};

export const EMPTY_BUSINESS: KycBusiness = {
  businessName: "", yearEstablished: "", address: "", city: "", state: "", zip: "", country: "",
  telephone: "", website: "", taxId: "", natureOfBusiness: "",
  ownerName: "", ownerEmail: "", ownerMobile: "",
  contactName: "", contactEmail: "", contactMobile: "",
  accountingName: "", accountingEmail: "", accountingMobile: "",
  bankName: "", bankAccount: "", bankAddress: "",
  signedName: "", signedTitle: "", signedDate: "",
};

export type KycRecord = {
  email: string;
  status: KycStatus;
  business: KycBusiness;
  files: KycFile[];
  notes: string;
  sentAt?: string;
  receivedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  /** Trade references are re-checked periodically; blank means no expiry. */
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function emptyKycRecord(email: string): KycRecord {
  const now = new Date().toISOString();
  return {
    email,
    status: "not_started",
    business: { ...EMPTY_BUSINESS },
    files: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

/** Counts only identity proofs — the signed form is tracked separately. */
export function idDocumentCount(record: KycRecord) {
  return record.files.filter((file) => file.kind === "id_document").length;
}

export function hasSignedForm(record: KycRecord) {
  return record.files.some((file) => file.kind === "kyc_form");
}

/** Approval requires the signed form plus two identity documents. */
export function canApprove(record: KycRecord) {
  return hasSignedForm(record) && idDocumentCount(record) >= REQUIRED_ID_DOCUMENTS;
}

export function approvalBlockers(record: KycRecord): string[] {
  const blockers: string[] = [];
  if (!hasSignedForm(record)) blockers.push("Signed KYC form has not been uploaded.");
  const ids = idDocumentCount(record);
  if (ids < REQUIRED_ID_DOCUMENTS) {
    const missing = REQUIRED_ID_DOCUMENTS - ids;
    blockers.push(`${missing} more identity document${missing === 1 ? "" : "s"} required.`);
  }
  return blockers;
}
