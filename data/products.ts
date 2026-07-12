// Two product lines:
//  1. SIGNATURE  — real, one-of-a-kind Piecut pieces we physically have in hand.
//                  Photographed in-house (11 pieces, public/images/products/*).
//  2. LAB-GROWN  — made-to-order price list (Jewel_Stone_Lab_Inventory_20pct.xlsx).
//                  Real specs/pricing, but no studio photography yet — shows the
//                  logo "Coming Soon" placeholder until real photos are ready.
//
// Piecut USD pricing = (Selling Price INR / 87) × 2 retail markup, rounded to
// the nearest $5. Adjust the FX rate/markup below if the business decides otherwise.

export type ProductCategory =
  | "Rings"
  | "Earrings"
  | "Bracelets"
  | "Necklaces"
  | "Pendants"
  | "Loose Diamonds"
  | "Custom Jewelry";

export type MetalVariant = "white" | "yellow" | "rose";
export type ProductSource = "signature" | "lab-grown";
export type DiamondOrigin = "Lab-Grown" | "Natural";
export type DiamondClarity = "FL" | "IF" | "VVS1" | "VVS2" | "VS1" | "VS2" | "SI1" | "SI2";
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
  colorClarity: string;
  diamondShape?: DiamondShape;
  diamondClarity?: DiamondClarity;
  diamondOrigin?: DiamondOrigin;
  antique?: boolean;
  piecut?: boolean;
  price: number;
  priceLabel: string;
  sizeInfo: string;
  description: string;
  image: string;
  // Real multi-angle photography (signature pieces only)
  gallery?: string[];
  videoUrl?: string;
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
    description: "One-of-a-kind Piecut halo rings in stock now, plus made-to-order lab-grown solitaires from 1CT to 20CT.",
    image: "/images/products/heart-halo-ring/cover.jpg",
    priceFrom: "From $600",
  },
  {
    title: "Earrings",
    slug: "earrings",
    category: "Earrings",
    description: "Halo drops and studs in stock now, plus made-to-order lab-grown studs from 1CT to 20CT.",
    image: "/images/products/asscher-halo-drop-earrings/cover.jpg",
    priceFrom: "From $350",
  },
  {
    title: "Pendants",
    slug: "pendants",
    category: "Pendants",
    description: "Emerald, heart, and pear halo pendants in stock now, plus made-to-order fancy pendant styles.",
    image: "/images/products/heart-halo-pendant/cover.jpg",
    priceFrom: "From $700",
  },
  {
    title: "Tennis Bracelets",
    slug: "bracelets",
    category: "Bracelets",
    description: "Made-to-order continuous diamond tennis bracelets from 2CT to 30CT. Studio photography coming soon.",
    image: "/images/placeholder-coming-soon-portrait.jpg",
    priceFrom: "From $900",
    comingSoon: true,
  },
  {
    title: "Necklaces",
    slug: "necklaces",
    category: "Necklaces",
    description: "Made-to-order tennis and fancy diamond necklaces from 5CT to 30CT. Studio photography coming soon.",
    image: "/images/placeholder-coming-soon-portrait.jpg",
    priceFrom: "From $3,500",
    comingSoon: true,
  },
  {
    title: "Custom Design",
    slug: "custom-jewelry",
    category: "Custom Jewelry",
    description: "From first sketch to finished heirloom — your stone, your metal, your story.",
    image: "/images/placeholder-coming-soon-portrait.jpg",
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

function signatureGallery(slug: string, count: number) {
  return Array.from({ length: count }, (_, i) => `/images/products/${slug}/angle-${i + 1}.jpg`);
}

// ── SIGNATURE COLLECTION — real, one-of-a-kind Piecut pieces ─────────────────

const signatureProducts: Product[] = [
  {
    id: "JSD0626001", sku: "JSD0626001",
    name: "Emerald Halo Split-Shank Ring",
    slug: "emerald-halo-engagement-ring",
    category: "Rings", source: "signature",
    style: "Split shank with halo", material: "18K White Gold",
    centerStone: "Emerald-cut cluster", carats: 0.49, diamondPieces: 9,
    colorClarity: "EF/VVS",
    price: 2375, priceLabel: usd(2375), sizeInfo: "One-of-a-kind — professional resizing available",
    description: "A 0.23ct emerald-cut illusion center built from 9 diamonds, held in a diamond-pavé halo on a split shank. 0.49ct total diamond weight in 18K white gold. EF color, VVS clarity. This is the exact physical piece shown — one available.",
    image: "/images/products/emerald-halo-engagement-ring/cover.jpg",
    gallery: signatureGallery("emerald-halo-engagement-ring", 8),
    videoUrl: "/images/products/emerald-halo-engagement-ring/video.mp4",
    featured: true,
  },
  {
    id: "JSD0626002", sku: "JSD0626002",
    name: "Emerald Halo Stud Earrings",
    slug: "emerald-halo-stud-earrings",
    category: "Earrings", source: "signature",
    style: "Screw back", material: "18K White Gold",
    centerStone: "Emerald-cut cluster", carats: 0.80, diamondPieces: 9,
    colorClarity: "EF/VVS",
    price: 4045, priceLabel: usd(4045), sizeInfo: "Pierced ears, screw-back closure",
    description: "0.58ct emerald-cut illusion centers (9 diamonds each) in an octagonal pavé halo, screw-back closure. 0.80ct total diamond weight in 18K white gold. EF color, VVS clarity. One pair available.",
    image: "/images/products/emerald-halo-stud-earrings/cover.jpg",
    gallery: signatureGallery("emerald-halo-stud-earrings", 8),
    videoUrl: "/images/products/emerald-halo-stud-earrings/video.mp4",
    featured: true,
  },
  {
    id: "JSD0626003", sku: "JSD0626003",
    name: "Emerald Halo Pendant",
    slug: "emerald-halo-pendant",
    category: "Pendants", source: "signature",
    style: "Framed halo", material: "18K White Gold",
    centerStone: "Emerald-cut cluster", carats: 0.67, diamondPieces: 9,
    colorClarity: "FG/VVS",
    price: 2245, priceLabel: usd(2245), sizeInfo: "Bail fits chains up to 3mm — chain sold separately",
    description: "0.43ct emerald-cut illusion center (9 diamonds) in a rectangular pavé frame. 0.67ct total diamond weight in 18K white gold. FG color, VVS clarity. One-of-a-kind piece.",
    image: "/images/products/emerald-halo-pendant/cover.jpg",
    gallery: signatureGallery("emerald-halo-pendant", 8),
    videoUrl: "/images/products/emerald-halo-pendant/video.mp4",
    featured: false,
  },
  {
    id: "JSD0626004", sku: "JSD0626004",
    name: "Oval Halo Drop Earrings",
    slug: "oval-halo-drop-earrings",
    category: "Earrings", source: "signature",
    style: "Screw back", material: "18K White Gold",
    centerStone: "Oval cluster", carats: 0.66, diamondPieces: 4,
    colorClarity: "EF/VVS",
    price: 2530, priceLabel: usd(2530), sizeInfo: "Pierced ears, screw-back closure",
    description: "0.45ct oval illusion centers (4 diamonds each) inside a round pavé halo. 0.66ct total diamond weight in 18K white gold. EF color, VVS clarity. One pair available.",
    image: "/images/products/oval-halo-drop-earrings/cover.jpg",
    gallery: signatureGallery("oval-halo-drop-earrings", 8),
    videoUrl: "/images/products/oval-halo-drop-earrings/video.mp4",
    featured: false,
  },
  {
    id: "JSD0626005", sku: "JSD0626005",
    name: "Heart Halo Ring",
    slug: "heart-halo-ring",
    category: "Rings", source: "signature",
    style: "Halo", material: "18K Rose Gold",
    centerStone: "Heart-shaped cluster", carats: 0.46, diamondPieces: 3,
    colorClarity: "EF/VVS",
    price: 2585, priceLabel: usd(2585), sizeInfo: "One-of-a-kind — professional resizing available",
    description: "A 0.24ct heart-shaped illusion center (3 diamonds) in a pavé heart halo on a rose gold band with a diamond shank. 0.46ct total diamond weight, 18K rose gold. EF color, VVS clarity. This exact piece — one available.",
    image: "/images/products/heart-halo-ring/cover.jpg",
    gallery: signatureGallery("heart-halo-ring", 16),
    videoUrl: "/images/products/heart-halo-ring/video.mp4",
    featured: true,
  },
  {
    id: "JSD0626006", sku: "JSD0626006",
    name: "Asscher Halo Drop Earrings",
    slug: "asscher-halo-drop-earrings",
    category: "Earrings", source: "signature",
    style: "Screw back", material: "18K Yellow Gold",
    centerStone: "Asscher-cut cluster", carats: 1.25, diamondPieces: 9,
    colorClarity: "EF/VVS",
    price: 4970, priceLabel: usd(4970), sizeInfo: "Pierced ears, screw-back closure",
    description: "0.62ct Asscher-cut illusion centers (9 diamonds each) in an octagonal halo, suspended from a diamond-pavé hoop. 1.25ct total diamond weight in 18K yellow gold. EF color, VVS clarity. One pair available.",
    image: "/images/products/asscher-halo-drop-earrings/cover.jpg",
    gallery: signatureGallery("asscher-halo-drop-earrings", 8),
    videoUrl: "/images/products/asscher-halo-drop-earrings/video.mp4",
    featured: true,
  },
  {
    id: "JSD0626007", sku: "JSD0626007",
    name: "Star Cluster Stud Earrings",
    slug: "star-cluster-stud-earrings",
    category: "Earrings", source: "signature",
    style: "Screw back, no halo", material: "18K White Gold",
    centerStone: "Star-cut cluster", carats: 0.72, diamondPieces: 4,
    colorClarity: "EF/VVS",
    price: 1940, priceLabel: usd(1940), sizeInfo: "Pierced ears, screw-back closure",
    description: "0.72ct star-cut illusion clusters (4 kite-shaped diamonds each forming a square silhouette), no halo, screw-back closure. 18K white gold. EF color, VVS clarity. One pair available.",
    image: "/images/products/star-cluster-stud-earrings/cover.jpg",
    gallery: signatureGallery("star-cluster-stud-earrings", 8),
    videoUrl: "/images/products/star-cluster-stud-earrings/video.mp4",
    featured: false,
  },
  {
    id: "JSD0626008", sku: "JSD0626008",
    name: "Heart Halo Pendant",
    slug: "heart-halo-pendant",
    category: "Pendants", source: "signature",
    style: "Framed halo", material: "18K Rose Gold",
    centerStone: "Heart-shaped cluster", carats: 1.02, diamondPieces: 3,
    colorClarity: "EF/VVS",
    price: 2480, priceLabel: usd(2480), sizeInfo: "Bail fits chains up to 3mm — chain sold separately",
    description: "0.82ct heart-shaped illusion center (3 diamonds) in a pavé heart frame. 1.02ct total diamond weight in 18K rose gold. EF color, VVS clarity. One-of-a-kind piece.",
    image: "/images/products/heart-halo-pendant/cover.jpg",
    gallery: signatureGallery("heart-halo-pendant", 8),
    videoUrl: "/images/products/heart-halo-pendant/video.mp4",
    featured: false,
  },
  {
    id: "JSD0626009", sku: "JSD0626009",
    name: "Heart Halo Drop Earrings",
    slug: "heart-halo-drop-earrings",
    category: "Earrings", source: "signature",
    style: "Screw back", material: "18K Rose Gold",
    centerStone: "Heart-shaped cluster", carats: 0.94, diamondPieces: 3,
    colorClarity: "EF/VVS",
    price: 2425, priceLabel: usd(2425), sizeInfo: "Pierced ears, screw-back closure",
    description: "0.71ct heart-shaped illusion centers (3 diamonds each) in a pavé heart halo. 0.94ct total diamond weight in 18K rose gold. EF color, VVS clarity. One pair available.",
    image: "/images/products/heart-halo-drop-earrings/cover.jpg",
    gallery: signatureGallery("heart-halo-drop-earrings", 8),
    videoUrl: "/images/products/heart-halo-drop-earrings/video.mp4",
    featured: false,
  },
  {
    id: "JSD0626010", sku: "JSD0626010",
    name: "Pear Halo Drop Earrings",
    slug: "pear-halo-drop-earrings",
    category: "Earrings", source: "signature",
    style: "Screw back", material: "18K Yellow Gold",
    centerStone: "Pear-shaped cluster", carats: 0.59, diamondPieces: 4,
    colorClarity: "EF/VVS",
    price: 3500, priceLabel: usd(3500), sizeInfo: "Pierced ears, screw-back closure",
    description: "0.35ct pear-shaped illusion centers (4 diamonds each) in a teardrop pavé halo. 0.59ct total diamond weight in 18K yellow gold. EF color, VVS clarity. One pair available.",
    image: "/images/products/pear-halo-drop-earrings/cover.jpg",
    gallery: signatureGallery("pear-halo-drop-earrings", 8),
    videoUrl: "/images/products/pear-halo-drop-earrings/video.mp4",
    featured: false,
  },
  {
    id: "JSD0626011", sku: "JSD0626011",
    name: "Pear Halo Pendant",
    slug: "pear-halo-pendant",
    category: "Pendants", source: "signature",
    style: "Framed halo", material: "18K Yellow Gold",
    centerStone: "Pear-shaped cluster", carats: 0.68, diamondPieces: 4,
    colorClarity: "EF/VVS",
    price: 2720, priceLabel: usd(2720), sizeInfo: "Bail fits chains up to 3mm — chain sold separately",
    description: "0.46ct pear-shaped illusion center (4 diamonds) in a teardrop pavé frame with a diamond bail accent. 0.68ct total diamond weight in 18K yellow gold. EF color, VVS clarity. One-of-a-kind piece.",
    image: "/images/products/pear-halo-pendant/cover.jpg",
    gallery: signatureGallery("pear-halo-pendant", 8),
    videoUrl: "/images/products/pear-halo-pendant/video.mp4",
    featured: false,
  },
];

// ── LAB-GROWN — made-to-order price list (Jewel_Stone_Lab_Inventory_20pct.xlsx) ─
// No studio photography yet — every entry renders the Coming Soon placeholder.

function labGrown(p: Omit<Product, "source" | "comingSoon" | "image" | "sku"> & { sku: string }): Product {
  return {
    ...p,
    sku: p.sku,
    source: "lab-grown",
    comingSoon: true,
    image: p.category === "Earrings" ? PLACEHOLDER.square : PLACEHOLDER.portrait,
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
  labGrown({ id: "SR1", sku: "SR1", name: "1CT Solitaire Ring", slug: "sr1-1ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 1, diamondPieces: 1, colorClarity: "E/VS1", price: 600, priceLabel: fmt(600), sizeInfo: "US Size 4–10, resizable — made to order", description: "1.00 CT E/VS1 oval lab-grown diamond solitaire. Clean, classic, and made to order in 14K white gold.", featured: false }),
  labGrown({ id: "SR1PT5", sku: "SR1.5", name: "1.5CT Solitaire Ring", slug: "sr1-5ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 1.5, diamondPieces: 1, colorClarity: "E/VS1", price: 900, priceLabel: fmt(900), sizeInfo: "US Size 4–10, resizable — made to order", description: "1.50 CT E/VS1 oval lab-grown solitaire. The ideal size for an engagement ring, made to order.", featured: true }),
  labGrown({ id: "SR2", sku: "SR2", name: "2CT Solitaire Ring", slug: "sr2-2ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 2, diamondPieces: 1, colorClarity: "E/VS1", price: 1200, priceLabel: fmt(1200), sizeInfo: "US Size 4–10, resizable — made to order", description: "2.00 CT E/VS1 oval in a classic 4-prong solitaire setting. Made to order.", featured: true }),
  labGrown({ id: "SR3", sku: "SR3", name: "3CT Solitaire Ring", slug: "sr3-3ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 3, diamondPieces: 1, colorClarity: "E/VS1", price: 1800, priceLabel: fmt(1800), sizeInfo: "US Size 4–10, resizable — made to order", description: "3.00 CT oval solitaire. A rare size that reads as a significant diamond. Made to order.", featured: true }),
  labGrown({ id: "SR4", sku: "SR4", name: "4CT Solitaire Ring", slug: "sr4-4ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 4, diamondPieces: 1, colorClarity: "E/VS1", price: 2400, priceLabel: fmt(2400), sizeInfo: "US Size 4–10, resizable — made to order", description: "4.00 CT oval solitaire in an unadorned setting that lets the diamond command attention. Made to order.", featured: false }),
  labGrown({ id: "SR5", sku: "SR5", name: "5CT Solitaire Ring", slug: "sr5-5ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 5, diamondPieces: 1, colorClarity: "E/VS1", price: 3000, priceLabel: fmt(3000), sizeInfo: "US Size 4–10, resizable — made to order", description: "5.00 CT oval solitaire. A statement ring that turns heads at every angle. Made to order.", featured: false }),
  labGrown({ id: "SR6", sku: "SR6", name: "6CT Solitaire Ring", slug: "sr6-6ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 6, diamondPieces: 1, colorClarity: "E/VS1", price: 3600, priceLabel: fmt(3600), sizeInfo: "US Size 4–10, resizable — made to order", description: "6.00 CT oval solitaire. An extraordinary center stone at an extraordinary lab-grown price. Made to order.", featured: false }),
  labGrown({ id: "SR8", sku: "SR8", name: "8CT Solitaire Ring", slug: "sr8-8ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 8, diamondPieces: 1, colorClarity: "E/VS1", price: 4800, priceLabel: fmt(4800), sizeInfo: "US Size 4–10, resizable — made to order", description: "8.00 CT oval solitaire. Collector-grade diamond weight on a clean 14K white gold band. Made to order.", featured: false }),
  labGrown({ id: "SR10", sku: "SR10", name: "10CT Solitaire Ring", slug: "sr10-10ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 10, diamondPieces: 1, colorClarity: "E/VS1", price: 6000, priceLabel: fmt(6000), sizeInfo: "US Size 4–10, resizable — made to order", description: "10.00 CT oval solitaire. A 10-carat center stone is a milestone few ever achieve at this price. Made to order.", featured: false }),
  labGrown({ id: "SR12", sku: "SR12", name: "12CT Solitaire Ring", slug: "sr12-12ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 12, diamondPieces: 1, colorClarity: "E/VS1", price: 7200, priceLabel: fmt(7200), sizeInfo: "US Size 4–10, resizable — made to order", description: "12.00 CT oval solitaire. A specimen-grade center stone, precisely engineered. Made to order.", featured: false }),
  labGrown({ id: "SR15", sku: "SR15", name: "15CT Solitaire Ring", slug: "sr15-15ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 15, diamondPieces: 1, colorClarity: "E/VS1", price: 9000, priceLabel: fmt(9000), sizeInfo: "US Size 4–10, resizable — made to order", description: "15.00 CT oval solitaire. One of the rarest center stone weights available in lab-grown. Made to order.", featured: false }),
  labGrown({ id: "SR20", sku: "SR20", name: "20CT Solitaire Ring", slug: "sr20-20ct-solitaire-ring", category: "Rings", style: "Solitaire", material: "14K White Gold", centerStone: "Oval", carats: 20, diamondPieces: 1, colorClarity: "E/VS1", price: 12000, priceLabel: fmt(12000), sizeInfo: "US Size 4–10, resizable — made to order", description: "20.00 CT oval solitaire. The absolute pinnacle of lab-grown solitaire rings. Made to order.", featured: false }),

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

export const products: Product[] = [...signatureProducts, ...labGrownProducts, customProduct];

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
  "JSD0626005", // Heart Halo Ring — signature
  "JSD0626006", // Asscher Halo Drop Earrings — signature
  "JSD0626001", // Emerald Halo Split-Shank Ring — signature
  "JSD0626008", // Heart Halo Pendant — signature
  "JSD0626002", // Emerald Halo Stud Earrings — signature
  "JSD0626010", // Pear Halo Drop Earrings — signature
  "JSD0626003", // Emerald Halo Pendant — signature
  "JSD0626011", // Pear Halo Pendant — signature
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
    .filter((c) => c.category === product.category && c.id !== product.id)
    .concat(products.filter((c) => c.category !== product.category && c.id !== product.id))
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
