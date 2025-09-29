import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { ConsoleEasterEgg } from "./components/ConsoleEasterEgg";
import { ThemeProvider } from "@/components/theme-provider";

const ronzino = localFont({
  src: "../public/fonts/Ronzino-Regular.otf",
  variable: "--font-ronzino",
  display: "swap",
});

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Raf",
  description: "Senior Designer and Design Engineer based in Toronto",
  metadataBase: new URL("https://raf.works"),
  openGraph: {
    title: "Raf",
    description: "Senior Designer and Design Engineer based in Toronto",
    url: "https://raf.works",
    siteName: "Raf",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raf",
    description: "Senior Designer and Design Engineer based in Toronto",
    creator: "@lfgraf",
    images: ["/og-image.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ronzino.variable} ${eduMarist.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preload critical images for faster loading */}
        <link rel="preload" as="image" href="/work/cb-d.png" />
        <link rel="preload" as="image" href="/work/voiceflow-landing.png" />
        <link rel="preload" as="image" href="/work/theoriq-prod-hero.png" />
      </head>
      <body className={ronzino.className}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <ConsoleEasterEgg />
      </body>
    </html>
  );
}
