import type { NextConfig } from "next";

/**
 * Optional same-origin proxy (CORS fallback, OFF by default).
 * Set API_PROXY_TARGET (server-side env, e.g. https://flamesight-api.example.com) and
 * NEXT_PUBLIC_API_BASE_URL="/api" to route browser calls through Next.js instead of
 * calling the backend directly. Only needed if the backend's CORS blocks the front-end origin.
 */
const proxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return proxyTarget ? [{ source: "/api/:path*", destination: `${proxyTarget}/:path*` }] : [];
  },
};

export default nextConfig;
