import { COLOR_CLARITY_LABEL, type Product } from "@/data/products";
import { brand } from "@/data/site";
import { modelFor } from "@/lib/models";

function normalizedSiteUrl(value: string | undefined) {
  try {
    const url = new URL(value || brand.website);
    return url.origin;
  } catch {
    return brand.website;
  }
}

export const SITE_URL = normalizedSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL,
);

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

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export type FaqItem = {
  question: string;
  answer: string;
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": `${SITE_URL}/#organization`,
    name: brand.name,
    legalName: "Jewel Stone NY LLC",
    url: SITE_URL,
    logo: absoluteUrl("/logo-transparent.png"),
    foundingDate: "1980",
    description:
      "NYC Diamond District jeweler creating natural, PIECUT, lab-grown, and custom diamond jewelry in-house.",
    slogan: brand.tagline,
    telephone: brand.phone,
    email: brand.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "62 W 47th St, Suite 505",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10036",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "New York" },
      { "@type": "Country", name: "United States" },
    ],
    knowsAbout: [
      "Natural diamonds",
      "Lab-grown diamonds",
      "PIECUT diamond jewelry",
      "Custom jewelry design",
      "GIA and IGI diamond certification",
    ],
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
      merchantReturnLink: absoluteUrl("/pages/returns"),
    },
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
    inLanguage: "en-US",
  };
}

export function productSchema(product: Product) {
  const model = modelFor(product.slug);
  const images = Array.from(new Set([product.image, ...(product.gallery ?? [])])).map(absoluteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${product.slug}#product`,
    name: product.name,
    image: images,
    description: product.description,
    sku: product.sku,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "Jewel Stone",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      price: product.price,
      priceCurrency: "USD",
      itemCondition: "https://schema.org/NewCondition",
      availability: `https://schema.org/${product.comingSoon ? "PreOrder" : "InStock"}`,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    material: product.material,
    ...(model ? {
      subjectOf: {
        "@type": "3DModel",
        name: `${product.name} interactive 3D model`,
        encoding: {
          "@type": "MediaObject",
          contentUrl: absoluteUrl(model),
          encodingFormat: "model/gltf-binary",
        },
      },
    } : {}),
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

export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema({
  title,
  description,
  path,
  image,
  citations,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  citations?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: absoluteUrl(path),
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    ...(citations?.length ? { citation: citations } : {}),
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#ishan-vaghani`,
      name: brand.owner,
      jobTitle: brand.title,
      worksFor: { "@id": `${SITE_URL}/#organization` },
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#ishan-vaghani`,
    name: brand.owner,
    jobTitle: brand.title,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    knowsAbout: [
      "Diamond selection",
      "Natural and lab-grown diamonds",
      "Custom jewelry design",
      "PIECUT diamond jewelry",
    ],
  };
}

export function itemListSchema(name: string, items: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `${SITE_URL}/products/${product.slug}#product`,
        name: product.name,
        url: `${SITE_URL}/products/${product.slug}`,
        image: absoluteUrl(product.image),
      },
    })),
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
