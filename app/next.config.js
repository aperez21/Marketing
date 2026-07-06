const { withMicrofrontends } = require("@vercel/microfrontends/next/config");

// basePath makes every route in this app (pages and API routes, including
// /api/v1/webhooks/conversion) actually live under /marketing, matching the
// "/marketing/:path*" routing rule that must be declared in GuruSan's own
// microfrontends.json (GuruSan is the default app; this is a child app).
const basePath = "/marketing";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = withMicrofrontends(nextConfig);
