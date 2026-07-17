import Image from "next/image";
import Link from "next/link";
import { products, type Product } from "@/data/products";
import { modelFor } from "@/lib/models";
import { PieceViewer } from "@/components/ar/PieceViewer";
import { Reveal } from "./Reveal";
import { Parallax } from "./Parallax";
import { CollectionDeck } from "./CollectionDeck";
import { Marquee, StatCounter } from "./Bits";
import styles from "./vitrine.module.css";

const VITRINE_ORDER = [
  "heart-halo-ring",
  "emerald-halo-engagement-ring",
  "pear-halo-pendant",
  "pear-halo-drop-earrings",
  "heart-halo-pendant",
];

const vitrine: Product[] = VITRINE_ORDER.map(
  (slug) => products.find((p) => p.slug === slug),
).filter(Boolean) as Product[];

const heroPiece = products.find((p) => p.slug === "heart-halo-ring")!;
const spotPiece = products.find((p) => p.slug === "emerald-halo-engagement-ring")!;
const arPiece = products.find((p) => p.slug === "pear-halo-pendant")!;

const reviews = [
  { quote: "He proposed with the heart halo. Three jewelers later, nothing came close to this piece.", who: "Amara T.", where: "Brooklyn, NY" },
  { quote: "Turning it in AR before flying in sealed it. It looked exactly like the real thing on my hand.", who: "Priya & Devan", where: "Jersey City, NJ" },
  { quote: "Ishan found me a stone I couldn't find anywhere else on 47th. Quiet, honest, extraordinary.", who: "Marcus L.", where: "Manhattan, NY" },
];

