import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

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
  title: "Raf | Product Designer",
  description:
    "Founding Product Designer and Design Engineer based in Toronto.",
  openGraph: {
    title: "Raf | Product Designer",
    description:
      "Founding Product Designer and Design Engineer based in Toronto.",
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
    title: "Raf | Product Designer",
    description:
      "Founding Product Designer and Design Engineer based in Toronto.",
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
    <html
      lang="en"
      className={`${ronzino.variable} ${eduMarist.variable} dark:bg-[#5C2E2E] dark:text-[#F8F6F1]`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={ronzino.className}>{children}</body>
    </html>
  );
}
