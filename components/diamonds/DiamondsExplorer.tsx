"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProductDiamondMetadata, type Product } from "@/data/products";
import { hasModel } from "@/lib/models";
import {
  CARAT_RANGES,
  DIAMOND_ORIGINS,
  DIAMOND_SHAPES,
  diamondSearchHref,
  matchesDiamondFilters,
  normalizeDiamondFilters,
  type DiamondFilters,
} from "@/lib/commerce/diamond-filters";
import styles from "./diamonds.module.css";

const CARAT_LABELS: Record<(typeof CARAT_RANGES)[number], string> = {
  "under-1": "Under 1 ct",
  "1-2": "1–2 ct",
  "2-3": "2–3 ct",
  "3-5": "3–5 ct",
  "5-plus": "5+ ct",
};

const FOUR_CS = [
  { key: "Cut", title: "Cut", body: "The most important C. Cut governs how light returns to the eye — the fire and brilliance. We favour Excellent and Ideal cuts; a well-cut stone outshines a larger, duller one." },
  { key: "Colour", title: "Colour", body: "Graded D (colourless) to Z. Our signature pieces sit in the EF–GH range — bright and white to the eye, set in metals chosen to flatter the stone." },
  { key: "Clarity", title: "Clarity", body: "From FL/IF (flawless) through VVS, VS, SI. We select eye-clean stones; most of our pieces are VVS–VS, so inclusions never interrupt the sparkle." },
  { key: "Carat", title: "Carat", body: "Weight, not size. Two stones of equal carat can look very different depending on cut and shape — we help you balance presence, proportion, and budget." },
];

export function DiamondsExplorer({ pieces }: { pieces: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [filters, setFilters] = useState<DiamondFilters>(() =>
    normalizeDiamondFilters(new URLSearchParams(searchKey)),
  );
  const [c, setC] = useState("Cut");
  const hasFilters = Boolean(filters.shape || filters.origin || filters.carat);

  useEffect(() => {
    setFilters(normalizeDiamondFilters(new URLSearchParams(searchKey)));
  }, [searchKey]);

  const updateFilters = (next: DiamondFilters) => {
    setFilters(next);
    router.replace(diamondSearchHref(next), { scroll: false });
  };

  const shapesWithStock = useMemo(() => {
    const set = new Set<string>();
    for (const shape of DIAMOND_SHAPES) {
      if (pieces.some((piece) => matchesDiamondFilters({
        shape: getProductDiamondMetadata(piece).shape,
        origin: getProductDiamondMetadata(piece).origin,
        carats: piece.carats,
      }, { shape, origin: "", carat: "" }))) set.add(shape);
    }
    return set;
  }, [pieces]);

  const matches = hasFilters
    ? pieces.filter((piece) => {
        const metadata = getProductDiamondMetadata(piece);
        return matchesDiamondFilters({
          shape: metadata.shape,
          origin: metadata.origin,
          carats: piece.carats,
        }, filters);
      })
    : [];
  const filterSummary = [
    filters.shape,
    filters.origin,
    filters.carat ? CARAT_LABELS[filters.carat] : "",
  ].filter(Boolean).join(" · ");
  const inquiryQuery = new URLSearchParams();
  if (filters.shape) inquiryQuery.set("shape", filters.shape);
  if (filters.origin) inquiryQuery.set("origin", filters.origin);
  if (filters.carat) inquiryQuery.set("carat", filters.carat);
  const inquiryHref = `/custom?${inquiryQuery.toString()}`;

  return (
    <div>
      {/* Shape selector */}
      <section className={styles.shapes}>
        <p className={styles.kick}>Start with a shape</p>
        <div className={styles.shapeGrid}>
          {DIAMOND_SHAPES.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.shape} ${filters.shape === s ? styles.shapeActive : ""}`}
              onClick={() => updateFilters({ ...filters, shape: filters.shape === s ? "" : s })}
              aria-pressed={filters.shape === s}
            >
              <span className={`${styles.shapeIcon} ${styles["s" + s]}`} aria-hidden />
              {s}
              {shapesWithStock.has(s) ? <i className={styles.dot} title="In stock" /> : null}
            </button>
          ))}
        </div>

        <div className={styles.filterBar}>
          <label>
            <span>Origin</span>
            <select
              value={filters.origin}
              onChange={(event) => updateFilters({ ...filters, origin: event.target.value as DiamondFilters["origin"] })}
            >
              <option value="">Any origin</option>
              {DIAMOND_ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
            </select>
          </label>
          <label>
            <span>Carat</span>
            <select
              value={filters.carat}
              onChange={(event) => updateFilters({ ...filters, carat: event.target.value as DiamondFilters["carat"] })}
            >
              <option value="">Any carat</option>
              {CARAT_RANGES.map((range) => <option key={range} value={range}>{CARAT_LABELS[range]}</option>)}
            </select>
          </label>
          {hasFilters ? (
            <button type="button" className={styles.clearFilters} onClick={() => updateFilters({ shape: "", origin: "", carat: "" })}>
              Clear filters
            </button>
          ) : null}
        </div>

        {hasFilters ? (
          <div className={styles.results} aria-live="polite">
            {matches.length ? (
              <>
                <p className={styles.resultsHead}>{matches.length} {filterSummary} {matches.length === 1 ? "piece" : "pieces"}</p>
                <div className={styles.tiles}>
                  {matches.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`} className={styles.tile}>
                      <div className={styles.tileFrame}>
                        <Image src={p.image} alt={p.name} fill sizes="240px" className={styles.tileImg} />
                        {hasModel(p.slug) ? <span className={styles.badge}>3D · AR</span> : null}
                      </div>
                      <div className={styles.tileMeta}><span>{p.name}</span><strong>View</strong></div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noMatch}>
                <p>No exact piece matches {filterSummary} right now. We can source a certified stone to order and build the setting around it.</p>
                <Link href={inquiryHref} className={styles.enquire}>Enquire with these preferences →</Link>
              </div>
            )}
          </div>
        ) : (
          <p className={styles.hint}>Choose a shape, origin, or carat range to see matching pieces—or source a stone to order.</p>
        )}
      </section>

      {/* 4Cs interactive */}
      <section className={styles.cs}>
        <div className={styles.csHead}>
          <p className={styles.kick}>The 4 Cs</p>
          <h2>How we choose a stone.</h2>
        </div>
        <div className={styles.csBody}>
          <div className={styles.csTabs}>
            {FOUR_CS.map((f) => (
              <button key={f.key} className={`${styles.csTab} ${c === f.key ? styles.csTabActive : ""}`} onClick={() => setC(f.key)}>
                {f.title}
              </button>
            ))}
          </div>
          <div className={styles.csPanel}>
            {FOUR_CS.filter((f) => f.key === c).map((f) => (
              <div key={f.key}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
