import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const piece = products.find((product) => product.slug === "emerald-halo-engagement-ring")!;

export function EditorialV2() {
  return (
    <Reveal className={`${styles.section} ${styles.editorial}`}>
      <div className={styles.editorialImage} data-reveal-item>
        <Image src={piece.gallery?.[2] ?? piece.image} alt={piece.name} fill sizes="(max-width: 800px) 92vw, 58vw" className={styles.productImage} />
        <span className={styles.verticalLabel}>Piece No. JSD0626001</span>
      </div>
      <div className={styles.editorialCopy} data-reveal-item>
        <p className={styles.kicker}><span /> The cut study</p>
        <h2>Emerald-Cut<br />Cascade.</h2>
        <p>Nine diamonds resolve into a single architectural center, framed by a pavé halo and split shank. Geometry first; spectacle second.</p>
        <dl className={styles.specs}><div><dt>Diamond</dt><dd>{piece.colorClarity}</dd></div><div><dt>Weight</dt><dd>{piece.carats} CTW</dd></div><div><dt>Metal</dt><dd>18K white gold</dd></div></dl>
        <Link href={`/products/${piece.slug}`} className={styles.textLink}>Discover the piece <span>↗</span></Link>
      </div>
    </Reveal>
  );
}
