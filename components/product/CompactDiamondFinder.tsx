"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DIAMOND_ORIGINS,
  DIAMOND_SHAPES,
  EMPTY_DIAMOND_FILTERS,
  diamondSearchHref,
  type DiamondFilters,
} from "@/lib/commerce/diamond-filters";
import styles from "./product.module.css";

const CARAT_OPTIONS: { value: DiamondFilters["carat"]; label: string }[] = [
  { value: "", label: "Any" },
  { value: "under-1", label: "Under 1" },
  { value: "1-2", label: "1–2" },
  { value: "2-3", label: "2–3" },
  { value: "3-5", label: "3–5" },
  { value: "5-plus", label: "5+" },
];

export function CompactDiamondFinder() {
  const router = useRouter();
  const [filters, setFilters] = useState<DiamondFilters>(EMPTY_DIAMOND_FILTERS);

  return (
    <form
      className={styles.diamondFinder}
      onSubmit={(event) => {
        event.preventDefault();
        router.push(diamondSearchHref(filters));
      }}
    >
      <div className={styles.finderHeading}>
        <span>Diamond concierge</span>
        <strong>Find your diamond</strong>
      </div>
      <label className={styles.finderField}>
        <span>Shape</span>
        <select
          value={filters.shape}
          onChange={(event) => setFilters({ ...filters, shape: event.target.value as DiamondFilters["shape"] })}
        >
          <option value="">Any</option>
          {DIAMOND_SHAPES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className={styles.finderField}>
        <span>Origin</span>
        <select
          value={filters.origin}
          onChange={(event) => setFilters({ ...filters, origin: event.target.value as DiamondFilters["origin"] })}
        >
          <option value="">Any</option>
          {DIAMOND_ORIGINS.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className={styles.finderField}>
        <span>Carat</span>
        <select
          value={filters.carat}
          onChange={(event) => setFilters({ ...filters, carat: event.target.value as DiamondFilters["carat"] })}
        >
          {CARAT_OPTIONS.map((option) => <option key={option.value || "any"} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <button className={styles.finderSubmit} type="submit">
        Find diamonds
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
