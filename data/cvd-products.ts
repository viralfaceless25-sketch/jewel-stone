// CVD lab-grown stock line — reconciled to
// "Final jewelstone inventory file.xlsx" (17 pieces, codes JSLD072614–JSLD072630).
//
// PUBLISHED: code, category, shape, colour/clarity, length, stone size/count,
//            total carat, 14KT gold.
// NEVER PUBLISHED: that sheet's cost columns — Net Diamond value, Total Gold
//            value, labour, Total Base Price, base*6. Those are wholesale
//            margin data. `price` below is the sheet's own USD figure and is
//            used only as the internal checkout amount; nothing renders it.
import type { Product } from "./products";

type CvdRow = {
  code: string;
  name: string;
  slug: string;
  category: Product["category"];
  style: string;
  centerStone: string;
  /** Stone diameter / dimensions as quoted on the sheet. */
  stoneSize: string;
  stones: number;
  carats: number;
  sizeInfo: string;
  usd: number;
};

const ROWS: CvdRow[] = [
  { code: "JSLD072614", name: "Tennis Bracelet 1.84CT", slug: "jsld072614-tennis-bracelet-1-84ct", category: "Bracelets", style: "Tennis", centerStone: "Round Brilliant", stoneSize: "1.75mm", stones: 87, carats: 1.841, sizeInfo: '7" — 87 stones', usd: 4215.03 },
  { code: "JSLD072615", name: "Tennis Bracelet 3.55CT", slug: "jsld072615-tennis-bracelet-3-55ct", category: "Bracelets", style: "Tennis", centerStone: "Round Brilliant", stoneSize: "2.2mm", stones: 79, carats: 3.55, sizeInfo: '7" — 79 stones', usd: 5499.96 },
  { code: "JSLD072616", name: "Tennis Bracelet 5.16CT", slug: "jsld072616-tennis-bracelet-5-16ct", category: "Bracelets", style: "Tennis", centerStone: "Round Brilliant", stoneSize: "2.7mm", stones: 68, carats: 5.16, sizeInfo: '7" — 68 stones', usd: 6724.69 },
  { code: "JSLD072617", name: "Tennis Bracelet 6.57CT", slug: "jsld072617-tennis-bracelet-6-57ct", category: "Bracelets", style: "Tennis", centerStone: "Round Brilliant", stoneSize: "3.2mm", stones: 52, carats: 6.57, sizeInfo: '7" — 52 stones', usd: 8157.28 },
  { code: "JSLD072618", name: "Tennis Bracelet 10.37CT", slug: "jsld072618-tennis-bracelet-10-37ct", category: "Bracelets", style: "Tennis", centerStone: "Round Brilliant", stoneSize: "4.0mm", stones: 41, carats: 10.37, sizeInfo: '7" — 41 stones', usd: 8782.73 },

  { code: "JSLD072619", name: 'Tennis Necklace 16" 3.28CT', slug: "jsld072619-tennis-necklace-16in", category: "Necklaces", style: "Tennis Necklace", centerStone: "Round Brilliant", stoneSize: "1.5mm", stones: 230, carats: 3.28, sizeInfo: '16" — 230 stones', usd: 8744.35 },
  { code: "JSLD072620", name: 'Tennis Necklace 18" 4.86CT', slug: "jsld072620-tennis-necklace-18in", category: "Necklaces", style: "Tennis Necklace", centerStone: "Round Brilliant", stoneSize: "1.75mm", stones: 229, carats: 4.86, sizeInfo: '18" — 229 stones', usd: 10492.44 },
  { code: "JSLD072621", name: 'Tennis Necklace 20" 8.31CT', slug: "jsld072621-tennis-necklace-20in", category: "Necklaces", style: "Tennis Necklace", centerStone: "Round Brilliant", stoneSize: "2.0mm", stones: 241, carats: 8.31, sizeInfo: '20" — 241 stones', usd: 13462.59 },
  { code: "JSLD072622", name: 'Tennis Necklace 22" 17.36CT', slug: "jsld072622-tennis-necklace-22in", category: "Necklaces", style: "Tennis Necklace", centerStone: "Round Brilliant", stoneSize: "3.0mm", stones: 169, carats: 17.36, sizeInfo: '22" — 169 stones', usd: 18300.01 },

  { code: "JSLD072623", name: "Round Engagement Ring 2.34CT", slug: "jsld072623-round-engagement-ring", category: "Rings", style: "Solitaire with accents", centerStone: "Round Brilliant", stoneSize: "8.20mm centre + 1.5mm accents", stones: 33, carats: 2.34, sizeInfo: "US 6.5 — resizable", usd: 2393.35 },
  { code: "JSLD072624", name: "Three Stone Emerald Ring 5.04CT", slug: "jsld072624-three-stone-emerald-ring", category: "Rings", style: "Three stone", centerStone: "Emerald cut with tapered baguettes", stoneSize: "10.5x8mm centre + 6.5x3.5x4mm sides", stones: 3, carats: 5.04, sizeInfo: "US 6.5 — resizable", usd: 4162.61 },
  { code: "JSLD072625", name: "Eternity Band 2.03CT", slug: "jsld072625-eternity-band", category: "Rings", style: "Eternity band", centerStone: "Round Brilliant", stoneSize: "3.00mm", stones: 20, carats: 2.03, sizeInfo: "US 6 — not resizable", usd: 1525.38 },

  { code: "JSLD072626", name: "Martini Stud Earrings 1.01CT", slug: "jsld072626-martini-studs-1-01ct", category: "Earrings", style: "Martini, screw back", centerStone: "Round Brilliant", stoneSize: "5.00mm", stones: 2, carats: 1.01, sizeInfo: "Pierced — screw back", usd: 1004.31 },
  { code: "JSLD072627", name: "Martini Stud Earrings 1.40CT", slug: "jsld072627-martini-studs-1-40ct", category: "Earrings", style: "Martini, screw back", centerStone: "Round Brilliant", stoneSize: "5.70mm", stones: 2, carats: 1.4, sizeInfo: "Pierced — screw back", usd: 1247.34 },
  { code: "JSLD072628", name: "Martini Stud Earrings 2.86CT", slug: "jsld072628-martini-studs-2-86ct", category: "Earrings", style: "Martini, screw back", centerStone: "Round Brilliant", stoneSize: "7.40mm", stones: 2, carats: 2.86, sizeInfo: "Pierced — screw back", usd: 2317.5 },
  { code: "JSLD072629", name: "Stud Earrings 4.03CT", slug: "jsld072629-screw-back-studs-4-03ct", category: "Earrings", style: "Screw back", centerStone: "Round Brilliant", stoneSize: "8.20mm", stones: 2, carats: 4.03, sizeInfo: "Pierced — screw back", usd: 3440.26 },
  { code: "JSLD072630", name: "Stud Earrings 5.97CT", slug: "jsld072630-screw-back-studs-5-97ct", category: "Earrings", style: "Screw back", centerStone: "Round Brilliant", stoneSize: "9.25mm", stones: 2, carats: 5.97, sizeInfo: "Pierced — screw back", usd: 4037.15 },
];

