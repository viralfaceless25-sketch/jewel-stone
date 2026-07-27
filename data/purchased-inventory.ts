// Goods received on memo (consignment) from suppliers. These live in the admin
// inventory under "Purchased inventory" and are NEVER published to the website —
// they are Maitri's property until sold and invoiced. Retail shown in the panel
// is the memo amount plus 10%, computed here so the memo cost stays the single
// source of truth.

export type PurchasedCategory =
  | "Necklaces" | "Earrings" | "Pendants" | "Bracelets" | "Rings";

export type PurchasedItem = {
  /** Supplier stock code from the memo. */
  code: string;
  name: string;
  category: PurchasedCategory;
  metal: string;
  metalWeightGm: number;
  diamondCarats: number;
  grossWeightGm: number;
  /** Memo (cost) amount in whole dollars, exactly as on the paperwork. */
  memoAmount: number;
  certificate?: string;
};

export type PurchaseMemo = {
  memoNumber: string;
  vendor: string;
  vendorContact: string;
  date: string;
  dueDate: string;
  termsDays: number;
  totalAmount: number;
  items: PurchasedItem[];
};

/** Retail = memo cost + 10%, rounded to the dollar. */
export const PURCHASED_MARKUP = 1.10;

export function purchasedRetail(item: PurchasedItem) {
  return Math.round(item.memoAmount * PURCHASED_MARKUP);
}

export function purchasedSlug(memo: PurchaseMemo, item: PurchasedItem) {
  return `memo-${memo.memoNumber.toLowerCase().replace(/[^a-z0-9]+/g, "")}-${item.code}`;
}

