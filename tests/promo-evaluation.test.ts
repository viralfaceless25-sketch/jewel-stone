import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluatePromo,
  type PromoCartItem,
  type PromoCode,
} from "../lib/admin/promo-shared";

const item: PromoCartItem = {
  slug: "diamond-ring",
  sku: "JS-R-1",
  category: "Rings",
  world: "natural",
  price: 100_000,
  qty: 1,
};

function promo(patch: Partial<PromoCode> = {}): PromoCode {
  return {
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    active: true,
    scope: "all",
    scopeValues: [],
    firstOrderOnly: false,
    redemptions: 0,
    notes: "",
    createdAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    ...patch,
  };
}

test("promotion calculates a bounded percentage discount", () => {
  assert.deepEqual(evaluatePromo(promo(), [item]), {
    ok: true,
    code: "WELCOME10",
    kind: "percent",
    amountOff: 10_000,
    freeShipping: false,
    label: "10% off",
  });
});

test("per-customer limits fail closed when identity is missing", () => {
  const result = evaluatePromo(promo({ perCustomerLimit: 1 }), [item]);
  assert.deepEqual(result, { ok: false, reason: "Sign in to use that code." });
});

test("per-customer limits reject a customer at the cap", () => {
  const result = evaluatePromo(
    promo({ perCustomerLimit: 1 }),
    [item],
    { customerRedemptions: 1 },
  );
  assert.deepEqual(result, { ok: false, reason: "You've already used that code." });
});

test("first-order promotions require confirmed customer history", () => {
  assert.deepEqual(
    evaluatePromo(promo({ firstOrderOnly: true }), [item]),
    { ok: false, reason: "Sign in to use that code." },
  );
  assert.deepEqual(
    evaluatePromo(promo({ firstOrderOnly: true }), [item], { isFirstOrder: false }),
    { ok: false, reason: "That code is for first orders only." },
  );
  assert.equal(
    evaluatePromo(promo({ firstOrderOnly: true }), [item], { isFirstOrder: true }).ok,
    true,
  );
});

test("legacy free-shipping codes cannot record zero-value redemptions", () => {
  assert.deepEqual(
    evaluatePromo(promo({ kind: "free_shipping", value: 0 }), [item]),
    {
      ok: false,
      reason: "Free-shipping codes are retired because shipping is already complimentary.",
    },
  );
});
