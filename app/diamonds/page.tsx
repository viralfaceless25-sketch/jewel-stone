import type { Metadata } from "next";
import Link from "next/link";
import { DiamondsExplorer } from "@/components/diamonds/DiamondsExplorer";
import { products } from "@/data/products";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Diamonds — Explore by Shape & the 4 Cs",
  description:
    "Explore diamonds by shape and learn the 4 Cs with Jewel Stone. GIA & IGI certified natural and lab-grown stones, sourced in NYC's Diamond District.",
  alternates: { canonical: "/diamonds" },
};

const pieces = products.filter((p) => p.source === "signature");

export default function DiamondsPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> The stone comes first</p>
        <h1 className={pages.h1}>Find your <em>diamond.</em></h1>
        <p className={pages.lede}>
          Every Jewel Stone piece begins with a hand-selected stone — GIA &amp; IGI
          certified, natural or lab-grown. Choose a shape, learn the 4 Cs, and we&apos;ll
          match it to a setting or source it for you.
        </p>
      </section>

      <DiamondsExplorer pieces={pieces} />

      <section className={pages.cta}>
        <h2 className={pages.h2}>Can&apos;t find your stone?</h2>
        <p className={pages.lede}>
          We hold access to 160,000+ certified diamonds. Tell us shape, budget, and
          timeline — we&apos;ll bring options to your private viewing.
        </p>
        <div className={`${pages.actions} ${pages.centerActions}`}>
          <Link href="/contact" className={pages.btnPrimary}>Book a diamond viewing</Link>
          <Link href="/custom" className={pages.btnGhost}>Start a custom design</Link>
        </div>
      </section>
    </main>
  );
}
