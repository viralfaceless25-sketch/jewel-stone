import type { Metadata } from "next";
import Link from "next/link";
import { LooseDiamondExplorer } from "@/components/diamonds/LooseDiamondExplorer";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Loose Diamonds — Certified & Value Stones",
  description:
    "Browse loose diamonds from the Jewel Stone inventory — IGI-certified and ungraded value stones across every shape and carat, ready to set into any piece.",
  alternates: { canonical: "/diamonds" },
};

const FOUR_CS = [
  { title: "Cut", body: "The most important C — it governs how light returns to the eye. We favour Excellent and Ideal cuts; a well-cut stone outshines a larger, duller one." },
  { title: "Colour", body: "Graded D (colourless) to Z. Bright, white stones in the D–H range read cleanest; set in the right metal, even faint warmth flatters." },
  { title: "Clarity", body: "From FL/IF through VVS, VS, SI. We select eye-clean stones so inclusions never interrupt the sparkle." },
  { title: "Carat", body: "Weight, not size. Two stones of equal carat can look very different by cut and shape — we balance presence, proportion, and budget." },
];

export default function DiamondsPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> The stone comes first</p>
        <h1 className={pages.h1}>Loose <em>diamonds.</em></h1>
        <p className={pages.lede}>
          Browse the Jewel Stone loose-diamond inventory — IGI-certified stones and
          ungraded value stones across every shape and carat. Choose one, and we set it
          into any Jewel Stone design or a piece made just for it.
        </p>
      </section>

      <LooseDiamondExplorer />

      <section className={pages.section}>
        <div className={pages.wrap}>
          <p className={pages.eyebrow}><span /> Certified vs. non-certified</p>
          <h2 className={pages.h2}>Two ways to buy a stone.</h2>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            <div className={pages.card}>
              <div className={pages.num}>01</div>
              <h3 className={pages.h3}>Certified</h3>
              <p className={pages.p} style={{ margin: 0 }}>Every certified stone carries an independent IGI report documenting its exact cut, colour, clarity, and carat — full confidence, in writing.</p>
            </div>
            <div className={pages.card}>
              <div className={pages.num}>02</div>
              <h3 className={pages.h3}>Non-certified</h3>
              <p className={pages.p} style={{ margin: 0 }}>Ungraded stones offer the same quality at better value. We grade them in person at your viewing so you see exactly what you are buying.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={pages.section}>
        <div className={pages.wrap}>
          <p className={pages.eyebrow}><span /> The 4 Cs</p>
          <h2 className={pages.h2}>What actually sets a diamond apart.</h2>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            {FOUR_CS.map((c) => (
              <div key={c.title} className={pages.card}>
                <h3 className={pages.h3}>{c.title}</h3>
                <p className={pages.p} style={{ margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={pages.cta}>
        <h2 className={pages.h2}>Can&apos;t find your stone?</h2>
        <p className={pages.lede}>
          Tell us shape, budget, and timeline. We&apos;ll compare certified and value
          options from our full inventory, then bring a focused selection to your private viewing.
        </p>
        <div className={`${pages.actions} ${pages.centerActions}`}>
          <Link href="/appointment" className={pages.btnPrimary}>Book a diamond viewing</Link>
          <Link href="/custom" className={pages.btnGhost}>Start a custom design</Link>
        </div>
      </section>
    </main>
  );
}
