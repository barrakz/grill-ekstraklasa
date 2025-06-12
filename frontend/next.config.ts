import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ekstraklasa-backend.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Dodajemy obsługę przekierowania żądań API w środowisku deweloperskim
  async rewrites() {
    return process.env.NODE_ENV === 'development' ? 
      [
        {
          source: '/api/:path*/',
          destination: 'http://localhost:8000/api/:path*/',
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*/',
        },
      ] : [];
  },
};

export default nextConfig;
