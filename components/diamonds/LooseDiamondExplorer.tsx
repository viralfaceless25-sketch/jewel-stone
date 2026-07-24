"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LOOSE_CARAT_RANGES,
  LOOSE_DIAMOND_SHAPES,
  looseDiamonds,
  retailPrice,
  type LooseCaratKey,
  type LooseDiamond,
} from "@/lib/commerce/loose-diamonds";
import styles from "./loose-diamonds.module.css";

const PAGE = 24;
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
type Sort = "carat-asc" | "carat-desc" | "price-asc" | "price-desc";

export function LooseDiamondExplorer() {
  const [certified, setCertified] = useState(true);
  const [shape, setShape] = useState("");
  const [carat, setCarat] = useState<LooseCaratKey | "">("");
  const [sort, setSort] = useState<Sort>("carat-desc");
  const [limit, setLimit] = useState(PAGE);

  const pool = useMemo(() => looseDiamonds.filter((d) => d.certified === certified), [certified]);

  const filtered = useMemo(() => {
    const range = LOOSE_CARAT_RANGES.find((r) => r.key === carat);
    const list = pool.filter(
      (d) =>
        (!shape || d.shape === shape) &&
        (!range || (d.carat >= range.min && d.carat < range.max)),
    );
    const cmp: Record<Sort, (a: LooseDiamond, b: LooseDiamond) => number> = {
      "carat-asc": (a, b) => a.carat - b.carat,
      "carat-desc": (a, b) => b.carat - a.carat,
      "price-asc": (a, b) => retailPrice(a) - retailPrice(b),
      "price-desc": (a, b) => retailPrice(b) - retailPrice(a),
    };
    return [...list].sort(cmp[sort]);
  }, [pool, shape, carat, sort]);

  const shapesForPool = useMemo(() => {
    const present = new Set(pool.map((d) => d.shape));
    return LOOSE_DIAMOND_SHAPES.filter((s) => present.has(s));
  }, [pool]);

  const reset = (patch: () => void) => { patch(); setLimit(PAGE); };

  return (
    <div className={styles.explorer}>
      <div className={styles.tabs} role="tablist" aria-label="Diamond certification">
        <button role="tab" aria-selected={certified} className={certified ? styles.tabOn : styles.tab} onClick={() => reset(() => setCertified(true))}>
          Certified
          <span>IGI graded · {looseDiamonds.filter((d) => d.certified).length}</span>
        </button>
        <button role="tab" aria-selected={!certified} className={!certified ? styles.tabOn : styles.tab} onClick={() => reset(() => setCertified(false))}>
          Non-certified
          <span>Ungraded value · {looseDiamonds.filter((d) => !d.certified).length}</span>
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.chipGroup}>
          <span className={styles.groupLabel}>Shape</span>
          <button className={!shape ? styles.chipOn : styles.chip} onClick={() => reset(() => setShape(""))}>All</button>
          {shapesForPool.map((s) => (
            <button key={s} className={shape === s ? styles.chipOn : styles.chip} onClick={() => reset(() => setShape(s))}>{s}</button>
          ))}
        </div>
        <div className={styles.chipGroup}>
          <span className={styles.groupLabel}>Carat</span>
          <button className={!carat ? styles.chipOn : styles.chip} onClick={() => reset(() => setCarat(""))}>Any</button>
          {LOOSE_CARAT_RANGES.map((r) => (
            <button key={r.key} className={carat === r.key ? styles.chipOn : styles.chip} onClick={() => reset(() => setCarat(r.key))}>{r.label}</button>
          ))}
        </div>
        <label className={styles.sort}>
          <span>Sort</span>
          <select value={sort} onChange={(e) => reset(() => setSort(e.target.value as Sort))}>
            <option value="carat-desc">Carat, high to low</option>
            <option value="carat-asc">Carat, low to high</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </label>
      </div>

      <p className={styles.count}>{filtered.length.toLocaleString("en-US")} stones available</p>

      <div className={styles.tableHead} aria-hidden="true">
        <span>Shape</span><span>Carat</span><span>Colour</span><span>Clarity</span><span>Cut</span><span>Report</span><span>Price</span><span />
      </div>
      <ul className={styles.list}>
        {filtered.slice(0, limit).map((d) => (
          <li key={d.id} className={styles.row}>
            <span className={styles.cShape} data-label="Shape">{d.shape}</span>
            <span data-label="Carat"><strong>{d.carat.toFixed(2)}</strong> ct</span>
            <span data-label="Colour">{d.color}</span>
            <span data-label="Clarity">{d.clarity}</span>
            <span data-label="Cut">{d.cut || "—"}</span>
            <span data-label="Report">{d.certified ? "IGI certified" : "Ungraded"}</span>
            <span className={styles.cPrice} data-label="Price">{usd(retailPrice(d))}</span>
            <Link className={styles.enquire} href={`/contact?stone=${encodeURIComponent(`${d.shape} ${d.carat}ct ${d.color}/${d.clarity} (${d.certified ? "IGI certified" : "ungraded"})`)}`}>
              Enquire
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No stones match. Try another shape or carat, or <Link href="/contact">tell us what you want</Link>.</p>
      ) : limit < filtered.length ? (
        <button className={styles.loadMore} onClick={() => setLimit((l) => l + PAGE)}>
          Show more stones <span>({filtered.length - limit} left)</span>
        </button>
      ) : null}
    </div>
  );
}
