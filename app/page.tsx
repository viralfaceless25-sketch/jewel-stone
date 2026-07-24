import { BrandHome } from "@/components/home/BrandHome";

// New arrivals rotate once per UTC day; rebuild the page on that cadence.
export const revalidate = 86400;

export default function HomePage() {
  return <BrandHome />;
}
