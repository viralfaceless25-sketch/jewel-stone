import Link from "next/link";
import Image from "next/image";
import pages from "./pages.module.css";
import styles from "./article.module.css";

export type ArticleSection = {
  h: string;
  body: string[];
  steps?: string[];
  table?: { headers: string[]; rows: string[][] };
};

export function ArticlePage({
  eyebrow,
  title,
  intro,
  sections,
  media,
  author,
  sources,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ArticleSection[];
  media?: { src: string; alt: string };
  author?: { name: string; title: string; href: string };
  sources?: { label: string; href: string }[];
}) {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> {eyebrow}</p>
        <h1 className={pages.h1}>{title}</h1>
        <p className={pages.lede}>{intro}</p>
        {author ? (
          <p className={styles.byline}>
            Guidance by <Link href={author.href}>{author.name}</Link> · {author.title}
          </p>
        ) : null}
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
              {s.steps ? (
                <ol className={styles.steps}>
                  {s.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              ) : null}
              {s.table ? (
                <div className={styles.tableWrap}>
                  <table>
                    <thead><tr>{s.table.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
                    <tbody>
                      {s.table.rows.map((row) => (
                        <tr key={row.join("|")}>{row.map((cell, index) => index === 0 ? <th key={`${index}-${cell}`} scope="row">{cell}</th> : <td key={`${index}-${cell}`}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ))}
          {sources?.length ? (
            <aside className={styles.sources} aria-labelledby="article-sources-title">
              <h2 id="article-sources-title">Primary sources</h2>
              <ul>
                {sources.map((source) => (
                  <li key={source.href}><a href={source.href}>{source.label}</a></li>
                ))}
              </ul>
            </aside>
          ) : null}
          <div className={styles.help}>
            <p>Still have a question?</p>
            <Link href="/contact" className={pages.btnPrimary}>Contact the team</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
