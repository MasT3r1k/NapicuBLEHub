import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  reactStrictMode: false,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
};

export default nextConfig;