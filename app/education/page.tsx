import type { Metadata } from "next";
import { ArticlePage } from "@/components/pages/ArticlePage";

export const metadata: Metadata = {
  title: "Diamond Education — The 4 Cs & Buying Guide",
  description:
    "Learn the 4 Cs, diamond shapes, and lab-grown vs natural with Jewel Stone's plain-English buying guide.",
  alternates: { canonical: "/education" },
};

export default function EducationPage() {
  return (
    <ArticlePage
      eyebrow="Learn"
      title="Diamond education"
      intro="No jargon. A jeweller's plain-English guide to choosing a stone you'll love for a lifetime."
      media={{ src: "/images/atelier/loose-diamonds.jpg", alt: "Loose diamonds examined at the Jewel Stone worktable" }}
      sections={[
        { h: "Cut — the one that matters most", body: ["Cut isn't shape; it's how well a diamond is proportioned to return light. A superbly cut stone throws fire and brilliance; a poorly cut one looks dull no matter its size. We favour Excellent and Ideal cuts."] },
        { h: "Colour — D to Z", body: ["Colour runs from D (icy colourless) toward Z (warm). Most of our pieces sit in the EF–GH band: bright and white to the eye, without paying a premium for a difference only a lab can see."] },
        { h: "Clarity — how clean", body: ["Clarity grades a stone's inclusions from FL/IF (flawless) through VVS, VS, and SI. We select eye-clean stones — usually VVS to VS — so nothing interrupts the sparkle in real light."] },
        { h: "Carat — weight, not size", body: ["Carat is weight. Two one-carat stones can look very different depending on cut and shape. We help you balance visible size, proportion, and budget — often a well-cut slightly smaller stone outshines a larger one."] },
        { h: "Shapes", body: ["Round maximises brilliance; oval and pear look larger for the weight; emerald and Asscher are calm and architectural; cushion and radiant are soft and fiery; heart and marquise are unmistakably romantic. There's no wrong answer — only what suits the wearer."] },
        { h: "Lab-grown vs natural", body: ["Lab-grown and natural diamonds are chemically and optically identical; the difference is origin and price. Lab-grown offers more size and clarity for the budget; natural carries rarity and provenance. Both are certified — we'll guide you honestly to the right choice for you."] },
      ]}
    />
  );
}
