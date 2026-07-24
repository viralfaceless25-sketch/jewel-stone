import type { DiamondWorld, Product } from "@/data/products";

export const DIAMOND_WORLDS: DiamondWorld[] = ["natural", "natural-piecut", "lab-grown"];

// Non-breaking space: "Natural PIECUT" must never wrap across two lines.
export const DIAMOND_WORLD_LABELS: Record<DiamondWorld, string> = {
  natural: "Natural",
  "natural-piecut": "Natural PIECUT",
  "lab-grown": "Lab Grown",
};

export const DIAMOND_WORLD_TAGLINES: Record<DiamondWorld, string> = {
  natural: "Earth-formed · One of one",
  "natural-piecut": "Assembled by hand · Found nowhere else",
  "lab-grown": "Same crystal · Greater freedom",
};

/**
 * Default world classification until the owner assigns `diamondWorld`
 * per product. Explicit assignment always wins.
 */
export function deriveDiamondWorld(product: Pick<Product, "diamondWorld" | "piecut" | "source">): DiamondWorld {
  if (product.diamondWorld) return product.diamondWorld;
  if (product.piecut) return "natural-piecut";
  if (product.source === "signature") return "natural";
  return "lab-grown";
}

export function isDiamondWorld(value: string): value is DiamondWorld {
  return (DIAMOND_WORLDS as string[]).includes(value);
}

export function filterByWorld<T extends Pick<Product, "diamondWorld" | "piecut" | "source">>(
  items: T[],
  world: DiamondWorld | "" | undefined,
): T[] {
  if (!world) return items;
  return items.filter((item) => deriveDiamondWorld(item) === world);
}

// ── Product type (maps to the four nav destinations) ──────────────────────────
export type ProductType = "engagement" | "wedding" | "jewelry";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  engagement: "Engagement",
  wedding: "Wedding",
  jewelry: "Jewelry",
};

/**
 * Buckets a piece into one of the nav's shopping types. Rings split by style —
 * eternity/wedding bands are Wedding, every other ring is Engagement. All
 * non-ring jewellery is Jewelry. Custom Jewelry is intentionally unclassified.
 */
export function deriveProductType(
  product: Pick<Product, "category" | "style" | "name">,
): ProductType | null {
  if (product.category === "Custom Jewelry") return null;
  if (product.category === "Rings") {
    return /\b(eternity|wedding)\b|\bband\b/i.test(`${product.style} ${product.name}`)
      ? "wedding"
      : "engagement";
  }
  return "jewelry";
}

export function isProductType(value: string): value is ProductType {
  return value === "engagement" || value === "wedding" || value === "jewelry";
}
