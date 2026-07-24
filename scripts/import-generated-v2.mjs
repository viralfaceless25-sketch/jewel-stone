// Converts the v2 ChatGPT set (/tmp/genimg/<slug>/*.png) into web-ready webp under
// public/images/products/<slug>/, renamed to the site's convention:
//   angle-<view>-<metal>.webp   (view: front|45|close|side ; metal: wg|yg|rg)
//   model.webp
// Then prints the LAB_MEDIA specs so data/products.ts can be wired.
//
//   node scripts/import-generated-v2.mjs

import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SRC = "/tmp/genimg";
const OUT_ROOT = join(process.cwd(), "public", "images", "products");
const WIDTH = 1400;

const VIEW_MAP = { front: "front", side: "side", angled: "45", "close-up": "close", "close": "close" };
const METALS = { wg: "wg", yg: "yg", rg: "rg" };

function parse(file) {
  const base = file.replace(/\.png$/i, "");
  const low = base.toLowerCase();
  if (low.includes("with model") || low.includes("model")) return { model: true };
  const metal = Object.keys(METALS).find((m) => new RegExp(`\\b${m}\\b`).test(low));
  let view = null;
  if (low.includes("close-up") || low.includes("close up") || low.includes("close")) view = "close";
  else if (low.includes("angled")) view = "45";
  else if (low.includes("front")) view = "front";
  else if (low.includes("side")) view = "side";
  if (!metal || !view) return null;
  return { metal, view };
}

const specs = {};
let created = 0;
let skippedBad = [];

for (const slug of readdirSync(SRC).filter((d) => existsSync(join(SRC, d)) && !d.startsWith("."))) {
  const srcDir = join(SRC, slug);
  if (!readdirSync(srcDir).some((f) => f.endsWith(".png"))) continue;
  const outDir = join(OUT_ROOT, slug);
  mkdirSync(outDir, { recursive: true });
  specs[slug] = { wg: new Set(), yg: new Set(), rg: new Set(), model: false };

  for (const file of readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith(".png"))) {
    const meta = parse(file);
    if (!meta) { skippedBad.push(`${slug}/${file}`); continue; }
    const outName = meta.model ? "model.webp" : `angle-${meta.view}-${meta.metal}.webp`;
    await sharp(join(srcDir, file))
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(outDir, outName));
    created += 1;
    if (meta.model) specs[slug].model = true;
    else specs[slug][meta.metal].add(meta.view);
  }
}

console.log(`created ${created} webp file(s)`);
if (skippedBad.length) console.log("UNPARSED:", skippedBad);

// Emit LAB_MEDIA lines. Order views front,45,close,side for a sensible gallery.
const order = ["front", "45", "close", "side"];
const sortViews = (set) => order.filter((v) => set.has(v));
console.log("\n--- LAB_MEDIA specs ---");
for (const [slug, s] of Object.entries(specs)) {
  const parts = [];
  for (const m of ["wg", "yg", "rg"]) {
    const v = sortViews(s[m]);
    if (v.length) parts.push(`${m}: [${v.map((x) => `"${x}"`).join(", ")}]`);
  }
  const model = s.model ? `, "white"` : "";
  console.log(`  "${slug}": importedMedia("${slug}", { ${parts.join(", ")} }${model}),`);
}
