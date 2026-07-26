import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./admin.module.css";

type Tone = "neutral" | "gold" | "good" | "warn" | "bad";
const toneClass: Record<Tone, string> = {
  neutral: "",
  gold: styles.toneGold,
  good: styles.toneGood,
  warn: styles.toneWarn,
  bad: styles.toneBad,
};

export function TileGrid({ children }: { children: ReactNode }) {
  return <div className={styles.tileGrid}>{children}</div>;
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
  href?: string;
}) {
  const className = `${styles.tile} ${toneClass[tone]}`;
  const content = (
    <>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>{value}</span>
      {hint ? <span className={styles.tileHint}>{hint}</span> : null}
    </>
  );
  return href ? <Link className={className} href={href}>{content}</Link> : <div className={className}>{content}</div>;
}

