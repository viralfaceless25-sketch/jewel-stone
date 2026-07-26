export type DocumentKind = "invoice" | "memo";
export type DocumentStatus = "draft" | "sent" | "paid" | "returned" | "void";
export type DocumentItemKind = "jewelry" | "loose_stone" | "service";

export type DocumentLineItem = {
  kind: DocumentItemKind;
  description: string;
  code?: string;
  category?: string;
  metal?: string;
  metalWeight?: string;
  diamondCarats?: string;
  grossWeight?: string;
  shape?: string;
  color?: string;
  clarity?: string;
  cutPolishSymmetry?: string;
  certificateNumber?: string;
  quantity: number;
  /** Integer cents per item. */
  unitPrice: number;
};

export type DocumentTotals = {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shipping: number;
  total: number;
};

export const DOCUMENT_STATUSES: DocumentStatus[] = ["draft", "sent", "paid", "returned", "void"];
export const MAX_LINE_ITEMS = 100;
export const MAX_CENTS = 1_000_000_000;

function clampCents(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.round(value), MAX_CENTS);
}

export function parseMoneyToCents(value: unknown) {
  if (typeof value === "number") return clampCents(value * 100);
  const cleaned = String(value ?? "").replace(/[$,\s]/g, "");
  if (!cleaned || !/^-?\d*\.?\d*$/.test(cleaned)) return 0;
  return clampCents(Number(cleaned) * 100);
}

export function parseRate(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[%\s]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(100, Math.round(parsed * 1000) / 1000);
}

export function parseQuantity(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.min(9999, Math.round(parsed));
}

export function lineTotal(item: Pick<DocumentLineItem, "quantity" | "unitPrice">) {
  return clampCents(parseQuantity(item.quantity) * clampCents(item.unitPrice));
}

export function computeTotals(
  kind: DocumentKind,
  lineItems: DocumentLineItem[],
  taxRate: unknown,
  shippingCents: number,
): DocumentTotals {
  const subtotal = clampCents(lineItems.reduce((sum, item) => sum + lineTotal(item), 0));
  const rate = kind === "memo" ? 0 : parseRate(taxRate);
  const taxAmount = Math.round((subtotal * rate) / 100);
  const shipping = kind === "memo" ? 0 : clampCents(shippingCents);
  return { subtotal, taxRate: rate, taxAmount, shipping, total: subtotal + taxAmount + shipping };
}

function text(value: unknown, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function itemKind(value: unknown): DocumentItemKind {
  return value === "loose_stone" || value === "service" ? value : "jewelry";
}

export function normalizeLineItems(raw: unknown): DocumentLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_LINE_ITEMS)
    .map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>;
      const description = text(row.description, 300);
      const directCents =
        typeof row.unitPriceCents === "number" ? clampCents(row.unitPriceCents) : undefined;
      const unitPrice = directCents ?? parseMoneyToCents(row.unitPrice);
      return {
        kind: itemKind(row.kind),
        description,
        code: text(row.code || row.sku, 80) || undefined,
        category: text(row.category, 100) || undefined,
        metal: text(row.metal, 120) || undefined,
        metalWeight: text(row.metalWeight, 40) || undefined,
        diamondCarats: text(row.diamondCarats || row.carats, 40) || undefined,
        grossWeight: text(row.grossWeight, 40) || undefined,
        shape: text(row.shape, 80) || undefined,
        color: text(row.color, 30) || undefined,
        clarity: text(row.clarity, 30) || undefined,
        cutPolishSymmetry: text(row.cutPolishSymmetry, 80) || undefined,
        certificateNumber: text(row.certificateNumber, 100) || undefined,
        quantity: parseQuantity(row.quantity ?? row.qty),
        unitPrice,
      } satisfies DocumentLineItem;
    })
    .filter((item) => item.description && item.unitPrice >= 0);
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}

export function formatDocumentDate(value?: string) {
  if (!value) return "—";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function parseDateOnly(value: unknown) {
  const result = text(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : undefined;
}

export function looksLikeEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function isDocumentStatus(value: unknown): value is DocumentStatus {
  return typeof value === "string" && DOCUMENT_STATUSES.includes(value as DocumentStatus);
}

export function statusLabel(status: DocumentStatus) {
  return status === "draft"
    ? "Draft"
    : status === "sent"
      ? "Sent"
      : status === "paid"
        ? "Paid"
        : status === "returned"
          ? "Returned"
          : "Void";
}

