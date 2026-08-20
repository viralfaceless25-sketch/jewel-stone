import "server-only";

import { getAdminSettings } from "./settings";
import { getCustomer } from "./orders";

// Trading terms resolve customer-first, house-default second. A new account
// pays in advance and holds memo goods for a week; an established account can
// be given its own terms on the customer record and every document it receives
// picks them up automatically.

export type ResolvedTerms = {
  /** Wording printed on an invoice, e.g. "Advance payment" or "Net 30". */
  invoiceTerms: string;
  /** How long memo goods may be held before they are due back. */
  memoDays: number;
  /** Days after issue an invoice is due. */
  invoiceDueDays: number;
  /** True when the values came from the customer rather than the house default. */
  fromCustomer: boolean;
};

export async function resolveTerms(email?: string): Promise<ResolvedTerms> {
  const settings = await getAdminSettings().catch(() => null);
  const invoiceDefault = settings?.defaultInvoiceTerms || "Advance payment";
  const memoDefault = typeof settings?.defaultMemoDays === "number" ? settings.defaultMemoDays : 7;
  const invoiceDueDefault =
    typeof settings?.defaultInvoiceDueDays === "number" ? settings.defaultInvoiceDueDays : 30;

  if (!email) {
    return {
      invoiceTerms: invoiceDefault,
      memoDays: memoDefault,
      invoiceDueDays: invoiceDueDefault,
      fromCustomer: false,
    };
  }

  const customer = await getCustomer(email).catch(() => null);
  const invoiceTerms = customer?.paymentTerms?.trim() || invoiceDefault;
  const memoDays = typeof customer?.memoDays === "number" && customer.memoDays >= 0
    ? customer.memoDays
    : memoDefault;
  const invoiceDueDays =
    typeof customer?.invoiceDueDays === "number" && customer.invoiceDueDays >= 0
      ? customer.invoiceDueDays
      : invoiceDueDefault;
  const fromCustomer = Boolean(customer?.paymentTerms?.trim()) ||
    typeof customer?.memoDays === "number" ||
    typeof customer?.invoiceDueDays === "number";

  return { invoiceTerms, memoDays, invoiceDueDays, fromCustomer };
}

/** Memo goods are due back this many days after they go out. */
export function memoDueDate(memoDays: number, from = new Date()) {
  const due = new Date(from);
  due.setDate(due.getDate() + Math.max(0, Math.round(memoDays)));
  return due.toISOString().slice(0, 10);
}

/** An invoice is due this many days after it's issued, e.g. 30 for "Net 30". */
export function invoiceDueDate(invoiceDueDays: number, from = new Date()) {
  const due = new Date(from);
  due.setDate(due.getDate() + Math.max(0, Math.round(invoiceDueDays)));
  return due.toISOString().slice(0, 10);
}

/** Terms wording for a memorandum, e.g. "Return within 7 days". */
export function memoTermsLabel(memoDays: number) {
  if (memoDays <= 0) return "Return on request";
  return `Return within ${memoDays} day${memoDays === 1 ? "" : "s"}`;
}

/** A document is overdue once its due date has passed and it's still open
    (a memo not yet returned, or an invoice not yet paid). */
export function isDocumentOverdue(dueDate: string | undefined, status: string) {
  if (!dueDate) return false;
  if (status === "paid" || status === "returned" || status === "void") return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}
