import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, SITE_URL, websiteSchema } from "@/lib/seo/schema";

// New "AR Vitrine" skin: high-contrast luxury serif for display, Inter for UI.
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jewel Stone | Diamond Jewelry NYC",
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
  openGraph: {
    title: "Jewel Stone | Rare PIECUT & Diamond Jewelry NYC",
    description:
      "Rare PIECUT and antique pieces, certified lab-grown and natural diamonds, and bespoke jewelry from NYC's Diamond District — viewable in 3D and AR.",
    url: SITE_URL,
    siteName: "Jewel Stone",
    images: [{ url: "/logo-transparent.png", alt: "Jewel Stone" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jewel Stone | Rare PIECUT & Diamond Jewelry NYC",
    description:
      "Rare PIECUT and antique pieces, certified diamonds, and bespoke jewelry from NYC's Diamond District — viewable in 3D and AR.",
    images: ["/logo-transparent.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteNav />
        <div id="main-content" tabIndex={-1} className="site-shell">{children}</div>
        <SiteFooter />
        <CartDrawer />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
