import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { brand } from "@/data/site";
import { absoluteUrl, articleSchema, faqPageSchema, type FaqItem } from "@/lib/seo/schema";

const TITLE = "Diamond Buying Guide — 4 Cs, Shapes & Lab-Grown vs Natural";
const DESCRIPTION = "A plain-English diamond buying guide from Jewel Stone in NYC covering cut, color, clarity, carat, shapes, certification, and lab-grown versus natural diamonds.";
const SOURCES = [
  { label: "GIA — How to Buy a Diamond and understand the 4 Cs", href: "https://4cs.gia.edu/en-us/how-to-buy-a-diamond/" },
  { label: "GIA — Natural and laboratory-grown diamond differences", href: "https://www.gia.edu/gia-news-research/difference-between-natural-laboratory-grown-diamonds" },
];

const EDUCATION_FAQS: FaqItem[] = [
  {
    question: "What are the 4 Cs of a diamond?",
    answer: "The 4 Cs are cut, color, clarity, and carat weight. Together they describe a diamond’s light performance, visible color, inclusions, and weight, but they should be judged alongside shape and proportion rather than as four isolated grades.",
  },
  {
    question: "Which diamond C matters most?",
    answer: "Cut usually has the greatest effect on visible brilliance because proportion and facet alignment control how light returns through the stone. A well-cut diamond can look brighter and more lively than a heavier diamond with weaker proportions.",
  },
  {
    question: "Are lab-grown diamonds real diamonds?",
    answer: "Yes. Lab-grown diamonds have the same carbon crystal structure and optical properties as natural diamonds. The main differences are origin, rarity, and price, and both can receive independent grading reports from laboratories such as GIA or IGI.",
  },
  {
    question: "How should I choose a diamond?",
    answer: "Start with the wearer’s preferred shape, set a total budget, prioritize cut and eye-clean clarity, compare natural and lab-grown options, and inspect the grading report before selecting the setting.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/education" },
  openGraph: {
    title: `${TITLE} | Jewel Stone`,
    description: DESCRIPTION,
    images: [{ url: absoluteUrl("/images/atelier/loose-diamonds.jpg"), alt: "Loose diamonds examined at the Jewel Stone worktable" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Jewel Stone`,
    description: DESCRIPTION,
    images: [absoluteUrl("/images/atelier/loose-diamonds.jpg")],
  },
};

export default function EducationPage() {
  return (
    <>
      <ArticlePage
        eyebrow="Diamond guide"
        title="How to choose a diamond"
        intro="Fact-first guidance on the 4 Cs, shape, certification, and the differences between natural and lab-grown diamonds."
        author={{ name: brand.owner, title: brand.title, href: "/about" }}
        media={{ src: "/images/atelier/loose-diamonds.jpg", alt: "Loose diamonds examined at the Jewel Stone worktable" }}
        sources={SOURCES}
        sections={[
          { h: EDUCATION_FAQS[0].question, body: [EDUCATION_FAQS[0].answer] },
          { h: EDUCATION_FAQS[1].question, body: [EDUCATION_FAQS[1].answer] },
          { h: "How does diamond color grading work?", body: ["Diamond color grades run from D (colorless) toward Z (noticeably warm). Many near-colorless diamonds in the E–H range appear bright and white once set, especially when metal color and shape are considered together."] },
          { h: "What does diamond clarity measure?", body: ["Clarity grades internal inclusions and external blemishes from Flawless and Internally Flawless through VVS, VS, SI, and Included grades. For jewelry, an eye-clean diamond often gives better value than paying for microscopic perfection that is invisible without magnification."] },
          { h: "Does carat mean diamond size?", body: ["Carat measures weight, not face-up dimensions. Two diamonds with the same carat weight can look different in size because shape, depth, and cut proportions change how much surface area is visible."] },
          { h: "Which diamond shape should I choose?", body: ["Round diamonds maximize classic brilliance. Oval, pear, and marquise shapes can appear larger for their weight; emerald and Asscher cuts show broad, architectural flashes; cushion and radiant cuts balance softness with lively sparkle."] },
          {
            h: EDUCATION_FAQS[2].question,
            body: [EDUCATION_FAQS[2].answer],
            table: {
              headers: ["Factor", "Natural diamond", "Lab-grown diamond"],
              rows: [
                ["Origin", "Formed geologically", "Created in controlled conditions"],
                ["Material", "Carbon crystal", "Carbon crystal"],
                ["Appearance", "Diamond optical properties", "Diamond optical properties"],
                ["Certification", "GIA or IGI when graded", "GIA or IGI when graded"],
                ["Best for", "Geological rarity and provenance", "More size or grade for the budget"],
              ],
            },
          },
          {
            h: EDUCATION_FAQS[3].question,
            body: [EDUCATION_FAQS[3].answer],
            steps: [
              "Choose a shape the wearer already responds to.",
              "Set a total budget that includes the setting and any custom work.",
              "Prioritize strong cut and proportions before chasing carat weight.",
              "Select a clarity grade that is eye-clean at normal viewing distance.",
              "Compare certified natural and lab-grown stones side by side.",
              "Verify the grading report and final measurements before approval.",
            ],
          },
        ]}
      />
      <JsonLd data={articleSchema({
        title: TITLE,
        description: DESCRIPTION,
        path: "/education",
        image: "/images/atelier/loose-diamonds.jpg",
        citations: SOURCES.map((source) => source.href),
      })} />
      <JsonLd data={faqPageSchema(EDUCATION_FAQS)} />
    </>
  );
}
