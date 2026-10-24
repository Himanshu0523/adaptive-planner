import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const API_BACKEND_URL = process.env.API_BACKEND_URL || "http://localhost:4000";

const nextConfig = {
  /* Optionally proxy /api/v1/* if external API_BACKEND_URL is configured */
  async rewrites() {
    if (process.env.API_BACKEND_URL) {
      return [
        {
          source: "/api/v1/:path*",
          destination: `${process.env.API_BACKEND_URL}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
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
};


export default nextConfig;
