import type { Metadata } from "next";
import Link from "next/link";
import { CollectionGallery } from "@/components/collections/CollectionGallery";
import { products } from "@/data/products";
import styles from "@/components/collections/collections.module.css";

export const metadata: Metadata = {
  title: "Collections — Jewel Stone",
  description:
    "Every Jewel Stone signature piece is one of one — PIECUT and antique diamond rings, earrings, and pendants, GIA & IGI certified and viewable in 3D and AR.",
  alternates: { canonical: "/collections" },
};

// Signature pieces lead, then the made-to-order lab-grown range — otherwise the
// lab-grown catalogue is unreachable except by direct URL.
const signature = [...products].sort(
  (a, b) => Number(b.source === "signature") - Number(a.source === "signature"),
);

const madeToOrder = [
  { title: "Tennis Bracelets", note: "2ct–30ct continuous diamond lines", href: "/custom" },
  { title: "Diamond Necklaces", note: "Tennis & fancy styles, 5ct–30ct", href: "/custom" },
  { title: "Wedding Bands", note: "Eternity, pavé & classic bands", href: "/custom" },
  { title: "Bespoke", note: "Your stone, your setting, your story", href: "/custom" },
];

export default function CollectionsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}><span /> The signature vitrine</p>
        <h1 className={styles.heroTitle}>
          Every piece,<br /><em>considered.</em>
        </h1>
        <p className={styles.heroSub}>
          Natural diamonds, rare PIECUT compositions, and lab-grown essentials —
          developed in-house with family knowledge carried since 1980. Explore
          signature pieces available as photographed alongside made-to-order designs,
          with studio views, film, 3D, and AR wherever media is complete.
        </p>
      </section>

      <CollectionGallery items={signature} />

      <section className={styles.mto}>
        <div className={styles.mtoInner}>
          <div className={styles.mtoHead}>
            <p>Made to order</p>
            <h2>Not on the shelf? We&apos;ll make it.</h2>
            <span>
              Beyond the signature vitrine, we craft bracelets, necklaces, bands, and
              fully bespoke pieces to order in-house — from a loose
              stone up.
            </span>
          </div>
          <div className={styles.mtoGrid}>
            {madeToOrder.map((m) => (
              <Link key={m.title} href={m.href} className={styles.mtoCard}>
                <div>
                  <h3>{m.title}</h3>
                  <p>{m.note}</p>
                </div>
                <em>Enquire →</em>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closer}>
        <h2>Find the one, or design it.</h2>
        <p>Book a private viewing in the Diamond District, or start a bespoke commission from a loose stone.</p>
        <div className={styles.closerActions}>
          <Link href="/contact" className={styles.btnPrimary}>Book a viewing</Link>
          <Link href="/diamonds" className={styles.btnGhost}>Search loose diamonds</Link>
        </div>
      </section>
    </main>
  );
}
