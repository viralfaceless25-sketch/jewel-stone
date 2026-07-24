import { products, type DiamondWorld, type Product } from "@/data/products";
import { deriveDiamondWorld } from "@/lib/commerce/diamond-worlds";

/** Days elapsed since epoch in UTC — the rotation seed. Changes once per 24h. */
export function utcDayIndex(now: Date = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}

export type Arrival = {
  key: string;
  world: DiamondWorld;
  name: string;
  image: string;
  /** Catalogued pieces link to their product page and show a price. */
  href: string;
  priceLabel?: string;
  /** Photographed studio arrivals not yet in the catalogue. */
  note?: string;
};

/**
 * Hand-picked showcase pieces, one per world. Owner curates this list; the
 * rotation below deals from it so the section changes as the list grows.
 */
const CURATED: Array<
  | { kind: "product"; slug: string }
  | { kind: "studio"; key: string; world: DiamondWorld; name: string; image: string; href: string; note: string }
> = [
  { kind: "product", slug: "pd2-butterfly-diamond-pendant" },
  {
    kind: "studio",
    key: "marquise-piecut-ring",
    world: "natural-piecut",
    name: "Marquise PIECUT Ring",
    image: "/images/studio-arrivals/marquise-piecut-ring/cover.webp",
    href: "/contact",
    note: "Studio arrival · Enquire",
  },
  { kind: "product", slug: "emerald-halo-engagement-ring" },
];

function toArrival(entry: (typeof CURATED)[number]): Arrival | null {
  if (entry.kind === "studio") {
    return {
      key: entry.key,
      world: entry.world,
      name: entry.name,
      image: entry.image,
      href: entry.href,
      note: entry.note,
    };
  }

  const product: Product | undefined = products.find((item) => item.slug === entry.slug);
  if (!product || product.image.includes("placeholder")) return null;

  return {
    key: product.slug,
    world: deriveDiamondWorld(product),
    name: product.name,
    image: product.image,
    href: `/products/${product.slug}`,
    priceLabel: product.priceLabel,
  };
}

/**
 * Deals `count` pieces from the curated list, rotating the window by the UTC day
 * so the set is stable for 24h and moves on as the list grows.
 * Deterministic: server and client agree for the same day.
 */
export function pickDailyArrivals(count = 3, now: Date = new Date()): Arrival[] {
  const pool = CURATED.map(toArrival).filter((item): item is Arrival => item !== null);
  if (pool.length === 0) return [];

  const day = utcDayIndex(now);
  const picks: Arrival[] = [];

  for (let offset = 0; offset < Math.min(count, pool.length); offset += 1) {
    picks.push(pool[(day + offset) % pool.length]);
  }

  return picks;
}
