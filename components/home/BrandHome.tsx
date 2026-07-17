import Image from "next/image";
import Link from "next/link";
import styles from "./brand-home.module.css";
import { CinematicArticle, CinematicHome, CinematicSection } from "./CinematicMotion";
import { HeroSlideshow } from "./HeroSlideshow";

const STORIES = [
  {
    eyebrow: "Natural diamond",
    title: "Asscher, drawn in light",
    story:
      "Step-cut geometry gives Asscher diamonds their quiet, hall-of-mirrors character. This pair carries that architecture into an articulated drop: precise, graphic, and alive when worn.",
    meta: "1.25 ct visual presence · 18K yellow gold · EF / VVS–VS",
    modelImage: "/images/lifestyle/model-asscher-editorial.jpg",
    productImage: "/images/products/asscher-halo-drop-earrings/cover.jpg",
    href: "/products/asscher-halo-drop-earrings",
    cta: "See piece, film & CAD",
  },
  {
    eyebrow: "The PIECUT signature",
    title: "Many stones. One silhouette.",
    story:
      "Nine precisely matched diamonds meet edge to edge, reading as one emerald-cut center. PIECUT turns small geometry into a larger flash—more character, less convention.",
    meta: "1.25 ct visual presence · 18K white gold · EF / VVS–VS",
    modelImage: "/images/lifestyle/model-asscher-earrings.jpg",
    productImage: "/images/products/emerald-halo-stud-earrings/cover.jpg",
    href: "/products/emerald-halo-stud-earrings",
    cta: "See piece, film & CAD",
  },
  {
    eyebrow: "Lab-grown diamond",
    title: "A neckline built in crescendo",
    story:
      "Graduated diamonds begin quietly at the clasp and gather scale toward the collarbone. Fifteen carats turn a classical line into an evening piece, made around metal, length, and proportion.",
    meta: "15.00 ct · 14K gold · made to order",
    modelImage: "/images/products/fn2-graduated-diamond-necklace/model.webp",
    productImage: "/images/products/fn2-graduated-diamond-necklace/angle-front-wg.webp",
    href: "/products/fn2-graduated-diamond-necklace",
    cta: "See model & all metal views",
  },
] as const;

const EDITORIAL = [
  {
    image: "/images/lifestyle/model-cluster-studs.jpg",
    title: "Cluster studs",
    href: "/products/star-cluster-stud-earrings",
  },
  {
    image: "/images/lifestyle/model-asscher-earrings.jpg",
    title: "Asscher drops",
    href: "/products/asscher-halo-drop-earrings",
  },
  {
    image: "/images/products/st4-4ct-diamond-studs/model.jpg",
    title: "Lab-grown studs",
    href: "/collections/earrings",
  },
] as const;

