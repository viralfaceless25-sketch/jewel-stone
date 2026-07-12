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
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <Link href="/" className={styles.footerWordmark}>
            Jewel Stone
          </Link>
          <p>Family-owned since 1980 · every piece made in-house on 47th Street.</p>
          <p className={styles.footerMeta}>{brand.address}</p>
          <p className={styles.footerMeta}>
            <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`}>{brand.phone}</a> ·{" "}
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </p>
        </div>
        <div className={styles.footerCols}>
          {columns.map((col) => (
            <div key={col.title} className={styles.footerCol}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} Jewel Stone NY LLC · Est. 1980 · GIA & IGI certified diamonds</span>
        <span className={styles.footerDistrict}>NYC Diamond District</span>
      </div>
    </footer>
  );
}
