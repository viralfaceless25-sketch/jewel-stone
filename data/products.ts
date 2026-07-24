// Two product lines:
//  1. SIGNATURE  — real, one-of-a-kind Piecut pieces we physically have in hand.
//                  11 photographed pieces plus 2 inventory-only arrivals.
//  2. LAB-GROWN  — made-to-order price list (Jewel_Stone_Lab_Inventory_20pct.xlsx).
//                  Real specs/pricing with supplied studio photography where available.
//
// Piecut pricing/specs follow "Final jewelstone inventory file.xlsx".

import imageryManifest from "./imagery-manifest.json";
import priceBook from "./price-book.json";
import { cvdProducts } from "./cvd-products";

export type ProductCategory =
  | "Rings"
  | "Earrings"
  | "Bracelets"
  | "Necklaces"
  | "Pendants"
  | "Loose Diamonds"
  | "Custom Jewelry";

export type MetalVariant = "white" | "yellow" | "rose" | "platinum" | "silver";
export type ProductMediaSet = { cover: string; gallery: string[]; videoUrl?: string };
export type ProductSource = "signature" | "lab-grown";
export type DiamondOrigin = "Lab-Grown" | "Natural";
// The three Jewel Stone worlds. Explicit per-product assignment wins;
// deriveDiamondWorld() supplies the default until the owner tags each piece.
export type DiamondWorld = "natural" | "natural-piecut" | "lab-grown";
export type DiamondClarity = "FL" | "IF" | "VVS1" | "VVS2" | "VS1" | "VS2" | "SI1" | "SI2";

// Every piece is cut to order, so colour and clarity are the shopper's choice on
// all products rather than a fixed spec. The per-product `colorClarity` string is
// retained as the reference grade the supplier sheet quoted, but the UI offers the
// full range instead of pinning one grade.
export const DIAMOND_COLOR_OPTIONS = ["D", "E", "F", "G", "H", "I", "J"] as const;
export const DIAMOND_CLARITY_OPTIONS: DiamondClarity[] = [
  "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2",
];
export const COLOR_CLARITY_LABEL = "D–J colour · FL–SI2 clarity — your choice";
export type DiamondShape =
  | "Round"
  | "Oval"
  | "Cushion"
  | "Emerald"
  | "Pear"
  | "Heart"
  | "Radiant"
  | "Marquise"
  | "Cushion Brilliant"
  | "Princess"
  | "Straight Baguette"
  | "Taper Baguette"
  | "Half Moon";

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  source: ProductSource;
  // true = no real studio photography yet, render the Coming Soon placeholder
  comingSoon?: boolean;
  style: string;
  material: string;
  centerStone: string;
  carats: number; // total diamond carat weight
  diamondPieces: number;
  certificateNumber?: string;
  visualCarat?: number;
  goldWeight?: number;
  colorClarity: string;
  diamondShape?: DiamondShape;
  diamondClarity?: DiamondClarity;
  diamondOrigin?: DiamondOrigin;
  antique?: boolean;
  piecut?: boolean;
  diamondWorld?: DiamondWorld;
  price: number;
  priceLabel: string;
  sizeInfo: string;
  description: string;
  image: string;
  // Real multi-angle photography (signature pieces only)
  gallery?: string[];
  videoUrl?: string;
  mediaByMetal?: Partial<Record<MetalVariant, ProductMediaSet>>;
  images?: {
    metal: MetalVariant;
    front: string;
    angle45: string;
    side: string;
    back: string;
  }[];
  featured: boolean;
};

// ── COLLECTIONS ───────────────────────────────────────────────────────────────

