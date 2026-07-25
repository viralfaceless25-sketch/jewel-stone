import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { brand } from "@/data/site";
import { personSchema } from "@/lib/seo/schema";
import styles from "@/components/pages/about.module.css";

export const metadata: Metadata = {
  title: "About — Family Jewelry Knowledge Since 1980",
  description:
    "Jewel Stone grows from a family jewelry business operating since 1980, with natural, PIECUT, and lab-grown diamond jewelry made in-house.",
  alternates: { canonical: "/about" },
};

const worlds = [
  { num: "I", title: "Natural", body: "Selected for rarity, proportion, and individual character — certified stones with geological provenance, chosen one at a time." },
  { num: "II", title: "Natural PIECUT", body: "Precisely matched natural diamonds assembled by hand into one larger geometric silhouette. Our most distinctive design language, found nowhere else." },
  { num: "III", title: "Lab Grown", body: "The same crystal structure and optical performance, with more freedom in scale, grade, and budget — made to order in every metal." },
];

const values = [
  { num: "01", title: "One of one", body: "Every signature piece is made a single time. When it sells, it is gone — no reorders, no duplicates." },
  { num: "02", title: "Stone first", body: "We start from the diamond, chosen for proportion and character, then build the setting around it." },
  { num: "03", title: "Made to be worn", body: "Finished to order in rose, white, yellow gold, or platinum — sized and insured. Heirlooms, not display pieces." },
];

const timeline = [
  { year: "1980", body: "The family enters the diamond trade — first selecting rough, then cutting and setting for houses you would recognise." },
  { year: "Since", body: "Three generations of judgment passed hand to hand: how a stone leaks light, how a pair truly matches on a face." },
  { year: "Today", body: `${brand.owner} carries that knowledge into Jewel Stone at 47th Street, overseeing every piece himself.` },
];

export default function AboutPage() {
  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroImg}>
            <Image src="/images/atelier/bench-setting.jpg" alt="A jeweler setting a diamond by hand at the bench" fill priority sizes="100vw" />
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>The maison · New York Diamond District</p>
            <h1>A new name, on deep family roots.</h1>
            <p className={styles.heroSub}>
              Jewel Stone grows from a family jewelry business operating since 1980. That
              experience now guides every stone we select and every piece we make in-house.
            </p>
          </div>
        </section>

        <section className={styles.founder}>
          <div className={styles.founderMedia}>
            <Image src="/images/new/custom-design-editorial.jpg" alt="Design sketches, tools, and loose diamonds on the atelier worktable" fill sizes="(max-width:860px) 92vw, 46vw" />
          </div>
          <div>
            <p className={styles.kicker}>The founder</p>
            <h2>Three generations at the bench.</h2>
            <p className={styles.founderName}>{brand.owner}</p>
            <p className={styles.founderRole}>{brand.title}</p>
            <p className="body">
              Our family jewelry business began in 1980, and the trade passed down hand to
              hand across three generations. {brand.owner} carries that knowledge into Jewel
              Stone today, overseeing each piece from stone selection and first sketch through
              setting and final finish.
            </p>
            <p className="body">
              Work stays <strong>in-house</strong> — design, casting, setting, and finish. No
              mass production, no anonymous catalogue story. Just carefully chosen stones,
              honest grading, and judgment built over more than forty years.
            </p>
            <div className={styles.actions}>
              <Link href="/appointment" className={styles.btnSolid}>Book a private viewing</Link>
              <Link href="/collections" className={styles.btnGhost}>See the vitrine</Link>
            </div>
          </div>
        </section>

        <section className={styles.heritage}>
          <div className={styles.heritageInner}>
            <p className={styles.kicker}>Family knowledge · since 1980</p>
            <h2>Forty years of looking closely.</h2>
            <blockquote className={styles.heritageQuote}>
              “A diamond will tell you the truth if you turn it slowly enough.”
            </blockquote>
            <div className={styles.timeline}>
              {timeline.map((step) => (
                <div key={step.year} className={styles.timeStep}>
                  <div className={styles.year}>{step.year}</div>
                  <div className={styles.line} />
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heritageBrand} aria-hidden="true">Jewel Stone</div>
        </section>

        <section className={styles.worlds}>
          <div className={styles.worldsHead}>
            <p className={styles.kicker}>Three diamond worlds</p>
            <h2>Different origins. One standard of judgment.</h2>
            <p>Whichever world a piece comes from, it meets the same eye for cut, colour, and character.</p>
          </div>
          <div className={styles.rows}>
            {worlds.map((world) => (
              <div key={world.num} className={styles.row}>
                <span className={styles.num}>{world.num}</span>
                <h3>{world.title}</h3>
                <p>{world.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.values}>
          <div className={styles.valuesInner}>
            <p className={styles.kicker}>What we stand for</p>
            <h2>Three quiet rules.</h2>
            <div className={styles.rows}>
              {values.map((value) => (
                <div key={value.num} className={styles.row}>
                  <span className={styles.num}>{value.num}</span>
                  <h3>{value.title}</h3>
                  <p>{value.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closer}>
          <h2>Come see them in person.</h2>
          <p>{brand.address} · {brand.hours}</p>
          <div className={styles.closerActions}>
            <Link href="/appointment" className={styles.btnSolid}>Book an appointment</Link>
            <Link href="/showroom" className={styles.btnGhost}>Visit the showroom</Link>
          </div>
        </section>
      </main>
      <JsonLd data={personSchema()} />
    </>
  );
}
