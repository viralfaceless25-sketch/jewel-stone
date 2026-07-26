// Promotion codes: types and the validation rules, kept free of `server-only`
// so the cart, the checkout API, and the admin panel all judge a code the same
// way. Storage lives in lib/admin/promo-codes.ts.

export const PROMO_KINDS = ["percent", "fixed", "free_shipping"] as const;
export type PromoKind = (typeof PROMO_KINDS)[number];

export const PROMO_SCOPES = ["all", "category", "world", "skus"] as const;
export type PromoScope = (typeof PROMO_SCOPES)[number];

export type PromoCode = {
  /** Uppercase, no spaces — this is the key customers type. */
  code: string;
  kind: PromoKind;
  /** Percent 1-100, or a fixed amount in cents. Ignored for free shipping. */
  value: number;
  active: boolean;
  /** ISO dates (yyyy-mm-dd). Blank means no bound. */
  startsAt?: string;
  expiresAt?: string;
  /** Cart subtotal in cents the order must reach to qualify. */
  minSubtotal?: number;
  /** Total redemptions allowed across all customers. */
  maxRedemptions?: number;
  /** Redemptions allowed per customer e-mail. */
  perCustomerLimit?: number;
  /** Restrict which pieces the discount applies to. */
  scope: PromoScope;
  scopeValues: string[];
  /** Only valid for a customer who has never ordered before. */
  firstOrderOnly: boolean;
  redemptions: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PromoCartItem = {
  slug: string;
  sku?: string;
  category?: string;
  world?: string;
  /** Unit price in cents. */
  price: number;
  qty: number;
};

export type PromoEvaluation =
  | { ok: true; code: string; kind: PromoKind; amountOff: number; freeShipping: boolean; label: string }
  | { ok: false; reason: string };

export function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function formatUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Human label for the admin list, e.g. "20% off" or "$250 off". */
export function promoLabel(promo: Pick<PromoCode, "kind" | "value">) {
  if (promo.kind === "percent") return `${promo.value}% off`;
  if (promo.kind === "fixed") return `${formatUsd(promo.value)} off`;
  return "Free shipping";
}

/** Which cart lines a code applies to, given its scope. */
export function eligibleItems(promo: PromoCode, items: PromoCartItem[]) {
  if (promo.scope === "all") return items;
  const wanted = promo.scopeValues.map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!wanted.length) return items;
  return items.filter((item) => {
    if (promo.scope === "category") return wanted.includes((item.category ?? "").toLowerCase());
    if (promo.scope === "world") return wanted.includes((item.world ?? "").toLowerCase());
    return wanted.includes((item.sku ?? "").toLowerCase()) || wanted.includes(item.slug.toLowerCase());
  });
}

function subtotalOf(items: PromoCartItem[]) {
  return items.reduce((sum, item) => sum + item.price * Math.max(1, item.qty), 0);
}

/**
 * The single source of truth for whether a code applies. `context` carries what
 * only the server knows — how many times this customer has already redeemed it,
 * and whether they have ordered before.
 */
export function evaluatePromo(
  promo: PromoCode | null,
  items: PromoCartItem[],
  context: { customerRedemptions?: number; isFirstOrder?: boolean; today?: string } = {},
): PromoEvaluation {
  if (!promo) return { ok: false, reason: "That code isn't recognised." };
  if (!promo.active) return { ok: false, reason: "That code is no longer active." };

  const today = context.today ?? new Date().toISOString().slice(0, 10);
  if (promo.startsAt && today < promo.startsAt) {
    return { ok: false, reason: "That code isn't available yet." };
  }
  if (promo.expiresAt && today > promo.expiresAt) {
    return { ok: false, reason: "That code has expired." };
  }
  if (typeof promo.maxRedemptions === "number" && promo.redemptions >= promo.maxRedemptions) {
    return { ok: false, reason: "That code has been fully redeemed." };
  }
  if (
    typeof promo.perCustomerLimit === "number" &&
    (context.customerRedemptions ?? 0) >= promo.perCustomerLimit
  ) {
    return { ok: false, reason: "You've already used that code." };
  }
  if (promo.firstOrderOnly && context.isFirstOrder === false) {
    return { ok: false, reason: "That code is for first orders only." };
  }

  const cartSubtotal = subtotalOf(items);
  if (typeof promo.minSubtotal === "number" && cartSubtotal < promo.minSubtotal) {
    return { ok: false, reason: `Spend ${formatUsd(promo.minSubtotal)} to use that code.` };
  }

  const applicable = eligibleItems(promo, items);
  if (!applicable.length) {
    return { ok: false, reason: "That code doesn't apply to anything in your bag." };
  }

  if (promo.kind === "free_shipping") {
    return { ok: true, code: promo.code, kind: promo.kind, amountOff: 0, freeShipping: true, label: "Free shipping" };
  }

  const applicableSubtotal = subtotalOf(applicable);
  const rawOff = promo.kind === "percent"
    ? Math.round((applicableSubtotal * promo.value) / 100)
    : promo.value;
  // Never discount below zero, and never beyond the eligible lines.
  const amountOff = Math.max(0, Math.min(rawOff, applicableSubtotal));
  if (amountOff <= 0) return { ok: false, reason: "That code has no value on this order." };

  return {
    ok: true,
    code: promo.code,
    kind: promo.kind,
    amountOff,
    freeShipping: false,
    label: promoLabel(promo),
  };
}
