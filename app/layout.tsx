import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { ConsoleEasterEgg } from "./components/ConsoleEasterEgg";

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
  title: "Raf V. - AI Product Designer & Design Engineer",
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
    "fintech UX",
  ],
  metadataBase: new URL("https://raf.works"),
  openGraph: {
    title: "Raf V. - AI Product Designer & Design Engineer",
    description:
      "Blending design, code, and systems thinking to craft interfaces where people and intelligent agents collaborate  with clarity, taste, and intent.",
    url: "https://raf.works",
    siteName: "Raf Works",
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
    title: "Raf V. - AI Product Designer & Design Engineer",
    description:
      "Blending design, code, and systems thinking to craft interfaces where people and intelligent agents collaborate  with clarity, taste, and intent.",
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
    <html
      lang="en"
      className={`${ronzino.variable} ${eduMarist.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preload critical images for faster loading */}
        <link rel="preload" as="image" href="/work/new-work/cb-0.png" />
        <link rel="preload" as="image" href="/work/new-work/vf-0.png" />
        <link rel="preload" as="image" href="/work/new-work/atlas-1.png" />
      </head>
      <body className={ronzino.className} suppressHydrationWarning>
        <div className="mobile-gutter">{children}</div>
        <Analytics />
        <ConsoleEasterEgg />
      </body>
    </html>
  );
}
