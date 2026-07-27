import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PDFDocument, PDFImage } from "pdf-lib";
import sharp from "sharp";

// The JS monogram used on document letterhead. It is neutralised here rather
// than changing the storefront asset, keeping generated paperwork truly
// black-and-white. A missing asset still falls back to drawn initials.

const LOGO_PATH = path.join(process.cwd(), "public", "brand", "jewel-stone-mono-mark.png");

let cached: Buffer | null | undefined;

async function logoBytes() {
  if (cached !== undefined) return cached;
  try {
    cached = await sharp(await readFile(LOGO_PATH))
      .grayscale()
      .png()
      .toBuffer();
  } catch {
    cached = null;
  }
  return cached;
}

export async function embedBrandLogo(pdf: PDFDocument): Promise<PDFImage | null> {
  const bytes = await logoBytes();
  if (!bytes) return null;
  try {
    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}

/** Scale the monogram to a target height, preserving its aspect ratio. */
export function logoBox(image: PDFImage, height: number) {
  const ratio = image.width / image.height;
  return { width: height * ratio, height };
}
