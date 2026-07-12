import Link from "next/link";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

export function VaultV2() {
  return (
    <Reveal className={styles.vault} id="vault">
      <p className={styles.kicker} data-reveal-item><span /> The Vault · New York</p>
      <h2 data-reveal-item>Eleven pieces.<br /><em>Never repeated.</em></h2>
      <p data-reveal-item>Each signature piece is held privately until collected. Once it leaves the vault, its exact composition is retired.</p>
      <Link href="/collections" className={styles.primaryButton} data-reveal-item>Enter the vault</Link>
      <div className={styles.vaultOrb} aria-hidden="true" />
    </Reveal>
  );
}
