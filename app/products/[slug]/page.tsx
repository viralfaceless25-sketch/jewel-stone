import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import { products } from "@/data/products";
import { publicCatalog, publicStateFor } from "@/lib/admin/inventory";
import { absoluteUrl, breadcrumbSchema, productSchema } from "@/lib/seo/schema";

export const revalidate = 60;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = (await publicCatalog()).find((candidate) => candidate.slug === params.slug);
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

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const catalog = await publicCatalog();
  const product = catalog.find((candidate) => candidate.slug === params.slug);
  if (!product) notFound();
  const availability = await publicStateFor(product.slug);
  const related = catalog
    .filter((candidate) => candidate.category === product.category && candidate.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <ProductView product={product} related={related} availability={availability} />
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
