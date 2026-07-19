import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import cvdMediaMap from "../data/cvd-media-map.json" with { type: "json" };

const execFileAsync = promisify(execFile);
const root = process.cwd();
const cvdSourceRoot = path.join(root, "CVD jewelry photography");
const cvdOutputRoot = path.join(root, "public", "images", "products");
const arrivalsOutputRoot = path.join(root, "public", "images", "studio-arrivals");

const piecutArrivals = [
  {
    sourceFolder: "Double Heart Ring Piecut",
    slug: "double-heart-piecut-ring",
    title: "Double Heart Piecut Ring",
    category: "Ring",
  },
  {
    sourceFolder: "Marquise Piecut Ring",
    slug: "marquise-piecut-ring",
    title: "Marquise Piecut Ring",
    category: "Ring",
  },
  {
    sourceFolder: "Oval Pendant Piecut",
    slug: "oval-piecut-pendant",
    title: "Oval Piecut Pendant",
    category: "Pendant",
  },
];

async function requireFile(filePath) {
  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat?.isFile() || stat.size === 0) {
    throw new Error(`Missing supplied media: ${path.relative(root, filePath)}`);
  }
  return filePath;
}

async function findStudioImage(sourceDir, stem) {
  const names = await fs.readdir(sourceDir);
  const match = names.find((name) => new RegExp(`^${stem}\\.jpg(?:\\.jpeg)?$`, "i").test(name));
  if (!match) throw new Error(`Missing ${stem} in ${path.relative(root, sourceDir)}`);
  return requireFile(path.join(sourceDir, match));
}

async function writeWebp(input, output) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp(input)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 5, smartSubsample: true })
    .toFile(output);
}

async function writeWebVideo(input, output) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  await execFileAsync("ffmpeg", [
    "-y",
    "-loglevel", "error",
    "-i", input,
    "-an",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "24",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    output,
  ], { maxBuffer: 1024 * 1024 * 4 });
}

async function importCvdGroup(group) {
  const sourceDir = path.join(cvdSourceRoot, group.sourceFolder);
  const outputDir = path.join(cvdOutputRoot, group.publicSlug);
  const imageInputs = await Promise.all(
    Array.from({ length: 8 }, (_, index) => findStudioImage(sourceDir, `S${index + 1}`)),
  );
  const imageOutputs = ["cover.webp", ...Array.from({ length: 7 }, (_, index) => `angle-${index + 1}.webp`)];

  await Promise.all(imageInputs.map((input, index) => writeWebp(input, path.join(outputDir, imageOutputs[index]))));

  const videoInput = await requireFile(path.join(sourceDir, "video.mp4"));
  const videoOutput = path.join(outputDir, "video-web.mp4");
  await writeWebVideo(videoInput, videoOutput);

  const publicDir = `/images/products/${group.publicSlug}`;
  const media = {
    cover: `${publicDir}/cover.webp`,
    gallery: Array.from({ length: 7 }, (_, index) => `${publicDir}/angle-${index + 1}.webp`),
    videoUrl: `${publicDir}/video-web.mp4`,
  };

  return {
    sourceFolder: `CVD jewelry photography/${group.sourceFolder}`,
    publicFolder: `public/images/products/${group.publicSlug}`,
    productCodes: group.productCodes,
    media,
  };
}

async function importPiecutArrival(arrival) {
  const sourceDir = path.join(root, "Pie-cut jewelry photo video", arrival.sourceFolder);
  const outputDir = path.join(arrivalsOutputRoot, arrival.slug);
  const imageInputs = await Promise.all(
    Array.from({ length: 4 }, (_, index) => findStudioImage(sourceDir, `S${index + 1}`)),
  );
  const imageOutputs = ["cover.webp", "angle-1.webp", "angle-2.webp", "angle-3.webp"];
  await Promise.all(imageInputs.map((input, index) => writeWebp(input, path.join(outputDir, imageOutputs[index]))));

  return {
    ...arrival,
    sourceFolder: `Pie-cut jewelry photo video/${arrival.sourceFolder}`,
    cover: `/images/studio-arrivals/${arrival.slug}/cover.webp`,
    gallery: Array.from({ length: 3 }, (_, index) => `/images/studio-arrivals/${arrival.slug}/angle-${index + 1}.webp`),
  };
}

const cvdGroups = [];
for (const group of cvdMediaMap) {
  cvdGroups.push(await importCvdGroup(group));
  console.log(`Imported CVD group: ${group.sourceFolder}`);
}

const arrivals = [];
for (const arrival of piecutArrivals) {
  arrivals.push(await importPiecutArrival(arrival));
  console.log(`Imported Piecut arrival: ${arrival.sourceFolder}`);
}

const products = cvdGroups.flatMap((group) => group.productCodes.map((code) => ({ code, ...group.media })));
const manifest = {
  generatedAt: new Date().toISOString(),
  sourceArchives: [
    "CVD jewelry photography 1.rar",
    "CVD jewelry photography 2.rar",
    "CVD jewelry photography 3.rar",
    "Piecut Jewelry Photography 1.rar",
    "Piecut Jewelry Photography 2.rar",
    "Piecut Jewelry Photography 3.rar",
  ],
  suppliedFiles: 254,
  importedRawFiles: 133,
  existingPiecutFilesVerifiedIdentical: 120,
  excludedFiles: [
    {
      source: "CVD jewelry photography/CVD emerald ring 3 stone/viral slip.pdf",
      reason: "Unrelated utility document; excluded from public source repository.",
    },
  ],
  cvdGroups,
  products,
  piecutArrivals: arrivals,
};

await fs.writeFile(
  path.join(root, "data", "rar-media-import.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(JSON.stringify({ cvdGroups: cvdGroups.length, cvdProducts: products.length, piecutArrivals: arrivals.length }, null, 2));
