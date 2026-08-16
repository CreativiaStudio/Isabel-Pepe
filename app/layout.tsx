import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://isabelpepe.com'),
  title: {
    default: "Isabel Pepe | Gioielli Demi-Fine & Argento 925",
    template: "%s | Isabel Pepe",
  },
  description:
    "Gioielli Demi-Fine in Argento 925 con placcatura Oro 18K (1.0µm) o Rodio ed E-Coating. Cofanetto regalo luxury e garanzia inclusi. Spedizione 24/48h.",
  keywords: [
    "gioielli demi-fine",
    "gioielli lusso accessibile",
    "collana punto luce",
    "orecchini anallergici oro 18k",
    "anello solitario taglio brillante",
    "gioielli placcati oro che non anneriscono",
    "gioielli waterproof",
    "cofanetto regalo gioielli",
    "argento 925 sterling"
  ],
  authors: [{ name: "Isabel Pepe" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://isabelpepe.com",
    siteName: "Isabel Pepe",
    title: "Isabel Pepe — Gioielli Demi-Fine in Oro 18K & Argento 925",
    description:
      "Lusso accessibile senza compromessi. Creazioni esclusive in Argento 925, placcatura Oro 18K a spessore, pietre di pura luce e cofanetto regalo incluso.",
    images: [
      {
        url: "https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Isabel Pepe — Demi-Fine Jewelry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isabel Pepe — Gioielli Demi-Fine in Oro 18K & Argento 925",
    description:
      "Creazioni in Argento 925 con doppio scudo protettivo in Oro 18K ed E-Coating. Cofanetto regalo luxury incluso.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import Tracker from "@/components/Tracker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <WishlistDrawer />
      </body>
    </html>
  );
}
