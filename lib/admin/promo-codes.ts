import "server-only";

import { kvGet, kvGetMany, kvIncrBy, kvSet, kvSetAdd, kvSetMembers, kvSetRemove } from "@/lib/kv";
import { customerKey } from "./order-items";
import { normalizeCode, type PromoCode, type PromoKind, type PromoScope } from "./promo-shared";

// Storage for promotion codes and their redemptions. Codes are owned entirely by
// the admin panel; the storefront only ever reads them through validation.

export * from "./promo-shared";

const PROMO_INDEX = "jewelstone:promos";
const promoKey = (code: string) => `jewelstone:promo:${normalizeCode(code)}`;
// Per-customer redemption counter, so "one per customer" can be enforced.
const customerCountKey = (code: string, email: string) =>
  `jewelstone:promo-use:${normalizeCode(code)}:${customerKey(email)}`;

export type PromoRedemption = {
  code: string;
  email: string;
  orderId: string;
  amountOff: number;
  at: string;
};

const redemptionKey = (code: string) => `jewelstone:promo-log:${normalizeCode(code)}`;

export async function getPromo(code: string): Promise<PromoCode | null> {
  if (!code.trim()) return null;
  return kvGet<PromoCode>(promoKey(code));
}

export async function listPromos(): Promise<PromoCode[]> {
  const codes = await kvSetMembers(PROMO_INDEX);
  if (!codes.length) return [];
  const rows = await kvGetMany<PromoCode>(codes.map((code) => `jewelstone:promo:${code}`));
  return rows
    .filter((row): row is PromoCode => row !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export type PromoDraft = {
  code: string;
  kind: PromoKind;
  value: number;
  active?: boolean;
  startsAt?: string;
  expiresAt?: string;
  minSubtotal?: number;
  maxRedemptions?: number;
  perCustomerLimit?: number;
  scope?: PromoScope;
  scopeValues?: string[];
  firstOrderOnly?: boolean;
  notes?: string;
};

export class PromoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoError";
  }
}

function positiveOrUndefined(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : undefined;
}

export async function savePromo(draft: PromoDraft): Promise<PromoCode> {
  const code = normalizeCode(draft.code);
  if (!/^[A-Z0-9._-]{3,40}$/.test(code)) {
    throw new PromoError("Use 3-40 letters, numbers, dot, dash, or underscore.");
  }
  if (draft.kind === "percent" && (draft.value < 1 || draft.value > 100)) {
    throw new PromoError("A percentage must be between 1 and 100.");
  }
  if (draft.kind === "fixed" && draft.value <= 0) {
    throw new PromoError("Enter an amount greater than zero.");
  }
  if (draft.startsAt && draft.expiresAt && draft.startsAt > draft.expiresAt) {
    throw new PromoError("The end date is before the start date.");
  }

  const existing = await getPromo(code);
  const now = new Date().toISOString();
  const next: PromoCode = {
    code,
    kind: draft.kind,
    value: draft.kind === "free_shipping" ? 0 : Math.round(draft.value),
    active: draft.active ?? existing?.active ?? true,
    ...(draft.startsAt ? { startsAt: draft.startsAt } : {}),
    ...(draft.expiresAt ? { expiresAt: draft.expiresAt } : {}),
    ...(positiveOrUndefined(draft.minSubtotal) ? { minSubtotal: positiveOrUndefined(draft.minSubtotal) } : {}),
    ...(positiveOrUndefined(draft.maxRedemptions) ? { maxRedemptions: positiveOrUndefined(draft.maxRedemptions) } : {}),
    ...(positiveOrUndefined(draft.perCustomerLimit) ? { perCustomerLimit: positiveOrUndefined(draft.perCustomerLimit) } : {}),
    scope: draft.scope ?? "all",
    scopeValues: (draft.scopeValues ?? []).map((value) => value.trim()).filter(Boolean),
    firstOrderOnly: draft.firstOrderOnly ?? false,
    // Redemptions are never reset by an edit — they are a record of what happened.
    redemptions: existing?.redemptions ?? 0,
    notes: (draft.notes ?? "").trim().slice(0, 1000),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await kvSet(promoKey(code), next);
  await kvSetAdd(PROMO_INDEX, code);
  return next;
}

export async function setPromoActive(code: string, active: boolean) {
  const promo = await getPromo(code);
  if (!promo) return null;
  const next = { ...promo, active, updatedAt: new Date().toISOString() };
  await kvSet(promoKey(code), next);
  return next;
}

export async function deletePromo(code: string) {
  await kvSet(promoKey(code), null);
  await kvSetRemove(PROMO_INDEX, normalizeCode(code));
}

export async function customerRedemptionCount(code: string, email?: string) {
  if (!email) return 0;
  return (await kvGet<number>(customerCountKey(code, email))) ?? 0;
}

/**
 * Record a redemption once payment succeeds. Counters are atomic so two
 * simultaneous orders cannot push a limited code past its cap.
 */
export async function recordRedemption(entry: PromoRedemption) {
  const code = normalizeCode(entry.code);
  const promo = await getPromo(code);
  if (!promo) return null;

  const redemptions = Math.max(0, promo.redemptions + 1);
  await kvSet(promoKey(code), { ...promo, redemptions, updatedAt: new Date().toISOString() });
  if (entry.email) await kvIncrBy(customerCountKey(code, entry.email), 1);

  const log = (await kvGet<PromoRedemption[]>(redemptionKey(code))) ?? [];
  await kvSet(redemptionKey(code), [entry, ...log].slice(0, 500));
  return redemptions;
}

export async function listRedemptions(code: string) {
  return (await kvGet<PromoRedemption[]>(redemptionKey(code))) ?? [];
}
