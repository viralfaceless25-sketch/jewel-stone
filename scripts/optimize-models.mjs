#!/usr/bin/env node
// Rebuilds every `-meshy.glb` in source-assets/models into public web-ready `-opt.glb`
// (Draco mesh compression + WebP textures). Raw Meshy exports are ~16-24MB
// each, which is ~16s on 4G before the viewer shows anything; the optimized
// output is ~1-2.5MB.
//
// The registry in lib/models.ts must only ever point at `-opt.glb`. Raw
// `-meshy.glb` files are inputs, not deliverables — .gitignore keeps them out
// of the repo.
//
// Usage: node scripts/optimize-models.mjs [--check]
//   --check  verify every registry entry resolves to an existing, compressed
//            file; exit non-zero otherwise. Suitable for CI.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = join(ROOT, "source-assets", "models");
const MODELS = join(ROOT, "public", "models");
const MB = (b) => (b / 1048576).toFixed(2) + "MB";

/** Parse the glTF JSON chunk out of a .glb container. */
function gltfJson(file) {
  const b = readFileSync(file);
  return JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString("utf8"));
}

function isCompressed(file) {
  const used = gltfJson(file).extensionsUsed || [];
  return used.includes("KHR_draco_mesh_compression") && used.includes("EXT_texture_webp");
}

function registryEntries() {
  const src = readFileSync(join(ROOT, "lib", "models.ts"), "utf8");
  return [...src.matchAll(/"([a-z0-9-]+)":\s*"(\/models\/[^"]+)"/g)].map((m) => ({
    slug: m[1],
    url: m[2],
    file: join(ROOT, "public", m[2]),
  }));
}

function check() {
  let bad = 0;
  for (const e of registryEntries()) {
    const problems = [];
    if (!existsSync(e.file)) problems.push("missing file");
    else {
      if (!e.url.endsWith("-opt.glb")) problems.push("registry points at an unoptimized file");
      if (!isCompressed(e.file)) problems.push("not Draco/WebP compressed");
      if (statSync(e.file).size > 6 * 1048576) problems.push(`too large (${MB(statSync(e.file).size)})`);
    }
    if (problems.length) {
      bad++;
      console.error(`FAIL ${e.slug}: ${problems.join("; ")}`);
    } else {
      console.log(`ok   ${e.slug.padEnd(30)} ${MB(statSync(e.file).size)}`);
    }
  }
  if (bad) {
    console.error(`\n${bad} model(s) failed. Run: node scripts/optimize-models.mjs`);
    process.exit(1);
  }
  console.log("\nall models optimized and wired");
}

function build() {
  const inputs = readdirSync(SOURCES).filter((f) => f.endsWith("-meshy.glb"));
  if (!inputs.length) {
    console.error("no *-meshy.glb inputs found in source-assets/models");
    process.exit(1);
  }
  let totalIn = 0, totalOut = 0;
  for (const f of inputs) {
    const src = join(SOURCES, f);
    const dst = join(MODELS, f.replace("-meshy.glb", "-opt.glb"));
    execFileSync(
      "npx",
      ["-y", "@gltf-transform/cli@4", "optimize", src, dst, "--texture-compress", "webp", "--compress", "draco"],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    const i = statSync(src).size, o = statSync(dst).size;
    totalIn += i; totalOut += o;
    console.log(`${f.replace("-meshy.glb", "").padEnd(30)} ${MB(i).padStart(8)} -> ${MB(o).padStart(8)}  (${(o / i * 100).toFixed(1)}%)`);
  }
  console.log(`\ntotal ${MB(totalIn)} -> ${MB(totalOut)}`);
}

process.argv.includes("--check") ? check() : build();
