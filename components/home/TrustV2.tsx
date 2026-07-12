import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const items = [{ value: "GIA / IGI", label: "Certified stones" }, { value: "18K", label: "Fine gold" }, { value: "NYC", label: "Diamond District" }, { value: "1:1", label: "Private guidance" }];

export function TrustV2() {
  return <Reveal className={styles.trust}>{items.map((item) => <div data-reveal-item key={item.value}><strong>{item.value}</strong><span>{item.label}</span></div>)}</Reveal>;
}
