import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React, { type ErrorInfo } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raf - Founding Product Designer who codes",
  description: "Raf is a founding product designer who codes.",
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>
          Something went wrong. Please check the console for error details.
        </h1>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          console.log('RootLayout rendered');
          window.onerror = function(message, source, lineno, colno, error) {
            console.error('Caught by window.onerror:', message, source, lineno, colno, error);
          };
        `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white text-black`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
