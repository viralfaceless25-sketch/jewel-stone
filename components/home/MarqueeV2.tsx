import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const signals = ["One-of-one pieces", "EF / VVS diamonds", "18K fine gold", "Private NYC viewings"];

export function MarqueeV2() {
  return (
    <Reveal className={styles.marquee}>
      {signals.map((signal) => <span data-reveal-item key={signal}><i />{signal}</span>)}
    </Reveal>
  );
}
