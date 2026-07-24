"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useMemo, useState } from "react";
import type { DiamondWorld, Product } from "@/data/products";
import {
  deriveDiamondWorld,
  deriveProductType,
  DIAMOND_WORLDS,
  DIAMOND_WORLD_LABELS,
  isDiamondWorld,
  isProductType,
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from "@/lib/commerce/diamond-worlds";
import { CollectionTile } from "./CollectionTile";
import { PieceQuickView } from "./PieceQuickView";
import styles from "./collections.module.css";

const CATEGORY_ORDER = ["Rings", "Earrings", "Pendants", "Bracelets", "Necklaces"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  Rings: "Rings",
  Earrings: "Earrings & Studs",
  Pendants: "Pendants",
  Bracelets: "Bracelets",
  Necklaces: "Necklaces & Chains",
};

export function CollectionGallery({ items }: { items: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const typeParam = params.get("type");
  const worldParam = params.get("world");
  const activeType: ProductType | "" = typeParam && isProductType(typeParam) ? typeParam : "";
  const activeWorld: DiamondWorld | "" = worldParam && isDiamondWorld(worldParam) ? worldParam : "";
  const activeCategory = params.get("category") ?? "All";

  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [expanded, setExpanded] = useState<Product | null>(null);

  // Push filter state into the URL so links (and the homepage pills) are shareable.
  const setFilter = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === "All") next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const base = useMemo(
    () => (showFullCatalog ? items : items.filter((product) => !product.comingSoon)),
    [items, showFullCatalog],
  );

  // Progressive narrowing: type → world → category, then sort by carat ascending.
  const afterType = useMemo(
    () => (activeType ? base.filter((p) => deriveProductType(p) === activeType) : base),
    [base, activeType],
  );
  const afterWorld = useMemo(
    () => (activeWorld ? afterType.filter((p) => deriveDiamondWorld(p) === activeWorld) : afterType),
    [afterType, activeWorld],
  );
  const categories = useMemo(() => {
    const present = new Set(afterWorld.map((p) => p.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [afterWorld]);
  const filtered = useMemo(() => {
    const list = activeCategory === "All" ? afterWorld : afterWorld.filter((p) => p.category === activeCategory);
    return [...list].sort((a, b) => a.carats - b.carats || a.name.localeCompare(b.name));
  }, [afterWorld, activeCategory]);

  const editorial = useMemo(() => {
    const category = activeCategory !== "All" ? activeCategory : filtered[0]?.category;
    if (category === "Rings") return { image: "/images/products/fr4-emerald-hidden-halo-ring/model.webp", title: "Scale, seen on the hand", href: "/products/fr4-emerald-hidden-halo-ring" };
    if (category === "Necklaces") return { image: "/images/products/fn2-graduated-diamond-necklace/model.webp", title: "Fifteen carats in crescendo", href: "/products/fn2-graduated-diamond-necklace" };
    if (category === "Bracelets") return { image: "/images/products/tb12-12ct-tennis-bracelet/model.webp", title: "A line of light around the wrist", href: "/products/tb12-12ct-tennis-bracelet" };
    if (category === "Earrings") return { image: "/images/lifestyle/model-asscher-editorial.jpg", title: "Movement changes the piece", href: "/products/asscher-halo-drop-earrings" };
    if (category === "Pendants") return { image: "/images/lifestyle/model-heart-halo-pendant.jpg", title: "Proportion at the collarbone", href: "/products/heart-halo-pendant" };
    return { image: "/images/hero/campaign-02.webp", title: "Jewelry made to meet the person", href: "/collections" };
  }, [activeCategory, filtered]);

  return (
    <div className={styles.galleryWrap}>
      <div className={styles.filterStack}>
        {/* 1 · Type */}
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Shop</span>
          <div className={styles.chips}>
            <FilterChip on={!activeType} onClick={() => setFilter({ type: null, category: null })}>All</FilterChip>
            {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((type) => (
              <FilterChip key={type} on={activeType === type} onClick={() => setFilter({ type, category: null })}>
                {PRODUCT_TYPE_LABELS[type]}
              </FilterChip>
            ))}
            <Link href="/diamonds" className={styles.chipLink}>Loose Diamonds ↗</Link>
          </div>
        </div>

        {/* 2 · World */}
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>World</span>
          <div className={styles.chips}>
            <FilterChip on={!activeWorld} onClick={() => setFilter({ world: null, category: null })}>All worlds</FilterChip>
            {DIAMOND_WORLDS.map((world) => (
              <FilterChip key={world} on={activeWorld === world} onClick={() => setFilter({ world, category: null })}>
                {DIAMOND_WORLD_LABELS[world]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* 3 · Category */}
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Type</span>
          <div className={styles.chips}>
            <FilterChip on={activeCategory === "All"} onClick={() => setFilter({ category: null })}>
              All<span>{afterWorld.length}</span>
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} on={activeCategory === c} onClick={() => setFilter({ category: c })}>
                {CATEGORY_LABELS[c] ?? c}
                <span>{afterWorld.filter((p) => p.category === c).length}</span>
              </FilterChip>
            ))}
          </div>
        </div>

        <div className={styles.filterMeta}>
          <p className={styles.count}>
            {filtered.length} {filtered.length === 1 ? "design" : "designs"} · sorted by carat, low to high
          </p>
          {items.some((p) => p.comingSoon) ? (
            <div className={styles.catalogMode} aria-label="Catalog visibility">
              <button type="button" className={!showFullCatalog ? styles.modeActive : ""} onClick={() => setShowFullCatalog(false)}>
                Photographed <span>{items.filter((p) => !p.comingSoon).length}</span>
              </button>
              <button type="button" className={showFullCatalog ? styles.modeActive : ""} onClick={() => setShowFullCatalog(true)}>
                Full catalog <span>{items.length}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.emptyState}>No pieces in this combination yet. Try another world or type, or <Link href="/custom">commission one</Link>.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p, index) => (
            <Fragment key={p.id}>
              <CollectionTile product={p} onExpand={() => setExpanded(p)} />
              {index === 4 && filtered.length > 6 ? (
                <Link href={editorial.href} className={styles.editorialTile}>
                  <Image src={editorial.image} alt={editorial.title} fill sizes="(max-width:1024px) 100vw, 66vw" />
                  <div><span>Jewel Stone, worn</span><strong>{editorial.title}</strong><em>Discover the study ↗</em></div>
                </Link>
              ) : null}
            </Fragment>
          ))}
        </div>
      )}

      <PieceQuickView product={expanded} onClose={() => setExpanded(null)} />
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`${styles.chip} ${on ? styles.chipActive : ""}`} onClick={onClick} aria-pressed={on}>
      {children}
    </button>
  );
}
