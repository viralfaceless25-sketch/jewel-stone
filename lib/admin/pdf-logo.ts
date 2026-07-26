import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PDFDocument, PDFImage } from "pdf-lib";

// The JS monogram used on the letterhead of every generated document. Read from
// disk at render time and cached for the life of the lambda. If it can't be
// loaded the callers fall back to drawing the "JS" initials, so a missing asset
// never breaks document generation.

const LOGO_PATH = path.join(process.cwd(), "public", "brand", "jewel-stone-mono-mark.png");

let cached: Buffer | null | undefined;

async function logoBytes() {
  if (cached !== undefined) return cached;
  try {
    cached = await readFile(LOGO_PATH);
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
