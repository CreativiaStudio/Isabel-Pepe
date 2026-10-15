import type { NextConfig } from "next";
import fs from "fs";
import path from "path";



const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Aumentato da 1MB a 50MB per consentire caricamenti multipli
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/tiktok',
        destination: '/?utm_source=tiktok&utm_medium=organic_social&utm_campaign=bio_link',
        permanent: false,
      },
      {
        source: '/bio',
        destination: '/?utm_source=social_bio&utm_medium=organic_social&utm_campaign=bio_link',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