export function BrandHome() {
  return (
    <CinematicHome className={styles.home}>
      <section className={`${styles.hero} cinematic-scene`}>
        <HeroSlideshow />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Jewel Stone · Shine with you</p>
          <h1>Jewelry with{" "}<br /><em>something to say.</em></h1>
          <p>
            Natural diamonds, rare PIECUT compositions, and lab-grown pieces—
            selected with three generations of judgment, then made in-house.
          </p>
        </div>
      </section>

      <CinematicSection className={styles.manifesto} id="point-of-view">
        <div className={styles.manifestoMedia}>
          <Image src="/images/lifestyle/model-heart-halo-pendant.jpg" alt="Jewel Stone diamond pendant worn on model" fill sizes="(max-width: 800px) 100vw, 46vw" />
          <div className={styles.manifestoStudio}>
            <Image src="/images/products/heart-halo-pendant/cover.jpg" alt="Heart halo pendant studio view" fill sizes="220px" />
            <span>Studio proof · PIECUT</span>
          </div>
          <div className={styles.manifestoSeal}>
            <Image src="/brand/jewel-stone-mark.webp" alt="" width={84} height={102} />
          </div>
        </div>
        <div className={styles.manifestoCopy}>
          <p className={styles.eyebrow}>Jewel Stone point of view</p>
          <h2>Stone first.<br /><em>Story close behind.</em></h2>
          <p className={styles.manifestoLede}>
            We begin with proportion, light, and how jewelry changes when it meets
            skin. Family knowledge since 1980 guides every stone selected and every
            piece developed in-house.
          </p>
          <div className={styles.manifestoProof}>
            <Link href="/collections"><b>01</b><strong>Natural</strong><span>Character, rarity, provenance</span></Link>
            <Link href="/collections"><b>02</b><strong>PIECUT</strong><span>Many stones, one silhouette</span></Link>
            <Link href="/collections"><b>03</b><strong>Lab-grown</strong><span>Scale and specification, your way</span></Link>
          </div>
          <Link href="/about" className={styles.manifestoLink}>Inside the maison <span>↗</span></Link>
        </div>
      </CinematicSection>

      <section className={styles.stories} aria-labelledby="story-title">
        <header className={styles.sectionHead}>
          <p>Three ways into the collection</p>
          <h2 id="story-title">Natural. PIECUT. Lab-grown.</h2>
          <span>Each piece gets context—not empty luxury language.</span>
        </header>

        {STORIES.map((item, index) => (
          <CinematicArticle className={styles.story} key={item.title}>
            <div className={styles.storyMedia}>
              <Link href={item.href} className={styles.storyModel} aria-label={`See ${item.title} worn`}>
                <Image src={item.modelImage} alt={`${item.title}, worn`} fill sizes="(max-width: 800px) 100vw, 42vw" className={styles.storyImage} />
              </Link>
              <Link href={item.href} className={styles.storyProduct} aria-label={`Inspect ${item.title}`}>
                <Image src={item.productImage} alt={`${item.title}, studio view`} fill sizes="(max-width: 800px) 42vw, 18vw" />
                <span>Studio view</span>
              </Link>
              <b>{String(index + 1).padStart(2, "0")}</b>
            </div>
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow}>{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.story}</p>
              <small>{item.meta}</small>
              <Link href={item.href}>{item.cta} <span>↗</span></Link>
            </div>
          </CinematicArticle>
        ))}
      </section>

      <CinematicSection className={styles.houseStudy} id="product-film">
        <header className={styles.houseStudyHead}>
          <div>
            <p className={styles.eyebrow}>The house selection · in motion</p>
            <h2>High jewelry,<br /><em>seen clearly.</em></h2>
          </div>
          <p>Sharp studio film and high-resolution jewelry studies. No haze, no placeholder imagery—only pieces worth looking at twice.</p>
        </header>
        <div className={styles.houseBento}>
          <Link href="/collections/bracelets" className={`${styles.bentoTile} ${styles.bentoFilm}`}>
            <video
              src="/images/home/house-selection.mp4"
              poster="/images/new/tennis-bracelet.jpg"
              autoPlay muted loop playsInline preload="metadata"
              aria-label="Jewel Stone high jewelry collection film"
            />
            <span>House selection film · 01:1</span>
          </Link>
          <Link href="/products/fr4-emerald-hidden-halo-ring" className={`${styles.bentoTile} ${styles.bentoRing}`}>
            <Image src="/images/products/fr4-emerald-hidden-halo-ring/angle-front-wg.webp" alt="Emerald hidden-halo lab-grown diamond ring" fill sizes="(max-width:800px) 100vw, 34vw" />
            <span>Emerald hidden halo · 5 ct</span>
          </Link>
          <Link href="/products/fn2-graduated-diamond-necklace" className={`${styles.bentoTile} ${styles.bentoBracelet}`}>
            <Image src="/images/products/fn2-graduated-diamond-necklace/model.webp" alt="Graduated diamond necklace worn on model" fill sizes="(max-width:800px) 100vw, 42vw" />
            <span>Graduated necklace · 15 ct</span>
          </Link>
          <Link href="/about" className={`${styles.bentoTile} ${styles.bentoBrand}`}>
            <Image src="/brand/jewel-stone-logo.jpeg" alt="Jewel Stone — Shine With You" fill sizes="(max-width:800px) 100vw, 34vw" />
          </Link>
        </div>
      </CinematicSection>

      <CinematicSection className={styles.editorial} id="earrings">
        <header className={styles.sectionHead}>
          <p>Best-covered category</p>
          <h2>Earrings, on the person.</h2>
          <span>Model imagery first. Studio proof, film, and CAD inside each piece.</span>
        </header>
        <div className={styles.editorialGrid}>
          {EDITORIAL.map((item) => (
            <Link href={item.href} key={item.title}>
              <div><Image src={item.image} alt={item.title} fill sizes="(max-width: 720px) 100vw, 33vw" /></div>
              <span>{item.title} ↗</span>
            </Link>
          ))}
        </div>
      </CinematicSection>

      <CinematicSection className={styles.arSection} id="ar">
        <div className={styles.arVisual}>
          <Image src="/images/products/sr1-round-1ct-solitaire-ring/model.webp" alt="Round solitaire ring worn on hand" fill sizes="(max-width: 800px) 100vw, 50vw" />
          <span>True-scale preview</span>
        </div>
        <div className={styles.arCopy}>
          <p className={styles.eyebrow}>3D + native AR</p>
          <h2>Inspect every angle.<br />Place it in your space.</h2>
          <p>
            Rotate and zoom on any device. On supported iPhone and Android devices,
            open native AR to place a true-scale piece in your environment. No fake
            hand-tracking promise: fit and on-body scale remain guided by model photography.
          </p>
          <ol>
            <li><span>01</span> Open product with 3D + AR badge</li>
            <li><span>02</span> Tap “View in your space” on supported phone</li>
            <li><span>03</span> Move phone slowly until placement surface appears</li>
          </ol>
          <Link href="/products/heart-halo-ring" className={styles.primary}>Open AR-ready piece</Link>
        </div>
      </CinematicSection>

      <CinematicSection className={styles.making} id="making">
        <header className={styles.makingHead}>
          <p className={styles.eyebrow}>How a piece comes to life</p>
          <h2>From eye, to line,<br />to the bench.</h2>
        </header>
        <div className={styles.makingGrid}>
          <figure className={styles.makingPrimary}>
            <Image src="/images/atelier/bench-setting.jpg" alt="Jeweler setting a diamond by hand at the bench" fill sizes="(max-width: 800px) 100vw, 62vw" />
            <figcaption><span>03</span> Setting &amp; finish</figcaption>
          </figure>
          <div className={styles.makingSide}>
            <figure>
              <Image src="/images/new/custom-design-editorial.jpg" alt="Jewelry design sketches, tools, and diamonds on the worktable" fill sizes="(max-width: 800px) 100vw, 38vw" />
              <figcaption><span>01</span> Sketch &amp; proportion</figcaption>
            </figure>
            <div className={styles.makingText}>
              <p>
                First, stone and silhouette. Then CAD resolves scale, balance, and
                construction before metal is cast. Final character arrives at the bench:
                stones set by hand, edges refined, surfaces polished, every angle checked.
              </p>
              <Link href="/custom">Follow custom process ↗</Link>
            </div>
          </div>
        </div>
      </CinematicSection>

      <CinematicSection className={styles.legacy} id="legacy">
        <div>
          <p className={styles.eyebrow}>Family knowledge · since 1980</p>
          <h2>New name.<br />Deep roots.</h2>
        </div>
        <div>
          <p>
            Jewel Stone grows from a family jewelry business operating since 1980.
            Experience passes through stone selection, proportion, construction,
            setting, and finish—not through inherited slogans.
          </p>
          <p>Every piece is developed in-house. Every client gets direct guidance.</p>
          <Link href="/about">Read our story ↗</Link>
        </div>
      </CinematicSection>

      <CinematicSection className={styles.closer} id="contact">
        <p>Private viewing · custom design · stone sourcing</p>
        <h2>Made around your story.<br /><em>Made to shine with you.</em></h2>
        <div className={styles.actions}>
          <Link href="/contact" className={styles.primary}>Start conversation</Link>
          <Link href="/collections" className={styles.secondary}>Explore collection</Link>
        </div>
      </CinematicSection>
    </CinematicHome>
  );
}
