import raw from "@/data/loose-diamonds.json";

export type LooseDiamond = {
  id: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  lab: string;
  price: number; // stock-sheet price
  certNo?: string;
  certified: boolean;
};

/** Website price is the stock-sheet price plus 5% (owner-specified). */
export const LOOSE_DIAMOND_RETAIL_MULTIPLIER = 1.05;

export function retailPrice(diamond: LooseDiamond): number {
  return Math.round(diamond.price * LOOSE_DIAMOND_RETAIL_MULTIPLIER);
}

export const looseDiamonds = raw as LooseDiamond[];

// Shapes present in the selection, most common first — drives the filter row.
export const LOOSE_DIAMOND_SHAPES = Array.from(
  looseDiamonds.reduce((map, d) => map.set(d.shape, (map.get(d.shape) ?? 0) + 1), new Map<string, number>()),
)
  .sort((a, b) => b[1] - a[1])
  .map(([shape]) => shape);

export const LOOSE_CARAT_RANGES = [
  { key: "under-1", label: "Under 1 ct", min: 0, max: 1 },
  { key: "1-2", label: "1–2 ct", min: 1, max: 2 },
  { key: "2-3", label: "2–3 ct", min: 2, max: 3 },
  { key: "3-plus", label: "3 ct +", min: 3, max: Infinity },
] as const;

export type LooseCaratKey = (typeof LOOSE_CARAT_RANGES)[number]["key"];
