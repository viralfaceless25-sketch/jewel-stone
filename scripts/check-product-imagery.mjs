#!/usr/bin/env node
// Verifies every image path referenced by data/products.ts actually exists on
// disk, so a failed generation surfaces as a build-time error instead of a
// broken <img> in front of a customer.
//
// Usage: node scripts/check-product-imagery.mjs

import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// products.ts is TypeScript; read it through a tiny transpile-free parse of the
// literal image paths rather than pulling in a TS loader.
import { readFileSync } from "node:fs";
const src = readFileSync(join(ROOT, "data", "products.ts"), "utf8");

const referenced = new Set();
for (const m of src.matchAll(/"(\/images\/[^"]+\.(?:jpg|jpeg|png|webp))"/g)) referenced.add(m[1]);

// Reconstruct the paths the labGrown() helper builds at runtime.
for (const m of src.matchAll(/labGrown\(\{[^}]*?slug: "([^"]+)"/gs)) {
  const d = `/images/products/${m[1]}`;
  ["cover.jpg", "angle-1.jpg", "angle-2.jpg", "model.jpg"].forEach((f) => referenced.add(`${d}/${f}`));
}
// ...and the signatureGallery() helper.
for (const m of src.matchAll(/signatureGallery\("([^"]+)",\s*(\d+)\)/g)) {
  for (let i = 1; i <= Number(m[2]); i++) referenced.add(`/images/products/${m[1]}/angle-${i}.jpg`);
}

const missing = [];
const empty = [];
for (const p of [...referenced].sort()) {
  const f = join(ROOT, "public", p);
  if (!existsSync(f)) missing.push(p);
  else if (statSync(f).size < 1024) empty.push(p);
}

console.log(`checked ${referenced.size} image path(s)`);
if (empty.length) { console.error(`\n${empty.length} suspiciously small (<1KB):`); empty.forEach((p) => console.error("  " + p)); }
if (missing.length) {
  console.error(`\n${missing.length} MISSING:`);
  missing.forEach((p) => console.error("  " + p));
  console.error("\nRun: node scripts/gen-product-imagery.mjs   (resumable — regenerates only what's absent)");
  process.exit(1);
}
if (empty.length) process.exit(1);
console.log("all product imagery present");
