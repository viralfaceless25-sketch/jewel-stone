import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/data/site";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "The Showroom — NYC Diamond District",
  description:
    "Visit Jewel Stone by appointment at 62 W 47th St, in the heart of NYC's Diamond District. Private viewings for diamonds and one-of-a-kind pieces.",
  alternates: { canonical: "/showroom" },
};

const expect = [
  { num: "01", title: "By appointment", body: "A private, unhurried table — no crowds, no pressure. Just you, the stones, and a loupe." },
  { num: "02", title: "Stones in hand", body: "Compare shapes, colours, and certificates side by side. Turn the very pieces you saw online in 3D." },
  { num: "03", title: "Made or matched", body: "Take a signature piece home, or brief a bespoke commission from a loose diamond up." },
];

export default function ShowroomPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Visit us</p>
        <h1 className={pages.h1}>The table on <em>47th.</em></h1>
        <p className={pages.lede}>
          {brand.address}. In the heart of the Diamond District, by appointment —
          {" "}{brand.hours.toLowerCase()}.
        </p>
        <div className={`${pages.actions} ${pages.centerActions}`}>
          <Link href="/contact" className={pages.btnPrimary}>Book an appointment</Link>
          <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} className={pages.btnGhost}>Call {brand.phone}</a>
        </div>
      </section>

      <section className={pages.section}>
        <div className={pages.wrap}>
          <div className={pages.cards}>
            {expect.map((e) => (
              <div key={e.num} className={pages.card}>
                <div className={pages.num}>{e.num}</div>
                <h3 className={pages.h3}>{e.title}</h3>
                <p style={{ margin: 0, color: "var(--js-ink-soft)", lineHeight: 1.65 }}>{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={pages.dark}>
        <div className={pages.wrap} style={{ paddingBlock: "clamp(3rem,6vw,5rem)", textAlign: "center" }}>
          <p className={pages.eyebrow}><span /> Getting here</p>
          <h2 className={pages.h2}>62 W 47th St, Suite 505</h2>
          <p className={pages.p} style={{ maxWidth: "48ch", margin: "0 auto 1.5rem" }}>
            Between 5th &amp; 6th Avenue, steps from Rockefeller Center. Nearest trains:
            B/D/F/M to 47–50 Sts–Rockefeller Center. Please book ahead so we can have
            your stones ready.
          </p>
          <Link href="/contact" className={pages.btnPrimary}>Reserve your viewing</Link>
        </div>
      </section>
    </main>
  );
}
