#!/usr/bin/env node
// Drives Codex `image_gen` to produce catalogue imagery for every lab-grown SKU.
//
// Per product: cover.jpg + angle-1.jpg + angle-2.jpg (1600x1600, dark sweep) and
// model.jpg (1200x1600, worn on the body part that suits the category).
//
// Resumable: a product whose 4 files already exist is skipped, so a failed or
// interrupted run can simply be re-run. One Codex process per product keeps a
// single bad generation from poisoning the rest.
//
// Usage:
//   node scripts/gen-product-imagery.mjs [--only SKU[,SKU]] [--limit N] [--dry-run]

import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = ["cover.jpg", "angle-1.jpg", "angle-2.jpg", "model.jpg"];

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n) => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };

/** slug + name per SKU, read straight from the app's own product data. */
function productsFromSource() {
  const src = readFileSync(join(ROOT, "data", "products.ts"), "utf8");
  const out = new Map();
  const re = /labGrown\(\{[^}]*?sku: "([^"]+)"[^}]*?slug: "([^"]+)"[^}]*?\}\)/gs;
  for (const m of src.matchAll(re)) out.set(m[1], m[2]);
  return out;
}

/** Where the piece is worn, per category. */
function wornShot(cat, name) {
  const c = cat.toLowerCase();
  if (c.includes("bracelet")) return "an elegant female wrist and forearm, relaxed, wearing the bracelet, resting on soft ivory silk";
  if (c.includes("necklace")) return "the décolletage and neckline of an elegant woman wearing the necklace, soft ivory knit top, warm light, head cropped above the chin";
  if (c.includes("pendant")) return "the décolletage and neckline of an elegant woman wearing the pendant on a fine chain, soft ivory knit top, head cropped above the chin";
  if (c.includes("stud") || c.includes("earring")) return "a close profile of a woman's ear and jawline wearing the earring, hair tucked back, soft-focus dark background, cinematic rim light";
  return "an elegant female hand, natural realistic skin with fine texture, neutral manicure, wearing the ring on the ring finger, resting on soft ivory silk, warm champagne light. Anatomically correct — exactly five fingers, natural nail beds, no distortion";
}

function spec(row, slug) {
  const dir = `public/images/products/${slug}`;
  const gold = row["Gold Type"];
  const shape = row["Center Stone"] === "Mixed" ? "as implied by the product name" : `${row["Center Stone"]} cut`;
  const ct = row["Total Carat"];
  const pcs = row["Diamond Pieces"];
  const size = row["US Size / Length"];

  return `# CODEX TASK — catalogue imagery for ${row.SKU} (${row["Product Name"]})

Use your **imagegen** / \`image_gen\` tool. **Images only — do NOT edit any code, data or components.**

Quality bar: these must read as **real studio photographs of real jewellery**. If a shot
looks CGI or 3D-rendered, it fails.

## The piece (exact specs — do not invent, do not embellish)
- **${row["Product Name"]}** — ${row["Style"]}, category: ${row["Category"]}
- Metal: **${gold}** — render this metal colour exactly and consistently in all 4 shots
- Centre stone: ${shape}
- **${ct} carat total diamond weight** across **${pcs} diamond(s)** — the stone scale MUST
  read as ${ct}ct total. This is the single most important spec: do not render a generic
  size. ${Number(ct) >= 8 ? "This is a large, statement piece — the diamonds should look substantial." : ""}
${row._stoneSize ? `- Individual stone size: **${row._stoneSize}** — match this exactly.\n` : ""}- Size / length: ${size}
- Colourless, eye-clean, crisp facets, realistic internal fire

## Global style (all 4 shots)
Photoreal high-end jewellery e-commerce photography. Real camera look: 100mm macro,
f/8–f/11 so the whole piece is sharp front-to-back, large softbox key + subtle fill,
believable specular highlights on the metal, real contact shadow. Colour-accurate and
restrained.

**Negatives (weight strongly):** no CGI look, no 3D render look, no plastic or waxy metal,
no text, no watermark, no logos, no oversaturation, no rainbow glare, no malformed or
extra prongs, no floating object, no busy background, no props, no glitter.

## Shots — save to these EXACT paths (.jpg)

1. \`${dir}/cover.jpg\` — **square 1600x1600**. The piece centred, shot straight on, hero
   presentation. Background: seamless **pure black (#000000)** studio sweep with soft falloff
   and a subtle reflection beneath — must match our existing catalogue exactly.
   ~18% margin all round. Whole piece in frame, nothing cropped at any edge.

2. \`${dir}/angle-1.jpg\` — **square 1600x1600**. Same piece, same background, 3/4 elevated
   view (~30° above) showing the setting profile and crown facets.

3. \`${dir}/angle-2.jpg\` — **square 1600x1600**. Same piece, same background, side/profile
   view showing depth and how the stones sit.

4. \`${dir}/model.jpg\` — **portrait 1200x1600**. On-body: ${wornShot(row["Category"], row["Product Name"])}.
   Tasteful editorial beauty crop. The piece must match the specs above exactly.

## Done criteria
Report each file written with pixel dimensions; flag failures. No code edits.
`;
}

const rows = JSON.parse(execFileSync("python3", ["-c", `
import pandas as pd, json
d = pd.read_excel(${JSON.stringify(join(ROOT, "JEWELSTONE_Inventory_US_Sizes (1).xlsx"))})
print(json.dumps(d.to_dict("records")))
`]).toString());

/** The CVD stock line lives in data/cvd-products.ts, not the spreadsheet.
 *  Map it onto the same row shape so one queue covers the whole catalogue. */
