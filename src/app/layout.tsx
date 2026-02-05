import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}