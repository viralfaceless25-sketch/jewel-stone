import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const reviews = [
  { quote: "Ishan made the entire process feel considered, never pressured. The final ring is even finer than the photographs.", name: "Alyssa M.", detail: "Custom ring · New York" },
  { quote: "Every detail was explained with absolute clarity. It felt like collecting a piece, not simply buying jewelry.", name: "Daniel R.", detail: "Signature collection · New Jersey" },
  { quote: "The private appointment was warm, precise, and deeply personal. We found something no one else will ever wear.", name: "Priya S.", detail: "Private viewing · Manhattan" },
];

export function ReviewsV2() {
  return (
    <Reveal className={styles.section}>
      <div className={styles.sectionHead} data-reveal-item><div><p className={styles.kicker}><span /> Private clients</p><h2>In their words.</h2></div><p>Quiet service, transparent guidance, and pieces with a singular point of view.</p></div>
      <div className={styles.reviewGrid}>{reviews.map((review, index) => <article data-reveal-item key={review.name}><span>0{index + 1}</span><blockquote>“{review.quote}”</blockquote><footer><strong>{review.name}</strong><small>{review.detail}</small></footer></article>)}</div>
    </Reveal>
  );
}
