import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { SITE_URL } from "@/lib/seo/schema";

const CATEGORY_SLUGS = [
  "engagement-rings",
  "rings",
  "wedding-bands",
  "earrings",
  "pendants",
  "bracelets",
  "necklaces",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/collections",
    ...CATEGORY_SLUGS.map((s) => `/collections/${s}`),
    "/diamonds",
    "/custom",
    "/about",
    "/contact",
    "/showroom",
    "/education",
    "/pages/faq",
    "/pages/shipping",
    "/pages/returns",
    "/pages/warranty",
    "/pages/editorial-standards",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...products
      .filter((p) => !p.comingSoon && p.category !== "Custom Jewelry")
      .map((product) => ({
        url: `${SITE_URL}/products/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
  ];
}
