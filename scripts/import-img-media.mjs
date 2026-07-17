import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "img");

const ringSlugs = {
  "1-oval": "sr1-1ct-solitaire-ring",
  "1-round": "sr1-round-1ct-solitaire-ring",
  "2-emerald": "sr2-2ct-solitaire-ring",
  "3-pear": "sr3-3ct-solitaire-ring",
  "5-marquise": "sr5-5ct-solitaire-ring",
  "6-radiant": "sr6-6ct-solitaire-ring",
  "8-cushion": "sr8-8ct-solitaire-ring",
};

function classify(file) {
  const name = file.toLowerCase();
  const carat = name.match(/^(\d+)ct/)?.[1];
  if (!carat) return null;

  let slug;
  if (name.includes("stud")) slug = `st${carat}-${carat}ct-diamond-studs`;
  else if (name.includes("bracelate")) slug = `tb${carat}-${carat}ct-tennis-bracelet`;
  else if (name.includes("soliter")) {
    const shape = name.includes("oval") ? "oval"
      : name.includes(" rd ") ? "round"
      : name.includes(" em ") ? "emerald"
      : name.includes(" pe ") ? "pear"
      : name.includes(" mq ") ? "marquise"
      : name.includes(" rad ") ? "radiant"
      : name.includes(" cu ") ? "cushion"
      : null;
    slug = shape ? ringSlugs[`${carat}-${shape}`] : null;
  }
  if (!slug) return null;

  let metal = /\brg\b/i.test(file) ? "rg" : /\byg\b/i.test(file) ? "yg" : /\bwg\b/i.test(file) ? "wg" : null;
  if (!metal && name.startsWith("2ct em") && name.includes("close-up")) metal = "yg";
  if (!metal && name.startsWith("3ct tennis bracelate") && name.includes("45 view")) metal = "rg";
  const view = name.includes("model") ? "model"
    : name.includes("close") ? "angle-close"
    : name.includes("45") ? "angle-45"
    : name.includes("front") ? "angle-front"
    : name.includes("side") ? "angle-side"
    : name.includes("stud") && metal ? "sheet"
    : null;
  if (!view) return null;
  return { slug, output: view === "model" ? "model.webp" : `${view}-${metal}.webp` };
}

const files = (await fs.readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith(".png"));
const imported = [];
const unmatched = [];
const destinations = new Map();

for (const file of files) {
  const target = classify(file);
  if (!target) {
    unmatched.push(file);
    continue;
  }
  const destinationKey = `${target.slug}/${target.output}`;
  if (destinations.has(destinationKey)) {
    throw new Error(`Media collision: ${file} and ${destinations.get(destinationKey)} -> ${destinationKey}`);
  }
  destinations.set(destinationKey, file);
  const outputDir = path.join(root, "public", "images", "products", target.slug);
  const outputPath = path.join(outputDir, target.output);
  await fs.mkdir(outputDir, { recursive: true });
  await sharp(path.join(sourceDir, file))
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, effort: 5, smartSubsample: true })
    .toFile(outputPath);
  imported.push({ source: `img/${file}`, product: target.slug, output: `public/images/products/${target.slug}/${target.output}` });
}

await fs.writeFile(
  path.join(root, "data", "img-media-import.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), imported, unmatched }, null, 2)}\n`,
);

console.log(JSON.stringify({ supplied: files.length, imported: imported.length, unmatched }, null, 2));