function describe(r: CvdRow) {
  const stones = r.stones > 3 ? `${r.stones} stones` : `${r.stones} stone${r.stones > 1 ? "s" : ""}`;
  return `${r.carats.toFixed(2)}ct total in ${stones} of ${r.stoneSize} ${r.centerStone.toLowerCase()}. 14K gold, CVD lab-grown. Cut to order — choose your colour and clarity.`;
}

export function cvdProducts(imageryReady: Set<string>): Product[] {
  return ROWS.map((r) => {
    const dir = `/images/products/${r.slug}`;
    const ready = imageryReady.has(r.slug);
    return {
      id: r.code,
      sku: r.code,
      name: r.name,
      slug: r.slug,
      category: r.category,
      source: "lab-grown" as const,
      comingSoon: !ready,
      style: r.style,
      material: "14K White, Yellow, or Rose Gold",
      centerStone: r.centerStone,
      carats: r.carats,
      diamondPieces: r.stones,
      colorClarity: "E/VVS",
      diamondOrigin: "Lab-Grown" as const,
      price: r.usd,
      priceLabel: "Price on request",
      sizeInfo: r.sizeInfo,
      description: describe(r),
      image: ready ? `${dir}/cover.jpg` : "/images/placeholder-coming-soon-portrait.jpg",
      gallery: ready ? [`${dir}/angle-1.jpg`, `${dir}/angle-2.jpg`, `${dir}/model.jpg`] : undefined,
      featured: false,
    };
  });
}

export const CVD_ROWS = ROWS;
