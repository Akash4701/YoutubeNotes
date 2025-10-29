import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Ignores TS errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
