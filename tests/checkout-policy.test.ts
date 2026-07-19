import test from "node:test";
import assert from "node:assert/strict";
import {
  checkoutMode,
  checkoutOrigin,
  envFlag,
} from "../lib/commerce/checkout-policy.ts";

test("checkout policy sends only made-to-order products to payment", () => {
  assert.equal(checkoutMode(["lab-grown"]), "payment");
  assert.equal(checkoutMode(["signature"]), "reservation");
  assert.equal(checkoutMode(["lab-grown", "signature"]), "reservation");
  assert.equal(checkoutMode([]), "reservation");
});

test("signature checkout requires an explicit inventory override", () => {
  assert.equal(checkoutMode(["signature"], true), "payment");
  assert.equal(checkoutMode(["lab-grown", "signature"], true), "payment");
});

test("environment flags require an explicit truthy value", () => {
  assert.equal(envFlag("true"), true);
  assert.equal(envFlag(" ON "), true);
  assert.equal(envFlag("false"), false);
  assert.equal(envFlag(undefined), false);
});

test("configured checkout origin strips paths and rejects unsafe protocols", () => {
  assert.equal(
    checkoutOrigin("http://localhost:3002/api/checkout", "https://shop.example.com/path", true),
    "https://shop.example.com",
  );
  assert.throws(
    () => checkoutOrigin("http://localhost:3002/api/checkout", "javascript:alert(1)", true),
    /site_url_invalid/,
  );
  assert.throws(
    () => checkoutOrigin("http://localhost:3002/api/checkout", "not a URL", true),
    /site_url_invalid/,
  );
  assert.throws(
    () => checkoutOrigin("http://localhost:3002/api/checkout", "http://shop.example.com", true),
    /site_url_invalid/,
  );
});

test("production checkout requires an explicit canonical site URL", () => {
  assert.throws(
    () => checkoutOrigin("https://forged.example/api/checkout", undefined, true),
    /site_url_unconfigured/,
  );
  assert.equal(
    checkoutOrigin("http://localhost:3002/api/checkout", undefined, false),
    "http://localhost:3002",
  );
});
