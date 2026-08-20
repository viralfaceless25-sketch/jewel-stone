import "server-only";

import { randomBytes } from "node:crypto";
import { kvGet, kvGetMany, kvSet, kvSetAdd, kvSetMembers } from "@/lib/kv";
import { nextDocumentNumber } from "@/lib/admin/inventory";
import { getAdminSettings } from "@/lib/admin/settings";
import { invoiceDueDate, memoDueDate, memoTermsLabel, resolveTerms } from "@/lib/admin/terms";
import {
  computeTotals,
  looksLikeEmail,
  normalizeLineItems,
  parseDateOnly,
  parseMoneyToCents,
  type DocumentKind,
  type DocumentLineItem,
  type DocumentStatus,
} from "./document-math";

export type { DocumentKind, DocumentLineItem, DocumentStatus } from "./document-math";

export type DocumentCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  shippingAddress: string;
};

export type BusinessDocument = {
  id: string;
  number: string;
  kind: DocumentKind;
  issuer: {
    displayName: string;
    legalName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    tagline: string;
  };
  createdAt: string;
  updatedAt: string;
  issueDate: string;
  dueDate?: string;
  terms: string;
  customer: DocumentCustomer;
  lineItems: DocumentLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shipping: number;
  total: number;
  notes: string;
  paymentInstructions: string;
  status: DocumentStatus;
  orderId?: string;
  sentAt?: string;
  paidAt?: string;
  returnedAt?: string;
  voidedAt?: string;
};

export type DocumentDraft = {
  kind: DocumentKind;
  customer: Partial<DocumentCustomer>;
  lineItems: unknown;
  issueDate?: unknown;
  dueDate?: unknown;
  terms?: unknown;
  taxRate?: unknown;
  shipping?: unknown;
  shippingCents?: unknown;
  notes?: unknown;
  paymentInstructions?: unknown;
  orderId?: unknown;
};

export type DocumentPatch = Partial<Omit<DocumentDraft, "kind">> & { status?: DocumentStatus };

export class DocumentError extends Error {
  constructor(
    public readonly code:
      | "document_not_found"
      | "document_void"
      | "customer_name_required"
      | "customer_email_invalid"
      | "line_items_required",
  ) {
    super(code);
    this.name = "DocumentError";
  }
}

const indexKey = "jewelstone:documents";
const recordKey = (number: string) => `jewelstone:document:${number}`;
const isDocumentNumber = (value: string) => /^[A-Z0-9]{2,10}-\d{4,10}$/.test(value);
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function customerFrom(raw: Partial<DocumentCustomer>): DocumentCustomer {
  const customer = {
    name: clean(raw.name, 160),
    email: clean(raw.email, 200).toLowerCase(),
    phone: clean(raw.phone, 60),
    address: clean(raw.address, 500),
    shippingAddress: clean(raw.shippingAddress, 500),
  };
  if (!customer.name) throw new DocumentError("customer_name_required");
  if (customer.email && !looksLikeEmail(customer.email)) {
    throw new DocumentError("customer_email_invalid");
  }
  return customer;
}

function bodyFrom(kind: DocumentKind, draft: DocumentDraft, fallbackTerms?: string, fallbackDueDate?: string) {
  const lineItems = normalizeLineItems(draft.lineItems);
  if (!lineItems.length) throw new DocumentError("line_items_required");
  const shippingCents =
    typeof draft.shippingCents === "number"
      ? draft.shippingCents
      : parseMoneyToCents(draft.shipping);
  const issueDate = parseDateOnly(draft.issueDate) ?? new Date().toISOString().slice(0, 10);
  const dueDate = parseDateOnly(draft.dueDate) ?? fallbackDueDate;
  const orderId = clean(draft.orderId, 120);
  return {
    customer: customerFrom(draft.customer ?? {}),
    lineItems,
    issueDate,
    ...(dueDate ? { dueDate } : {}),
    terms: clean(draft.terms, 80) || fallbackTerms || (kind === "memo" ? "Return within 7 days" : "Advance payment"),
    ...computeTotals(kind, lineItems, draft.taxRate, shippingCents),
    notes: clean(draft.notes, 5000),
    paymentInstructions: kind === "invoice" ? clean(draft.paymentInstructions, 3000) : "",
    ...(orderId ? { orderId } : {}),
  };
}

async function save(document: BusinessDocument) {
  await kvSet(recordKey(document.number), document);
  await kvSetAdd(indexKey, document.number);
  return document;
}

