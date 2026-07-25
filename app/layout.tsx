import type { Metadata } from "next";
import "@fontsource/marcellus";
import "@fontsource-variable/figtree";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ScrollTop } from "@/components/site/ScrollTop";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, SITE_URL, websiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jewel Stone NYC | Natural, PIECUT & Lab-Grown Diamond Jewelry",
    template: "%s | Jewel Stone",
  },
  description:
    "Built on family jewelry knowledge since 1980. Jewel Stone crafts rare, one-of-a-kind PIECUT and antique diamond pieces, lab-grown and natural diamonds, and bespoke jewelry made in-house — viewable in 3D and AR.",
  keywords: [
    "Jewel Stone",
    "PIECUT diamond jewelry",
    "antique diamond jewelry",
    "lab-grown diamonds",
    "natural diamonds",
    "GIA certified diamonds",
    "IGI certified diamonds",
    "NYC Diamond District jeweler",
    "bespoke diamond jewelry",
    "try on jewelry AR",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Ishan Vaghani", url: "/about" }],
  creator: "Jewel Stone",
  publisher: "Jewel Stone NY LLC",
  category: "Fine jewelry",
  openGraph: {
    title: "Jewel Stone NYC | Natural, PIECUT & Lab-Grown Diamond Jewelry",
    description:
      "Rare PIECUT and antique pieces, certified lab-grown and natural diamonds, and bespoke jewelry from NYC's Diamond District — viewable in 3D and AR.",
    url: SITE_URL,
    siteName: "Jewel Stone",
    locale: "en_US",
    images: [{
      url: `${SITE_URL}/images/hero/campaign-01.webp`,
      width: 1671,
      height: 941,
      alt: "Jewel Stone diamond jewelry photographed in New York",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jewel Stone | Rare PIECUT & Diamond Jewelry NYC",
    description:
      "Rare PIECUT and antique pieces, certified diamonds, and bespoke jewelry from NYC's Diamond District — viewable in 3D and AR.",
    images: [`${SITE_URL}/images/hero/campaign-01.webp`],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  } : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ScrollTop />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteNav />
        <div id="main-content" tabIndex={-1} className="site-shell">{children}</div>
        <SiteFooter />
        <CartDrawer />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
