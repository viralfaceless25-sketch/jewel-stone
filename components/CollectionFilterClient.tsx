"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { getProductDiamondMetadata } from "@/data/products";
import type { DiamondOrigin, DiamondShape, Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductQuickView } from "@/components/ProductQuickView";

function toggleSet<T>(set: Set<T>, val: T): Set<T> {
  const n = new Set(set);
  n.has(val) ? n.delete(val) : n.add(val);
  return n;
}

const SHAPES: DiamondShape[] = [
  "Round", "Oval", "Cushion", "Emerald", "Pear", "Heart", "Radiant", "Marquise",
  "Cushion Brilliant", "Princess", "Straight Baguette", "Taper Baguette", "Half Moon",
];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"] as const;
const ORIGINS: DiamondOrigin[] = ["Lab-Grown", "Natural"];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
        active
          ? "border-rose/70 bg-rose/10 text-velvet shadow-[0_0_0_3px_rgba(168,124,54,0.14)]"
          : "border-rose/18 bg-pearl/50 text-ink/65 hover:border-rose/45 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-velvet/50">
      {children}
    </p>
  );
}

const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "carat-asc", label: "Carat: Low → High" },
  { key: "carat-desc", label: "Carat: High → Low" },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export function CollectionFilterClient({ products }: { products: Product[] }) {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [selectedShapes, setSelectedShapes] = useState(new Set<string>());
  const [selectedStyles, setSelectedStyles] = useState(new Set<string>());
  const [selectedClarities, setSelectedClarities] = useState(new Set<string>());
  const [selectedOrigins, setSelectedOrigins] = useState(new Set<DiamondOrigin>());
  const [antique, setAntique] = useState(false);
  const [piecut, setPiecut] = useState(false);
  const [caratMin, setCaratMin] = useState("");
  const [caratMax, setCaratMax] = useState("");

  const styles = useMemo(() => {
    const s = new Set(products.map((p) => p.style).filter(Boolean));
    return [...s].sort();
  }, [products]);


  const hasFilters =
    selectedShapes.size > 0 ||
    selectedStyles.size > 0 ||
    selectedClarities.size > 0 ||
    selectedOrigins.size > 0 ||
    antique ||
    piecut ||
    !!caratMin ||
    !!caratMax;

  function clearAll() {
    setSelectedShapes(new Set());
    setSelectedStyles(new Set());
    setSelectedClarities(new Set());
    setSelectedOrigins(new Set());
    setAntique(false);
    setPiecut(false);
    setCaratMin("");
    setCaratMax("");
    setSort("featured");
  }

  const results = useMemo(() => {
    let list = [...products];
    if (selectedShapes.size > 0)
      list = list.filter((p) => {
        const shape = getProductDiamondMetadata(p).shape;
        return !!shape && selectedShapes.has(shape);
      });
    if (selectedStyles.size > 0)
      list = list.filter((p) => selectedStyles.has(p.style));
    if (selectedClarities.size > 0)
      list = list.filter((p) => {
        const clarity = getProductDiamondMetadata(p).clarity;
        return !!clarity && selectedClarities.has(clarity);
      });
    if (selectedOrigins.size > 0)
      list = list.filter((p) => selectedOrigins.has(getProductDiamondMetadata(p).origin));
    if (antique) list = list.filter((p) => getProductDiamondMetadata(p).antique);
    if (piecut) list = list.filter((p) => getProductDiamondMetadata(p).piecut);
    if (caratMin) list = list.filter((p) => p.carats >= parseFloat(caratMin));
    if (caratMax) list = list.filter((p) => p.carats <= parseFloat(caratMax));
    switch (sort) {
      case "carat-asc":  list.sort((a, b) => a.carats - b.carats); break;
      case "carat-desc": list.sort((a, b) => b.carats - a.carats); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [products, selectedShapes, selectedStyles, selectedClarities, selectedOrigins, antique, piecut, caratMin, caratMax, sort]);

  return (
    <>
      <div className="luxury-shell pt-10 pb-32">
        {/* ── Rose gold frost glass filter bar ── */}
        <div className="mb-8 rounded-2xl border border-rose/15 bg-[linear-gradient(135deg,rgba(255,244,240,0.80)_0%,rgba(252,228,215,0.72)_50%,rgba(255,244,240,0.80)_100%)] px-6 py-5 shadow-[0_8px_40px_rgba(12,14,16,0.09),inset_0_1px_0_rgba(237,241,246,0.65)] backdrop-blur-xl ring-1 ring-inset ring-white/30">

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-velvet/55">
                Filter &amp; Sort
              </span>
              <span className="h-px w-6 bg-rose/25" />
              <span className="text-xs text-ink/55">
                <span className="font-semibold text-ink">{results.length}</span>{" "}
                {results.length === 1 ? "piece" : "pieces"}
                {hasFilters && (
                  <span className="ml-1 text-rose/80"> (filtered)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products"
                className="cursor-pointer rounded-full border border-rose/22 bg-pearl/55 px-3.5 py-1.5 text-xs font-medium text-ink/70 focus:border-rose/50 focus:outline-none"
              >
                {SORT_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {/* Clear all */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 rounded-full border border-rose/28 bg-pearl/50 px-3 py-1.5 text-xs text-rose transition-all duration-200 hover:border-rose/55 hover:bg-rose/5"
                >
                  <X size={11} aria-hidden="true" />
                  Clear
                </button>
              )}

              {/* Mobile toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                className="flex items-center gap-1.5 rounded-full border border-rose/22 bg-pearl/55 px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-rose/45 lg:hidden"
              >
                <SlidersHorizontal size={12} aria-hidden="true" />
                {hasFilters ? "Filters •" : "Filters"}
                <ChevronDown
                  size={11}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Filter groups — always visible on lg+, toggle on mobile */}
          <div className={`mt-5 ${mobileOpen ? "block" : "hidden"} lg:block`}>
            <div className="flex flex-wrap items-start gap-x-8 gap-y-5">

              {/* Diamond Shape */}
              <div>
                <Label>Diamond Shape</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SHAPES.map((shape) => (
                    <Pill
                      key={shape}
                      active={selectedShapes.has(shape)}
                      onClick={() => setSelectedShapes(toggleSet(selectedShapes, shape))}
                    >
                      {shape}
                    </Pill>
                  ))}
                </div>
              </div>

              <div>
                <Label>Clarity</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CLARITIES.map((clarity) => (
                    <Pill
                      key={clarity}
                      active={selectedClarities.has(clarity)}
                      onClick={() => setSelectedClarities(toggleSet(selectedClarities, clarity))}
                    >
                      {clarity}
                    </Pill>
                  ))}
                </div>
              </div>

              <div>
                <Label>Origin &amp; Specialty</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ORIGINS.map((origin) => (
                    <Pill
                      key={origin}
                      active={selectedOrigins.has(origin)}
                      onClick={() => setSelectedOrigins(toggleSet(selectedOrigins, origin))}
                    >
                      {origin}
                    </Pill>
                  ))}
                  <Pill active={antique} onClick={() => setAntique((value) => !value)}>
                    Antique
                  </Pill>
                  <button
                    type="button"
                    onClick={() => setPiecut((value) => !value)}
                    aria-pressed={piecut}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose ${
                      piecut
                        ? "border-champagne bg-rose text-ink shadow-[0_0_0_3px_rgba(197,164,126,0.2)]"
                        : "border-champagne/65 bg-rose/90 text-champagne hover:bg-rose"
                    }`}
                  >
                    Piecut Specialty
                  </button>
                </div>
              </div>

              {/* Style */}
              {styles.length > 1 && (
                <div>
                  <Label>Style</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {styles.map((s) => (
                      <Pill
                        key={s}
                        active={selectedStyles.has(s)}
                        onClick={() => setSelectedStyles(toggleSet(selectedStyles, s))}
                      >
                        {s}
                      </Pill>
                    ))}
                  </div>
                </div>
              )}

              {/* Carat Weight */}
              <div>
                <Label>Carat Weight</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="Min"
                    value={caratMin}
                    onChange={(e) => setCaratMin(e.target.value)}
                    className="w-20 rounded-lg border border-rose/20 bg-pearl/60 px-3 py-1.5 text-xs text-ink placeholder:text-ink/35 focus:border-rose/55 focus:outline-none"
                  />
                  <span className="text-[10px] text-ink/35">–</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="Max"
                    value={caratMax}
                    onChange={(e) => setCaratMax(e.target.value)}
                    className="w-20 rounded-lg border border-rose/20 bg-pearl/60 px-3 py-1.5 text-xs text-ink placeholder:text-ink/35 focus:border-rose/55 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product grid */}
        {results.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink/40">No pieces match these filters.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-rose/30 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-rose/60"
            >
              <X size={14} aria-hidden="true" />
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(i * 0.04, 0.3),
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <ProductCard product={product} onQuickView={setQuickView} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
