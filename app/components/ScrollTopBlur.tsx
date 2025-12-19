/**
 * ============================================================================
 * SCROLL TOP BLUR COMPONENT
 * ============================================================================
 *
 * A decorative overlay that hides the sticky label ("From 2016 / Designer /
 * Contract") when scrolling to the footer area.
 *
 * BEHAVIOR:
 * - Hidden at page load (opacity 0)
 * - Begins appearing at 93% scroll progress (synced with theme blend)
 * - Fully visible by 100% scroll progress (at footer)
 * - Uses easeOutCubic to match theme transition timing
 * - Subtle glow accent matches bottom blur visual language
 *
 * PERFORMANCE:
 * - Uses requestAnimationFrame for smooth scroll handling
 * - Passive scroll listener for better scroll performance
 * - Conditional rendering when fully hidden
 */

"use client"

import { useEffect, useState, useRef, useMemo } from "react"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Scroll progress (0-1) at which fade begins - synced with theme blend */
const FADE_START = 0.93

/** Scroll progress (0-1) at which component is fully visible */
const FADE_END = 1.0

/** Maximum glow opacity */
const MAX_GLOW_OPACITY = 0.04

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function ScrollTopBlur() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight
          const progress = scrollY / (documentHeight - windowHeight)
          setScrollProgress(progress)
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Calculate derived values with easing
  const { opacity, glowOpacity } = useMemo(() => {
    if (scrollProgress <= FADE_START) {
      return { opacity: 0, glowOpacity: 0 }
    }

    const fadeRange = FADE_END - FADE_START
    const fadeProgress = Math.min(1, (scrollProgress - FADE_START) / fadeRange)

    // Use cubic ease-out to match theme blend timing
    const opacity = easeOutCubic(fadeProgress)

    // Glow increases with scroll progress
    const glowOpacity = MAX_GLOW_OPACITY * fadeProgress

    return { opacity, glowOpacity }
  }, [scrollProgress])

  // Don't render when effectively invisible
  if (opacity < 0.01) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-[50]"
      style={{
        height: "min(35vh, 250px)",
        opacity,
        // No CSS transition - responds instantly to JS-driven opacity (matches theme blend)
      }}
    >
      {/* Soft gradient fade - no hard edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            color-mix(in srgb, var(--bg), transparent 10%) 0%,
            color-mix(in srgb, var(--bg), transparent 30%) 30%,
            color-mix(in srgb, var(--bg), transparent 60%) 60%,
            color-mix(in srgb, var(--bg), transparent 85%) 80%,
            transparent 100%
          )`,
        }}
      />

      {/* Subtle glow accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "70%",
          height: "50%",
          background: `radial-gradient(ellipse at center top,
            hsla(var(--accent) / ${glowOpacity}) 0%,
            transparent 70%
          )`,
          filter: "blur(30px)",
          opacity: glowOpacity > 0 ? 1 : 0,
          // No CSS transition - instant response at all scroll speeds
        }}
      />
    </div>
  )
}
