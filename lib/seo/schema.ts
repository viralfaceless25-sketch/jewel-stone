import { COLOR_CLARITY_LABEL, type Product } from "@/data/products";

export const SITE_URL = "https://www.jewelstone.com";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type ReviewInput = {
  author: string;
  rating: number;
  body?: string;
  datePublished?: string;
};

type AggregateRatingInput = {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
};

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "JewelryStore"],
    "@id": `${SITE_URL}/#organization`,
    name: "Jewel Stone",
    url: SITE_URL,
    logo: absoluteUrl("/logo-transparent.png"),
    foundingDate: "1980",
    description:
      "Built on family jewelry knowledge since 1980, Jewel Stone creates one-of-a-kind diamond jewelry in-house.",
    slogan: "Made in-house since 1980",
    address: {
      "@type": "PostalAddress",
      streetAddress: "NYC Diamond District",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10036",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.instagram.com/jewelstone",
      "https://www.facebook.com/jewelstone",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Jewel Stone",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={query}`,
      },
      "query-input": "required name=query",
    },
  };
}

export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${product.slug}#product`,
    name: product.name,
    image: [product.image, ...(product.gallery ?? [])].map(absoluteUrl),
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Jewel Stone",
    },
    // Pricing is quote-only, so no `price` is published here. Emitting one would
    // surface a price in search results that the site itself never shows.
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      availability: `https://schema.org/${product.comingSoon ? "PreOrder" : "InStock"}`,
    },
    material: product.material,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Cut",
        value: product.centerStone,
      },
      {
        "@type": "PropertyValue",
        name: "Clarity",
        value: COLOR_CLARITY_LABEL,
      },
      {
        "@type": "PropertyValue",
        name: "Carat",
        value: product.carats,
        unitText: "CT",
      },
    ],
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function reviewSchema(review: ReviewInput) {
  return {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    ...(review.body ? { reviewBody: review.body } : {}),
    ...(review.datePublished ? { datePublished: review.datePublished } : {}),
  };
}

export function aggregateRatingSchema(rating: AggregateRatingInput) {
  return {
    "@type": "AggregateRating",
    ratingValue: rating.ratingValue,
    reviewCount: rating.reviewCount,
    bestRating: rating.bestRating ?? 5,
    worstRating: rating.worstRating ?? 1,
  };
}
