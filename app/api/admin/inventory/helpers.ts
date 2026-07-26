import "server-only";

import { revalidatePath } from "next/cache";
import { products, type ProductCategory } from "@/data/products";
import { listAdminProducts, type AdminProduct } from "@/lib/admin/inventory";

export const CATEGORIES: ProductCategory[] = [
  "Rings",
  "Earrings",
  "Bracelets",
  "Necklaces",
  "Pendants",
  "Loose Diamonds",
  "Custom Jewelry",
];

export const MAX_IMAGES = 8;
export const MAX_IMAGE_CHARS = 130_000;
export const MAX_TOTAL_IMAGE_CHARS = 900_000;

export function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/collections/[category]", "page");
  revalidatePath("/products/[slug]", "page");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export async function takenSlugs() {
  return new Set([
    ...products.map((product) => product.slug),
    ...(await listAdminProducts()).map((product) => product.slug),
  ]);
}

export function uniqueSlug(value: string, taken: Set<string>) {
  const root = slugify(value) || "piece";
  let candidate = root;
  let index = 2;
  while (taken.has(candidate)) candidate = `${root}-${index++}`;
  taken.add(candidate);
  return candidate;
}

export const str = (value: unknown, max = 400) =>
  typeof value === "string" ? value.trim().slice(0, max) : String(value ?? "").trim().slice(0, max);

export function num(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeCategory(value: unknown): ProductCategory | null {
  const raw = str(value, 60).toLowerCase();
  const exact = CATEGORIES.find((category) => category.toLowerCase() === raw);
  if (exact) return exact;
  if (/ring|band|solitaire/.test(raw)) return "Rings";
  if (/earring|stud|hoop|drop/.test(raw)) return "Earrings";
  if (/bracelet|bangle/.test(raw)) return "Bracelets";
  if (/necklace|chain|riviera|riviere/.test(raw)) return "Necklaces";
  if (/pendant|charm/.test(raw)) return "Pendants";
  if (/loose|diamond|stone/.test(raw)) return "Loose Diamonds";
  if (/custom|bespoke/.test(raw)) return "Custom Jewelry";
  return null;
}

export type ProductDraft = {
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  style: string;
  material: string;
  centerStone: string;
  carats: number;
  colorClarity: string;
  sizeInfo: string;
  description: string;
};

export function readDraft(input: Record<string, unknown>):
  | { ok: true; draft: ProductDraft }
  | { ok: false; error: string } {
  const name = str(input.name, 160);
  if (!name) return { ok: false, error: "Add a product name." };
  const category = normalizeCategory(input.category);
  if (!category) return { ok: false, error: "Choose a valid category." };
  const price = Math.round(num(input.price));
  if (price <= 0) return { ok: false, error: "Price must be greater than zero." };
  return {
    ok: true,
    draft: {
      name,
      sku: str(input.sku, 64),
      category,
      price,
      style: str(input.style, 120),
      material: str(input.material, 120),
      centerStone: str(input.centerStone, 120),
      carats: Math.max(0, Math.round(num(input.carats) * 100) / 100),
      colorClarity: str(input.colorClarity, 120),
      sizeInfo: str(input.sizeInfo, 160),
      description: str(input.description, 2000),
    },
  };
}

export function buildProduct(draft: ProductDraft, slug: string, existing: AdminProduct | null): AdminProduct {
  const now = new Date().toISOString();
  return {
    slug,
    sku: draft.sku || slug.toUpperCase().slice(0, 24),
    name: draft.name,
    category: draft.category,
    price: draft.price,
    style: draft.style || draft.category,
    material: draft.material,
    centerStone: draft.centerStone,
    carats: draft.carats,
    colorClarity: draft.colorClarity,
    sizeInfo: draft.sizeInfo,
    description: draft.description || `${draft.name} by Jewel Stone.`,
    images: existing?.images ?? [],
    displayCount: existing?.displayCount ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function validateImages(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_IMAGES) {
    return { ok: false as const, error: `Use up to ${MAX_IMAGES} images.` };
  }
  let total = 0;
  const images: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(item)) {
      return { ok: false as const, error: "Images must be JPEG, PNG, or WebP." };
    }
    if (item.length > MAX_IMAGE_CHARS) {
      return { ok: false as const, error: "One image is too large after compression." };
    }
    total += item.length;
    images.push(item);
  }
  if (total > MAX_TOTAL_IMAGE_CHARS) {
    return { ok: false as const, error: "Combined images are too large." };
  }
  return { ok: true as const, images };
}
