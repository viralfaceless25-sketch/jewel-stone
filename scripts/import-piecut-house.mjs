// Imports the in-house Natural PIECUT studio sets (Pie-cut jewelry photo video/*)
// into public/images/products/<slug>/ as web-ready webp + mp4.
//
// Mapping is by shape + piece type, cross-checked against the
// "Natural Pie-cut in House" sheet of JEWELSTONE_final_Inventory_price.xlsx.
//
// Idempotent: skips any output that already exists. Run:
//   node scripts/import-piecut-house.mjs

import { existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_ROOT = join(ROOT, "Pie-cut jewelry photo video");
const OUT_ROOT = join(ROOT, "public", "images", "products");

/** sourceFolder -> product slug (SKU in comment) */
const MAP = {
  "EM-RING-02": "jsnd062601-emerald-piecut-ring",            // JSND062601
  "EM-EAR-01-26-06": "jsnd062602-emerald-piecut-earrings",   // JSND062602
  "EM-PEN-01-26-06": "jsnd062603-emerald-piecut-pendant",    // JSND062603
  "OV-EAR-01-26-06": "jsnd062604-oval-piecut-earrings",      // JSND062604
  "HE-RING-01": "jsnd062605-heart-piecut-ring",              // JSND062605
  "ASS-EAR-01-26-06": "jsnd062606-asscher-piecut-earrings",  // JSND062606
  "STAR-EAR-01-26-06": "jsnd062607-star-piecut-earrings",    // JSND062607
  "HEART-PEN-01-26-06": "jsnd062608-heart-piecut-pendant",   // JSND062608
  "HE-EAR-01-26-06": "jsnd062609-heart-piecut-earrings",     // JSND062609
  "PE-EAR-01-26-06": "jsnd062610-pear-piecut-earrings",      // JSND062610
  "PEAR-PEN-01-26-06": "jsnd062611-pear-piecut-pendant",     // JSND062611
};

const WIDTH = 1400;

let created = 0;
let skipped = 0;

for (const [folder, slug] of Object.entries(MAP)) {
  const srcDir = join(SRC_ROOT, folder);
  if (!existsSync(srcDir)) {
    console.error(`MISSING SOURCE: ${folder}`);
    continue;
  }

  const outDir = join(OUT_ROOT, slug);
  mkdirSync(outDir, { recursive: true });

  const stills = readdirSync(srcDir)
    .filter((f) => /^S\d+\.jpg$/i.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

  for (const [index, file] of stills.entries()) {
    const outName = index === 0 ? "cover.webp" : `angle-${index}.webp`;
    const outPath = join(outDir, outName);
    if (existsSync(outPath)) {
      skipped += 1;
      continue;
    }
    await sharp(join(srcDir, file))
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
    created += 1;
  }

  const video = join(srcDir, "video.mp4");
  const videoOut = join(outDir, "video-web.mp4");
  if (existsSync(video) && !existsSync(videoOut)) {
    copyFileSync(video, videoOut);
    created += 1;
  }

  console.log(`${folder} -> ${slug} (${stills.length} stills)`);
}

console.log(`\ncreated ${created} file(s), skipped ${skipped} existing`);
