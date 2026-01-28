import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Make backend URL available at build time if needed
  env: {
    BACKEND_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/public/:path*',
        destination: `${BACKEND_URL}/public/:path*`,
      },
    ];
  },
};

export default nextConfig;