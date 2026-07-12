/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: static "export" removed so Stripe API routes (/api/checkout, /api/webhook)
  // work. Deploy on Vercel (or any Node host). Set Stripe env vars in .env.local.
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "d360.tech", pathname: "/imaged/**" },
      { protocol: "https", hostname: "viw-us.s3.amazonaws.com", pathname: "/js/**" },
    ],
  },
};

export default nextConfig;
