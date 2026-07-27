/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: static "export" removed so Stripe API routes (/api/checkout, /api/webhook)
  // work. Deploy on Vercel (or any Node host). Set Stripe env vars in .env.local.
  reactStrictMode: true,
  experimental: {
    // pdf-parse/pdfjs break when webpack bundles them server-side
    // ("Object.defineProperty called on non-object") — load them natively.
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
  images: {
    // `unoptimized` was required by the old static export; that export is gone
    // (see note above), so optimisation is back on. Without it every <Image>
    // ships the raw 1600x1600 catalogue JPEG — even into a 76px thumbnail.
    // Needs `sharp`, which is a dependency.
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "d360.tech", pathname: "/imaged/**" },
      { protocol: "https", hostname: "viw-us.s3.amazonaws.com", pathname: "/js/**" },
    ],
  },
};

export default nextConfig;
