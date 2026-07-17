import Link from "next/link";
import Image from "next/image";
import pages from "./pages.module.css";
import styles from "./article.module.css";

export type ArticleSection = { h: string; body: string[] };

export function ArticlePage({
  eyebrow,
  title,
  intro,
  sections,
  media,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ArticleSection[];
  media?: { src: string; alt: string };
}) {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> {eyebrow}</p>
        <h1 className={pages.h1}>{title}</h1>
        <p className={pages.lede}>{intro}</p>
      </section>

      <section className={pages.section}>
        <div className={`${styles.article} ${media ? styles.articleWithMedia : ""}`}>
          {media ? (
            <figure className={styles.featureMedia}>
              <Image src={media.src} alt={media.alt} fill sizes="(max-width:800px) 100vw, 46vw" />
            </figure>
          ) : null}
          {sections.map((s) => (
            <div key={s.h} className={styles.block}>
              <h2>{s.h}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ))}
          <div className={styles.help}>
            <p>Still have a question?</p>
            <Link href="/contact" className={pages.btnPrimary}>Contact the team</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