export const collections: Array<{
  title: string;
  slug: string;
  description: string;
  image: string;
  category: ProductCategory;
  priceFrom?: string;
  comingSoon?: boolean;
}> = [
  {
    title: "Engagement & Fine Rings",
    slug: "rings",
    category: "Rings",
    description: "One-of-a-kind Piecut rings in stock now, plus made-to-order lab-grown solitaires from 1CT to 12CT.",
    image: "/images/products/heart-halo-ring/cover.jpg",
    priceFrom: "From $690",
  },
  {
    title: "Earrings",
    slug: "earrings",
    category: "Earrings",
    description: "Halo drops and studs in stock now, plus made-to-order lab-grown studs from 1CT to 20CT.",
    image: "/images/products/asscher-halo-drop-earrings/cover.jpg",
    priceFrom: "From $403",
  },
  {
    title: "Pendants",
    slug: "pendants",
    category: "Pendants",
    description: "Emerald, heart, and pear halo pendants in stock now, plus made-to-order fancy pendant styles.",
    image: "/images/products/heart-halo-pendant/cover.jpg",
    priceFrom: "From $805",
  },
  {
    title: "Tennis Bracelets",
    slug: "bracelets",
    category: "Bracelets",
    description: "Made-to-order continuous diamond tennis bracelets from 2CT to 30CT, with multi-angle and model photography on selected weights.",
    image: "/images/products/tb12-12ct-tennis-bracelet/model.webp",
    priceFrom: "From $1,035",
  },
  {
    title: "Necklaces",
    slug: "necklaces",
    category: "Necklaces",
    description: "Made-to-order tennis and fancy diamond necklaces from 5CT to 30CT, with studio views on selected weights.",
    image: "/images/products/tn15-15ct-tennis-necklace/cover.webp",
    priceFrom: "From $4,025",
  },
  {
    title: "Custom Design",
    slug: "custom-jewelry",
    category: "Custom Jewelry",
    description: "From first sketch to finished heirloom — your stone, your metal, your story.",
    image: "/images/atelier/bench-setting.jpg",
    priceFrom: "Custom quote",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fmt(price: number) {
  return `From $${price.toLocaleString("en-US")}`;
}

function usd(priceLabel: number) {
  return `$${priceLabel.toLocaleString("en-US")}`;
}

const PLACEHOLDER = {
  square: "/images/placeholder-coming-soon-square.jpg",
  portrait: "/images/placeholder-coming-soon-portrait.jpg",
};

function signatureGallery(slug: string, count: number, ext: "jpg" | "webp" = "jpg") {
  return Array.from({ length: count }, (_, i) => `/images/products/${slug}/angle-${i + 1}.${ext}`);
}

// ── SIGNATURE COLLECTION — real, one-of-a-kind Piecut pieces ─────────────────

// Signature halo pieces removed — they duplicated the Natural PIECUT set
// (JSND0626xx). The authoritative piecut line is piecutHouseProducts below.
const signatureProducts: Product[] = [];

// ── LAB-GROWN — made-to-order price list (Jewel_Stone_Lab_Inventory_20pct.xlsx) ─
// Supplied imagery is imported per SKU into public/images/products/<slug>/.
// imagery-manifest.json remains fallback registry for earlier completed sets.
const IMAGERY_READY = new Set(imageryManifest.ready);

type LabMedia = { cover: string; gallery: string[]; byMetal?: Partial<Record<MetalVariant, ProductMediaSet>> };

function braceletMedia(carat: number, metals: ("wg" | "yg" | "rg")[], modelMetal?: "white" | "yellow" | "rose", missingFront: string[] = []): LabMedia {
  const slug = `tb${carat}-${carat}ct-tennis-bracelet`;
  const dir = `/images/products/${slug}`;
  const metalKey = { wg: "white", yg: "yellow", rg: "rose" } as const;
  const byMetal: Partial<Record<MetalVariant, ProductMediaSet>> = {};
  for (const metal of metals) {
    const key = metalKey[metal];
    const cover = missingFront.includes(metal) ? `${dir}/angle-45-${metal}.webp` : `${dir}/angle-front-${metal}.webp`;
    const gallery = [
      ...(missingFront.includes(metal) ? [] : [`${dir}/angle-45-${metal}.webp`]),
      `${dir}/angle-close-${metal}.webp`,
      ...(modelMetal === key ? [`${dir}/model.webp`] : []),
    ];
    byMetal[key] = { cover, gallery };
  }
  const white = byMetal.white!;
  return { cover: white.cover, gallery: white.gallery, byMetal };
}

function necklaceMedia(carat: number, views = 3): LabMedia {
  const dir = `/images/products/tn${carat}-${carat}ct-tennis-necklace`;
  return {
    cover: `${dir}/cover.webp`,
    gallery: Array.from({ length: Math.max(0, views - 1) }, (_, index) => `${dir}/angle-${index + 2}.webp`),
    byMetal: { white: { cover: `${dir}/cover.webp`, gallery: Array.from({ length: Math.max(0, views - 1) }, (_, index) => `${dir}/angle-${index + 2}.webp`) } },
  };
}

type ImportedView = "front" | "45" | "close" | "side" | "back" | "sheet";
type ImportedMetal = "wg" | "yg" | "rg";

function importedMedia(
  slug: string,
  specs: Partial<Record<ImportedMetal, ImportedView[]>>,
  modelMetal?: MetalVariant,
): LabMedia {
  const dir = `/images/products/${slug}`;
  const metalKey = { wg: "white", yg: "yellow", rg: "rose" } as const;
  const byMetal: Partial<Record<MetalVariant, ProductMediaSet>> = {};
  for (const [suffix, views] of Object.entries(specs) as [ImportedMetal, ImportedView[]][]) {
    const key = metalKey[suffix];
    const paths = views.map((view) => `${dir}/${view === "sheet" ? "sheet" : `angle-${view}`}-${suffix}.webp`);
    byMetal[key] = {
      cover: paths[0],
      gallery: [...paths.slice(1), ...(modelMetal === key ? [`${dir}/model.webp`] : [])],
    };
  }
  const lead = byMetal.white ?? byMetal.yellow ?? byMetal.rose!;
  return { cover: lead.cover, gallery: lead.gallery, byMetal };
}

const ALL_STUDIO_VIEWS: ImportedView[] = ["front", "45", "close", "side"];
const RING_VIEWS: ImportedView[] = ["front", "close", "side"];
const BRACELET_VIEWS: ImportedView[] = ["front", "45", "close"];

const LAB_MEDIA: Record<string, LabMedia> = {
  "st1-1ct-diamond-studs": importedMedia("st1-1ct-diamond-studs", { wg: ["sheet"], yg: ["sheet"], rg: ["sheet"] }),
  "st2-2ct-diamond-studs": importedMedia("st2-2ct-diamond-studs", { wg: ["sheet"], yg: ["sheet"], rg: ["sheet"] }),
  "st3-3ct-diamond-studs": importedMedia("st3-3ct-diamond-studs", { wg: ["sheet"], yg: ["sheet"], rg: ["sheet"] }),
  "st4-4ct-diamond-studs": importedMedia("st4-4ct-diamond-studs", { wg: ["sheet"], yg: ["sheet"], rg: ["sheet"] }),
  "st5-5ct-diamond-studs": importedMedia("st5-5ct-diamond-studs", { wg: ["sheet"], yg: ["sheet"], rg: ["sheet"] }),
  "st6-6ct-diamond-studs": importedMedia("st6-6ct-diamond-studs", { wg: ["sheet"], yg: ["sheet"], rg: ["sheet"] }),
  "st8-8ct-diamond-studs": importedMedia("st8-8ct-diamond-studs", { wg: ["front", "45", "side"], yg: ALL_STUDIO_VIEWS }),
  "st10-10ct-diamond-studs": importedMedia("st10-10ct-diamond-studs", { wg: ALL_STUDIO_VIEWS, yg: ALL_STUDIO_VIEWS }),
  "st12-12ct-diamond-studs": importedMedia("st12-12ct-diamond-studs", { wg: ["front", "45"] }),
  "st15-15ct-diamond-studs": importedMedia("st15-15ct-diamond-studs", { wg: ALL_STUDIO_VIEWS, rg: ALL_STUDIO_VIEWS }),
  "tb2-2ct-tennis-bracelet": importedMedia("tb2-2ct-tennis-bracelet", { wg: BRACELET_VIEWS, yg: BRACELET_VIEWS, rg: BRACELET_VIEWS }, "white"),
  "tb3-3ct-tennis-bracelet": importedMedia("tb3-3ct-tennis-bracelet", { wg: BRACELET_VIEWS, yg: BRACELET_VIEWS, rg: BRACELET_VIEWS }, "white"),
  "tb4-4ct-tennis-bracelet": importedMedia("tb4-4ct-tennis-bracelet", { wg: BRACELET_VIEWS, yg: BRACELET_VIEWS, rg: BRACELET_VIEWS }, "white"),
  "tb5-5ct-tennis-bracelet": importedMedia("tb5-5ct-tennis-bracelet", { wg: BRACELET_VIEWS, yg: BRACELET_VIEWS, rg: BRACELET_VIEWS }, "white"),
  "tb6-6ct-tennis-bracelet": importedMedia("tb6-6ct-tennis-bracelet", { wg: BRACELET_VIEWS, yg: BRACELET_VIEWS, rg: BRACELET_VIEWS }, "white"),
  "tb8-8ct-tennis-bracelet": importedMedia("tb8-8ct-tennis-bracelet", { wg: BRACELET_VIEWS, yg: BRACELET_VIEWS, rg: ["front", "45"] }, "white"),
  "sr1-round-1ct-solitaire-ring": importedMedia("sr1-round-1ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "sr2-2ct-solitaire-ring": importedMedia("sr2-2ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "sr3-3ct-solitaire-ring": importedMedia("sr3-3ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "sr5-5ct-solitaire-ring": importedMedia("sr5-5ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "sr6-6ct-solitaire-ring": importedMedia("sr6-6ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "sr8-8ct-solitaire-ring": importedMedia("sr8-8ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "tb10-10ct-tennis-bracelet": braceletMedia(10, ["wg", "yg", "rg"], "rose"),
  "tb12-12ct-tennis-bracelet": braceletMedia(12, ["wg", "yg", "rg"], "rose"),
  "tb15-15ct-tennis-bracelet": braceletMedia(15, ["wg", "yg"]),
  "tb20-20ct-tennis-bracelet": braceletMedia(20, ["wg", "yg", "rg"], "yellow", ["rg"]),
  "tb25-25ct-tennis-bracelet": braceletMedia(25, ["wg"]),
  "tb30-30ct-tennis-bracelet": braceletMedia(30, ["wg", "rg"]),
  "tn10-10ct-tennis-necklace": necklaceMedia(10),
  "tn12-12ct-tennis-necklace": necklaceMedia(12),
  "tn15-15ct-tennis-necklace": necklaceMedia(15),
  "tn20-20ct-tennis-necklace": necklaceMedia(20),
  "tn25-25ct-tennis-necklace": necklaceMedia(25, 2),
  "fn2-graduated-diamond-necklace": importedMedia("fn2-graduated-diamond-necklace", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "sr12-12ct-solitaire-ring": importedMedia("sr12-12ct-solitaire-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "fr1-hidden-halo-oval-ring": importedMedia("fr1-hidden-halo-oval-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "fr2-radiant-halo-ring": importedMedia("fr2-radiant-halo-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "fr3-double-halo-cushion-ring": importedMedia("fr3-double-halo-cushion-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "fr4-emerald-hidden-halo-ring": importedMedia("fr4-emerald-hidden-halo-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "fr5-three-stone-oval-ring": importedMedia("fr5-three-stone-oval-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "fr6-fancy-cluster-ring": importedMedia("fr6-fancy-cluster-ring", { wg: RING_VIEWS, yg: RING_VIEWS, rg: ["front", "side"] }, "white"),
  "pd1-cross-diamond-pendant": importedMedia("pd1-cross-diamond-pendant", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "pd2-butterfly-diamond-pendant": importedMedia("pd2-butterfly-diamond-pendant", { wg: ["front", "close", "side", "back"], yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "pd3-cluster-flower-pendant": importedMedia("pd3-cluster-flower-pendant", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "pd4-heart-halo-pendant-lab-grown": importedMedia("pd4-heart-halo-pendant-lab-grown", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  "pd5-fancy-drop-pendant": importedMedia("pd5-fancy-drop-pendant", { wg: RING_VIEWS, yg: RING_VIEWS, rg: RING_VIEWS }, "white"),
  // v2 generated set (front/close/side ×3 metals + model). Studs & solitaires.
  "st20-20ct-diamond-studs": importedMedia("st20-20ct-diamond-studs", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
  "sr1-5ct-solitaire-ring": importedMedia("sr1-5ct-solitaire-ring", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
  "sr4-4ct-solitaire-ring": importedMedia("sr4-4ct-solitaire-ring", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
  "sr10-10ct-solitaire-ring": importedMedia("sr10-10ct-solitaire-ring", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
  // v2 generated necklaces (front/45/close ×3 metals + model).
  "tn5-5ct-tennis-necklace": importedMedia("tn5-5ct-tennis-necklace", { wg: ["front", "45", "close"], yg: ["front", "45", "close"], rg: ["front", "45", "close"] }, "white"),
  "tn8-8ct-tennis-necklace": importedMedia("tn8-8ct-tennis-necklace", { wg: ["front", "45", "close"], yg: ["front", "45", "close"], rg: ["front", "45", "close"] }, "white"),
  "tn30-30ct-tennis-necklace": importedMedia("tn30-30ct-tennis-necklace", { wg: ["front", "45", "close"], yg: ["front", "45", "close"], rg: ["front", "45", "close"] }, "white"),
  "fn1-diamond-riviera-necklace": importedMedia("fn1-diamond-riviera-necklace", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
  "fn3-statement-diamond-necklace": importedMedia("fn3-statement-diamond-necklace", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
  "fn4-luxury-cluster-necklace": importedMedia("fn4-luxury-cluster-necklace", { wg: ["front", "close", "side"], yg: ["front", "close", "side"], rg: ["front", "close", "side"] }, "white"),
};

function labGrown(p: Omit<Product, "source" | "comingSoon" | "image" | "sku"> & { sku: string }): Product {
  const dir = `/images/products/${p.slug}`;
  const addedMedia = LAB_MEDIA[p.slug];
  const ready = Boolean(addedMedia) || IMAGERY_READY.has(p.slug);
  return {
    ...p,
    sku: p.sku,
    source: "lab-grown",
    comingSoon: !ready,
    image: addedMedia?.cover ?? (ready
      ? `${dir}/cover.jpg`
      : p.category === "Earrings"
        ? PLACEHOLDER.square
        : PLACEHOLDER.portrait),
    gallery: addedMedia?.gallery ?? (ready ? [`${dir}/angle-1.jpg`, `${dir}/angle-2.jpg`, `${dir}/model.jpg`] : undefined),
    mediaByMetal: addedMedia?.byMetal,
  };
}

const labGrownProducts: Product[] = [
  // ── STUD EARRINGS ──
  labGrown({ id: "ST1", sku: "ST1", name: "1CT Diamond Stud Earrings", slug: "st1-1ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 1, diamondPieces: 2, colorClarity: "D/VVS2", price: 350, priceLabel: fmt(350), sizeInfo: "N/A (Earrings)", description: "1.00 CTW (0.50 CT each). D/VVS2 round brilliant lab-grown diamonds in a 4-prong 14K gold setting. Made to order — available in white, yellow, or rose gold.", featured: false }),
  labGrown({ id: "ST2", sku: "ST2", name: "2CT Diamond Stud Earrings", slug: "st2-2ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 2, diamondPieces: 2, colorClarity: "E/VS1", price: 700, priceLabel: fmt(700), sizeInfo: "N/A (Earrings)", description: "2.00 CTW (1.00 CT each). E/VS1 round brilliant lab-grown diamonds with noticeable presence on the ear. Made to order.", featured: false }),
  labGrown({ id: "ST3", sku: "ST3", name: "3CT Diamond Stud Earrings", slug: "st3-3ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 3, diamondPieces: 2, colorClarity: "D/VS2", price: 1050, priceLabel: fmt(1050), sizeInfo: "N/A (Earrings)", description: "3.00 CTW (1.50 CT each). D/VS2 round brilliant studs that command attention without overwhelming. Made to order.", featured: false }),
  labGrown({ id: "ST4", sku: "ST4", name: "4CT Diamond Stud Earrings", slug: "st4-4ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 4, diamondPieces: 2, colorClarity: "E/VVS2", price: 1400, priceLabel: fmt(1400), sizeInfo: "N/A (Earrings)", description: "4.00 CTW (2.00 CT each). E/VVS2 round brilliant diamonds with serious sparkle. Made to order.", featured: false }),
  labGrown({ id: "ST5", sku: "ST5", name: "5CT Diamond Stud Earrings", slug: "st5-5ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 5, diamondPieces: 2, colorClarity: "D/VS1", price: 1750, priceLabel: fmt(1750), sizeInfo: "N/A (Earrings)", description: "5.00 CTW (2.50 CT each). High-impact round brilliants in a polished 14K gold 4-prong setting. Made to order.", featured: false }),
  labGrown({ id: "ST6", sku: "ST6", name: "6CT Diamond Stud Earrings", slug: "st6-6ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 6, diamondPieces: 2, colorClarity: "E/VS2", price: 2100, priceLabel: fmt(2100), sizeInfo: "N/A (Earrings)", description: "6.00 CTW (3.00 CT each). E/VS2 round brilliants for a bold luxury look. Made to order.", featured: false }),
  labGrown({ id: "ST8", sku: "ST8", name: "8CT Diamond Stud Earrings", slug: "st8-8ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 8, diamondPieces: 2, colorClarity: "D/VVS2", price: 2800, priceLabel: fmt(2800), sizeInfo: "N/A (Earrings)", description: "8.00 CTW (4.00 CT each). D/VVS2 round brilliant studs at a scale that defines an entrance. Made to order.", featured: false }),
  labGrown({ id: "ST10", sku: "ST10", name: "10CT Diamond Stud Earrings", slug: "st10-10ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 10, diamondPieces: 2, colorClarity: "E/VS1", price: 3500, priceLabel: fmt(3500), sizeInfo: "N/A (Earrings)", description: "10.00 CTW (5.00 CT each). E/VS1 round brilliants at collector scale. Made to order.", featured: true }),
  labGrown({ id: "ST12", sku: "ST12", name: "12CT Diamond Stud Earrings", slug: "st12-12ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 12, diamondPieces: 2, colorClarity: "D/VS2", price: 4200, priceLabel: fmt(4200), sizeInfo: "N/A (Earrings)", description: "12.00 CTW (6.00 CT each). D/VS2 round brilliant diamonds of exceptional rarity. Made to order.", featured: false }),
  labGrown({ id: "ST15", sku: "ST15", name: "15CT Diamond Stud Earrings", slug: "st15-15ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 15, diamondPieces: 2, colorClarity: "E/VVS2", price: 5250, priceLabel: fmt(5250), sizeInfo: "N/A (Earrings)", description: "15.00 CTW (7.50 CT each). E/VVS2 round brilliant lab-grown diamonds. Made to order.", featured: false }),
  labGrown({ id: "ST20", sku: "ST20", name: "20CT Diamond Stud Earrings", slug: "st20-20ct-diamond-studs", category: "Earrings", style: "Classic Studs", material: "14K White, Yellow, or Rose Gold", centerStone: "Round Brilliant", carats: 20, diamondPieces: 2, colorClarity: "D/VS1", price: 7000, priceLabel: fmt(7000), sizeInfo: "N/A (Earrings)", description: "20.00 CTW (10.00 CT each). The pinnacle of lab-grown diamond studs. Made to order.", featured: false }),

  // ── TENNIS BRACELETS ──
  labGrown({ id: "TB2", sku: "TB2", name: "2CT Tennis Bracelet", slug: "tb2-2ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 2, diamondPieces: 24, colorClarity: "E/VS2", price: 900, priceLabel: fmt(900), sizeInfo: '7" — made to order', description: '2.00 CTW lab-grown diamond tennis bracelet. Continuous brilliant-cut diamonds in 14K white gold. Made to order.', featured: false }),
  labGrown({ id: "TB3", sku: "TB3", name: "3CT Tennis Bracelet", slug: "tb3-3ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 3, diamondPieces: 36, colorClarity: "D/VVS2", price: 1350, priceLabel: fmt(1350), sizeInfo: '7" — made to order', description: '3.00 CTW tennis bracelet. D/VVS2 lab-grown round brilliants in a secure box-link setting. Made to order.', featured: false }),
  labGrown({ id: "TB4", sku: "TB4", name: "4CT Tennis Bracelet", slug: "tb4-4ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 4, diamondPieces: 48, colorClarity: "E/VS1", price: 1800, priceLabel: fmt(1800), sizeInfo: '7" — made to order', description: '4.00 CTW. The classic entry to statement tennis bracelets — fluid, luminous, and built for daily wear. Made to order.', featured: true }),
  labGrown({ id: "TB5", sku: "TB5", name: "5CT Tennis Bracelet", slug: "tb5-5ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 5, diamondPieces: 60, colorClarity: "D/VS2", price: 2250, priceLabel: fmt(2250), sizeInfo: '7" — made to order', description: '5.00 CTW. D/VS2 round brilliants that create an unbroken river of light around the wrist. Made to order.', featured: true }),
  labGrown({ id: "TB6", sku: "TB6", name: "6CT Tennis Bracelet", slug: "tb6-6ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 6, diamondPieces: 72, colorClarity: "E/VVS2", price: 2700, priceLabel: fmt(2700), sizeInfo: '7" — made to order', description: '6.00 CTW tennis bracelet. Bold, saturated diamond coverage in a finely crafted 14K white gold box-link. Made to order.', featured: false }),
  labGrown({ id: "TB8", sku: "TB8", name: "8CT Tennis Bracelet", slug: "tb8-8ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 8, diamondPieces: 96, colorClarity: "D/VS1", price: 3600, priceLabel: fmt(3600), sizeInfo: '7" — made to order', description: '8.00 CTW. High-impact lab-grown diamond tennis bracelet with serious wrist coverage. Made to order.', featured: false }),
  labGrown({ id: "TB10", sku: "TB10", name: "10CT Tennis Bracelet", slug: "tb10-10ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 10, diamondPieces: 120, colorClarity: "E/VS2", price: 4500, priceLabel: fmt(4500), sizeInfo: '7" — made to order', description: '10.00 CTW. Investment-tier diamond tennis bracelet at a commanding scale. Made to order.', featured: true }),
  labGrown({ id: "TB12", sku: "TB12", name: "12CT Tennis Bracelet", slug: "tb12-12ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 12, diamondPieces: 144, colorClarity: "D/VVS2", price: 5400, priceLabel: fmt(5400), sizeInfo: '7" — made to order', description: '12.00 CTW. Exceptional lab-grown diamond coverage across a 7" box-link setting. Made to order.', featured: false }),
  labGrown({ id: "TB15", sku: "TB15", name: "15CT Tennis Bracelet", slug: "tb15-15ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 15, diamondPieces: 180, colorClarity: "E/VS1", price: 6750, priceLabel: fmt(6750), sizeInfo: '7" — made to order', description: '15.00 CTW. A wrist statement of rare magnitude. Made to order.', featured: false }),
  labGrown({ id: "TB20", sku: "TB20", name: "20CT Tennis Bracelet", slug: "tb20-20ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 20, diamondPieces: 240, colorClarity: "D/VS2", price: 9000, priceLabel: fmt(9000), sizeInfo: '7" — made to order', description: '20.00 CTW. The collector-grade tennis bracelet. Made to order.', featured: false }),
  labGrown({ id: "TB25", sku: "TB25", name: "25CT Tennis Bracelet", slug: "tb25-25ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 25, diamondPieces: 300, colorClarity: "E/VVS2", price: 11250, priceLabel: fmt(11250), sizeInfo: '7" — made to order', description: '25.00 CTW. Near-unbroken diamond coverage across the full 7" length. Made to order.', featured: false }),
  labGrown({ id: "TB30", sku: "TB30", name: "30CT Tennis Bracelet", slug: "tb30-30ct-tennis-bracelet", category: "Bracelets", style: "Tennis Bracelet", material: "14K White Gold", centerStone: "Round Brilliant", carats: 30, diamondPieces: 360, colorClarity: "D/VS1", price: 13500, priceLabel: fmt(13500), sizeInfo: '7" — made to order', description: '30.00 CTW. The ultimate tennis bracelet — maximum diamond saturation. Made to order.', featured: false }),

  // ── TENNIS NECKLACES ──
  labGrown({ id: "TN5", sku: "TN5", name: "5CT Tennis Necklace", slug: "tn5-5ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 5, diamondPieces: 75, colorClarity: "E/VS2", price: 3500, priceLabel: fmt(3500), sizeInfo: '18" — made to order', description: '5.00 CTW lab-grown diamond tennis necklace. Continuous round brilliants at 18". Made to order.', featured: true }),
  labGrown({ id: "TN8", sku: "TN8", name: "8CT Tennis Necklace", slug: "tn8-8ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 8, diamondPieces: 120, colorClarity: "D/VVS2", price: 5600, priceLabel: fmt(5600), sizeInfo: '18" — made to order', description: '8.00 CTW. D/VVS2 lab-grown brilliants in unbroken succession. Made to order.', featured: false }),
  labGrown({ id: "TN10", sku: "TN10", name: "10CT Tennis Necklace", slug: "tn10-10ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 10, diamondPieces: 150, colorClarity: "E/VS1", price: 7000, priceLabel: fmt(7000), sizeInfo: '18" — made to order', description: '10.00 CTW tennis necklace. A commanding neckline statement. Made to order.', featured: true }),
  labGrown({ id: "TN12", sku: "TN12", name: "12CT Tennis Necklace", slug: "tn12-12ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 12, diamondPieces: 180, colorClarity: "D/VS2", price: 8400, priceLabel: fmt(8400), sizeInfo: '18" — made to order', description: '12.00 CTW. Exceptional diamond coverage around the neckline. Made to order.', featured: false }),
  labGrown({ id: "TN15", sku: "TN15", name: "15CT Tennis Necklace", slug: "tn15-15ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 15, diamondPieces: 225, colorClarity: "E/VVS2", price: 10500, priceLabel: fmt(10500), sizeInfo: '18" — made to order', description: '15.00 CTW. A rare statement in lab-grown diamond tennis necklaces. Made to order.', featured: false }),
  labGrown({ id: "TN20", sku: "TN20", name: "20CT Tennis Necklace", slug: "tn20-20ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 20, diamondPieces: 300, colorClarity: "D/VS1", price: 14000, priceLabel: fmt(14000), sizeInfo: '18" — made to order', description: '20.00 CTW. Investment-tier tennis necklace at a scale rarely seen at this price. Made to order.', featured: false }),
  labGrown({ id: "TN25", sku: "TN25", name: "25CT Tennis Necklace", slug: "tn25-25ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 25, diamondPieces: 375, colorClarity: "E/VS2", price: 17500, priceLabel: fmt(17500), sizeInfo: '18" — made to order', description: '25.00 CTW. Near-complete diamond coverage around the neckline. Made to order.', featured: false }),
  labGrown({ id: "TN30", sku: "TN30", name: "30CT Tennis Necklace", slug: "tn30-30ct-tennis-necklace", category: "Necklaces", style: "Tennis Necklace", material: "14K White Gold", centerStone: "Round Brilliant", carats: 30, diamondPieces: 450, colorClarity: "D/VVS2", price: 21000, priceLabel: fmt(21000), sizeInfo: '18" — made to order', description: '30.00 CTW. The ultimate tennis necklace — maximum diamond saturation at 18". Made to order.', featured: false }),

  // ── FANCY NECKLACES ──
  labGrown({ id: "FN1", sku: "FN1", name: "Diamond Riviera Necklace", slug: "fn1-diamond-riviera-necklace", category: "Necklaces", style: "Riviera Necklace", material: "14K White Gold", centerStone: "Mixed", carats: 10, diamondPieces: 120, colorClarity: "F/VS1", price: 6500, priceLabel: fmt(6500), sizeInfo: '18" — made to order', description: '10.00 CTW Riviera necklace with graduated round brilliant lab-grown diamonds. Made to order.', featured: true }),
  labGrown({ id: "FN2", sku: "FN2", name: "Graduated Diamond Necklace", slug: "fn2-graduated-diamond-necklace", category: "Necklaces", style: "Graduated Necklace", material: "14K White Gold", centerStone: "Mixed", carats: 15, diamondPieces: 140, colorClarity: "F/VS1", price: 9000, priceLabel: fmt(9000), sizeInfo: '18" — made to order', description: '15.00 CTW graduated necklace. Diamonds scale in size from clasp to center cluster. Made to order.', featured: false }),
  labGrown({ id: "FN3", sku: "FN3", name: "Statement Diamond Necklace", slug: "fn3-statement-diamond-necklace", category: "Necklaces", style: "Statement Necklace", material: "14K White Gold", centerStone: "Mixed", carats: 20, diamondPieces: 160, colorClarity: "F/VS1", price: 14000, priceLabel: fmt(14000), sizeInfo: '18" — made to order', description: '20.00 CTW statement necklace. A showpiece of lab-grown diamond density. Made to order.', featured: false }),
  labGrown({ id: "FN4", sku: "FN4", name: "Luxury Cluster Necklace", slug: "fn4-luxury-cluster-necklace", category: "Necklaces", style: "Cluster Necklace", material: "14K White Gold", centerStone: "Mixed", carats: 25, diamondPieces: 180, colorClarity: "F/VS1", price: 18000, priceLabel: fmt(18000), sizeInfo: '18" — made to order', description: '25.00 CTW cluster necklace. Overlapping diamond groupings create an extraordinarily rich surface. Made to order.', featured: false }),

  // ── SOLITAIRE RINGS ──
  labGrown({ id: "SR1", sku: "SR1", name: "1CT Round Solitaire Ring", slug: "sr1-round-1ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Round Brilliant", diamondShape: "Round", carats: 1, diamondPieces: 1, colorClarity: "E/VS1", price: 600, priceLabel: fmt(600), sizeInfo: "US Size 4–10, resizable — made to order", description: "1.00 CT E/VS1 round brilliant lab-grown solitaire in a classic four-prong setting. Made to order.", featured: false }),
  labGrown({ id: "SR15", sku: "SR15", name: "1.5CT Solitaire Ring", slug: "sr1-5ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 1.5, diamondPieces: 1, colorClarity: "E/VS1", price: 900, priceLabel: fmt(900), sizeInfo: "US Size 4–10, resizable — made to order", description: "1.50 CT E/VS1 oval lab-grown solitaire. The ideal size for an engagement ring, made to order.", featured: true }),
  labGrown({ id: "SR2", sku: "SR2", name: "2CT Emerald Solitaire Ring", slug: "sr2-2ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Emerald", diamondShape: "Emerald", carats: 2, diamondPieces: 1, colorClarity: "E/VS1", price: 1200, priceLabel: fmt(1200), sizeInfo: "US Size 4–10, resizable — made to order", description: "2.00 CT E/VS1 emerald-cut diamond in a precise four-prong solitaire setting. Made to order.", featured: true }),
  labGrown({ id: "SR3", sku: "SR3", name: "3CT Pear Solitaire Ring", slug: "sr3-3ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Pear", diamondShape: "Pear", carats: 3, diamondPieces: 1, colorClarity: "E/VS1", price: 1800, priceLabel: fmt(1800), sizeInfo: "US Size 4–10, resizable — made to order", description: "3.00 CT pear-cut solitaire with a refined pointed silhouette. Made to order.", featured: true }),
  labGrown({ id: "SR4", sku: "SR4", name: "4CT Solitaire Ring", slug: "sr4-4ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 4, diamondPieces: 1, colorClarity: "E/VS1", price: 2400, priceLabel: fmt(2400), sizeInfo: "US Size 4–10, resizable — made to order", description: "4.00 CT oval solitaire in an unadorned setting that lets the diamond command attention. Made to order.", featured: false }),
  labGrown({ id: "SR5", sku: "SR5", name: "5CT Marquise Solitaire Ring", slug: "sr5-5ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Marquise", diamondShape: "Marquise", carats: 5, diamondPieces: 1, colorClarity: "E/VS1", price: 3000, priceLabel: fmt(3000), sizeInfo: "US Size 4–10, resizable — made to order", description: "5.00 CT marquise solitaire with elongated proportion and exceptional finger coverage. Made to order.", featured: false }),
  labGrown({ id: "SR6", sku: "SR6", name: "6CT Radiant Solitaire Ring", slug: "sr6-6ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Radiant", diamondShape: "Radiant", carats: 6, diamondPieces: 1, colorClarity: "E/VS1", price: 3600, priceLabel: fmt(3600), sizeInfo: "US Size 4–10, resizable — made to order", description: "6.00 CT radiant-cut solitaire balancing crisp geometry with brilliant light return. Made to order.", featured: false }),
  labGrown({ id: "SR8", sku: "SR8", name: "8CT Cushion Solitaire Ring", slug: "sr8-8ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Cushion Brilliant", diamondShape: "Cushion Brilliant", carats: 8, diamondPieces: 1, colorClarity: "E/VS1", price: 4800, priceLabel: fmt(4800), sizeInfo: "US Size 4–10, resizable — made to order", description: "8.00 CT cushion-brilliant solitaire with softened corners and collector-scale presence. Made to order.", featured: false }),
  labGrown({ id: "SR10", sku: "SR10", name: "10CT Solitaire Ring", slug: "sr10-10ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 10, diamondPieces: 1, colorClarity: "E/VS1", price: 6000, priceLabel: fmt(6000), sizeInfo: "US Size 4–10, resizable — made to order", description: "10.00 CT oval solitaire. A 10-carat center stone is a milestone few ever achieve at this price. Made to order.", featured: false }),
  labGrown({ id: "SR12", sku: "SR12", name: "12CT Princess Solitaire Ring", slug: "sr12-12ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Princess", diamondShape: "Princess", carats: 12, diamondPieces: 1, colorClarity: "E/VS1", price: 7200, priceLabel: fmt(7200), sizeInfo: "US Size 4–10, resizable — made to order", description: "12.00 CT princess-cut solitaire. A specimen-scale square center with crisp geometry, made to order.", featured: false }),

  // ── FANCY RINGS ──
  labGrown({ id: "FR1", sku: "FR1", name: "Hidden Halo Oval Ring", slug: "fr1-hidden-halo-oval-ring", category: "Rings", style: "Hidden Halo", material: "14K White Gold", centerStone: "Mixed", carats: 2.5, diamondPieces: 45, colorClarity: "F/VS1", price: 1800, priceLabel: fmt(1800), sizeInfo: "US Size 4–10, resizable — made to order", description: "2.50 CT oval lab-grown diamond in a hidden halo setting, visible only at certain angles. Made to order.", featured: true }),
  labGrown({ id: "FR2", sku: "FR2", name: "Radiant Halo Ring", slug: "fr2-radiant-halo-ring", category: "Rings", style: "Radiant Halo", material: "14K White Gold", centerStone: "Mixed", carats: 3, diamondPieces: 50, colorClarity: "F/VS1", price: 2200, priceLabel: fmt(2200), sizeInfo: "US Size 4–10, resizable — made to order", description: "3.00 CT radiant-cut lab-grown diamond with a brilliant round halo. Made to order.", featured: false }),
  labGrown({ id: "FR3", sku: "FR3", name: "Double Halo Cushion Ring", slug: "fr3-double-halo-cushion-ring", category: "Rings", style: "Double Halo", material: "14K White Gold", centerStone: "Mixed", carats: 4, diamondPieces: 55, colorClarity: "F/VS1", price: 3200, priceLabel: fmt(3200), sizeInfo: "US Size 4–10, resizable — made to order", description: "4.00 CT cushion-cut lab-grown center with a double pavé halo. Made to order.", featured: true }),
  labGrown({ id: "FR4", sku: "FR4", name: "Emerald Hidden Halo Ring", slug: "fr4-emerald-hidden-halo-ring", category: "Rings", style: "Hidden Halo", material: "14K White Gold", centerStone: "Mixed", carats: 5, diamondPieces: 60, colorClarity: "F/VS1", price: 4500, priceLabel: fmt(4500), sizeInfo: "US Size 4–10, resizable — made to order", description: "5.00 CT emerald-cut lab-grown diamond with a hidden halo. Made to order.", featured: false }),
  labGrown({ id: "FR5", sku: "FR5", name: "Three Stone Oval Ring", slug: "fr5-three-stone-oval-ring", category: "Rings", style: "Three Stone", material: "14K White Gold", centerStone: "Oval", carats: 3.5, diamondPieces: 65, colorClarity: "F/VS1", price: 2800, priceLabel: fmt(2800), sizeInfo: "US Size 4–10, resizable — made to order", description: "3.50 CTW three-stone ring. A prominent oval center flanked by two trillion-cut side stones. Made to order.", featured: false }),
  labGrown({ id: "FR6", sku: "FR6", name: "Fancy Cluster Ring", slug: "fr6-fancy-cluster-ring", category: "Rings", style: "Cluster", material: "14K White Gold", centerStone: "Round", carats: 6, diamondPieces: 70, colorClarity: "F/VS1", price: 5200, priceLabel: fmt(5200), sizeInfo: "US Size 4–10, resizable — made to order", description: "6.00 CTW fancy cluster ring — a floral cluster pattern for more visual impact per carat. Made to order.", featured: false }),

  // ── PENDANTS ──
  labGrown({ id: "PD1", sku: "PD1", name: "Cross Diamond Pendant", slug: "pd1-cross-diamond-pendant", category: "Pendants", style: "Cross", material: "14K Yellow Gold", centerStone: "Round Brilliant", carats: 1.5, diamondPieces: 31, colorClarity: "F/VS1", price: 700, priceLabel: fmt(700), sizeInfo: '18" chain — made to order', description: '1.50 CTW lab-grown diamond cross pendant on an 18" chain. Made to order.', featured: false }),
  labGrown({ id: "PD2", sku: "PD2", name: "Butterfly Diamond Pendant", slug: "pd2-butterfly-diamond-pendant", category: "Pendants", style: "Butterfly", material: "14K Yellow Gold", centerStone: "Round Brilliant", carats: 2, diamondPieces: 37, colorClarity: "F/VS1", price: 950, priceLabel: fmt(950), sizeInfo: '18" chain — made to order', description: '2.00 CTW butterfly pendant with diamonds tracing the wings — a wearable piece of art. Made to order.', featured: false }),
  labGrown({ id: "PD3", sku: "PD3", name: "Cluster Flower Pendant", slug: "pd3-cluster-flower-pendant", category: "Pendants", style: "Cluster Flower", material: "14K Yellow Gold", centerStone: "Round Brilliant", carats: 3, diamondPieces: 43, colorClarity: "F/VS1", price: 1400, priceLabel: fmt(1400), sizeInfo: '18" chain — made to order', description: '3.00 CTW floral cluster pendant, round brilliants arranged in a blooming pattern. Made to order.', featured: true }),
  labGrown({ id: "PD4", sku: "PD4", name: "Heart Halo Pendant (Lab-Grown)", slug: "pd4-heart-halo-pendant-lab-grown", category: "Pendants", style: "Heart Halo", material: "14K Yellow Gold", centerStone: "Round Brilliant", carats: 4, diamondPieces: 49, colorClarity: "F/VS1", price: 1900, priceLabel: fmt(1900), sizeInfo: '18" chain — made to order', description: '4.00 CTW heart-shaped halo pendant, heart center surrounded by a pavé halo. Made to order.', featured: false }),
  labGrown({ id: "PD5", sku: "PD5", name: "Fancy Drop Pendant", slug: "pd5-fancy-drop-pendant", category: "Pendants", style: "Drop", material: "14K Yellow Gold", centerStone: "Round Brilliant", carats: 5, diamondPieces: 55, colorClarity: "F/VS1", price: 2600, priceLabel: fmt(2600), sizeInfo: '18" chain — made to order', description: '5.00 CTW fancy drop pendant, a cascading design that catches light at every angle. Made to order.', featured: false }),
];

// ── CUSTOM ────────────────────────────────────────────────────────────────────

const customProduct: Product = {
  id: "CUSTOM", sku: "CUSTOM", name: "Custom Jewelry Design", slug: "custom-jewelry-design",
  category: "Custom Jewelry", source: "lab-grown", comingSoon: true,
  style: "Bespoke", material: "Your choice", centerStone: "Any",
  carats: 0, diamondPieces: 0, colorClarity: "Per selection",
  price: 0, priceLabel: "Custom quote", sizeInfo: "Per design",
  description: "From first sketch to finished heirloom. Bring your brief, your stone, or your inherited piece — we design and craft around you.",
  image: PLACEHOLDER.portrait,
  featured: false,
};

// ── EXPORTS ───────────────────────────────────────────────────────────────────

/**
 * Supplier lab rows are quoted in 14K. Storefront offers 18K gold, priced at
 * exactly 15% above those source figures. Signature rows already describe 18K
 * and receive the same July 2026 retail adjustment. Source constants remain
 * unchanged so inventory reconciliation can always recover original figures.
 */
// Prices come straight from JEWELSTONE_final_Inventory_price.xlsx (data/price-book.json),
// matched by SKU. No markup — the sheet value is the shelf price. Products without a
// SKU in the book (e.g. the custom CTA) keep their own price.
function withBookPrice(product: Product): Product {
  const exact = (priceBook as Record<string, number>)[product.sku];
  if (exact == null || exact <= 0) return product;
  // Every product in the price file shows its exact sheet price. Keep the
  // "From " prefix only for made-to-order lines that already use it.
  const priceLabel = product.priceLabel.startsWith("From ") ? fmt(exact) : usd(exact);
  return { ...product, price: exact, priceLabel };
}

// ── NATURAL PIECUT — in-house studio line ──────────────────────────────────────
// Source of truth: "Natural Pie-cut in House" sheet of
// JEWELSTONE_final_Inventory_price.xlsx. The sheet's "Selling price USD" is the
// final retail price for PIECUT, so this line is deliberately excluded from
// asEighteenKRetail() — gold is already 18K and no multiplier applies.
const piecutHouseProducts: Product[] = [
  {
    id: "JSND062601", sku: "JSND062601",
    name: "Emerald Piecut Ring",
    slug: "jsnd062601-emerald-piecut-ring",
    category: "Rings", source: "signature", 
    style: "Piecut split-shank halo ring", material: "18K Gold",
    centerStone: "Emerald PIECUT cluster", carats: 0.54, diamondPieces: 9,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838672606",
    visualCarat: 0.46, goldWeight: 2.067,
    price: 1515, priceLabel: usd(1515), sizeInfo: "One-of-a-kind — professional resizing available",
    description:
      "A 0.23ct emerald PIECUT centre assembled from 9 matched natural diamonds, reading close to 0.46ct on the hand. 0.54ct total diamond weight set in 2.067g of 18K gold. IGI certificate 46J838672606. One-of-one piece.",
    image: "/images/products/jsnd062601-emerald-piecut-ring/cover.webp",
    gallery: signatureGallery("jsnd062601-emerald-piecut-ring", 7, "webp"),
    videoUrl: "/images/products/jsnd062601-emerald-piecut-ring/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062602", sku: "JSND062602",
    name: "Emerald Piecut Earrings",
    slug: "jsnd062602-emerald-piecut-earrings",
    category: "Earrings", source: "signature", 
    style: "Piecut screw-back earrings", material: "18K Gold",
    centerStone: "Emerald PIECUT cluster", carats: 0.29, diamondPieces: 9,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838682606",
    visualCarat: 1.25, goldWeight: 2.71,
    price: 2230, priceLabel: usd(2230), sizeInfo: "Screw-back pair — one-of-a-kind",
    description:
      "A 0.29ct emerald PIECUT centre assembled from 9 matched natural diamonds, reading close to 1.25ct on the hand. 0.29ct total diamond weight set in 2.71g of 18K gold. IGI certificate 46J838682606. One-of-one pair.",
    image: "/images/products/jsnd062602-emerald-piecut-earrings/cover.webp",
    gallery: signatureGallery("jsnd062602-emerald-piecut-earrings", 7, "webp"),
    videoUrl: "/images/products/jsnd062602-emerald-piecut-earrings/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062603", sku: "JSND062603",
    name: "Emerald Piecut Pendant",
    slug: "jsnd062603-emerald-piecut-pendant",
    category: "Pendants", source: "signature", 
    style: "Piecut framed pendant", material: "18K Gold",
    centerStone: "Emerald PIECUT cluster", carats: 0.678, diamondPieces: 9,
    colorClarity: "FG/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838692606",
    visualCarat: 1.75, goldWeight: 1.111,
    price: 1422, priceLabel: usd(1422), sizeInfo: "Includes 18K chain — one-of-a-kind",
    description:
      "A 0.43ct emerald PIECUT centre assembled from 9 matched natural diamonds, reading close to 1.75ct on the hand. 0.678ct total diamond weight set in 1.111g of 18K gold. IGI certificate 46J838692606. One-of-one piece.",
    image: "/images/products/jsnd062603-emerald-piecut-pendant/cover.webp",
    gallery: signatureGallery("jsnd062603-emerald-piecut-pendant", 7, "webp"),
    videoUrl: "/images/products/jsnd062603-emerald-piecut-pendant/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062604", sku: "JSND062604",
    name: "Oval Piecut Earrings",
    slug: "jsnd062604-oval-piecut-earrings",
    category: "Earrings", source: "signature", 
    style: "Piecut screw-back earrings", material: "18K Gold",
    centerStone: "Oval PIECUT cluster", carats: 0.698, diamondPieces: 8,
    colorClarity: "EFG/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838702606",
    visualCarat: 0.75, goldWeight: 2.668,
    price: 2010, priceLabel: usd(2010), sizeInfo: "Screw-back pair — one-of-a-kind",
    description:
      "A 0.45ct oval PIECUT centre assembled from 8 matched natural diamonds, reading close to 0.75ct on the hand. 0.698ct total diamond weight set in 2.668g of 18K gold. IGI certificate 46J838702606. One-of-one pair.",
    image: "/images/products/jsnd062604-oval-piecut-earrings/cover.webp",
    gallery: signatureGallery("jsnd062604-oval-piecut-earrings", 7, "webp"),
    videoUrl: "/images/products/jsnd062604-oval-piecut-earrings/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062605", sku: "JSND062605",
    name: "Heart Piecut Ring",
    slug: "jsnd062605-heart-piecut-ring",
    category: "Rings", source: "signature", 
    style: "Piecut halo ring", material: "18K Gold",
    centerStone: "Heart PIECUT cluster", carats: 0.482, diamondPieces: 9,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838712606",
    visualCarat: 0.75, goldWeight: 1.778,
    price: 1405, priceLabel: usd(1405), sizeInfo: "One-of-a-kind — professional resizing available",
    description:
      "A 0.24ct heart PIECUT centre assembled from 9 matched natural diamonds, reading close to 0.75ct on the hand. 0.482ct total diamond weight set in 1.778g of 18K gold. IGI certificate 46J838712606. One-of-one piece.",
    image: "/images/products/jsnd062605-heart-piecut-ring/cover.webp",
    gallery: signatureGallery("jsnd062605-heart-piecut-ring", 7, "webp"),
    videoUrl: "/images/products/jsnd062605-heart-piecut-ring/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062606", sku: "JSND062606",
    name: "Asscher Piecut Earrings",
    slug: "jsnd062606-asscher-piecut-earrings",
    category: "Earrings", source: "signature", 
    style: "Piecut screw-back earrings", material: "18K Gold",
    centerStone: "Asscher PIECUT cluster", carats: 0.29, diamondPieces: 9,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838722606",
    visualCarat: 1.25, goldWeight: 4.74,
    price: 3556, priceLabel: usd(3556), sizeInfo: "Screw-back pair — one-of-a-kind",
    description:
      "A 0.29ct asscher PIECUT centre assembled from 9 matched natural diamonds, reading close to 1.25ct on the hand. 0.29ct total diamond weight set in 4.74g of 18K gold. IGI certificate 46J838722606. One-of-one pair.",
    image: "/images/products/jsnd062606-asscher-piecut-earrings/cover.webp",
    gallery: signatureGallery("jsnd062606-asscher-piecut-earrings", 7, "webp"),
    videoUrl: "/images/products/jsnd062606-asscher-piecut-earrings/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062607", sku: "JSND062607",
    name: "Star Piecut Earrings",
    slug: "jsnd062607-star-piecut-earrings",
    category: "Earrings", source: "signature", 
    style: "Piecut screw-back earrings", material: "18K Gold",
    centerStone: "Round PIECUT cluster", carats: 0.72, diamondPieces: 8,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838732607",
    visualCarat: 2, goldWeight: 1.741,
    price: 1674, priceLabel: usd(1674), sizeInfo: "Screw-back pair — one-of-a-kind",
    description:
      "A 0.72ct round PIECUT centre assembled from 8 matched natural diamonds, reading close to 2ct on the hand. 0.72ct total diamond weight set in 1.741g of 18K gold. IGI certificate 46J838732607. One-of-one pair.",
    image: "/images/products/jsnd062607-star-piecut-earrings/cover.webp",
    gallery: signatureGallery("jsnd062607-star-piecut-earrings", 7, "webp"),
    videoUrl: "/images/products/jsnd062607-star-piecut-earrings/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062608", sku: "JSND062608",
    name: "Heart Piecut Pendant",
    slug: "jsnd062608-heart-piecut-pendant",
    category: "Pendants", source: "signature", 
    style: "Piecut framed pendant", material: "18K Gold",
    centerStone: "Heart PIECUT cluster", carats: 1.044, diamondPieces: 3,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838742607",
    visualCarat: 3, goldWeight: 1.466,
    price: 2241, priceLabel: usd(2241), sizeInfo: "Includes 18K chain — one-of-a-kind",
    description:
      "A 0.82ct heart PIECUT centre assembled from 3 matched natural diamonds, reading close to 3ct on the hand. 1.044ct total diamond weight set in 1.466g of 18K gold. IGI certificate 46J838742607. One-of-one piece.",
    image: "/images/products/jsnd062608-heart-piecut-pendant/cover.webp",
    gallery: signatureGallery("jsnd062608-heart-piecut-pendant", 7, "webp"),
    videoUrl: "/images/products/jsnd062608-heart-piecut-pendant/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062609", sku: "JSND062609",
    name: "Heart Piecut Earrings",
    slug: "jsnd062609-heart-piecut-earrings",
    category: "Earrings", source: "signature", 
    style: "Piecut screw-back earrings", material: "18K Gold",
    centerStone: "Heart PIECUT cluster", carats: 0.952, diamondPieces: 6,
    colorClarity: "FGH/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838752606",
    visualCarat: 1.25, goldWeight: 2.397,
    price: 2249, priceLabel: usd(2249), sizeInfo: "Screw-back pair — one-of-a-kind",
    description:
      "A 0.71ct heart PIECUT centre assembled from 6 matched natural diamonds, reading close to 1.25ct on the hand. 0.952ct total diamond weight set in 2.397g of 18K gold. IGI certificate 46J838752606. One-of-one pair.",
    image: "/images/products/jsnd062609-heart-piecut-earrings/cover.webp",
    gallery: signatureGallery("jsnd062609-heart-piecut-earrings", 7, "webp"),
    videoUrl: "/images/products/jsnd062609-heart-piecut-earrings/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062610", sku: "JSND062610",
    name: "Pear Piecut Earrings",
    slug: "jsnd062610-pear-piecut-earrings",
    category: "Earrings", source: "signature", 
    style: "Piecut screw-back earrings", material: "18K Gold",
    centerStone: "Pear PIECUT cluster", carats: 0.17, diamondPieces: 4,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838762606",
    visualCarat: 0.5, goldWeight: 1.932,
    price: 1553, priceLabel: usd(1553), sizeInfo: "Screw-back pair — one-of-a-kind",
    description:
      "A 0.17ct pear PIECUT centre assembled from 4 matched natural diamonds, reading close to 0.5ct on the hand. 0.17ct total diamond weight set in 1.932g of 18K gold. IGI certificate 46J838762606. One-of-one pair.",
    image: "/images/products/jsnd062610-pear-piecut-earrings/cover.webp",
    gallery: signatureGallery("jsnd062610-pear-piecut-earrings", 7, "webp"),
    videoUrl: "/images/products/jsnd062610-pear-piecut-earrings/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062611", sku: "JSND062611",
    name: "Pear Piecut Pendant",
    slug: "jsnd062611-pear-piecut-pendant",
    category: "Pendants", source: "signature", 
    style: "Piecut framed pendant", material: "18K Gold",
    centerStone: "Pear PIECUT cluster", carats: 0.686, diamondPieces: 4,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838772607",
    visualCarat: 1.25, goldWeight: 1.444,
    price: 1729, priceLabel: usd(1729), sizeInfo: "Includes 18K chain — one-of-a-kind",
    description:
      "A 0.46ct pear PIECUT centre assembled from 4 matched natural diamonds, reading close to 1.25ct on the hand. 0.686ct total diamond weight set in 1.444g of 18K gold. IGI certificate 46J838772607. One-of-one piece.",
    image: "/images/products/jsnd062611-pear-piecut-pendant/cover.webp",
    gallery: signatureGallery("jsnd062611-pear-piecut-pendant", 7, "webp"),
    videoUrl: "/images/products/jsnd062611-pear-piecut-pendant/video-web.mp4",
    featured: false,
  },
  {
    id: "JSND062612", sku: "JSND062612",
    name: "Emerald Piecut Statement Ring",
    slug: "jsnd062612-emerald-piecut-statement-ring",
    category: "Rings", source: "signature", comingSoon: true,
    style: "Piecut statement ring", material: "18K Gold",
    centerStone: "Emerald PIECUT cluster", carats: 0.93, diamondPieces: 9,
    colorClarity: "EF/VVS/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "46J838782607",
    visualCarat: 3, goldWeight: 2.069,
    price: 2984, priceLabel: usd(2984), sizeInfo: "One-of-a-kind — professional resizing available",
    description:
      "A 0.93ct emerald PIECUT centre assembled from 9 matched natural diamonds, reading close to 3ct on the hand. 0.93ct total diamond weight set in 2.069g of 18K gold. IGI certificate 46J838782607. One-of-one piece.",
    image: PLACEHOLDER.portrait,
    featured: false,
  },
  {
    id: "JSND062613", sku: "JSND062613",
    name: "Round Piecut Statement Ring",
    slug: "jsnd062613-round-piecut-statement-ring",
    category: "Rings", source: "signature", comingSoon: true,
    style: "Piecut statement ring", material: "18K Gold",
    centerStone: "Round PIECUT cluster", carats: 1.04, diamondPieces: 9,
    colorClarity: "FG/VS", piecut: true, diamondWorld: "natural-piecut",
    diamondOrigin: "Natural", certificateNumber: "24J135722403",
    visualCarat: 3, goldWeight: 4.662,
    price: 4014, priceLabel: usd(4014), sizeInfo: "One-of-a-kind — professional resizing available",
    description:
      "A 0.93ct round PIECUT centre assembled from 9 matched natural diamonds, reading close to 3ct on the hand. 1.04ct total diamond weight set in 4.662g of 18K gold. IGI certificate 24J135722403. One-of-one piece.",
    image: PLACEHOLDER.portrait,
    featured: false,
  },
];

// CVD line comes from the supplier stock sheet (see data/cvd-products.ts).
export const products: Product[] = [
  ...signatureProducts,
  ...labGrownProducts,
  ...cvdProducts(IMAGERY_READY),
  customProduct,
  ...piecutHouseProducts,
].map(withBookPrice);

const DIAMOND_SHAPES: DiamondShape[] = [
  "Cushion Brilliant",
  "Straight Baguette",
  "Taper Baguette",
  "Half Moon",
  "Princess",
  "Marquise",
  "Radiant",
  "Cushion",
  "Emerald",
  "Heart",
  "Pear",
  "Oval",
  "Round",
];

export function getProductDiamondMetadata(product: Product) {
  const searchableShape = `${product.name} ${product.centerStone} ${product.description}`.toLowerCase();
  const shape =
    product.diamondShape ??
    DIAMOND_SHAPES.find((candidate) => searchableShape.includes(candidate.toLowerCase()));
  const parsedClarity = product.colorClarity.split("/")[1]?.trim() as DiamondClarity | undefined;

  return {
    shape,
    clarity: product.diamondClarity ?? parsedClarity,
    origin: product.diamondOrigin ?? (product.source === "lab-grown" ? "Lab-Grown" : "Natural"),
    antique: product.antique ?? false,
    piecut: product.piecut ?? product.source === "signature",
  };
}

export const featuredProducts = products.filter((p) => p.featured);

// Curated homepage grid — lead with real signature pieces, one lab-grown stud for range
const HOME_FEATURED_IDS = [
  "JSND062605", // Heart Halo Ring — signature
  "JSND062606", // Asscher Halo Drop Earrings — signature
  "JSND062601", // Emerald Halo Split-Shank Ring — signature
  "JSND062608", // Heart Halo Pendant — signature
  "JSND062602", // Emerald Halo Stud Earrings — signature
  "JSND062610", // Pear Halo Drop Earrings — signature
  "JSND062603", // Emerald Halo Pendant — signature
  "JSND062611", // Pear Halo Pendant — signature
  "ST10",       // 10CT diamond studs — lab-grown range preview
];

export const homeFeaturedProducts = HOME_FEATURED_IDS
  .map((id) => products.find((p) => p.id === id))
  .filter((p): p is Product => !!p);

export const signatureCollection = products.filter((p) => p.source === "signature");

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter((c) => !c.comingSoon && c.category === product.category && c.id !== product.id)
    .concat(products.filter((c) => !c.comingSoon && c.category !== product.category && c.id !== product.id))
    .slice(0, 3);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter((p) => p.category === category);
}

export function getStudProducts() {
  return products
    .filter((p) => p.id.startsWith("ST"))
    .sort((a, b) => a.carats - b.carats);
}
