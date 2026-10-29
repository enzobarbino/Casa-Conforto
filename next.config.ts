import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mlstatic.com",
      },
      {
        protocol: "http",
        hostname: "**.mlstatic.com",
      },
    ],
  },
};

export default nextConfig;
