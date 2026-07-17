"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { hasModel } from "@/lib/models";
import styles from "./diamonds.module.css";

const SHAPES = [
  "Round", "Oval", "Cushion", "Emerald", "Pear", "Heart",
  "Radiant", "Marquise", "Princess", "Asscher",
];

const FOUR_CS = [
  { key: "Cut", title: "Cut", body: "The most important C. Cut governs how light returns to the eye — the fire and brilliance. We favour Excellent and Ideal cuts; a well-cut stone outshines a larger, duller one." },
  { key: "Colour", title: "Colour", body: "Graded D (colourless) to Z. Our signature pieces sit in the EF–GH range — bright and white to the eye, set in metals chosen to flatter the stone." },
  { key: "Clarity", title: "Clarity", body: "From FL/IF (flawless) through VVS, VS, SI. We select eye-clean stones; most of our pieces are VVS–VS, so inclusions never interrupt the sparkle." },
  { key: "Carat", title: "Carat", body: "Weight, not size. Two stones of equal carat can look very different depending on cut and shape — we help you balance presence, proportion, and budget." },
];

export function DiamondsExplorer({ pieces }: { pieces: Product[] }) {
  const [shape, setShape] = useState<string | null>(null);
  const [c, setC] = useState("Cut");

  const shapesWithStock = useMemo(() => {
    const set = new Set(pieces.map((p) => p.diamondShape).filter(Boolean) as string[]);
    return set;
  }, [pieces]);

  const matches = shape
    ? pieces.filter((p) => (p.diamondShape ?? p.centerStone?.split("-")[0]) === shape || p.centerStone?.toLowerCase().includes(shape.toLowerCase()))
    : [];

  return (
    <div>
      {/* Shape selector */}
      <section className={styles.shapes}>
        <p className={styles.kick}>Start with a shape</p>
        <div className={styles.shapeGrid}>
          {SHAPES.map((s) => (
            <button
              key={s}
              className={`${styles.shape} ${shape === s ? styles.shapeActive : ""}`}
              onClick={() => setShape(shape === s ? null : s)}
            >
              <span className={`${styles.shapeIcon} ${styles["s" + s]}`} aria-hidden />
              {s}
              {shapesWithStock.has(s) ? <i className={styles.dot} title="In stock" /> : null}
            </button>
          ))}
        </div>

        {shape ? (
          <div className={styles.results}>
            {matches.length ? (
              <>
                <p className={styles.resultsHead}>{matches.length} signature {shape} {matches.length === 1 ? "piece" : "pieces"}</p>
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
                <p>No {shape} piece in the signature vitrine right now — but we source {shape.toLowerCase()} stones to order, from 1ct to 20ct.</p>
                <Link href="/custom" className={styles.enquire}>Enquire about a {shape} stone →</Link>
              </div>
            )}
          </div>
        ) : (
          <p className={styles.hint}>Pick a shape to see matching one-of-a-kind pieces — or the option to source it.</p>
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
