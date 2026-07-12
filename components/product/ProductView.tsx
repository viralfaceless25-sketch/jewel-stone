"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { hasModel, modelFor } from "@/lib/models";
import { PieceViewer } from "@/components/ar/PieceViewer";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Reveal } from "@/components/home/vitrine/Reveal";
import styles from "./product.module.css";

const METALS: { key: string; label: string; swatch: string }[] = [
  { key: "yellow", label: "18K Yellow Gold", swatch: "linear-gradient(135deg,#e8c876,#b8892f)" },
  { key: "rose", label: "18K Rose Gold", swatch: "linear-gradient(135deg,#e8bfa8,#c17e63)" },
  { key: "white", label: "18K White Gold", swatch: "linear-gradient(135deg,#f3f2ee,#c7c2b8)" },
];

function nativeMetal(material: string): string {
  const m = material.toLowerCase();
  if (m.includes("rose")) return "rose";
  if (m.includes("yellow")) return "yellow";
  return "white";
}

const RING_SIZES = ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"];
const CHAIN_LENGTHS = ['16"', '18"', '20"'];

export function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const model = modelFor(product.slug);
  const gallery = useMemo(
    () => [product.image, ...(product.gallery ?? [])].filter(Boolean),
    [product],
  );
  const [activeImg, setActiveImg] = useState(0);
  const [metal, setMetal] = useState(() => nativeMetal(product.material));
  const isRing = product.category === "Rings";
  const isNeck = product.category === "Pendants" || product.category === "Necklaces";
  const [size, setSize] = useState<string>(isRing ? "6.5" : isNeck ? '18"' : "");
  const [added, setAdded] = useState(false);

  const add = useCartStore((s) => s.add);
  const wishItems = useWishlistStore((s) => s.items);
  const toggleWish = useWishlistStore((s) => s.toggleItem);
  const saved = wishItems.includes(product.id);
  const metalLabel = METALS.find((m) => m.key === metal)?.label ?? product.material;

  const onAdd = () => {
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      priceLabel: product.priceLabel,
      image: product.image,
      metal: metalLabel,
      size: size || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span>/</span>{" "}
        <Link href="/collections">Collections</Link> <span>/</span>{" "}
        <em>{product.name}</em>
      </nav>

      <section className={styles.top}>
        {/* Media */}
        <div className={styles.media}>
          <div className={styles.stage}>
            {model ? (
              <PieceViewer src={model} alt={product.name} poster={product.image} className={styles.viewer} />
            ) : (
              <Image
                src={gallery[activeImg]}
                alt={product.name}
                fill
                sizes="(max-width: 900px) 92vw, 52vw"
                className={styles.stageImg}
                priority
              />
            )}
            {model ? <span className={styles.arChip}>3D · tap “View in your space” on mobile</span> : null}
          </div>

          {!model && gallery.length > 1 ? (
            <div className={styles.thumbs}>
              {gallery.map((src, i) => (
                <button
                  key={src}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image src={src} alt="" fill sizes="80px" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className={styles.info}>
          <p className={styles.eyebrow}>
            <span /> {product.category} · One of one
          </p>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.priceRow}>
            <strong className={styles.price}>{product.priceLabel}</strong>
            <span className={styles.priceNote}>incl. certification · ships insured</span>
          </div>

          <ul className={styles.chips}>
            {product.diamondShape ? <li>{product.diamondShape} cut</li> : null}
            <li>{product.carats} ct total</li>
            {product.colorClarity ? <li>{product.colorClarity}</li> : null}
            {product.diamondOrigin ? <li>{product.diamondOrigin}</li> : null}
          </ul>

          <p className={styles.desc}>{product.description}</p>

          {/* Configurator */}
          <div className={styles.config}>
            <div className={styles.configRow}>
              <label>Metal — <em>{metalLabel}</em></label>
              <div className={styles.swatches}>
                {METALS.map((m) => (
                  <button
                    key={m.key}
                    className={`${styles.swatch} ${metal === m.key ? styles.swatchActive : ""}`}
                    style={{ background: m.swatch }}
                    onClick={() => setMetal(m.key)}
                    aria-label={m.label}
                    title={m.label}
                  />
                ))}
              </div>
            </div>

            {isRing ? (
              <div className={styles.configRow}>
                <label>Ring size — <em>US {size}</em></label>
                <div className={styles.sizes}>
                  {RING_SIZES.map((s) => (
                    <button
                      key={s}
                      className={`${styles.size} ${size === s ? styles.sizeActive : ""}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {isNeck ? (
              <div className={styles.configRow}>
                <label>Chain length — <em>{size}</em></label>
                <div className={styles.sizes}>
                  {CHAIN_LENGTHS.map((s) => (
                    <button
                      key={s}
                      className={`${styles.size} ${size === s ? styles.sizeActive : ""}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button className={styles.addBtn} onClick={onAdd}>
              {added ? "Added to bag ✓" : "Add to bag"}
            </button>
            <button
              className={styles.wishBtn}
              onClick={() => toggleWish(product.id)}
              aria-pressed={saved}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              title={saved ? "Saved" : "Save to wishlist"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <Link href="/contact" className={styles.viewingLink}>Prefer to see it first? Book a private viewing →</Link>

          <ul className={styles.assurance}>
            <li>◆ Made in-house · est. 1980</li>
            <li>◆ GIA / IGI certified</li>
            <li>◆ Insured FedEx shipping</li>
            <li>◆ Complimentary resizing &amp; lifetime care</li>
          </ul>
        </div>
      </section>

      {/* Specs */}
      <Reveal as="section" className={styles.specs}>
        <div data-reveal-item>
          <h2>The details</h2>
        </div>
        <dl className={styles.specGrid} data-reveal-item>
          <div><dt>Style</dt><dd>{product.style}</dd></div>
          <div><dt>Center</dt><dd>{product.centerStone}</dd></div>
          <div><dt>Material</dt><dd>{metalLabel}</dd></div>
          <div><dt>Total carats</dt><dd>{product.carats} ct</dd></div>
          <div><dt>Diamonds</dt><dd>{product.diamondPieces} stones</dd></div>
          <div><dt>Colour / clarity</dt><dd>{product.colorClarity}</dd></div>
          {product.diamondOrigin ? <div><dt>Origin</dt><dd>{product.diamondOrigin}</dd></div> : null}
          <div><dt>SKU</dt><dd>{product.sku}</dd></div>
          <div className={styles.specWide}><dt>Fit</dt><dd>{product.sizeInfo}</dd></div>
        </dl>
      </Reveal>

      {/* Related */}
      {related.length ? (
        <Reveal as="section" className={styles.related}>
          <div className={styles.relatedHead} data-reveal-item>
            <p className={styles.eyebrow}><span /> Continue the shortlist</p>
            <h2>You may also love</h2>
          </div>
          <div className={styles.relatedGrid}>
            {related.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className={styles.relCard} data-reveal-item>
                <div className={styles.relFrame}>
                  <Image src={p.image} alt={p.name} fill sizes="(max-width:900px) 46vw, 30vw" className={styles.relImg} />
                  {hasModel(p.slug) ? <span className={styles.relBadge}>3D · AR</span> : null}
                </div>
                <div className={styles.relMeta}>
                  <div><h3>{p.name}</h3><p>{p.material}</p></div>
                  <strong>{p.priceLabel}</strong>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      ) : null}
    </main>
  );
}