export const purchaseMemos: PurchaseMemo[] = [
  {
    memoNumber: "JS-80795",
    vendor: "Maitri Diamonds Inc.",
    vendorContact: "Jash Mavani · +1 (212) 869 0606 · Sales5@maitri.nyc",
    date: "2026-07-24",
    dueDate: "2026-08-08",
    termsDays: 15,
    totalAmount: 56820,
    items: [
      { code: "3000084", name: "2 Layer PE Rivera Necklace", category: "Necklaces", metal: "14K White Gold", metalWeightGm: 21.282, diamondCarats: 31.14, grossWeightGm: 27.51, memoAmount: 7100 },
      { code: "3000194", name: "Multishape BZL Hoops", category: "Earrings", metal: "14K Yellow Gold", metalWeightGm: 6.118, diamondCarats: 2.21, grossWeightGm: 6.56, memoAmount: 1330 },
      { code: "3000213", name: "RD OV BZL Hoops", category: "Earrings", metal: "14K White Gold", metalWeightGm: 4.808, diamondCarats: 1.71, grossWeightGm: 5.15, memoAmount: 980 },
      { code: "3000438", name: "OV Earrings", category: "Earrings", metal: "14K Yellow Gold", metalWeightGm: 11.104, diamondCarats: 7.63, grossWeightGm: 12.63, memoAmount: 2770 },
      { code: "3000462", name: "MA Earrings", category: "Earrings", metal: "14K White Gold", metalWeightGm: 18.858, diamondCarats: 8.31, grossWeightGm: 20.52, memoAmount: 4200 },
      { code: "3000518", name: "OV BZL Pendant & Chain", category: "Pendants", metal: "14K Yellow Gold", metalWeightGm: 4.15, diamondCarats: 2.04, grossWeightGm: 4.83, memoAmount: 1150, certificate: "IGI-760552761" },
      { code: "3000588", name: "RD Bezel Studs", category: "Earrings", metal: "14K Yellow Gold", metalWeightGm: 1.5, diamondCarats: 2.04, grossWeightGm: 2.18, memoAmount: 640, certificate: "IGI-769640066, 769640067" },
      { code: "3000591", name: "OV Bezel Studs", category: "Earrings", metal: "14K Yellow Gold", metalWeightGm: 1.49, diamondCarats: 2.04, grossWeightGm: 2.17, memoAmount: 640, certificate: "IGI-782641530, 775639946" },
      { code: "3000604", name: "HT BZL Pendant & Chain", category: "Pendants", metal: "14K Yellow Gold", metalWeightGm: 3.32, diamondCarats: 1.08, grossWeightGm: 3.68, memoAmount: 820, certificate: "IGI-778691236" },
      { code: "3000651", name: "EM BZL Studs", category: "Earrings", metal: "14K Yellow Gold", metalWeightGm: 1.33, diamondCarats: 1.32, grossWeightGm: 1.77, memoAmount: 410 },
      { code: "3000666", name: "CU BZL Studs", category: "Earrings", metal: "14K Yellow Gold", metalWeightGm: 1.38, diamondCarats: 2.1, grossWeightGm: 2.08, memoAmount: 620, certificate: "IGI-776623067, 772631458" },
      { code: "3000696", name: "EM Bracelet", category: "Bracelets", metal: "14K White Gold", metalWeightGm: 6.336, diamondCarats: 10.72, grossWeightGm: 8.48, memoAmount: 2280 },
      { code: "3000711", name: "OV Bracelet", category: "Bracelets", metal: "14K White Gold", metalWeightGm: 7.228, diamondCarats: 9.81, grossWeightGm: 9.19, memoAmount: 2640 },
      { code: "3000726", name: "Multi-shape Ring", category: "Rings", metal: "14K White Gold", metalWeightGm: 4.736, diamondCarats: 3.92, grossWeightGm: 5.52, memoAmount: 1670 },
      { code: "3000733", name: "Multi-shape Ring", category: "Rings", metal: "14K White Gold", metalWeightGm: 4.322, diamondCarats: 2.59, grossWeightGm: 4.84, memoAmount: 1030 },
      { code: "3000856", name: "CUL BZL Ring", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 3.53, diamondCarats: 2.02, grossWeightGm: 3.934, memoAmount: 1000, certificate: "IGI-768606560" },
      { code: "3000948", name: "EM Eternity Band", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 3.526, diamondCarats: 7.87, grossWeightGm: 5.1, memoAmount: 1430 },
      { code: "3000980", name: "SPC PE Studs", category: "Earrings", metal: "14K White Gold", metalWeightGm: 1.16, diamondCarats: 3.1, grossWeightGm: 1.78, memoAmount: 1030 },
      { code: "3000993", name: "SPC PE Pendant & Chain", category: "Pendants", metal: "14K White Gold", metalWeightGm: 2.018, diamondCarats: 2.06, grossWeightGm: 2.43, memoAmount: 790 },
      { code: "3000999", name: "OV Bracelet", category: "Bracelets", metal: "14K White Gold", metalWeightGm: 5.946, diamondCarats: 7.07, grossWeightGm: 7.36, memoAmount: 1970 },
      { code: "3001010", name: "EM Bracelet", category: "Bracelets", metal: "14K White Gold", metalWeightGm: 6.512, diamondCarats: 5.29, grossWeightGm: 7.57, memoAmount: 1740 },
      { code: "3001015", name: "PE Bracelet", category: "Bracelets", metal: "14K Yellow Gold", metalWeightGm: 5.302, diamondCarats: 9.54, grossWeightGm: 7.21, memoAmount: 1860 },
      { code: "3001031", name: "PE Bypass Ring", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 3.184, diamondCarats: 1.73, grossWeightGm: 3.53, memoAmount: 740 },
      { code: "3001035", name: "MQ Hidden Halo w/ Pave Ring", category: "Rings", metal: "14K White Gold", metalWeightGm: 4.372, diamondCarats: 3.54, grossWeightGm: 5.08, memoAmount: 1430 },
      { code: "3001040", name: "EM BZL 3 Stone Ring", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 2.996, diamondCarats: 2.67, grossWeightGm: 3.53, memoAmount: 840 },
      { code: "3001043", name: "Multishape 2 Layer Band", category: "Rings", metal: "14K White Gold", metalWeightGm: 3.524, diamondCarats: 2.23, grossWeightGm: 3.97, memoAmount: 940 },
      { code: "3001047", name: "OV 2 Stone Pendant & Chain", category: "Pendants", metal: "14K White Gold", metalWeightGm: 2.152, diamondCarats: 0.49, grossWeightGm: 2.25, memoAmount: 410 },
      { code: "3001053", name: "Multishape Bracelet", category: "Bracelets", metal: "14K White Gold", metalWeightGm: 5.16, diamondCarats: 5.95, grossWeightGm: 6.35, memoAmount: 1660 },
      { code: "3001054", name: "EM BZL w/ Pave Ring", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 2.498, diamondCarats: 1.51, grossWeightGm: 2.8, memoAmount: 580 },
      { code: "3001055", name: "OV BU Fancy Ring", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 3.522, diamondCarats: 1.99, grossWeightGm: 3.92, memoAmount: 960 },
      { code: "7000565", name: '6.75" Flex Bangle Fway', category: "Bracelets", metal: "14K White Gold", metalWeightGm: 13.18, diamondCarats: 8.12, grossWeightGm: 14.804, memoAmount: 2650 },
      { code: "7000846", name: '17" RVR Necklace 3P', category: "Necklaces", metal: "14K Yellow Gold", metalWeightGm: 17.88, diamondCarats: 10.63, grossWeightGm: 20.006, memoAmount: 3730 },
      { code: "7001861", name: '16"-20" DBY Necklace', category: "Necklaces", metal: "14K Yellow Gold", metalWeightGm: 2.32, diamondCarats: 2.04, grossWeightGm: 2.728, memoAmount: 600 },
      { code: "7002165", name: '16"-20" DBY Necklace', category: "Necklaces", metal: "14K Yellow Gold", metalWeightGm: 2.59, diamondCarats: 3.12, grossWeightGm: 3.214, memoAmount: 800 },
      { code: "7002171", name: '16"-20" DBY Necklace', category: "Necklaces", metal: "14K White Gold", metalWeightGm: 3.19, diamondCarats: 5.38, grossWeightGm: 4.266, memoAmount: 1050 },
      { code: "7002178", name: '16"-20" DBY Necklace', category: "Necklaces", metal: "14K Yellow Gold", metalWeightGm: 3.19, diamondCarats: 5.28, grossWeightGm: 4.246, memoAmount: 1050 },
      { code: "3001046", name: "EM 3 Layer Band", category: "Rings", metal: "14K Yellow Gold", metalWeightGm: 4.822, diamondCarats: 4.49, grossWeightGm: 5.72, memoAmount: 1280 },
    ],
  },
];
