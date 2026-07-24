import Image from "next/image";
import Link from "next/link";
import { brand } from "@/data/site";
import styles from "./site-chrome.module.css";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/collections", label: "Collections" },
      { href: "/collections/engagement-rings", label: "Engagement" },
      { href: "/diamonds", label: "Loose Diamonds" },
      { href: "/custom", label: "Custom Design" },
    ],
  },
  {
    title: "Maison",
    links: [
      { href: "/about", label: "About" },
      { href: "/showroom", label: "Showroom" },
      { href: "/contact", label: "Contact" },
      { href: "/education", label: "Diamond Education" },
    ],
  },
  {
    title: "Care",
    links: [
      { href: "/pages/shipping", label: "Shipping" },
      { href: "/pages/returns", label: "Returns" },
      { href: "/pages/warranty", label: "Warranty" },
      { href: "/pages/faq", label: "FAQ" },
      { href: "/pages/editorial-standards", label: "Editorial standards" },
    ],
  },
];

const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`;

/** Stylised block plan of 47th St between 5th and 6th — drawn inline, no map service. */
function StudioMap() {
  return (
    <svg className={styles.mapCanvas} viewBox="0 0 320 180" role="img" aria-label={`Map showing Jewel Stone at ${brand.address}`}>
      <rect width="320" height="180" fill="#1b1713" />
      {/* avenues */}
      <rect x="26" y="0" width="16" height="180" fill="#241f1a" />
      <rect x="278" y="0" width="16" height="180" fill="#241f1a" />
      {/* 47th street */}
      <rect x="0" y="82" width="320" height="20" fill="#2b251e" />
      {/* blocks */}
      <g fill="#211c17">
        <rect x="46" y="14" width="70" height="62" />
        <rect x="122" y="14" width="66" height="62" />
        <rect x="194" y="14" width="80" height="62" />
        <rect x="46" y="108" width="70" height="58" />
        <rect x="122" y="108" width="66" height="58" />
        <rect x="194" y="108" width="80" height="58" />
      </g>
      {/* street labels */}
      <text x="160" y="96" fill="#8d8175" fontSize="8" letterSpacing="2.4" textAnchor="middle">W 47TH ST · DIAMOND DISTRICT</text>
      <text x="34" y="172" fill="#6f6459" fontSize="7" letterSpacing="1.6" textAnchor="middle" transform="rotate(-90 34 172)">6 AVE</text>
      <text x="286" y="172" fill="#6f6459" fontSize="7" letterSpacing="1.6" textAnchor="middle" transform="rotate(-90 286 172)">5 AVE</text>
      {/* marker */}
      <circle cx="150" cy="66" r="13" fill="rgba(232,212,182,.16)" />
      <circle cx="150" cy="66" r="5" fill="#E8D4B6" />
      <text x="150" y="46" fill="#E8D4B6" fontSize="8" letterSpacing="2" textAnchor="middle">JEWEL STONE</text>
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.serviceRail} aria-label="Client services">
        <span><b>01</b> Certified diamonds</span>
        <span><b>02</b> Fully insured delivery</span>
        <span><b>03</b> Lifetime craftsmanship care</span>
        <span><b>04</b> Private appointments</span>
      </div>

      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.footerWordmark} aria-label="Jewel Stone home">
            <Image src="/brand/jewel-stone-wordmark.webp" alt="Jewel Stone — Shine with You" width={360} height={100} />
          </Link>
          <p className={styles.footerLede}>
            Natural, PIECUT, and lab-grown diamond jewelry. Family knowledge since 1980.
            Every piece developed in-house.
          </p>
        </div>

        <div className={styles.footerCols}>
          {columns.map((col) => (
            <div key={col.title} className={styles.footerCol}>
              <h2>{col.title}</h2>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.footerVisit}>
          <h2>Visit the studio</h2>
          <Link href={MAPS_HREF} className={styles.mapFrame} target="_blank" rel="noreferrer noopener">
            <StudioMap />
            <span>Open in Maps</span>
          </Link>
          <address className={styles.footerAddress}>
            {brand.address}
            <br />
            {brand.hours}
          </address>
          <p className={styles.footerMeta}>
            <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`}>{brand.phone}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </p>
        </div>
      </div>

      <div className={styles.footerSignature} aria-hidden="true">Jewel Stone</div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} Jewel Stone NY LLC · Est. 1980 · GIA &amp; IGI certified diamonds</span>
        <span className={styles.footerDistrict}>NYC Diamond District</span>
      </div>
    </footer>
  );
}
