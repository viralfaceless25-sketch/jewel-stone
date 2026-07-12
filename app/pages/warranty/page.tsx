import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";

export const metadata: Metadata = {
  title: "Warranty & Care",
  description: "Lifetime craftsmanship warranty and complimentary care for every Jewel Stone piece.",
  alternates: { canonical: "/pages/warranty" },
};

export default function WarrantyPage() {
  return (
    <ArticlePage
      eyebrow="For a lifetime"
      title="Warranty & care"
      intro="A Jewel Stone piece is made to be worn every day and passed on. We stand behind it for life."
      sections={[
        { h: "Lifetime craftsmanship warranty", body: ["Every piece is covered against manufacturing defects for life. If a prong, setting, or finish ever fails through normal wear, we repair it at no charge."] },
        { h: "Complimentary care", body: ["Bring your piece back to 47th Street any time for professional cleaning, inspection, and re-polishing. We'll check the setting and tighten stones to keep it secure."] },
        { h: "What's not covered", body: ["Loss, theft, and accidental damage aren't covered by the warranty — we recommend insuring your piece (we're happy to provide an appraisal for coverage). Everyday wear and tear repairs are handled at fair, transparent rates."] },
        { h: "Appraisals & certificates", body: ["Each piece ships with its GIA or IGI certificate. Need an insurance appraisal or a replacement document? Just ask — we keep records of every piece we make."] },
      ]}
    />
  );
}
