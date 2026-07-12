import { Award, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

const TRUST = [
  { icon: Award, title: "GIA graded", copy: "Independent diamond grading" },
  { icon: RotateCcw, title: "30-day returns", copy: "A considered window to decide" },
  { icon: ShieldCheck, title: "Insured shipping", copy: "Protected from our bench to you" },
  { icon: Sparkles, title: "Lifetime service", copy: "Cleaning and prong care, always" },
] as const;

export function TrustSection() {
  return (
    <section className="border-y border-[var(--hair2)] bg-ivory" aria-labelledby="trust-section-heading">
      <h2 id="trust-section-heading" className="sr-only">The Jewel Stone standard</h2>
      <div className="luxury-shell grid sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, copy }, index) => (
            <article key={title} className={`flex min-h-28 items-center gap-4 px-6 py-5 ${index ? "border-t border-[var(--hair)] sm:[&:nth-child(even)]:border-l lg:border-l lg:border-t-0" : ""}`}>
              <Icon size={18} className="shrink-0 text-champagne" aria-hidden />
              <div><h3 className="font-display text-lg">{title}</h3><p className="mt-1 text-xs text-ink/48">{copy}</p></div>
            </article>
          ))}
      </div>
    </section>
  );
}
