export const DIAMOND_SHAPES = [
  "Round",
  "Oval",
  "Emerald",
  "Pear",
  "Cushion",
  "Marquise",
  "Radiant",
  "Princess",
] as const;

export const DIAMOND_ORIGINS = ["Natural", "Lab-Grown"] as const;
export const CARAT_RANGES = ["under-1", "1-2", "2-3", "3-5", "5-plus"] as const;

export type DiamondFilters = {
  shape: "" | (typeof DIAMOND_SHAPES)[number];
  origin: "" | (typeof DIAMOND_ORIGINS)[number];
  carat: "" | (typeof CARAT_RANGES)[number];
};

export type DiamondProduct = {
  shape?: string;
  origin?: string;
  carats: number;
};

export const EMPTY_DIAMOND_FILTERS: DiamondFilters = {
  shape: "",
  origin: "",
  carat: "",
};

export function normalizeDiamondFilters(input: URLSearchParams): DiamondFilters {
  const shape = input.get("shape") ?? "";
  const origin = input.get("origin") ?? "";
  const carat = input.get("carat") ?? "";

  return {
    shape: DIAMOND_SHAPES.includes(shape as (typeof DIAMOND_SHAPES)[number])
      ? (shape as DiamondFilters["shape"])
      : "",
    origin: DIAMOND_ORIGINS.includes(origin as (typeof DIAMOND_ORIGINS)[number])
      ? (origin as DiamondFilters["origin"])
      : "",
    carat: CARAT_RANGES.includes(carat as (typeof CARAT_RANGES)[number])
      ? (carat as DiamondFilters["carat"])
      : "",
  };
}

export function diamondSearchHref(filters: DiamondFilters) {
  const query = new URLSearchParams();
  if (filters.shape) query.set("shape", filters.shape);
  if (filters.origin) query.set("origin", filters.origin);
  if (filters.carat) query.set("carat", filters.carat);
  const value = query.toString();
  return value ? `/diamonds?${value}` : "/diamonds";
}

function inCaratRange(carats: number, range: DiamondFilters["carat"]) {
  if (!range) return true;
  if (range === "under-1") return carats < 1;
  if (range === "1-2") return carats >= 1 && carats < 2;
  if (range === "2-3") return carats >= 2 && carats < 3;
  if (range === "3-5") return carats >= 3 && carats < 5;
  return carats >= 5;
}

export function matchesDiamondFilters(product: DiamondProduct, filters: DiamondFilters) {
  return (
    (!filters.shape || product.shape === filters.shape) &&
    (!filters.origin || product.origin === filters.origin) &&
    inCaratRange(product.carats, filters.carat)
  );
}
