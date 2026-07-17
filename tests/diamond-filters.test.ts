import test from "node:test";
import assert from "node:assert/strict";
import {
  diamondSearchHref,
  matchesDiamondFilters,
  normalizeDiamondFilters,
} from "../lib/commerce/diamond-filters.ts";

test("normalizes supported search values", () => {
  const result = normalizeDiamondFilters(
    new URLSearchParams("shape=Oval&origin=Natural&carat=2-3"),
  );

  assert.deepEqual(result, { shape: "Oval", origin: "Natural", carat: "2-3" });
});

test("drops unknown search values", () => {
  const result = normalizeDiamondFilters(
    new URLSearchParams("shape=Triangle&origin=Mined&carat=huge"),
  );

  assert.deepEqual(result, { shape: "", origin: "", carat: "" });
});

test("builds a shareable diamond search URL", () => {
  assert.equal(
    diamondSearchHref({ shape: "Oval", origin: "Lab-Grown", carat: "2-3" }),
    "/diamonds?shape=Oval&origin=Lab-Grown&carat=2-3",
  );
  assert.equal(
    diamondSearchHref({ shape: "", origin: "", carat: "" }),
    "/diamonds",
  );
});

test("matches all selected diamond filters", () => {
  const filters = { shape: "Oval", origin: "Lab-Grown", carat: "2-3" } as const;

  assert.equal(
    matchesDiamondFilters({ shape: "Oval", origin: "Lab-Grown", carats: 2.5 }, filters),
    true,
  );
  assert.equal(
    matchesDiamondFilters({ shape: "Oval", origin: "Natural", carats: 2.5 }, filters),
    false,
  );
});

test("applies carat boundaries consistently", () => {
  const product = { shape: "Round", origin: "Natural", carats: 2 };

  assert.equal(matchesDiamondFilters(product, { shape: "", origin: "", carat: "1-2" }), false);
  assert.equal(matchesDiamondFilters(product, { shape: "", origin: "", carat: "2-3" }), true);
});