function cvdRows() {
  const src = readFileSync(join(ROOT, "data", "cvd-products.ts"), "utf8");
  const out = [];
  for (const m of src.matchAll(/\{ code: "([^"]+)", name: "([^"]+)", slug: "([^"]+)", category: "([^"]+)", style: "([^"]+)", centerStone: "([^"]+)", stoneSize: "([^"]+)", stones: ([0-9]+), carats: ([0-9.]+), sizeInfo: "([^"]+)"/g)) {
    out.push({
      SKU: m[1],
      "Product Name": m[2],
      Style: m[5],
      Category: m[4],
      "Gold Type": "14K White Gold",
      "Center Stone": m[6],
      "Total Carat": Number(m[9]),
      "Diamond Pieces": Number(m[8]),
      "US Size / Length": m[10],
      _slug: m[3],
      _stoneSize: m[7],
    });
  }
  return out;
}

const slugs = productsFromSource();
for (const r of cvdRows()) {
  slugs.set(String(r.SKU), r._slug);
  rows.push(r);
}
const only = val("--only")?.split(",").map((s) => s.trim());
const limit = val("--limit") ? Number(val("--limit")) : Infinity;

let done = 0, skipped = 0, failed = [];
const queue = rows.filter((r) => !only || only.includes(String(r.SKU)));

/** The repo lives on a removable volume that occasionally drops for a moment.
 *  Wait for it rather than dying mid-batch. */
function waitForVolume(tries = 30) {
  for (let i = 0; i < tries; i++) {
    try {
      writeFileSync(join(ROOT, ".volume-probe"), "x");
      rmSync(join(ROOT, ".volume-probe"), { force: true });
      return true;
    } catch {
      execFileSync("sleep", ["10"]);
    }
  }
  return false;
}

async function generate(row, sku, slug, dir) {
  const specPath = join(ROOT, `.codex-spec-${sku}.md`);
  writeFileSync(specPath, spec(row, slug));
  mkdirSync(dir, { recursive: true });
  try {
    await execFileAsync("codex", ["exec", "-s", "workspace-write",
      `Read ${specPath.replace(ROOT + "/", "")} in this repo and execute it exactly. Generate the 4 images with image_gen and save to the exact paths given. Images only, do not edit code.`],
      { cwd: ROOT, timeout: 20 * 60 * 1000, maxBuffer: 1 << 26 });
  } catch {
    // fall through to the file check — codex may still have written the images
  } finally {
    rmSync(specPath, { force: true });
  }
  return SHOTS.filter((s) => !existsSync(join(dir, s)));
}

/** Work through one product: retry once, survive a volume drop. */
async function runOne(row) {
  const sku = String(row.SKU);
  const slug = slugs.get(sku);
  if (!slug) { failed.push(`${sku}: no slug in products.ts`); return; }

  // The repo sits on a removable volume that has dropped mid-run before. A
  // dropped disk makes `codex exec` hang rather than throw, so the ENOENT catch
  // below never fires and a worker can burn its whole 20-minute timeout writing
  // nowhere. Check the volume is actually there before spending a generation.
  if (!existsSync(join(ROOT, "package.json"))) {
    console.log(`wait  ${sku.padEnd(11)} volume gone — waiting for it to come back`);
    if (!waitForVolume()) { failed.push(`${sku}: volume never came back`); return; }
    console.log(`ok    volume back, resuming`);
  }

  const dir = join(ROOT, "public", "images", "products", slug);
  if (SHOTS.every((s) => existsSync(join(dir, s)))) {
    skipped++;
    console.log(`skip  ${sku.padEnd(11)} ${slug}`);
    return;
  }

  let missing = SHOTS;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      missing = await generate(row, sku, slug, dir);
      if (!missing.length) break;
    } catch (e) {
      if (String(e?.code) === "ENOENT" && !existsSync(ROOT)) {
        console.log(`wait  ${sku.padEnd(11)} volume dropped, waiting...`);
        if (!waitForVolume()) { failed.push(`${sku}: volume never came back`); break; }
      } else if (attempt >= 2) {
        failed.push(`${sku}: ${String(e?.message || e).slice(0, 90)}`);
      }
    }
  }

  done++;
  if (missing.length) {
    if (!failed.some((f) => f.startsWith(sku + ":"))) failed.push(`${sku}: missing ${missing.join(", ")}`);
    console.log(`FAIL  ${sku.padEnd(11)} ${slug} (${missing.length} shots missing)   [${done}/${queue.length}]`);
  } else {
    console.log(`ok    ${sku.padEnd(11)} ${slug}   [${done}/${queue.length}]`);
  }
}

// Several codex processes at once: each spends most of its life waiting on
// image_gen, so the wall-clock win is close to linear. Capped low enough to
// stay polite to the API and to the removable volume.
const CONCURRENCY = Number(val("--jobs") ?? 3);

if (flag("--dry-run")) {
  for (const row of queue) console.log(`would generate ${row.SKU} -> ${slugs.get(String(row.SKU))}`);
  done = queue.length;
} else {
  const work = [...queue];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (work.length) {
      if (done >= limit) return;
      await runOne(work.shift());
    }
  });
  await Promise.all(workers);

  // One normalisation pass at the end — cheaper than after every product.
  try {
    execFileSync("python3", [join(ROOT, "scripts", "normalize-backgrounds.py"), "--dir", join(ROOT, "public", "images", "products")],
      { stdio: ["ignore", "inherit", "ignore"] });
  } catch { /* best-effort; the standalone script can re-run */ }
}

console.log(`\ngenerated ${done - failed.length}, skipped ${skipped}, failed ${failed.length}`);
if (failed.length) { console.log("FAILED:"); failed.forEach((f) => console.log("  " + f)); process.exitCode = 1; }
