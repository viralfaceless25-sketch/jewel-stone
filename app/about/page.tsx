import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/site";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "About — The Maison on 47th Street",
  description:
    "Jewel Stone is a Diamond District maison led by Ishan Vaghani — one-of-a-kind PIECUT and antique diamond jewelry, hand-finished in New York.",
  alternates: { canonical: "/about" },
};

const values = [
  { num: "01", title: "One of one", body: "Every signature piece is made a single time. When it sells, it is gone — no reorders, no duplicates." },
  { num: "02", title: "Stone first", body: "We start from the diamond, hand-selected on 47th Street, GIA & IGI certified, then build the setting around it." },
  { num: "03", title: "Made to be worn", body: "Finished to order in rose, white, yellow gold or platinum, sized and insured — heirlooms, not display pieces." },
];

export default function AboutPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> The maison</p>
        <h1 className={pages.h1}>Quietly made,<br /><em>on 47th Street.</em></h1>
        <p className={pages.lede}>
          A family house on 47th Street since 1980 — now in its third generation.
          Everything is produced under one roof, and we make each piece once. What
          you turn on screen, in 3D and AR, is the exact piece that arrives at your door.
        </p>
      </section>

      <section className={pages.section}>
        <div className={`${pages.wrap} ${pages.split}`}>
          <div className={pages.mediaFrame}>
            <Image src="/images/products/emerald-halo-engagement-ring/cover.jpg" alt="A Jewel Stone piece" fill sizes="(max-width:860px) 92vw, 46vw" className={pages.mediaImg} />
          </div>
          <div>
            <p className={pages.eyebrow}><span /> The family · est. 1980</p>
            <h2 className={pages.h2}>Three generations at the bench</h2>
            <p className={pages.p}>
              Jewel Stone opened on 47th Street in 1980 and has been family-run ever
              since — the trade passed down, hand to hand, across three generations.
              {" "}{brand.owner} continues it today, selecting every diamond in the
              Diamond District and overseeing each piece from sketch to setting.
            </p>
            <p className={pages.p}>
              Everything is made <strong>in-house</strong> — designed, cast, hand-set,
              and finished on our own bench, never outsourced. No mass production, no
              catalog reruns. Just rare stones, honestly graded, and the patience of
              a family that has done this for forty years.
            </p>
            <div className={pages.actions}>
              <Link href="/contact" className={pages.btnPrimary}>Book a private viewing</Link>
              <Link href="/collections" className={pages.btnGhost}>See the vitrine</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${pages.dark}`}>
        <div className={pages.wrap} style={{ paddingBlock: "clamp(3.5rem,7vw,6rem)" }}>
          <p className={pages.eyebrow}><span /> What we stand for</p>
          <h2 className={pages.h2}>Three quiet rules.</h2>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            {values.map((v) => (
              <div key={v.num} className={pages.card} style={{ background: "rgba(242,240,235,0.04)", borderColor: "rgba(242,240,235,0.12)" }}>
                <div className={pages.num}>{v.num}</div>
                <h3 className={pages.h3} style={{ color: "#f7f5f0" }}>{v.title}</h3>
                <p style={{ margin: 0, color: "rgba(242,240,235,0.7)", lineHeight: 1.65 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={pages.cta}>
        <h2 className={pages.h2}>Come see them in person.</h2>
        <p className={pages.lede}>{brand.address} · {brand.hours}</p>
        <div className={`${pages.actions} ${pages.centerActions}`}>
          <Link href="/showroom" className={pages.btnPrimary}>Visit the showroom</Link>
          <Link href="/contact" className={pages.btnGhost}>Contact us</Link>
        </div>
      </section>
    </main>
  );
}
