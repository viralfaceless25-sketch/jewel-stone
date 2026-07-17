"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { hasModel } from "@/lib/models";
import styles from "./vitrine.module.css";

export function CollectionDeck({ items }: { items: Product[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const nudge = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };

  // pointer drag
  const onDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };
  const onUp = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (el) el.releasePointerCapture(e.pointerId);
    drag.current.down = false;
  };
  const guardClick = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  return (
    <div className={styles.deckWrap}>
      <div
        ref={trackRef}
        className={styles.deck}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {items.map((p, i) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className={styles.slide}
            onClick={guardClick}
            draggable={false}
          >
            <div className={styles.slideFrame}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 82vw, 40vw"
                className={styles.slideImg}
                draggable={false}
              />
              {hasModel(p.slug) ? <span className={styles.slideBadge}>3D · AR</span> : null}
              <span className={styles.slideNo}>{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>
            <div className={styles.slideMeta}>
              <div>
                <h3>{p.name}</h3>
                <p>{p.material} · {p.carats} ct</p>
              </div>
              <strong>View</strong>
            </div>
          </Link>
        ))}

        <Link href="/collections" className={`${styles.slide} ${styles.slideMore}`} onClick={guardClick}>
          <div className={styles.slideMoreInner}>
            <span>Enter the<br />full vitrine</span>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
      </div>

      <div className={styles.deckControls}>
        <div className={styles.deckProgress}>
          <span style={{ transform: `scaleX(${0.12 + progress * 0.88})` }} />
        </div>
        <div className={styles.deckArrows}>
          <button onClick={() => nudge(-1)} aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={() => nudge(1)} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
