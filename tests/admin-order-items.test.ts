import test from "node:test";
import assert from "node:assert/strict";
import {
  customerKey,
  parseSessionItems,
  quantitiesBySlug,
} from "../lib/admin/order-items.ts";

test("Stripe metadata parser restores variants and quantities", () => {
  assert.deepEqual(
    parseSessionItems("emerald-ring:2:Platinum:6.5:D-VS1|studs:1:14K White:::"),
    [
      { slug: "emerald-ring", qty: 2, metal: "Platinum", size: "6.5", grade: "D-VS1" },
      { slug: "studs", qty: 1, metal: "14K White", size: undefined, grade: undefined },
    ],
  );
});

test("Stripe metadata parser rejects empty slugs and normalizes invalid quantities", () => {
  assert.deepEqual(parseSessionItems(":4::::|valid:0:::"), [
    { slug: "valid", qty: 1, metal: undefined, size: undefined, grade: undefined },
  ]);
});

test("stock quantities combine repeated product lines", () => {
  assert.deepEqual(
    [...quantitiesBySlug([
      { slug: "ring", qty: 1 },
      { slug: "ring", qty: 2 },
      { slug: "studs", qty: 1 },
      { slug: " ", qty: 99 },
    ])],
    [["ring", 3], ["studs", 1]],
  );
});

test("customer identity is case-insensitive and whitespace-safe", () => {
  assert.equal(customerKey("  Buyer@Example.COM "), "buyer@example.com");
});
