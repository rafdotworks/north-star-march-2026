"use client";

/**
 * Demo page for web-haptics. Renders HapticsDemo and a link back to home.
 * See docs/WEB_HAPTICS.md for API and usage.
 */

import Link from "next/link";
import HapticsDemo from "@/app/components/effects/HapticsDemo";

export default function HapticsDemoPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <Link
          href="/"
          className="type-caption text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          ← Home
        </Link>
      </div>
      <HapticsDemo />
    </main>
  );
}
