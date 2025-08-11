import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tarot-api-r89b.onrender.com', pathname: '/static/**' },
      { protocol: 'https', hostname: 'api.go4it.site', pathname: '/static/**' },
    ],
  },
};

export default nextConfig;
