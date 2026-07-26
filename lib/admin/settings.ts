import "server-only";

import { brand } from "@/data/site";
import { kvGet, kvSet } from "@/lib/kv";

export type AdminSettings = {
  displayName: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tagline: string;
  defaultTaxRate: number;
  defaultShipping: number;
  invoicePrefix: string;
  memoPrefix: string;
  defaultPaymentInstructions: string;
  /** Printed on invoices and memoranda so customers can settle three ways. */
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  zelleId: string;
  /** House defaults for a customer with no agreed terms of their own. */
  defaultInvoiceTerms: string;
  defaultMemoDays: number;
  updatedAt: string;
};

const key = "jewelstone:admin-settings";

export const defaultAdminSettings: AdminSettings = {
  displayName: brand.name,
  legalName: process.env.INVOICE_LEGAL_NAME ?? brand.name,
  address: brand.address,
  phone: brand.phone,
  email: brand.email,
  website: brand.website,
  tagline: brand.tagline,
  defaultTaxRate: 0,
  defaultShipping: 0,
  invoicePrefix: "INV",
  memoPrefix: "MEMO",
  defaultPaymentInstructions: "",
  bankName: "",
  bankAccountNumber: "2910099681",
  bankRoutingNumber: "021000021",
  zelleId: "5513413256",
  // New customers pay up front and hold memo goods for a week; established
  // accounts get their own terms on the customer record.
  defaultInvoiceTerms: "Advance payment",
  defaultMemoDays: 7,
  updatedAt: new Date(0).toISOString(),
};

function clean(value: unknown, fallback: string, max: number) {
  const result = String(value ?? "").trim().slice(0, max);
  return result || fallback;
}

function prefix(value: unknown, fallback: string) {
  const result = String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  return result || fallback;
}

export async function getAdminSettings() {
  const stored = await kvGet<Partial<AdminSettings>>(key);
  return { ...defaultAdminSettings, ...(stored ?? {}) };
}

export async function saveAdminSettings(input: Partial<AdminSettings>) {
  const current = await getAdminSettings();
  const next: AdminSettings = {
    displayName: clean(input.displayName, current.displayName, 100),
    legalName: clean(input.legalName, current.legalName, 160),
    address: clean(input.address, current.address, 300),
    phone: clean(input.phone, current.phone, 60),
    email: clean(input.email, current.email, 160),
    website: clean(input.website, current.website, 200),
    tagline: clean(input.tagline, current.tagline, 120),
    defaultTaxRate: Math.max(0, Math.min(100, Number(input.defaultTaxRate ?? current.defaultTaxRate) || 0)),
    defaultShipping: Math.max(0, Math.round(Number(input.defaultShipping ?? current.defaultShipping) || 0)),
    invoicePrefix: prefix(input.invoicePrefix, current.invoicePrefix),
    memoPrefix: prefix(input.memoPrefix, current.memoPrefix),
    defaultPaymentInstructions: String(input.defaultPaymentInstructions ?? current.defaultPaymentInstructions).trim().slice(0, 3000),
    bankName: String(input.bankName ?? current.bankName).trim().slice(0, 120),
    bankAccountNumber: String(input.bankAccountNumber ?? current.bankAccountNumber).trim().slice(0, 40),
    bankRoutingNumber: String(input.bankRoutingNumber ?? current.bankRoutingNumber).trim().slice(0, 40),
    zelleId: String(input.zelleId ?? current.zelleId).trim().slice(0, 80),
    defaultInvoiceTerms: clean(input.defaultInvoiceTerms, current.defaultInvoiceTerms, 80),
    defaultMemoDays: Math.max(0, Math.min(365, Math.round(Number(input.defaultMemoDays ?? current.defaultMemoDays) || 0))),
    updatedAt: new Date().toISOString(),
  };
  await kvSet(key, next);
  return next;
}

