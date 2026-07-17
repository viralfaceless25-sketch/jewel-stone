import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/site";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "About — Family Jewelry Knowledge Since 1980",
  description:
    "Jewel Stone grows from a family jewelry business operating since 1980, with natural, PIECUT, and lab-grown diamond jewelry made in-house.",
  alternates: { canonical: "/about" },
};

const values = [
  { num: "01", title: "One of one", body: "Every signature piece is made a single time. When it sells, it is gone — no reorders, no duplicates." },
  { num: "02", title: "Stone first", body: "We start from the diamond, selected for proportion and character, then build the setting around it." },
  { num: "03", title: "Made to be worn", body: "Finished to order in rose, white, yellow gold or platinum, sized and insured — heirlooms, not display pieces." },
];

const diamondWorlds = [
  { num: "01", title: "Natural", body: "Selected for rarity, proportion, and individual character. Certified stones with geological provenance." },
  { num: "02", title: "PIECUT", body: "Precisely matched diamonds assembled into one larger geometric silhouette—our most distinctive design language." },
  { num: "03", title: "Lab-grown", body: "The same crystal structure and optical performance, with more freedom in scale, grade, and budget." },
];

export default function AboutPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> The maison</p>
        <h1 className={pages.h1}>A new name.<br /><em>Deep family roots.</em></h1>
        <p className={pages.lede}>
          Jewel Stone grows from a family jewelry business operating since 1980.
          That experience now guides every stone we select, every proportion we refine,
          and every piece we make in-house.
        </p>
      </section>

      <section className={pages.section}>
        <div className={`${pages.wrap} ${pages.split}`}>
          <div className={pages.mediaFrame}>
            <Image src="/images/atelier/bench-setting.jpg" alt="Jeweler setting a diamond by hand at the bench" fill sizes="(max-width:860px) 92vw, 46vw" className={pages.mediaCover} />
          </div>
          <div>
            <p className={pages.eyebrow}><span /> The family · est. 1980</p>
            <h2 className={pages.h2}>Three generations at the bench</h2>
            <p className={pages.p}>
              Our family jewelry business began in 1980. The trade passed down,
              hand to hand, across three generations. {brand.owner} carries that
              knowledge into Jewel Stone today, overseeing each piece from stone
              selection and first sketch through setting and final finish.
            </p>
            <p className={pages.p}>
              Work stays <strong>in-house</strong> — design, casting, setting, and finish.
              No mass production and no anonymous catalog story. Just carefully chosen
              stones, honest grading, and judgment built over more than forty years.
            </p>
            <div className={pages.actions}>
              <Link href="/contact" className={pages.btnPrimary}>Book a private viewing</Link>
              <Link href="/collections" className={pages.btnGhost}>See the vitrine</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={pages.section}>
        <div className={pages.wrap}>
          <p className={pages.eyebrow}><span /> Three diamond languages</p>
          <h2 className={pages.h2}>Different origins. One standard of judgment.</h2>
          <div className={pages.cards} style={{ marginTop: "2.5rem" }}>
            {diamondWorlds.map((world) => <div key={world.num} className={pages.card}><div className={pages.num}>{world.num}</div><h3 className={pages.h3}>{world.title}</h3><p className={pages.p} style={{ margin:0 }}>{world.body}</p></div>)}
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
