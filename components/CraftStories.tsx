import Image from "next/image";
import { ButtonLink } from "@/components/Buttons";

export function CraftStories() {
  return (
    <section className="editorial-section bg-ivory" aria-labelledby="craft-stories-heading">
      <div className="luxury-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <figure className="reveal border border-[var(--hair)] bg-[#141416] p-4 sm:p-8">
          <div className="relative aspect-[4/5]">
            <Image src="/images/atelier/bench-setting.jpg" alt="A Jewel Stone piece being set by hand at the NYC Diamond District bench" fill sizes="(min-width:1024px) 46vw, 92vw" className="object-contain p-2" />
          </div>
          <figcaption className="border-t border-[var(--hair)] pt-4 text-[.58rem] uppercase tracking-[.2em] text-ink/45">The bench · 47th Street, New York</figcaption>
        </figure>
        <div className="reveal">
          <p className="eyebrow">Our philosophy</p>
          <h2 id="craft-stories-heading" className="mt-5 font-display text-[clamp(3.2rem,6vw,6.2rem)] leading-[.94] tracking-[-.025em]">Beauty is in the eye of the <em className="editorial-italic">beholder.</em></h2>
          <p className="mt-8 max-w-lg text-lg leading-8 text-ink/62">Every Jewel Stone piece begins with a person, not a production line. We choose the silhouette, metal, proportions and stone together; then matched diamonds are cut, balanced and set one prong at a time by hand.</p>
          <p className="mt-5 max-w-lg leading-8 text-ink/55">Finished to your fit, engraved when you wish, inspected and boxed — ready to leave our hands and become part of your story.</p>
          <div className="mt-9"><ButtonLink href="/custom" variant="gold">Begin a custom piece</ButtonLink></div>
        </div>
      </div>
    </section>
  );
}
