/**
 * ============================================================================
 * ROOT LAYOUT - app/layout.tsx
 * ============================================================================
 *
 * Next.js App Router root layout component.
 * Sets up global configuration, fonts, metadata, and analytics.
 *
 * KEY FEATURES:
 * - Custom font loading (Ronzino, Edu Marist)
 * - SEO metadata (Open Graph, Twitter Cards)
 * - Vercel Analytics integration
 * - Console easter egg for developers
 * - Mobile-safe viewport configuration
 *
 * FONTS:
 * - Ronzino: Primary body font (--font-ronzino)
 * - Edu Marist: Secondary/accent font (--font-edu-marist)
 *
 * Both use font-display: swap for performance
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { ConsoleEasterEgg } from "./components/ConsoleEasterEgg";

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

/** Primary body font - Ronzino Regular */
const ronzino = localFont({
  src: "../public/fonts/Ronzino-Regular.otf",
  variable: "--font-ronzino",
  display: "swap", // Show fallback font while loading
});

/** Secondary/accent font - Edu Marist Regular */
const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
  display: "swap",
});

// ============================================================================
// SEO METADATA
// ============================================================================

/** Site metadata for SEO and social sharing */
export const metadata: Metadata = {
  title: "Raf V. - Senior AI Product Designer, Design Engineer",
  description:
    "Blending design, code, and systems thinking to craft interfaces where people and intelligent agents collaborate  with clarity, taste, and intent.",
  keywords: [
    "design systems",
    "AI/agent UX",
    "product design",
    "design engineering",
    "interface design",
    "brand design",
    "systems thinking",
    "UX",
    "Cursor",
    "Claude Code",
  ],
  metadataBase: new URL("https://raf.works"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Raf V. - Senior AI Product Designer, Design Engineer",
    description:
      "With 7+ years in product design and systems thinking, Raf now focuses on how humans and intelligent agents collaborate with clarity and intent.",
    url: "https://raf.works",
    siteName: "Raf V. - Personal Website",
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
    title: "Raf V. - Senior AI Product Designer, Design Engineer",
    description:
      "Blending design, code, and systems thinking to craft interfaces where people and intelligent agents collaborate  with clarity, taste, and intent.",
    creator: "@lfgraf",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ronzino.variable} ${eduMarist.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className={ronzino.className} suppressHydrationWarning>
        <div className="mobile-gutter">{children}</div>
        <Analytics />
        <ConsoleEasterEgg />
      </body>
    </html>
  );
}
