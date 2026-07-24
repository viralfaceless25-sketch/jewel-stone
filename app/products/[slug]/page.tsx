import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";
import { absoluteUrl, breadcrumbSchema, productSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    ...(product.comingSoon ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${product.name} | Jewel Stone`,
      description: product.description,
      images: [{ url: absoluteUrl(product.image), alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Jewel Stone`,
      description: product.description,
      images: [absoluteUrl(product.image)],
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);

  return (
    <>
      <ProductView product={product} related={related} />
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Collections", url: "/collections" },
          { name: product.name, url: `/products/${product.slug}` },
        ])}
      />
    </>
  );
}
