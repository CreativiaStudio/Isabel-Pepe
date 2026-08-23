import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/init-assets";
import { getOrganizationAndWebsiteSchema } from "@/lib/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.isabelpepe.com'),
  title: {
    default: "Isabel Pepe | Gioielli Demi-Fine in Oro 18K & Regali Esclusivi",
    template: "%s | Isabel Pepe",
  },
  description:
    "Scopri l'Atelier Isabel Pepe: gioielli demi-fine in Oro 18K e Argento 925 pensati per essere indossati ogni giorno. Cofanetto luxury in velluto incluso, garanzia 24 mesi e spedizione express 48h.",
  keywords: [
    "gioielli demi fine",
    "gioielli oro 18k donna",
    "regali gioielli esclusivi",
    "anello solitario lusso accessibile",
    "collana punto luce argento 925",
    "parure regalo donna",
    "gioielli ipoallergenici cofanetto regalo",
    "gioielli demi-fine",
    "gioielli lusso accessibile",
    "argento 925 sterling"
  ],
  authors: [{ name: "Isabel Pepe" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://www.isabelpepe.com",
    siteName: "Isabel Pepe",
    title: "Isabel Pepe — Gioielli Demi-Fine in Oro 18K & Lusso Quotidiano",
    description:
      "L'emozione del lusso accessibile senza compromessi. Creazioni raffinate in Oro 18K, pietre di pura luce e cofanetto regalo incluso in ogni ordine.",
    images: [
      {
        url: "https://www.isabelpepe.com/og-image.jpg",
        secureUrl: "https://www.isabelpepe.com/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Isabel Pepe — Gioielli Demi-Fine in Oro 18K",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isabel Pepe — Gioielli Demi-Fine in Oro 18K & Regali Esclusivi",
    description:
      "Gioielli demi-fine pensati per celebrare la tua luce ogni giorno. Cofanetto regalo luxury e garanzia inclusi.",
    images: ["https://www.isabelpepe.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "zhBoVXVcROJG7C0ebSblYcbHgDkgAHx1dXss2fUGO58",
  },
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import CookieBanner from "@/components/CookieBanner";
import PrivilegeClubModal from "@/components/PrivilegeClubModal";
import Tracker from "@/components/Tracker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootJsonLd = getOrganizationAndWebsiteSchema();

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <WishlistDrawer />
        <CookieBanner />
        <PrivilegeClubModal />
      </body>
    </html>
  );
}


