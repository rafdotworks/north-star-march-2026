import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raf | Founding Product Designer",
  description:
    "Founding product designer who codes. Currently leading design at Theoriq.",
  openGraph: {
    title: "Raf | Founding Product Designer",
    description:
      "Founding product designer who codes. Currently leading design at Theoriq.",
    url: "https://raf.works",
    siteName: "Raf",
    images: [
      {
        url: "/og-image.png", // You'll need to add this image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raf | Founding Product Designer",
    description:
      "Founding product designer who codes. Currently leading design at Theoriq.",
    creator: "@lfgraf",
    images: ["/og-image.png"], // Same image as OG
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
