import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionGallery } from "@/components/collections/CollectionGallery";
import { getProductsByCategory, products } from "@/data/products";
import type { ProductCategory } from "@/data/products";
import pages from "@/components/pages/pages.module.css";

const SLUG_TO_CATEGORY: Record<string, ProductCategory> = {
  rings: "Rings",
  "engagement-rings": "Rings",
  "wedding-bands": "Rings",
  earrings: "Earrings",
  bracelets: "Bracelets",
  necklaces: "Necklaces",
  pendants: "Pendants",
  "custom-jewelry": "Custom Jewelry",
};

const COPY: Record<string, { eyebrow: string; title: string; sub: string }> = {
  "engagement-rings": { eyebrow: "Engagement", title: "Rings she'll say yes to.", sub: "One-of-a-kind halo and cluster rings in hand now — GIA & IGI certified, finished in your metal." },
  "wedding-bands": { eyebrow: "Wedding", title: "Bands that last forever.", sub: "Eternity, pavé and classic bands, made to order in the Diamond District." },
  rings: { eyebrow: "Rings", title: "Diamond rings.", sub: "One-of-a-kind pieces in hand, plus made-to-order settings." },
  earrings: { eyebrow: "Earrings", title: "Studs & drops.", sub: "Halo drops and clusters in hand now, plus made-to-order studs." },
  bracelets: { eyebrow: "Bracelets", title: "Tennis bracelets.", sub: "Continuous diamond lines from 2ct to 30ct, made to order." },
  necklaces: { eyebrow: "Necklaces", title: "Necklaces with presence.", sub: "Tennis and fancy diamond necklaces from 5ct to 30ct, made to order." },
  pendants: { eyebrow: "Pendants", title: "Every shape, every occasion.", sub: "One-of-a-kind halo pendants in hand now, plus made-to-order styles." },
  "custom-jewelry": { eyebrow: "Custom", title: "Your vision, our craft.", sub: "From a loose stone up — designed with you in five steps." },
};

const TABS = [
  { slug: "engagement-rings", label: "Engagement" },
  { slug: "earrings", label: "Earrings" },
  { slug: "pendants", label: "Pendants" },
  { slug: "wedding-bands", label: "Wedding" },
  { slug: "bracelets", label: "Bracelets" },
  { slug: "necklaces", label: "Necklaces" },
];

export function generateStaticParams() {
  return Object.keys(SLUG_TO_CATEGORY).map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const c = COPY[params.category];
  if (!c) return {};
  return {
    title: `${c.eyebrow} — Jewel Stone`,
    description: c.sub,
    alternates: { canonical: `/collections/${params.category}` },
  };
}

export default function CollectionCategoryPage({ params }: { params: { category: string } }) {
  const category = SLUG_TO_CATEGORY[params.category];
  const copy = COPY[params.category];
  if (!category || !copy) notFound();

  // The whole catalogue, not just the signature vitrine: the made-to-order
  // lab-grown pieces have product pages, and this is the only place that links
  // to them. One-of-a-kind pieces lead, then the made-to-order range.
  const items = getProductsByCategory(category).sort(
    (a, b) => Number(b.source === "signature") - Number(a.source === "signature"),
  );

  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> {copy.eyebrow}</p>
        <h1 className={pages.h1}>{copy.title}</h1>
        <p className={pages.lede}>{copy.sub}</p>
        <nav className={pages.actions} style={{ justifyContent: "center", marginTop: "1.6rem" }} aria-label="Browse categories">
          {TABS.map((t) => (
            <Link
              key={t.slug}
              href={`/collections/${t.slug}`}
              className={t.slug === params.category ? pages.btnPrimary : pages.btnGhost}
              style={{ padding: "0.6rem 1.1rem", fontSize: "0.82rem" }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </section>

      {items.length ? (
        <section aria-labelledby="category-pieces-title">
          <h2 id="category-pieces-title" className="sr-only">{copy.eyebrow} pieces</h2>
          <CollectionGallery items={items} />
        </section>
      ) : (
        <section className={pages.cta}>
          <h2 className={pages.h2}>Made to order.</h2>
          <p className={pages.lede}>
            We don&apos;t keep {copy.eyebrow.toLowerCase()} on the shelf — each is crafted to
            order from a loose stone up. Tell us what you have in mind and we&apos;ll
            bring options to your viewing.
          </p>
          <div className={`${pages.actions} ${pages.centerActions}`}>
            <Link href="/custom" className={pages.btnPrimary}>Start a custom {copy.eyebrow.toLowerCase()} piece</Link>
            <Link href="/collections" className={pages.btnGhost}>See what&apos;s in hand</Link>
          </div>
        </section>
      )}
    </main>
  );
}
