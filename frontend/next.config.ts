import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/public/:path*',
        destination: 'http://127.0.0.1:8000/public/:path*',
      },
      // Fallback for other /api routes if needed, 
      // though explicit routes in app/api/* take precedence.
    ];
  },
};

export default nextConfig;
