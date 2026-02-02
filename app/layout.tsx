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
import { ConsoleEasterEgg } from "./components/effects/ConsoleEasterEgg";

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

/** Monospace font - CoFo Sans Mono */
const cofoSansMono = localFont({
  src: "../public/fonts/CoFoSansMono-Regular.ttf",
  variable: "--font-mono",
  display: "swap",
});

// ============================================================================
// SEO METADATA
// ============================================================================

/** Site metadata for SEO and social sharing */
export const metadata: Metadata = {
  title: "Raf - Staff AI Product Designer",
  description:
    "Product designer and design-engineer with 8+ years of experience focused on clarity, decision-making, and human judgment in AI-driven systems.",
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
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Raf - Staff AI Product Designer",
    description:
      "Product designer and design-engineer with 8+ years of experience focused on clarity, decision-making, and human judgment in AI-driven systems.",
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
    title: "Raf - Staff AI Product Designer",
    description:
      "Product designer and design-engineer with 8+ years of experience focused on clarity, decision-making, and human judgment in AI-driven systems.",
    creator: "@rafdotworks",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#131619" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ronzino.variable} ${eduMarist.variable} ${cofoSansMono.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className={ronzino.className} suppressHydrationWarning>
        {/* SVG filter for film grain effect - hidden from DOM */}
        <svg
          className="absolute w-0 h-0"
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            <filter id="grain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                type="saturate"
                values="0"
                in="noise"
                result="monoNoise"
              />
            </filter>
          </defs>
        </svg>

        <div className="mobile-gutter">{children}</div>
        <Analytics />
        <ConsoleEasterEgg />
      </body>
    </html>
  );
}
