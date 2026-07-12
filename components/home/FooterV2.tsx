import Link from "next/link";
import { brand } from "@/data/site";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const links = [{ href: "/collections", label: "Collections" }, { href: "/diamonds", label: "Diamonds" }, { href: "/custom", label: "Custom design" }, { href: "/about", label: "Our story" }, { href: "/contact", label: "Contact" }];

export function FooterV2() {
  return (
    <Reveal as="footer" className={styles.footer}>
      <div className={styles.footerTop} data-reveal-item><p>Begin with a conversation.</p><Link href="/contact">Book a private appointment <span>↗</span></Link></div>
      <div className={styles.footerGrid} data-reveal-item>
        <div><Link href="/" className={styles.wordmark}>JEWEL STONE</Link><p>{brand.tagline}<br />Fine diamonds from New York.</p></div>
        <nav aria-label="Footer navigation">{links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
        <address><p>{brand.address}</p><a href={`tel:${brand.phone.replace(/\s/g, "")}`}>{brand.phone}</a><a href={`mailto:${brand.email}`}>{brand.email}</a><span>{brand.hours}</span></address>
      </div>
      <div className={styles.footerBottom} data-reveal-item><span>© 2026 Jewel Stone NY LLC</span><span>Natural &amp; lab-grown · GIA &amp; IGI</span></div>
    </Reveal>
  );
}
