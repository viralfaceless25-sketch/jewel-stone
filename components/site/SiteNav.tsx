"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { megaNav } from "@/data/site";
import { cartCount, useCartStore } from "@/store/cart";
import styles from "./site-chrome.module.css";

const PRIMARY_LABELS = new Set(["Engagement", "Wedding", "Jewelry"]);
const SECONDARY_LABELS = new Set(["Diamonds", "Custom Design", "About"]);

const mobileMenuMotion = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

export function SiteNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 220, damping: 32, mass: 0.25 });
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

    // Every top-level entry navigates on click. Items that own a mega menu get a
    // separate caret button so the panel can still be toggled by click/keyboard.
    return (
      <div key={item.label} className={styles.navItem} onMouseEnter={() => enter(index)}>
        <Link
          href={item.href}
          className={`${styles.navLink} ${selected || current ? styles.navLinkActive : ""}`}
          aria-current={current ? "page" : undefined}
          onFocus={() => {
            clearTimers();
            setActive(item.groups ? index : null);
          }}
          onClick={() => setActive(null)}
        >
          {item.label}
        </Link>
        {item.groups ? (
          <button
            type="button"
            className={`${styles.navCaret} ${selected ? styles.navCaretOpen : ""}`}
            aria-haspopup="true"
            aria-expanded={selected}
            aria-label={`${selected ? "Hide" : "Show"} ${item.label} menu`}
            onClick={() => {
              clearTimers();
              setActive(selected ? null : index);
            }}
          >
            <i className={styles.caret} aria-hidden />
          </button>
        ) : null}
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
      className={`${styles.nav} ${scrolled || active !== null || open ? styles.navScrolled : ""}`}
      onKeyDown={onHeaderKeyDown}
    >
      <p className={styles.navUtilityBar}>
        Complimentary insured shipping · New York Diamond District · By appointment
      </p>

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
          <span className={styles.brandReveal} aria-hidden="true">
            <Image
              className={styles.brandMono}
              src="/brand/jewel-stone-mono-mark.png"
              alt=""
              width={375}
              height={655}
              priority
            />
            <span className={styles.brandTextFace}>
              <span className={styles.wordmarkText}>Jewel Stone</span>
            </span>
          </span>
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

      <motion.div
        aria-hidden="true"
        className={styles.navProgress}
        style={{ scaleX: reduceMotion ? scrollYProgress : smoothScrollProgress }}
      />

      <AnimatePresence>
        {activeItem?.groups ? (
          <motion.button
            type="button"
            className={styles.navScrim}
            aria-label="Close navigation menu"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setActive(null)}
          />
        ) : null}
      </AnimatePresence>

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
                  <h4>
                    <Link
                      href={group.href ?? group.items[0]?.href ?? activeItem.href}
                      onClick={() => setActive(null)}
                    >
                      {group.title}
                    </Link>
                  </h4>
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

      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            id="mobile-navigation"
            className={styles.mobileMenu}
            aria-label="Mobile"
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit={reduceMotion ? undefined : "exit"}
            variants={mobileMenuMotion}
          >
            <div className={styles.mobileMenuInner}>
              <p className={styles.mobileMenuKicker}>Explore Jewel Stone</p>
              {megaNav.map((item, itemIndex) => {
                const expanded = mobileExpanded === item.label;
                const current = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <section key={item.label} className={styles.mobileSection}>
                    <div className={styles.mobileTop}>
                      <span className={styles.mobileIndex} aria-hidden>{String(itemIndex + 1).padStart(2, "0")}</span>
                      <Link
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={current ? styles.mobileCurrent : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
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
                <Link className={styles.mobileAppointment} href="/contact" onClick={() => setOpen(false)}>Book appointment ↗</Link>
                <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
                <Link href="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
