import assert from "node:assert/strict";
import test from "node:test";
import {
  createCustomerSessionToken,
  parseCustomerSessionToken,
} from "../lib/account/customer-session";

const secret = "test-session-secret";
const now = Date.parse("2026-07-27T12:00:00.000Z");

test("customer session carries normalized identity and revocation version", () => {
  const token = createCustomerSessionToken(
    " Buyer@Example.COM ",
    4,
    secret,
    now + 60_000,
  );
  assert.deepEqual(parseCustomerSessionToken(token, secret, now), {
    email: "buyer@example.com",
    expiresAt: now + 60_000,
    tokenVersion: 4,
  });
});

test("customer session rejects tampering and the wrong signing secret", () => {
  const token = createCustomerSessionToken("buyer@example.com", 1, secret, now + 60_000);
  assert.equal(parseCustomerSessionToken(`${token}x`, secret, now), null);
  assert.equal(parseCustomerSessionToken(token, "different-secret", now), null);
});

test("customer session rejects expired and legacy unversioned claims", () => {
  const expired = createCustomerSessionToken("buyer@example.com", 1, secret, now - 1);
  assert.equal(parseCustomerSessionToken(expired, secret, now), null);

  const legacyPayload = Buffer.from(`buyer@example.com|${now + 60_000}`).toString("base64url");
  assert.equal(parseCustomerSessionToken(`${legacyPayload}.invalid`, secret, now), null);
});
