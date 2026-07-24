import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { brand } from "@/data/site";
import { articleSchema } from "@/lib/seo/schema";

const TITLE = "Editorial Standards & Product Information";
const DESCRIPTION = "How Jewel Stone attributes diamond guidance, checks product information, handles availability, and corrects website content.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pages/editorial-standards" },
};

export default function EditorialStandardsPage() {
  return (
    <>
      <ArticlePage
        eyebrow="Trust & transparency"
        title="Editorial standards"
        intro="How Jewel Stone presents product facts, diamond guidance, commercial information, and corrections."
        author={{ name: brand.owner, title: brand.title, href: "/about" }}
        sections={[
          {
            h: "Who is responsible for the guidance?",
            body: [`Diamond and jewelry guidance is published by Jewel Stone under ${brand.owner}, ${brand.title}. The About page identifies the business experience behind that guidance, while product pages separate measured specifications from general education.`],
          },
          {
            h: "Where do product details come from?",
            body: ["Product names, dimensions, carat weights, materials, grades, certificate references, prices, and media are maintained from Jewel Stone inventory records and available product documentation. Photography, video, and 3D media are labeled as product views rather than independent grading evidence."],
          },
          {
            h: "How are price and availability handled?",
            body: ["Website prices describe the listed configuration. One-of-one availability, final stone selection, custom specifications, taxes, duties, and production timing are confirmed before fulfillment because those details can change by client and destination."],
          },
          {
            h: "How are corrections handled?",
            body: [`If a specification, policy, or educational statement appears inaccurate, contact ${brand.email}. Jewel Stone will compare the page with its source record and correct confirmed errors.`],
          },
          {
            h: "Commercial disclosure",
            body: ["Jewel Stone sells the products and custom services described on this website. Educational pages are intended to help clients ask better questions; they do not replace the grading report or written quotation for a specific stone or piece."],
          },
        ]}
      />
      <JsonLd data={articleSchema({ title: TITLE, description: DESCRIPTION, path: "/pages/editorial-standards" })} />
    </>
  );
}
