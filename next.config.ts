import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Ensure certificate aliases exist (certificato_perle_oro18k.webp and .jpg)
try {
  const brandDir = path.resolve(process.cwd(), "public/Brand");
  const cleanWebp = path.join(brandDir, "certificato_perle_card_clean.webp");
  const aliasWebp = path.join(brandDir, "certificato_perle_oro18k.webp");
  if (fs.existsSync(cleanWebp) && !fs.existsSync(aliasWebp)) {
    fs.copyFileSync(cleanWebp, aliasWebp);
  }
  const cleanJpg = path.join(brandDir, "certificato_perle_card_clean.jpg");
  const aliasJpg = path.join(brandDir, "certificato_perle_oro18k.jpg");
  if (fs.existsSync(cleanJpg) && !fs.existsSync(aliasJpg)) {
    fs.copyFileSync(cleanJpg, aliasJpg);
  }
} catch (e) {
  // Ignore
}

const nextConfig: NextConfig = {
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
};

export default nextConfig;

