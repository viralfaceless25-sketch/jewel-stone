import { ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { StaggerItem, StaggerReveal } from "@/components/SectionReveal";

const REVIEWS = [
  {
    name: "Sarah M.",
    location: "New York, NY",
    text: "My engagement ring is absolutely stunning. The diamond quality is exceptional, cleaner than anything I saw in traditional retailers. Ishan was patient and knowledgeable throughout.",
    date: "March 2025"
  },
  {
    name: "James T.",
    location: "Chicago, IL",
    text: "Custom wedding band came out perfect. Matched my wife's ring exactly. The process was clear, pricing was transparent, and delivery was faster than expected.",
    date: "February 2025"
  },
  {
    name: "Priya K.",
    location: "San Francisco, CA",
    text: "I was skeptical about lab-grown diamonds until I saw them in person. I saved thousands and Jewel Stone made the whole experience feel personal.",
    date: "January 2025"
  },
  {
    name: "Michael R.",
    location: "Miami, FL",
    text: "Ordered a 3CT tennis bracelet as an anniversary gift. The craftsmanship is top-tier, and the piece feels far above the price point.",
    date: "April 2025"
  },
  {
    name: "Allison B.",
    location: "Austin, TX",
    text: "From selection to delivery, this was the most considered jewelry purchase I've made. The GIA report gave me complete confidence.",
    date: "December 2024"
  },
  {
    name: "Daniel W.",
    location: "Boston, MA",
    text: "Ishan personally walked me through every diamond option. Three weeks later I had a custom pendant that looked like it belonged in a major maison case.",
    date: "May 2025"
  }
];

export function ReviewsSection() {
  return (
    <section className="bg-ivory py-24">
      <div className="luxury-shell">
        <SectionHeader eyebrow="Customer stories" title="Every piece has a story." />
        <StaggerReveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <StaggerItem key={`${review.name}-${review.date}`}>
              <article className="bezel-outer h-full">
                <div className="bezel-inner flex h-full flex-col p-6">
                  <p className="text-sm tracking-[0.08em] text-rose" aria-label="Five-star rating">
                    ★★★★★
                  </p>
                  <h3 className="mt-4 text-[0.9rem] font-semibold text-ink">{review.name}</h3>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-ink/40">
                    {review.location}
                  </p>
                  <p className="mt-3 flex-1 text-[0.875rem] leading-[1.75] text-ink/65">{review.text}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-rose/10 pt-4">
                    <span className="text-[0.6rem] text-ink/35">{review.date}</span>
                    <span className="inline-flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-rose/70">
                      <ShieldCheck size={10} aria-hidden="true" />
                      Verified Purchase
                    </span>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
