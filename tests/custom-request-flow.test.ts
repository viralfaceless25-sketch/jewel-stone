import assert from "node:assert/strict";
import test from "node:test";
import {
  canCustomerDecide,
  canMarkShipped,
  canOwnerQuote,
  canStartProduction,
  maskEmail,
  toCustomerCustomRequest,
  type CustomRequestRecord,
} from "../lib/custom-request-types";

const request: CustomRequestRecord = {
  id: "JS-20260722-ABC123",
  publicToken: "p".repeat(32),
  ownerToken: "o".repeat(32),
  createdAt: "2026-07-22T00:00:00.000Z",
  updatedAt: "2026-07-22T00:00:00.000Z",
  status: "awaiting_quote",
  name: "Customer",
  email: "customer@example.com",
  phone: "+1 212 555 0100",
  choices: {
    type: "Engagement ring",
    metal: "Platinum",
    shape: "Oval",
    origin: "Natural",
    budget: "$5k–$15k",
  },
  notes: "Low profile",
  referenceFiles: [],
};

test("custom request transitions enforce owner and customer order", () => {
  assert.equal(canOwnerQuote("awaiting_quote"), true);
  assert.equal(canCustomerDecide("awaiting_quote"), false);
  assert.equal(canCustomerDecide("quoted"), true);
  assert.equal(canStartProduction("quoted"), false);
  assert.equal(canStartProduction("accepted"), true);
  assert.equal(canMarkShipped("accepted"), false);
  assert.equal(canMarkShipped("in_production"), true);
  assert.equal(canOwnerQuote("declined"), true);
});

test("customer request view removes owner credentials and contact details", () => {
  const customer = toCustomerCustomRequest(request);
  assert.equal("ownerToken" in customer, false);
  assert.equal("email" in customer, false);
  assert.equal("phone" in customer, false);
  assert.equal(customer.notificationEmail, "cu••••••@example.com");
});

test("email masking handles malformed input safely", () => {
  assert.equal(maskEmail("invalid"), "your email");
  assert.equal(maskEmail("a@example.com"), "a•••@example.com");
});
