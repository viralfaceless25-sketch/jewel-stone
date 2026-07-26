import test from "node:test";
import assert from "node:assert/strict";
import {
  computeTotals,
  lineTotal,
  normalizeLineItems,
  parseMoneyToCents,
  parseQuantity,
  parseRate,
} from "../lib/admin/document-math.ts";

test("document money parser converts display dollars to integer cents", () => {
  assert.equal(parseMoneyToCents("$7,350.25"), 735025);
  assert.equal(parseMoneyToCents("125"), 12500);
  assert.equal(parseMoneyToCents("-5"), 0);
  assert.equal(parseMoneyToCents("bad input"), 0);
});

test("document totals use integer cents and invoice tax", () => {
  const items = normalizeLineItems([
    { description: "Diamond", quantity: 2, unitPrice: "1250.50" },
    { description: "Setting", quantity: 1, unitPrice: "899" },
  ]);
  assert.equal(lineTotal(items[0]), 250100);
  assert.deepEqual(computeTotals("invoice", items, "8.875%", 12500), {
    subtotal: 340000,
    taxRate: 8.875,
    taxAmount: 30175,
    shipping: 12500,
    total: 382675,
  });
});

test("memorandum total never applies sales tax or shipping", () => {
  const items = normalizeLineItems([
    { kind: "jewelry", description: "Memo piece", quantity: 1, unitPrice: "18400" },
  ]);
  assert.deepEqual(computeTotals("memo", items, 8.875, 9999), {
    subtotal: 1840000,
    taxRate: 0,
    taxAmount: 0,
    shipping: 0,
    total: 1840000,
  });
});

test("line-item normalization preserves jewelry and stone specifications", () => {
  const [item] = normalizeLineItems([{
    kind: "loose_stone",
    description: "Emerald cut diamond",
    sku: "JS-EM-161",
    carats: "1.61 ct",
    certificateNumber: "IGI 9133044-021A",
    quantity: "2",
    unitPriceCents: 735025,
  }]);
  assert.equal(item.kind, "loose_stone");
  assert.equal(item.code, "JS-EM-161");
  assert.equal(item.diamondCarats, "1.61 ct");
  assert.equal(item.certificateNumber, "IGI 9133044-021A");
  assert.equal(item.quantity, 2);
  assert.equal(item.unitPrice, 735025);
});

test("quantity and rate inputs are bounded", () => {
  assert.equal(parseQuantity(0), 1);
  assert.equal(parseQuantity(20000), 9999);
  assert.equal(parseRate("7.1238"), 7.124);
  assert.equal(parseRate(200), 100);
});
