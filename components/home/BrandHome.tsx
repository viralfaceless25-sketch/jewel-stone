import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/site";
import { DIAMOND_WORLD_LABELS } from "@/lib/commerce/diamond-worlds";
import { pickDailyArrivals } from "@/lib/home/new-arrivals";
import styles from "./brand-home.module.css";
import { CinematicHome, CinematicSection } from "./CinematicMotion";
import { HeroSlideshow } from "./HeroSlideshow";

const WORLDS = [
  {
    id: "natural",
    numeral: "I",
    label: "Earth-formed · One of one",
    title: "Natural",
    body:
      "Formed over a billion years and chosen stone by stone for provenance and individual character. When it is gone, there is no second.",
    detail:
      "Every natural stone we take is examined loose, under the lamp, before it is ever committed to a setting — for how it returns light, how clean it reads to the eye, and whether it deserves the design we have in mind. The certificate confirms what we have already seen by hand.",
    specs: ["GIA certified", "Provenance traced", "One of one"],
    image: "/images/lifestyle/model-diamond-pendant.jpg",
    alt: "Natural diamond pendant worn by a model, editorial portrait",
    href: "/collections?world=natural",
    cta: "Explore Natural",
  },
  {
    id: "lab-grown",
    numeral: "III",
    label: "Same crystal · Greater freedom",
    title: "Lab Grown",
    body:
      "Diamond in every optical and physical property, with room to go larger, finer, or bolder — on your terms and your budget.",
    detail:
      "Grown rather than mined, then cut and set to exactly the same standard as everything else we make. It is the most direct route to real size and high clarity, and because each piece is made to order you choose the carat, the colour, the clarity, and the metal.",
    specs: ["IGI certified", "Made to order", "14K & 18K"],
    image: "/images/products/sr1-round-1ct-solitaire-ring/model.webp",
    alt: "Lab-grown round solitaire ring worn on the hand",
    href: "/collections?world=lab-grown",
    cta: "Explore Lab Grown",
  },
] as const;

const HOUSE_FILMS: Array<{
  id: string;
  src: string;
  poster: string;
  label: string;
  caption: string;
  href: string;
}> = [
  {
    id: "ring",
    src: "/images/products/cvd-round-solitaire-halo-ring/video-web.mp4",
    poster: "/images/products/cvd-round-solitaire-halo-ring/cover.webp",
    label: "Ring",
    caption: "Round solitaire halo",
    href: "/collections/rings",
  },
  {
    id: "necklace",
    src: "/images/products/cvd-tennis-necklace/video-web.mp4",
    poster: "/images/products/cvd-tennis-necklace/cover.webp",
    label: "Necklace",
    caption: "Tennis line, graduated",
    href: "/collections/necklaces",
  },
  {
    id: "bracelet",
    src: "/images/products/cvd-tennis-bracelet-4mm/video-web.mp4",
    poster: "/images/products/cvd-tennis-bracelet-4mm/cover.webp",
    label: "Bracelet",
    caption: "4 mm tennis bracelet",
    href: "/collections/bracelets",
  },
  {
    id: "earring",
    src: "/images/products/cvd-round-studs-7-4-8-2mm/video-web.mp4",
    poster: "/images/products/cvd-round-studs-7-4-8-2mm/cover.webp",
    label: "Earrings",
    caption: "Round studs, 7.4–8.2 mm",
    href: "/collections/earrings",
  },
];

