#!/usr/bin/env node
// Writes data/imagery-manifest.json — the slugs whose generated imagery is
// actually complete on disk.
//
// products.ts consults this so a product still mid-generation keeps its
// Coming Soon placeholder instead of rendering a broken <img>. Imagery is
// produced by a long batch (scripts/gen-product-imagery.mjs), so the two must
// never be assumed in sync: re-run this after every batch.
//
// Usage: node scripts/build-imagery-manifest.mjs

import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = ["cover.jpg", "angle-1.jpg", "angle-2.jpg", "model.jpg"];

const src = readFileSync(join(ROOT, "data", "products.ts"), "utf8");
const slugs = [...src.matchAll(/labGrown\(\{[^}]*?slug: "([^"]+)"/gs)].map((m) => m[1]);

const ready = slugs.filter((slug) => {
  const dir = join(ROOT, "public", "images", "products", slug);
  return SHOTS.every((s) => {
    const f = join(dir, s);
    return existsSync(f) && statSync(f).size > 1024;
  });
});

const out = join(ROOT, "data", "imagery-manifest.json");
writeFileSync(out, JSON.stringify({ ready: ready.sort() }, null, 2) + "\n");
console.log(`${ready.length}/${slugs.length} lab-grown products have complete imagery`);
if (ready.length < slugs.length) {
  console.log(`${slugs.length - ready.length} still on the Coming Soon placeholder`);
}
