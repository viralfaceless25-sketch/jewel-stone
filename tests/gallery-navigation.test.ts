import test from "node:test";
import assert from "node:assert/strict";
import { swipeDelta, wrappedIndex } from "../lib/commerce/gallery-navigation.ts";

test("wrappedIndex advances and wraps forward", () => {
  assert.equal(wrappedIndex(1, 4, 1), 2);
  assert.equal(wrappedIndex(3, 4, 1), 0);
});

test("wrappedIndex moves and wraps backward", () => {
  assert.equal(wrappedIndex(2, 4, -1), 1);
  assert.equal(wrappedIndex(0, 4, -1), 3);
});

test("wrappedIndex safely handles an empty gallery", () => {
  assert.equal(wrappedIndex(0, 0, 1), 0);
});

test("swipeDelta accepts horizontal intent in both directions", () => {
  assert.equal(swipeDelta(-60, 10), 1);
  assert.equal(swipeDelta(60, 10), -1);
});

test("swipeDelta rejects short or primarily vertical gestures", () => {
  assert.equal(swipeDelta(30, 2), 0);
  assert.equal(swipeDelta(60, 80), 0);
});
