"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const HeroRing = dynamic(() => import("./HeroRing").then((module) => module.HeroRing), { ssr: false });

export function HeroV2() {
  return (
    <Reveal as="header" className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroCopy} data-reveal-item>
        <p className={styles.kicker}><span /> The Signature Atelier</p>
        <h1>Made once.<br />Remembered always.</h1>
        <p className={styles.heroLead}>One-of-a-kind diamond pieces, selected and finished in New York&apos;s Diamond District.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/collections">Explore the collection</Link>
          <Link className={styles.ghostButton} href="/contact">Book a private viewing</Link>
        </div>
        <dl className={styles.stats}>
          <div><dt>11</dt><dd>Signature pieces</dd></div>
          <div><dt>EF</dt><dd>Exceptional color</dd></div>
          <div><dt>NYC</dt><dd>Diamond District</dd></div>
        </dl>
      </div>
      <div className={styles.ringStage} data-reveal-item>
        <div className={styles.stageLabel}>Heart Halo · 0.46 CTW</div>
        <HeroRing />
        <div className={styles.stageIndex}>01 / 11</div>
      </div>
    </Reveal>
  );
}
