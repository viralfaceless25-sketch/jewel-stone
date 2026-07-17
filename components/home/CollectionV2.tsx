import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const signature = products.filter((product) => product.source === "signature").slice(0, 6);

export function CollectionV2() {
  return (
    <Reveal className={styles.section} id="signature">
      <div className={styles.sectionHead} data-reveal-item>
        <div><p className={styles.kicker}><span /> The signature collection</p><h2>Rare by design.</h2></div>
        <p>Eleven physical pieces. Photographed in-house. The piece you see is the piece you receive.</p>
      </div>
      <div className={styles.productGrid}>
        {signature.map((product, index) => (
          <Link href={`/products/${product.slug}`} className={styles.productCard} data-reveal-item key={product.id}>
            <div className={styles.productFrame}>
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw" className={styles.productImage} />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className={styles.productMeta}>
              <div><h3>{product.name}</h3><p>{product.material} · {product.carats} CTW</p></div>
              <strong>View</strong>
            </div>
          </Link>
        ))}
      </div>
      <div className={styles.centerAction} data-reveal-item><Link className={styles.ghostButton} href="/collections">View all pieces</Link></div>
    </Reveal>
  );
}