export async function createDocument(draft: DocumentDraft) {
  const kind: DocumentKind = draft.kind === "memo" ? "memo" : "invoice";
  const now = new Date().toISOString();
  const settings = await getAdminSettings();
  const number = await nextDocumentNumber(
    kind === "memo" ? "MEMO" : "INV",
    kind === "memo" ? settings.memoPrefix : settings.invoicePrefix,
  );
  // A customer with agreed terms gets them automatically; everyone else gets
  // the house default (advance payment, 7-day memo).
  const terms = await resolveTerms(draft.customer?.email ? String(draft.customer.email) : undefined);
  const fallbackTerms = kind === "memo" ? memoTermsLabel(terms.memoDays) : terms.invoiceTerms;
  const fallbackDueDate = kind === "memo"
    ? memoDueDate(terms.memoDays)
    : invoiceDueDate(terms.invoiceDueDays);
  const enrichedDraft = {
    ...draft,
    taxRate: draft.taxRate === undefined ? settings.defaultTaxRate : draft.taxRate,
    shippingCents:
      (draft.shipping === undefined || String(draft.shipping).trim() === "") &&
      draft.shippingCents === undefined
        ? settings.defaultShipping
        : draft.shippingCents,
    paymentInstructions:
      draft.paymentInstructions === undefined
        ? settings.defaultPaymentInstructions
        : draft.paymentInstructions,
  };
  return save({
    id: randomBytes(9).toString("base64url"),
    number,
    kind,
    issuer: {
      displayName: settings.displayName,
      legalName: settings.legalName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      tagline: settings.tagline,
    },
    createdAt: now,
    updatedAt: now,
    status: "draft",
    ...bodyFrom(kind, enrichedDraft, fallbackTerms, fallbackDueDate),
  } satisfies BusinessDocument);
}

export async function getDocument(number: string) {
  if (!isDocumentNumber(number)) return null;
  return kvGet<BusinessDocument>(recordKey(number));
}

export async function listDocuments() {
  const numbers = await kvSetMembers(indexKey);
  const rows = await kvGetMany<BusinessDocument>(numbers.map(recordKey));
  return rows
    .filter((row): row is BusinessDocument => Boolean(row))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number.localeCompare(a.number));
}

export async function updateDocument(number: string, patch: DocumentPatch) {
  const current = await getDocument(number);
  if (!current) throw new DocumentError("document_not_found");
  if (current.status === "void") throw new DocumentError("document_void");

  const bodyEdited = [
    patch.customer,
    patch.lineItems,
    patch.issueDate,
    patch.dueDate,
    patch.terms,
    patch.taxRate,
    patch.shipping,
    patch.shippingCents,
    patch.notes,
    patch.paymentInstructions,
    patch.orderId,
  ].some((value) => value !== undefined);

  const body = bodyEdited
    ? bodyFrom(current.kind, {
        kind: current.kind,
        customer: { ...current.customer, ...(patch.customer ?? {}) },
        lineItems:
          patch.lineItems ??
          current.lineItems.map((item) => ({ ...item, unitPriceCents: item.unitPrice })),
        issueDate: patch.issueDate ?? current.issueDate,
        dueDate: patch.dueDate ?? current.dueDate,
        terms: patch.terms ?? current.terms,
        taxRate: patch.taxRate ?? current.taxRate,
        shippingCents:
          typeof patch.shippingCents === "number"
            ? patch.shippingCents
            : patch.shipping !== undefined
              ? undefined
              : current.shipping,
        shipping: patch.shipping,
        notes: patch.notes ?? current.notes,
        paymentInstructions: patch.paymentInstructions ?? current.paymentInstructions,
        orderId: patch.orderId ?? current.orderId,
      })
    : null;

  const status = patch.status ?? current.status;
  const now = new Date().toISOString();
  return save({
    ...current,
    ...(body ?? {}),
    status,
    updatedAt: now,
    ...(status === "sent" && !current.sentAt ? { sentAt: now } : {}),
    ...(status === "paid" && !current.paidAt ? { paidAt: now } : {}),
    ...(status === "returned" && !current.returnedAt ? { returnedAt: now } : {}),
  });
}

export async function voidDocument(number: string) {
  const current = await getDocument(number);
  if (!current) throw new DocumentError("document_not_found");
  if (current.status === "void") return current;
  const now = new Date().toISOString();
  return save({ ...current, status: "void", voidedAt: now, updatedAt: now });
}
