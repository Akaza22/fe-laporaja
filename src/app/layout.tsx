import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomToaster from '../components/CustomToaster';
import SplashScreen from '@/components/ui/SplashScreen';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LaporAja - Aduan Publik Cepat",
  description: "Platform pengaduan masyarakat yang transparan dan responsif.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LaporAja",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A", // Warna tema bar browser (Slate-900)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="tes.png" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className={inter.className}>
        <SplashScreen />
        <main>{children}</main>
        <CustomToaster />
      </body>
    </html>
  );
}