export function BrandHome() {
  const arrivals = pickDailyArrivals(3);

  return (
    <CinematicHome className={styles.home}>
      <section className={`${styles.hero} cinematic-scene`}>
        <HeroSlideshow />
      </section>

      {/* ── The three worlds ── */}
      <CinematicSection className={styles.worldsHead} id="worlds">
        <p className={styles.worldsKicker}>The three worlds</p>
        <h2>Natural. Natural&nbsp;PIECUT. Lab&nbsp;Grown.</h2>
        <p className={styles.worldsSub}>
          Every Jewel Stone piece begins with one decision — the world its diamond comes
          from. Three worlds, one standard of cut, colour, and character.
        </p>
      </CinematicSection>

      <CinematicSection className={styles.world} id={WORLDS[0].id}>
        <div className={styles.worldMedia}>
          <Image src={WORLDS[0].image} alt={WORLDS[0].alt} fill sizes="(max-width: 860px) 100vw, 46vw" />
        </div>
        <div className={styles.worldCopy}>
          <p className={styles.worldLabel}>{WORLDS[0].numeral} — {WORLDS[0].label}</p>
          <h3>{WORLDS[0].title}</h3>
          <p className={styles.worldBody}>{WORLDS[0].body}</p>
          <p className={styles.worldDetail}>{WORLDS[0].detail}</p>
          <ul className={styles.worldSpecs}>
            {WORLDS[0].specs.map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
          <Link href={WORLDS[0].href} className={styles.worldCta}>{WORLDS[0].cta}</Link>
        </div>
      </CinematicSection>

      <CinematicSection className={styles.worldSignature} id="natural-piecut">
        <div className={styles.worldSignatureInner}>
          <div className={styles.worldCopy}>
            <p className={styles.worldLabel}>II — The signature</p>
            <h3>Natural&nbsp;PIECUT</h3>
            <p className={styles.worldBody}>
              Precisely matched natural diamonds, assembled by hand to read as one larger
              geometric silhouette.
            </p>
            <p className={styles.worldDetail}>
              Nine or more stones are cut, matched, and set so exactly that the seams disappear
              and the eye reads a single emerald, heart, or asscher many times the carat weight.
              It takes days at the bench and cannot be mass produced — which is why every PIECUT
              piece is made once, and only once.
            </p>
            <p className={styles.worldSignatureNote}>Found nowhere else</p>
            <Link href="/collections?world=natural-piecut" className={styles.worldCtaPill}>Explore PIECUT</Link>
          </div>
          <div className={styles.worldMedia}>
            <Image
              src="/images/lifestyle/model-asscher-earrings.jpg"
              alt="Model wearing a Natural PIECUT asscher-cut drop earring in warm daylight"
              fill
              sizes="(max-width: 860px) 100vw, 46vw"
            />
          </div>
        </div>
      </CinematicSection>

      <CinematicSection className={`${styles.world} ${styles.worldReverse}`} id={WORLDS[1].id}>
        <div className={styles.worldMedia}>
          <Image src={WORLDS[1].image} alt={WORLDS[1].alt} fill sizes="(max-width: 860px) 100vw, 46vw" />
        </div>
        <div className={styles.worldCopy}>
          <p className={styles.worldLabel}>{WORLDS[1].numeral} — {WORLDS[1].label}</p>
          <h3>{WORLDS[1].title}</h3>
          <p className={styles.worldBody}>{WORLDS[1].body}</p>
          <p className={styles.worldDetail}>{WORLDS[1].detail}</p>
          <ul className={styles.worldSpecs}>
            {WORLDS[1].specs.map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
          <Link href={WORLDS[1].href} className={styles.worldCta}>{WORLDS[1].cta}</Link>
        </div>
      </CinematicSection>

      <section className={styles.worldFilters} aria-label="Shop by diamond world">
        <p className={styles.worldsKicker}>Shop by world</p>
        <h2>Every style. Three worlds.</h2>
        <div className={styles.worldPills}>
          <Link href="/collections" className={styles.worldPillActive}>All worlds</Link>
          <Link href="/collections?world=natural" className={styles.worldPill}>Natural</Link>
          <Link href="/collections?world=natural-piecut" className={styles.worldPill}>Natural&nbsp;PIECUT</Link>
          <Link href="/collections?world=lab-grown" className={styles.worldPill}>Lab Grown</Link>
        </div>
      </section>

      {/* ── House selection, in motion ── */}
      <CinematicSection className={styles.films} id="product-film">
        <header className={styles.filmsHead}>
          <div>
            <p className={styles.worldsKicker}>The house selection · in motion</p>
            <h2>High jewelry, seen clearly.</h2>
          </div>
          <p>
            Studio film shot against black so the only thing moving is the light inside
            the stone. One piece from each category, and the collection together.
          </p>
        </header>
        <Link href="/collections" className={styles.filmLead}>
          <Image
            src="/images/hero/campaign-02.webp"
            alt="Jewel Stone model wearing the full collection — necklaces, pendant, earrings, rings, and bracelets"
            fill
            sizes="(max-width: 860px) 100vw, 90vw"
            className={styles.filmLeadImage}
          />
          <div className={styles.filmCaption}>
            <span>The house collection</span>
            <p>Natural, PIECUT, and lab-grown — worn together.</p>
          </div>
        </Link>

        <div className={styles.filmGrid}>
          {HOUSE_FILMS.map((film) => (
            <Link key={film.id} href={film.href} className={styles.filmTile}>
              <video
                src={film.src}
                poster={film.poster}
                muted
                loop
                playsInline
                preload="metadata"
                data-lux-video
                aria-label={`${film.label} — ${film.caption}`}
              />
              <div className={styles.filmCaption}>
                <span>{film.label}</span>
                <p>{film.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </CinematicSection>

      {/* ── New arrivals, rotating daily ── */}
      <CinematicSection className={styles.arrivals} id="new-arrivals">
        <header className={styles.arrivalsHead}>
          <div>
            <p className={styles.worldsKicker}>New arrivals · refreshed daily</p>
            <h2>Today at the house.</h2>
          </div>
          <p>A new selection across all three worlds every day. Seen something? It may move tomorrow.</p>
        </header>
        <div className={styles.arrivalsGrid}>
          {arrivals.map((arrival) => (
            <Link href={arrival.href} key={arrival.key} className={styles.arrivalCard}>
              <div className={styles.arrivalMedia}>
                <Image src={arrival.image} alt={arrival.name} fill sizes="(max-width: 860px) 100vw, 30vw" />
              </div>
              <span className={styles.arrivalWorld}>{DIAMOND_WORLD_LABELS[arrival.world]}</span>
              <h3>{arrival.name}</h3>
              <p>{arrival.priceLabel ?? arrival.note}</p>
            </Link>
          ))}
        </div>
        <Link href="/collections" className={styles.arrivalsLink}>View the full collection</Link>
      </CinematicSection>

      {/* ── Family knowledge ── */}
      <CinematicSection className={styles.legacy} id="legacy">
        <div className={styles.legacyInner}>
          <p className={styles.legacyKicker}>Family knowledge · since 1980</p>
          <h2 className={styles.legacyTitle}>New name.<br />Deep roots.</h2>
          <blockquote className={styles.legacyQuote}>
            “A diamond will tell you the truth if you turn it slowly enough.”
          </blockquote>
          <div className={styles.legacyStory}>
            <p>
              Jewel Stone is young. The knowledge behind it is not. Since 1980 this family
              has worked in diamonds — first selecting rough, then cutting, then setting for
              other houses whose names you would recognise on a boulevard.
            </p>
            <p>
              What passed down was never a slogan. It was the habit of turning a stone under
              a lamp until it gives itself away: where the light leaks, where the cut was
              rushed, which pair will actually match once they sit on a face. That judgment
              now sits at 47th Street, in a workshop where every Jewel Stone piece is
              developed, and where {brand.owner} still takes the meetings himself.
            </p>
            <p>
              Three generations of looking closely — in a house that finally carries its own
              name.
            </p>
          </div>
          <div className={styles.legacyActions}>
            <Link href="/about" className={styles.legacyCta}>Read our story</Link>
            <Link href="/contact" className={styles.legacyCtaGhost}>Meet {brand.owner.split(" ")[0]}</Link>
          </div>
        </div>
        <div className={styles.legacyBranding} aria-hidden="true">Jewel Stone</div>
      </CinematicSection>

      {/* ── Appointment ── */}
      <CinematicSection className={styles.appointment} id="appointment">
        <div className={styles.appointmentCopy}>
          <p className={styles.worldsKicker}>Private appointment</p>
          <h2>Come see the stones in person.</h2>
          <p className={styles.appointmentBody}>
            Diamonds photograph well and read differently in the hand. Book a private
            viewing at the studio, or start the conversation remotely — either way you
            speak directly with {brand.owner}.
          </p>
          <div className={styles.appointmentActions}>
            <Link href="/appointment" className={styles.appointmentCta}>Book an appointment</Link>
            <Link href="/custom" className={styles.appointmentGhost}>Start a custom piece</Link>
          </div>
        </div>
        <dl className={styles.appointmentDetails}>
          <div>
            <dt>Studio</dt>
            <dd>{brand.address}</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{brand.hours}</dd>
          </div>
          <div>
            <dt>Direct</dt>
            <dd>
              <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`}>{brand.phone}</a>
              <br />
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </dd>
          </div>
        </dl>
      </CinematicSection>
    </CinematicHome>
  );
}
