import assert from "node:assert/strict";
import test from "node:test";
import { getProductBySlug } from "../data/products";
import {
  faqPageSchema,
  organizationSchema,
  productSchema,
  websiteSchema,
} from "../lib/seo/schema";

test("organization schema uses verified Jewel Stone contact and location facts", () => {
  const schema = organizationSchema();

  assert.equal(schema["@type"], "JewelryStore");
  assert.equal(schema.telephone, "+1 551-341-3256");
  assert.equal(schema.email, "ishan@thejewelstone.com");
  assert.equal(schema.address.streetAddress, "62 W 47th St, Suite 505");
  assert.equal(schema.address.postalCode, "10036");
});

test("website schema does not advertise a missing site-search route", () => {
  const schema = websiteSchema();

  assert.equal("potentialAction" in schema, false);
});

test("product schema exposes visible price, seller, and available 3D media", () => {
  const product = getProductBySlug("jsnd062601-emerald-piecut-ring");
  assert.ok(product);

  const schema = productSchema(product);
  assert.equal(schema.offers.price, product.price);
  assert.equal(schema.offers.priceCurrency, "USD");
  assert.equal(schema.offers.seller["@id"].endsWith("/#organization"), true);
  assert.equal("subjectOf" in schema, true);
});

test("FAQ schema mirrors supplied visible questions and answers", () => {
  const schema = faqPageSchema([
    { question: "What is PIECUT jewelry?", answer: "Multiple diamonds are matched into one silhouette." },
  ]);

  assert.equal(schema.mainEntity[0].name, "What is PIECUT jewelry?");
  assert.equal(
    schema.mainEntity[0].acceptedAnswer.text,
    "Multiple diamonds are matched into one silhouette.",
  );
});
