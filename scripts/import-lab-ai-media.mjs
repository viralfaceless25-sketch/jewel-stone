import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "Lab AI jewelry");

const families = [
  ["graduated diamond necklace", "fn2-graduated-diamond-necklace"],
  ["butterfly pendant", "pd2-butterfly-diamond-pendant"],
  ["cluster flower pendant", "pd3-cluster-flower-pendant"],
  ["cross diamond pendant", "pd1-cross-diamond-pendant"],
  ["fancy drop pendant", "pd5-fancy-drop-pendant"],
  ["heart halo pendant", "pd4-heart-halo-pendant-lab-grown"],
  ["12ct pri soliter ring", "sr12-12ct-solitaire-ring"],
  ["fancy cluster ring", "fr6-fancy-cluster-ring"],
  ["fancy hidden halo oval ring", "fr1-hidden-halo-oval-ring"],
  ["fancy hidden halo rad ring", "fr2-radiant-halo-ring"],
  ["fancy ring double halo cushion ring", "fr3-double-halo-cushion-ring"],
  ["fancy ring emerald hidden halo ring", "fr4-emerald-hidden-halo-ring"],
  ["three stone oval ring", "fr5-three-stone-oval-ring"],
];

async function walk(dir) {
  const results = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...await walk(full));
    else if (/\.png$/i.test(entry.name)) results.push(full);
  }
  return results;
}

function classify(filePath) {
  const file = path.basename(filePath);
  const name = file.toLowerCase();
  const family = families.find(([prefix]) => name.startsWith(prefix));
  if (!family) return null;
  const [, slug] = family;
  if (name.includes("model")) return { slug, output: "model.webp" };
  const view = name.includes("close") ? "close"
    : name.includes("front") ? "front"
    : name.includes("side") || name.includes("back") ? (name.includes("back") ? "back" : "side")
    : null;
  if (!view) return null;
  const metal = /\brg\b/i.test(file) ? "rg" : /\byg\b/i.test(file) ? "yg" : "wg";
  return { slug, output: `angle-${view}-${metal}.webp` };
}

const inputs = await walk(sourceRoot);
const imported = [];
const destinations = new Map();

for (const input of inputs) {
  const target = classify(input);
  if (!target) continue;
  const key = `${target.slug}/${target.output}`;
  if (destinations.has(key)) throw new Error(`Media collision: ${input} and ${destinations.get(key)} -> ${key}`);
  destinations.set(key, input);
  const outputDir = path.join(root, "public", "images", "products", target.slug);
  const outputPath = path.join(outputDir, target.output);
  await fs.mkdir(outputDir, { recursive: true });
  await sharp(input)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 5, smartSubsample: true })
    .toFile(outputPath);
  imported.push({
    source: path.relative(root, input),
    product: target.slug,
    output: path.relative(root, outputPath),
  });
}

const represented = [...new Set(imported.map((item) => item.product))].sort();
await fs.writeFile(
  path.join(root, "data", "lab-ai-media-import.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), supplied: inputs.length, imported: imported.length, products: represented, files: imported }, null, 2)}\n`,
);

console.log(JSON.stringify({ supplied: inputs.length, imported: imported.length, products: represented.length }, null, 2));
