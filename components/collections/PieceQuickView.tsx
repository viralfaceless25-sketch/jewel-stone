"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLOR_CLARITY_LABEL, type Product } from "@/data/products";
import { modelFor } from "@/lib/models";
import { PieceViewer } from "@/components/ar/PieceViewer";
import styles from "./collections.module.css";

/**
 * The expanded product card: full gallery with prev/next, plus a 3D · AR toggle
 * on pieces we have a scan for. The model is only mounted once requested, so
 * opening the panel never pulls a multi-MB .glb.
 */
export function PieceQuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [showModel, setShowModel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const priorFocus = useRef<HTMLElement | null>(null);

  const shots = useMemo(
    () => (product ? [product.image, ...(product.gallery ?? [])].filter(Boolean) : []),
    [product],
  );
  const model = product ? modelFor(product.slug) : undefined;

  useEffect(() => {
    setI(0);
    setShowModel(false);
  }, [product?.slug]);

  const step = useCallback(
    (d: number) => {
      setShowModel(false);
      setI((v) => (shots.length ? (v + d + shots.length) % shots.length : 0));
    },
    [shots.length],
  );

  useEffect(() => {
    if (!product) return;
    priorFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      priorFocus.current?.focus();
    };
  }, [product, onClose, step]);

  if (!product) return null;

  return (
    <div className={styles.qvBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} className={styles.qvPanel} role="dialog" aria-modal="true" aria-labelledby={`quick-view-${product.slug}`}>
        <button ref={closeRef} type="button" className={styles.qvClose} onClick={onClose} aria-label="Close">×</button>

        <div className={styles.qvStage}>
          {showModel && model ? (
            <PieceViewer src={model} alt={product.name} poster={product.image} className={styles.qvViewer} />
          ) : (
            <Image
              src={shots[i]}
              alt={product.name}
              fill
              sizes="(max-width: 900px) 92vw, 46vw"
              className={styles.qvImg}
            />
          )}

          {!showModel && shots.length > 1 ? (
            <>
              <button type="button" className={`${styles.qvNav} ${styles.qvPrev}`} onClick={() => step(-1)} aria-label="Previous image">‹</button>
              <button type="button" className={`${styles.qvNav} ${styles.qvNext}`} onClick={() => step(1)} aria-label="Next image">›</button>
              <span className={styles.qvCount}>{i + 1} / {shots.length}</span>
            </>
          ) : null}

          {model ? (
            <button
              type="button"
              className={styles.qvArBtn}
              onClick={() => setShowModel((v) => !v)}
              aria-pressed={showModel}
            >
              {showModel ? "Photos" : "3D · AR try-on"}
            </button>
          ) : null}
        </div>

        <div className={styles.qvInfo}>
          <p className={styles.qvEyebrow}>{product.category}</p>
          <h2 id={`quick-view-${product.slug}`}>{product.name}</h2>
          <p className={styles.qvDesc}>{product.description}</p>
          <dl className={styles.qvSpecs}>
            <div><dt>Material</dt><dd>{product.material}</dd></div>
            <div><dt>Diamond</dt><dd>{product.centerStone} · {product.carats} ct</dd></div>
            <div><dt>Colour / clarity</dt><dd>{COLOR_CLARITY_LABEL}</dd></div>
          </dl>
          <div className={styles.qvActions}>
            <Link href={`/products/${product.slug}`} className={styles.qvPrimary}>View full details</Link>
            <Link href="/contact" className={styles.qvSecondary}>Enquire</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
