"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { CollectionTile } from "./CollectionTile";
import { PieceQuickView } from "./PieceQuickView";
import styles from "./collections.module.css";

export function CollectionGallery({ items }: { items: Product[] }) {
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const photographed = useMemo(() => items.filter((p) => !p.comingSoon), [items]);
  const visibleItems = showFullCatalog ? items : photographed;
  const categories = useMemo(() => {
    const set = new Set(visibleItems.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [visibleItems]);
  const [active, setActive] = useState("All");
  const [expanded, setExpanded] = useState<Product | null>(null);

  const filtered = active === "All" ? visibleItems : visibleItems.filter((p) => p.category === active);
  const editorial = useMemo(() => {
    const category = active === "All" ? visibleItems[0]?.category : active;
    if (category === "Rings") return { image: "/images/products/fr4-emerald-hidden-halo-ring/model.webp", title: "Scale, seen on the hand", href: "/products/fr4-emerald-hidden-halo-ring" };
    if (category === "Necklaces") return { image: "/images/products/fn2-graduated-diamond-necklace/model.webp", title: "Fifteen carats in crescendo", href: "/products/fn2-graduated-diamond-necklace" };
    if (category === "Bracelets") return { image: "/images/products/tb12-12ct-tennis-bracelet/model.webp", title: "A line of light around the wrist", href: "/products/tb12-12ct-tennis-bracelet" };
    if (category === "Earrings") return { image: "/images/lifestyle/model-asscher-editorial.jpg", title: "Movement changes the piece", href: "/products/asscher-halo-drop-earrings" };
    if (category === "Pendants") return { image: "/images/lifestyle/model-heart-halo-pendant.jpg", title: "Proportion at the collarbone", href: "/products/heart-halo-pendant" };
    return { image: "/images/hero/campaign-02.webp", title: "Jewelry made to meet the person", href: "/collections" };
  }, [active, visibleItems]);

  return (
    <div className={styles.galleryWrap}>
      <div className={styles.filters}>
        <div className={styles.chips}>
          {categories.map((c) => (
            <button
              key={c}
              className={`${styles.chip} ${active === c ? styles.chipActive : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
              <span>
                {c === "All" ? visibleItems.length : visibleItems.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <p className={styles.count}>
          {filtered.length} {filtered.length === 1 ? "design" : "designs"} · signature + made to order
        </p>
        {items.length > photographed.length ? (
          <div className={styles.catalogMode} aria-label="Catalog visibility">
            <button type="button" className={!showFullCatalog ? styles.modeActive : ""} onClick={() => { setShowFullCatalog(false); setActive("All"); }}>
              Photographed <span>{photographed.length}</span>
            </button>
            <button type="button" className={showFullCatalog ? styles.modeActive : ""} onClick={() => { setShowFullCatalog(true); setActive("All"); }}>
              Full catalog <span>{items.length}</span>
            </button>
          </div>
        ) : null}
      </div>

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

      <PieceQuickView product={expanded} onClose={() => setExpanded(null)} />
    </div>
  );
}
