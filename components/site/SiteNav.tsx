"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { megaNav } from "@/data/site";
import { cartCount, useCartStore } from "@/store/cart";
import styles from "./site-chrome.module.css";

const PRIMARY_LABELS = new Set(["Engagement", "Wedding", "Jewelry"]);
const SECONDARY_LABELS = new Set(["Diamonds", "Custom Design"]);

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setActive(null);
    setOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => () => clearTimers(), []);

  const enter = (index: number) => {
    clearTimers();
    if (!megaNav[index].groups) {
      setActive(null);
      return;
    }
    if (active !== null) {
      setActive(index);
      return;
    }
    openTimer.current = setTimeout(() => setActive(index), 160);
  };

  const leave = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setActive(null), 180);
  };

  const activeItem = active !== null ? megaNav[active] : null;
  const primaryItems = megaNav.filter((item) => PRIMARY_LABELS.has(item.label));
  const secondaryItems = megaNav.filter((item) => SECONDARY_LABELS.has(item.label));

  const desktopItem = (item: (typeof megaNav)[number]) => {
    const index = megaNav.indexOf(item);
    const selected = active === index;
    const current = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

    return (
      <div key={item.label} className={styles.navItem} onMouseEnter={() => enter(index)}>
        {item.groups ? (
          <button
            type="button"
            className={`${styles.navLink} ${selected || current ? styles.navLinkActive : ""}`}
            aria-haspopup="true"
            aria-expanded={selected}
            onClick={() => {
              clearTimers();
              setActive(index);
            }}
            onFocus={() => {
              clearTimers();
              setActive(index);
            }}
          >
            {item.label}
            <i className={styles.caret} aria-hidden />
          </button>
        ) : (
          <Link href={item.href} className={`${styles.navLink} ${current ? styles.navLinkActive : ""}`}>
            {item.label}
          </Link>
        )}
      </div>
    );
  };

  const onHeaderKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      clearTimers();
      setActive(null);
      setOpen(false);
    }
  };

  return (
    <header
      className={`${styles.nav} ${scrolled || active !== null ? styles.navScrolled : ""}`}
      onKeyDown={onHeaderKeyDown}
    >
      <div className={styles.navInner} onMouseLeave={leave}>
        <button
          type="button"
          className={`${styles.burger} ${open ? styles.burgerOpen : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <nav className={styles.navLeft} aria-label="Primary">
          {primaryItems.map(desktopItem)}
        </nav>

        <Link href="/" className={styles.wordmark} aria-label="Jewel Stone home">
          <Image
            className={styles.navWordmark}
            src="/brand/jewel-stone-nav-wordmark.webp"
            alt="Jewel Stone"
            width={166}
            height={23}
            priority
          />
        </Link>

        <div className={styles.navRight}>
          <nav className={styles.navSecondary} aria-label="Diamond services">
            {secondaryItems.map(desktopItem)}
          </nav>
          <div className={styles.navActions}>
            <Link href="/diamonds" className={styles.iconBtn} aria-label="Search diamonds">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openCart();
              }}
              className={styles.bagBtn}
              aria-label={`Bag, ${count} items`}
            >
              Bag
              {count > 0 ? <span className={styles.bagCount}>{count}</span> : null}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.mega} ${activeItem?.groups ? styles.megaOpen : ""}`}
        onMouseEnter={clearTimers}
        onMouseLeave={leave}
      >
        {activeItem?.groups ? (
          <div className={styles.megaInner}>
            <div className={styles.megaGroups}>
              {activeItem.groups.map((group) => (
                <div key={group.title} className={styles.megaGroup}>
                  <h4>{group.title}</h4>
                  <ul>
                    {group.items.map((link, index) => (
                      <li key={`${link.label}-${index}`}>
                        <Link href={link.href} onClick={() => setActive(null)}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {activeItem.viewAll ? (
                <Link className={styles.megaViewAll} href={activeItem.viewAll} onClick={() => setActive(null)}>
                  View all {activeItem.label}
                  <span aria-hidden>→</span>
                </Link>
              ) : null}
            </div>
            {activeItem.featured ? (
              <Link href={activeItem.featured.href} className={styles.megaFeatured} onClick={() => setActive(null)}>
                <Image src={activeItem.featured.image} alt={activeItem.featured.title} fill sizes="320px" className={styles.megaFeaturedImg} />
                <div className={styles.megaFeaturedBody}>
                  {activeItem.featured.subtitle ? <span>{activeItem.featured.subtitle}</span> : null}
                  <strong>{activeItem.featured.title}</strong>
                  <em>{activeItem.featured.cta} →</em>
                </div>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {open ? (
        <nav id="mobile-navigation" className={styles.mobileMenu} aria-label="Mobile">
          <div className={styles.mobileMenuInner}>
            {megaNav.map((item) => {
              const expanded = mobileExpanded === item.label;
              return (
                <section key={item.label} className={styles.mobileSection}>
                  <div className={styles.mobileTop}>
                    <Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
                    {item.groups ? (
                      <button
                        type="button"
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
                        aria-expanded={expanded}
                        onClick={() => setMobileExpanded(expanded ? null : item.label)}
                      >
                        <span aria-hidden>{expanded ? "−" : "+"}</span>
                      </button>
                    ) : null}
                  </div>
                  {expanded && item.groups ? (
                    <div className={styles.mobileChildren}>
                      {item.groups.flatMap((group) => group.items).map((link, index) => (
                        <Link key={`${link.label}-${index}`} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
            <div className={styles.mobileUtility}>
              <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
              <Link href="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
