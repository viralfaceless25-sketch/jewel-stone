"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { hasModel } from "@/lib/models";
import styles from "./collections.module.css";

const SLIDE_MS = 2600;

/**
 * Auto-advances the tile's hero image through the piece's studio shots. Runs
 * only while the tile is on screen, and never under prefers-reduced-motion.
 */
function useSlideshow(count: number, hostRef: React.RefObject<HTMLElement>) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer ??= setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.2 });
    io.observe(host);
    return () => { io.disconnect(); stop(); };
  }, [count, hostRef]);

  return index;
}

export function CollectionTile({ product, onExpand }: { product: Product; onExpand: () => void }) {
  // Studio shots only. The on-body `model.jpg` sits on ivory silk and would
  // break the uniform black background across the grid; it stays on the
  // product page and in the expanded view.
  const slides = useMemo(
    () =>
      [product.image, ...(product.gallery ?? [])]
        .filter(Boolean)
        .filter((s) => !s.endsWith("/model.jpg"))
        .slice(0, 5),
    [product],
  );

  const frameRef = useRef<HTMLDivElement>(null);
  const slide = useSlideshow(slides.length, frameRef);

  return (
    <div className={styles.tile}>
      <Link href={`/products/${product.slug}`} className={styles.tileLink} aria-label={product.name}>
        <div className={styles.tileFrame} ref={frameRef}>
          {slides.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={i === 0 ? product.name : ""}
              aria-hidden={i === 0 ? undefined : true}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
              className={`${styles.tileImg} ${i === slide ? styles.slideOn : styles.slideOff}`}
            />
          ))}
          {product.comingSoon ? <span className={styles.badge}>Private catalog</span> : hasModel(product.slug) ? <span className={styles.badge}>3D · AR</span> : null}
          {slides.length > 1 ? (
            <span className={styles.dots} aria-hidden="true">
              {slides.map((s, i) => (
                <i key={s} className={i === slide ? styles.dotOn : undefined} />
              ))}
            </span>
          ) : null}
        </div>
      </Link>

      <div className={styles.meta}>
        <div>
          <h3>{product.name}</h3>
          <p>{product.material} · {product.carats} ct</p>
        </div>
        <button
          type="button"
          className={styles.expandBtn}
          onClick={onExpand}
          aria-label={`Expand ${product.name}`}
        >
          Expand
        </button>
      </div>
    </div>
  );
}
