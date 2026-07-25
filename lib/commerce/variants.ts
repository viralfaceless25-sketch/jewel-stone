import { products, type Product, type ProductCategory } from "@/data/products";

// ── The buy-now / quotation rule ─────────────────────────────────────────────
// A product's Excel price applies ONLY to its exact listed spec. On the product
// page the shopper can change carat, shape, metal, colour, clarity, and setting.
//  • If the chosen combination matches another listed product → navigate to it
//    (that product's own price, buy-now).
//  • If the combination is NOT a listed Excel row → it becomes a custom piece:
//    the price is hidden and the shopper is asked to request a quotation.
// Everything here is derived from the catalogue, so the option menus and the
// match logic stay in lock-step with the Excel data.

export type Axis = "carat" | "shape" | "metal" | "color" | "clarity" | "setting";

export type Selection = {
  carat: number;
  shape: string;
  metal: string;
  color: string;
  clarity: string;
  setting: string;
};

const EXTRA_METALS = ["Platinum", "Sterling Silver"];

/** Collapse "Round Brilliant", "Emerald PIECUT cluster" → "Round", "Emerald". */
export function normShape(centerStone: string): string {
  const s = (centerStone || "").trim();
  if (!s) return "";
  const first = s
    .replace(/piecut/i, "")
    .replace(/cluster/i, "")
    .replace(/brilliant/i, "")
    .trim()
    .split(/\s+/)[0];
  return first ? first[0].toUpperCase() + first.slice(1).toLowerCase() : s;
}

/** Buy-now metals a listed product covers, e.g. "14K White, Yellow, or Rose Gold". */
export function metalsOf(material: string): string[] {
  const m = (material || "").trim();
  if (!m) return [];
  const karat = m.match(/\b(\d{2})K\b/i)?.[1];
  if (karat && /white,\s*yellow,?\s*(or\s*)?rose/i.test(m)) {
    return [`${karat}K White Gold`, `${karat}K Yellow Gold`, `${karat}K Rose Gold`];
  }
  return [m];
}

/** Split "D/VVS2" → colour D, clarity VVS2 (only when both are clean grades). */
export function parseGrade(colorClarity: string): { color: string; clarity: string } | null {
  const parts = (colorClarity || "").split("/").map((p) => p.trim());
  if (parts.length !== 2) return null;
  const [color, clarity] = parts;
  const cleanColor = /^[D-Jd-j]$/.test(color);
  const cleanClarity = /^(FL|IF|VVS[12]|VS[12]|SI[12])$/i.test(clarity);
  if (!cleanColor || !cleanClarity) return null;
  return { color: color.toUpperCase(), clarity: clarity.toUpperCase() };
}

export function productSpec(product: Product): Selection {
  const grade = parseGrade(product.colorClarity);
  return {
    carat: product.carats,
    shape: normShape(product.centerStone),
    metal: metalsOf(product.material)[0] ?? product.material,
    color: grade?.color ?? product.colorClarity,
    clarity: grade?.clarity ?? "",
    setting: (product.style || "").trim(),
  };
}

const eq = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Exact listed match for a selection within a category (metal ∈ product's set). */
export function matchProduct(category: ProductCategory, sel: Selection): Product | null {
  for (const p of products) {
    if (p.category !== category || p.comingSoon) continue;
    const spec = productSpec(p);
    if (spec.carat !== sel.carat) continue;
    if (!eq(spec.shape, sel.shape)) continue;
    if (!eq(spec.setting, sel.setting)) continue;
    if (!eq(spec.color, sel.color)) continue;
    if (!eq(spec.clarity, sel.clarity)) continue;
    if (!metalsOf(p.material).some((m) => eq(m, sel.metal))) continue;
    return p;
  }
  return null;
}

/**
 * When a structural axis (carat / shape / setting) changes, jump to the closest
 * listed product that shares the piece's other structural axes. Returns null when
 * nothing in the catalogue offers that value → the change becomes a custom piece.
 */
export function snapToVariant(product: Product, axis: Axis, value: string): Product | null {
  const base = productSpec(product);
  const wantCarat = axis === "carat" ? Number(value) : base.carat;
  const wantShape = axis === "shape" ? value : base.shape;
  const wantSetting = axis === "setting" ? value : base.setting;

  let best: { p: Product; score: number; caratGap: number } | null = null;
  for (const p of products) {
    if (p.category !== product.category || p.comingSoon) continue;
    const spec = productSpec(p);
    if (axis === "carat" && spec.carat !== wantCarat) continue;
    if (axis === "shape" && !eq(spec.shape, wantShape)) continue;
    if (axis === "setting" && !eq(spec.setting, wantSetting)) continue;
    // prefer products that keep the piece's other structural axes intact
    let score = 0;
    if (eq(spec.shape, wantShape)) score += 2;
    if (eq(spec.setting, wantSetting)) score += 2;
    if (eq(spec.metal, base.metal)) score += 1;
    const caratGap = Math.abs(spec.carat - wantCarat);
    if (!best || score > best.score || (score === best.score && caratGap < best.caratGap)) {
      best = { p, score, caratGap };
    }
  }
  return best?.p ?? null;
}

export type ChangeResult =
  | { type: "navigate"; slug: string }
  | { type: "buy"; selection: Selection }
  | { type: "custom"; selection: Selection };

/** Resolve a single selector change into: navigate, stay-and-buy, or go custom. */
export function resolveChange(product: Product, current: Selection, axis: Axis, value: string): ChangeResult {
  const next: Selection = { ...current, [axis]: axis === "carat" ? Number(value) : value };

  // Structural axes navigate between real products (adopting their full spec).
  if (axis === "carat" || axis === "shape" || axis === "setting") {
    const target = snapToVariant(product, axis, value);
    if (target && target.slug !== product.slug) return { type: "navigate", slug: target.slug };
    if (target && target.slug === product.slug) return { type: "buy", selection: productSpec(target) };
    return { type: "custom", selection: next };
  }

  // Spec axes (metal / colour / clarity): exact listed match → buy, else custom.
  const exact = matchProduct(product.category, next);
  if (exact && exact.slug !== product.slug) return { type: "navigate", slug: exact.slug };
  if (exact) return { type: "buy", selection: next };
  return { type: "custom", selection: next };
}

/** Is a selection an exact listed Excel row (i.e. buy-now) for this category? */
export function isListed(category: ProductCategory, sel: Selection): boolean {
  return matchProduct(category, sel) !== null;
}

// ── Option menus, derived per category from the Excel catalogue ───────────────
export type AxisOptions = {
  carats: number[];
  shapes: string[];
  settings: string[];
  metals: string[];
  colors: string[];
  clarities: string[];
};

const COLORS = ["D", "E", "F", "G", "H", "I", "J"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];

export function optionsForCategory(category: ProductCategory): AxisOptions {
  const inCat = products.filter((p) => p.category === category && !p.comingSoon);
  const uniq = <T,>(xs: T[]) => [...new Set(xs)];
  const catalogueMetals = uniq(inCat.flatMap((p) => metalsOf(p.material)));
  return {
    carats: uniq(inCat.map((p) => p.carats)).sort((a, b) => a - b),
    shapes: uniq(inCat.map((p) => normShape(p.centerStone))).filter(Boolean),
    settings: uniq(inCat.map((p) => (p.style || "").trim())).filter(Boolean),
    metals: uniq([...catalogueMetals, ...EXTRA_METALS]),
    colors: COLORS,
    clarities: CLARITIES,
  };
}
