import "server-only";

import { kvGet, kvGetMany, kvSet, kvSetAdd, kvSetMembers, kvSetRemove, kvIncrBy } from "@/lib/kv";
import { products as catalogProducts, type Product, type ProductCategory } from "@/data/products";

// Inventory = the static Excel catalogue + a Redis overlay the owner controls.
// The overlay carries on-hand stock and website visibility; admin-added products
// live entirely in Redis. Both the storefront and the admin read through here so
// the two can never disagree.

export const DEFAULT_STOCK = 1;

export type StockOverlay = {
  slug: string;
  stock: number;
  visible: boolean;
  updatedAt: string;
};

/** A product created from the admin panel (dialog or Excel import). */
export type AdminProduct = {
  slug: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  style: string;
  material: string;
  centerStone: string;
  carats: number;
  colorClarity: string;
  sizeInfo: string;
  description: string;
  /** Data-URL images (Vercel's filesystem is read-only at runtime). */
  images: string[];
  /** How many of the uploaded images the website shows. */
  displayCount: number;
  createdAt: string;
  updatedAt: string;
};

export type InventoryRow = {
  slug: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  priceLabel: string;
  image: string;
  stock: number;
  visible: boolean;
  source: "catalog" | "admin";
  imageCount: number;
  /** Blocks publishing to the website until at least one image exists. */
  missingImages: boolean;
};

const overlayKey = (slug: string) => `jewelstone:stock:${slug}`;
const adminProductKey = (slug: string) => `jewelstone:product:${slug}`;
const ADMIN_PRODUCT_INDEX = "jewelstone:products";

function usd(price: number) {
  return `$${price.toLocaleString("en-US")}`;
}

export function adminProductToProduct(item: AdminProduct): Product {
  const gallery = item.images.slice(0, Math.max(1, item.displayCount || item.images.length));
  return {
    id: item.sku,
    sku: item.sku,
    name: item.name,
    slug: item.slug,
    category: item.category,
    source: "lab-grown",
    style: item.style,
    material: item.material,
    centerStone: item.centerStone,
    carats: item.carats,
    diamondPieces: 1,
    colorClarity: item.colorClarity,
    price: item.price,
    priceLabel: usd(item.price),
    sizeInfo: item.sizeInfo,
    description: item.description,
    image: gallery[0] ?? "/images/placeholder-coming-soon-portrait.jpg",
    gallery,
    featured: false,
  };
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const slugs = await kvSetMembers(ADMIN_PRODUCT_INDEX);
  if (!slugs.length) return [];
  const rows = await kvGetMany<AdminProduct>(slugs.map(adminProductKey));
  return rows.filter((row): row is AdminProduct => row !== null);
}

export async function getAdminProduct(slug: string) {
  return kvGet<AdminProduct>(adminProductKey(slug));
}

export async function saveAdminProduct(item: AdminProduct) {
  await kvSet(adminProductKey(item.slug), item);
  await kvSetAdd(ADMIN_PRODUCT_INDEX, item.slug);
}

export async function deleteAdminProduct(slug: string) {
  await kvSetRemove(ADMIN_PRODUCT_INDEX, slug);
  await kvSet(adminProductKey(slug), null);
}

export async function getOverlays(slugs: string[]): Promise<Map<string, StockOverlay>> {
  const rows = await kvGetMany<StockOverlay>(slugs.map(overlayKey));
  const map = new Map<string, StockOverlay>();
  rows.forEach((row, index) => {
    if (row) map.set(slugs[index], row);
  });
  return map;
}

export async function setOverlay(slug: string, patch: { stock?: number; visible?: boolean }) {
  const current = await kvGet<StockOverlay>(overlayKey(slug));
  const next: StockOverlay = {
    slug,
    stock: patch.stock ?? current?.stock ?? DEFAULT_STOCK,
    visible: patch.visible ?? current?.visible ?? true,
    updatedAt: new Date().toISOString(),
  };
  await kvSet(overlayKey(slug), next);
  return next;
}

/**
 * Atomically reduce stock when a piece sells. Uses a Redis counter so two
 * simultaneous checkouts can never both claim the last one-of-one piece.
 */
export async function decrementStock(slug: string, quantity = 1) {
  const current = await kvGet<StockOverlay>(overlayKey(slug));
  if (!current) {
    // Seed from the default, then apply the sale.
    const stock = Math.max(0, DEFAULT_STOCK - quantity);
    return setOverlay(slug, { stock });
  }
  const stock = Math.max(0, current.stock - quantity);
  return setOverlay(slug, { stock });
}

/** Every product the owner manages, catalogue + admin-created. */
export async function listInventory(): Promise<InventoryRow[]> {
  const adminProducts = await listAdminProducts();
  const slugs = [...catalogProducts.map((p) => p.slug), ...adminProducts.map((p) => p.slug)];
  const overlays = await getOverlays(slugs);

  const catalogRows: InventoryRow[] = catalogProducts.map((product) => {
    const overlay = overlays.get(product.slug);
    return {
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      priceLabel: product.priceLabel,
      image: product.image,
      stock: overlay?.stock ?? DEFAULT_STOCK,
      visible: overlay?.visible ?? true,
      source: "catalog",
      imageCount: 1 + (product.gallery?.length ?? 0),
      missingImages: false,
    };
  });

  const adminRows: InventoryRow[] = adminProducts.map((item) => {
    const overlay = overlays.get(item.slug);
    return {
      slug: item.slug,
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price,
      priceLabel: usd(item.price),
      image: item.images[0] ?? "/images/placeholder-coming-soon-portrait.jpg",
      stock: overlay?.stock ?? DEFAULT_STOCK,
      visible: overlay?.visible ?? true,
      source: "admin",
      imageCount: item.images.length,
      missingImages: item.images.length === 0,
    };
  });

  return [...adminRows, ...catalogRows];
}

export type PublicProductState = { stock: number; visible: boolean; soldOut: boolean };

/** Storefront view of a single product's availability. */
export async function publicStateFor(slug: string): Promise<PublicProductState> {
  const overlay = await kvGet<StockOverlay>(overlayKey(slug)).catch(() => null);
  const stock = overlay?.stock ?? DEFAULT_STOCK;
  const visible = overlay?.visible ?? true;
  return { stock, visible, soldOut: stock <= 0 };
}

/** Storefront catalogue: admin products merged in, hidden/sold-out filtered. */
export async function publicCatalog(): Promise<Product[]> {
  try {
    const adminProducts = await listAdminProducts();
    const publishable = adminProducts.filter((item) => item.images.length > 0);
    const merged = [...catalogProducts, ...publishable.map(adminProductToProduct)];
    const overlays = await getOverlays(merged.map((p) => p.slug));
    return merged.filter((product) => overlays.get(product.slug)?.visible !== false);
  } catch {
    // Never let a store outage take the storefront down.
    return catalogProducts;
  }
}

/** Next invoice/memo number, e.g. INV-0007. */
export async function nextDocumentNumber(prefix: "INV" | "MEMO") {
  const value = await kvIncrBy(`jewelstone:counter:${prefix.toLowerCase()}`, 1);
  return `${prefix}-${String(value).padStart(4, "0")}`;
}
