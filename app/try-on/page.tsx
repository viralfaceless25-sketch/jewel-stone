import type { Metadata } from "next";
import Link from "next/link";
import { TryOn } from "@/components/ar/TryOn";
import styles from "@/components/ar/try-on-page.module.css";

export const metadata: Metadata = {
  title: "Virtual Try-On",
  description:
    "Try Jewel Stone PIECUT pieces on your own hand, ears, and neckline with your camera — a live virtual try-on.",
  alternates: { canonical: "/try-on" },
  robots: { index: false, follow: true },
};

const TIPS = [
  { for: "Rings & bracelets (rear camera)", items: ["Hold your hand still, palm or back facing the lens.", "Spread your fingers slightly so the ring finger is clear.", "Keep your hand 20–30 cm from the camera in good light."] },
  { for: "Earrings, pendants & necklaces (front camera)", items: ["Face the camera straight on, hair tucked behind your ears.", "Stay in even, bright light — avoid strong backlight.", "Hold steady for a second so tracking can lock on."] },
];

export default function TryOnPage({ searchParams }: { searchParams?: { piece?: string } }) {
  return (
    <main className={styles.page}>
      <section className={styles.head}>
        <p className={styles.kicker}>Virtual try-on · beta</p>
        <h1>See it on you.</h1>
        <p className={styles.lede}>
          Pick a piece, allow the camera, and Jewel Stone places it live on your hand, ears,
          or neckline. Best on a phone in good light. Nothing is recorded — the camera stays
          on your device.
        </p>
      </section>

      <section className={styles.tips} aria-label="How to get the best result">
        {TIPS.map((t) => (
          <div key={t.for} className={styles.tipCard}>
            <h2>{t.for}</h2>
            <ul>{t.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </section>

      <TryOn initialSlug={searchParams?.piece} />

      <section className={styles.foot}>
        <p>Only pieces we have a 3D scan for can be tried on. Don&apos;t see the one you want?</p>
        <Link href="/contact" className={styles.footLink}>Ask us to add it</Link>
      </section>
    </main>
  );
}