export function VitrineHome() {
  return (
    <main className={styles.home}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          <Parallax speed={0.08} className={styles.heroStageWrap}>
            <div className={styles.heroStage}>
              <PieceViewer src={modelFor(heroPiece.slug)!} alt={heroPiece.name} poster={heroPiece.image} className={styles.viewer} />
            </div>
          </Parallax>
          <div className={styles.heroChips}>
            <span>◆ One of one</span>
            <span>◆ 18K · GIA</span>
          </div>
          <p className={styles.heroHint}>Drag to turn · pinch to zoom · tap “View in your space”</p>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> Family-run · NYC Diamond District · Est. 1980</p>
          <h1 className={styles.heroTitle}>Rare things,<br /><em>quietly</em> made.</h1>
          <p className={styles.heroSub}>
            Family-run on 47th Street since 1980 — every piece designed, cast, and
            set entirely in-house. Turn our one-of-a-kind PIECUT and antique diamonds
            in 3D, or place one on your hand in AR before you ever visit.
          </p>
          <div className={styles.heroActions}>
            <Link href="/collections" className={styles.btnPrimary}>Explore the collection</Link>
            <Link href="/contact" className={styles.btnGhost}>Book a private viewing</Link>
          </div>
          <ul className={styles.trustRow}>
            <li><strong>11</strong> signature pieces</li>
            <li><strong>GIA · IGI</strong> certified</li>
            <li><strong>3D + AR</strong> on every piece</li>
          </ul>
        </div>

        <div className={styles.scrollCue}><span />scroll</div>
      </section>

      {/* ── Marquee ── */}
      <Marquee words={["Est. 1980", "Made in-house", "Three generations", "NYC Diamond District", "GIA · IGI Certified", "One of one", "3D + AR"]} />

      {/* ── Collection slide-deck ── */}
      <Reveal as="section" className={styles.section} id="vitrine">
        <div className={styles.sectionHead} data-reveal-item>
          <div>
            <p className={styles.kicker}><span /> The signature vitrine</p>
            <h2>Turn them in the light.</h2>
          </div>
          <p className={styles.sectionLede}>
            Eleven physical pieces, made once. Drag through the vitrine — the piece
            you turn on screen is the exact piece you receive.
          </p>
        </div>
        <div data-reveal-item>
          <CollectionDeck items={vitrine} />
        </div>
      </Reveal>

      {/* ── Featured spotlight (full-bleed dark) ── */}
      <section className={styles.spotlight}>
        <div className={styles.spotInner}>
          <div className={styles.spotMedia}>
            <div className={styles.spotStage}>
              <PieceViewer src={modelFor(spotPiece.slug)!} alt={spotPiece.name} poster={spotPiece.image} className={styles.viewer} />
            </div>
          </div>
          <Parallax speed={0.06} className={styles.spotCopy}>
            <p className={styles.kickerLight}><span /> Piece of the moment</p>
            <h2>{spotPiece.name}</h2>
            <p className={styles.spotDesc}>{spotPiece.description}</p>
            <div className={styles.spotSpecs}>
              <div><strong>{spotPiece.carats} ct</strong><span>total weight</span></div>
              <div><strong>D–J · FL–SI2</strong><span>colour · clarity</span></div>
              <div><strong>{spotPiece.material.replace("18K ", "")}</strong><span>18K metal</span></div>
            </div>
            <div className={styles.spotActions}>
              <Link href={`/products/${spotPiece.slug}`} className={styles.btnLight}>View & configure</Link>

            </div>
          </Parallax>
        </div>
      </section>

      {/* ── AR band ── */}
      <Reveal as="section" className={styles.arBand}>
        <div className={styles.arCopy} data-reveal-item>
          <p className={styles.kicker}><span /> See it in your world</p>
          <h2>Try it on, from your couch.</h2>
          <p>
            Every Jewel Stone piece carries a true-to-scale 3D scan. On your phone,
            tap <strong>“View in your space”</strong> and place the ring on your hand
            or the pendant on the table — real size, real light, no showroom required.
          </p>
          <ol className={styles.arSteps}>
            <li><span>1</span> Open a piece on your phone</li>
            <li><span>2</span> Tap “View in your space”</li>
            <li><span>3</span> Point your camera &amp; place it</li>
          </ol>
          <Link href={`/products/${arPiece.slug}`} className={styles.btnPrimary}>Try {arPiece.name}</Link>
        </div>
        <div className={styles.arMedia} data-reveal-item>
          <div className={styles.arStage}>
            <PieceViewer src={modelFor(arPiece.slug)!} alt={arPiece.name} poster={arPiece.image} className={styles.viewer} />
          </div>
        </div>
      </Reveal>

      {/* ── Craft editorial + counters ── */}
      <Reveal as="section" className={styles.craft}>
        <Parallax speed={0.1} className={styles.craftImg} data-reveal-item>
          <Image src={arPiece.image} alt="Jewel Stone diamond jewelry crafted in-house" fill sizes="(max-width: 900px) 92vw, 46vw" className={styles.craftImgInner} />
        </Parallax>
        <div className={styles.craftCopy} data-reveal-item>
          <p className={styles.kicker}><span /> The maker · since 1980</p>
          <h2>Three generations, one bench.</h2>
          <p>
            A family house on 47th Street since 1980, now in its third generation.
            Every stone is hand-selected in the Diamond District and every piece is
            produced entirely <strong>in-house</strong> — cast, set, and finished by our
            own bench. Nothing is outsourced; nothing is mass-produced.
          </p>
          <div className={styles.counters}>
            <StatCounter value={1980} label="established · family-run" />
            <StatCounter value={3} label="generations at the bench" />
            <StatCounter value={160000} suffix="+" label="certified stones" />
          </div>
          <Link href="/about" className={styles.btnGhost}>Meet the maison</Link>
        </div>
      </Reveal>

      {/* ── Reviews ── */}
      <Reveal as="section" className={styles.reviews}>
        <div className={styles.reviewsHead} data-reveal-item>
          <p className={styles.kicker}><span /> In their words</p>
          <h2>Kept for a lifetime.</h2>
        </div>
        <div className={styles.reviewGrid}>
          {reviews.map((r) => (
            <figure className={styles.review} data-reveal-item key={r.who}>
              <div className={styles.stars}>★★★★★</div>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>{r.who} · <span>{r.where}</span></figcaption>
            </figure>
          ))}
        </div>
      </Reveal>

      {/* ── Closer ── */}
      <Reveal as="section" className={styles.closer}>
        <div data-reveal-item>
          <h2>Find the one, or design it.</h2>
          <p>Book a private viewing in the Diamond District, or start a bespoke commission.</p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.btnPrimary}>Book a viewing</Link>
            <Link href="/custom" className={styles.btnGhost}>Start a custom design</Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
