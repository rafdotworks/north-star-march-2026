"use client";

/**
 * ============================================================================
 * 404 NOT FOUND PAGE - app/not-found.tsx
 * ============================================================================
 *
 * Simple 404 page with a static portrait.
 * Features:
 * - Full viewport height layout with no scrolling
 * - Centered portrait with generous white space
 * - Subtle "Page not found" messaging
 * - Link back to home page
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-8 px-6">
        {/* Portrait Container */}
        <div className="relative w-[400px] max-w-[90vw] aspect-[3/4] flex items-center justify-center">
          {/* Portrait Image */}
          <Image
            src="/image-portrait.jpeg"
            alt="Portrait"
            fill
            className="object-contain"
            priority
            quality={90}
          />
        </div>

        {/* Text and Link */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-foreground/60 text-base tracking-tight">
            Page not found
          </p>
          <Link
            href="/"
            className="text-foreground/80 hover:text-foreground text-sm tracking-tight transition-colors duration-200 underline-offset-4 hover:underline"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

