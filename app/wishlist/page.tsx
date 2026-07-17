import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";
import pages from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved Jewel Stone pieces. One-of-a-kind — save them before they're gone.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <main className={pages.page}>
      <section className={pages.hero}>
        <p className={pages.eyebrow}><span /> Saved</p>
        <h1 className={pages.h1}>Your wishlist</h1>
        <p className={pages.lede}>Signature pieces and made-to-order designs you&apos;re considering, kept together for comparison.</p>
      </section>
      <WishlistView />
    </main>
  );
}
