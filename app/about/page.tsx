/**
 * ============================================================================
 * ABOUT PAGE - app/about/page.tsx
 * ============================================================================
 *
 * Minimal biographical page for Raf Vitale.
 *
 * FEATURES:
 * - Vertical layout only (no horizontal scroll)
 * - Centered content with optimal reading width
 * - Small, refined typography (10-14px)
 * - Focus/unfocus text hierarchy
 * - Theme-aware (matches system dark/light preference)
 * - Beautiful, inspiring minimal aesthetic
 *
 * LAYOUT:
 * - Single vertical column
 * - Centered on page
 * - Fixed viewport with vertical scroll if needed
 * - Max width for readability
 *
 * TYPOGRAPHY:
 * - Name: 14px (small, refined)
 * - Location: 10px (tiny, muted)
 * - Bio: 12px (small, elegant)
 */

"use client"

import { useMemo, useEffect } from "react"
import { useSystemTheme } from "@/hooks/use-system-theme"

export default function AboutPage() {
  const { prefersDark, isReady } = useSystemTheme()

  // Only apply theme after client-side detection to prevent hydration mismatch
  const shouldShowDark = useMemo(() => {
    return prefersDark && isReady
  }, [prefersDark, isReady])

  // Apply theme to entire document (html element) for full-page background
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const theme = shouldShowDark ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [shouldShowDark])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-20 overflow-x-hidden">
      <div className="w-full max-w-[600px] mx-auto">
        
        {/* Bio with "R" initial */}
        <div className="space-y-4">
          <p className="type-body leading-relaxed text-foreground transition-colors duration-200">
            <span className="font-edu-marist text-xl md:text-2xl">R</span>
            <br />
            <br />
            Currently Staff UX Designer at Walmart, designing AI-powered recommendation systems for marketplace sellers. Focus: trust, transparency, and safe adoption at scale.
            <br />
            <br />
            <span className="opacity-80">
              Previously founding designer at Theoriq, scaling brand, marketing, and product from 0 to 140k active users in 6 months. Held senior roles at Coinbase (developer tools) and Voiceflow (AI agents, onboarding). Earlier: design systems at Zalando, features at Obvious.
            </span>
            <br />
            <br />
            <span className="opacity-80">
              Studied software engineering. Started in brand design.
            </span>
            <br />
            <br />
            <span className="opacity-80">
              Also: writer, photographer, yogi.
            </span>
          </p>
        </div>

      </div>
    </main>
  )
}
