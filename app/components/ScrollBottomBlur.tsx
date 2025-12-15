/**
 * ============================================================================
 * SCROLL BOTTOM BLUR COMPONENT
 * ============================================================================
 *
 * A decorative overlay that creates a soft blur effect at the bottom of the
 * viewport. Fades out gradually as the user scrolls down the page.
 *
 * BEHAVIOR:
 * - Visible at page load with full opacity
 * - Fades gradually from 0% to 20% scroll progress
 * - Blur intensity decreases with scroll
 * - Subtle glow accent peaks mid-transition
 * - Re-appears if user scrolls back up (no permanent dismissal)
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

/** Scroll progress (0-1) at which fade begins */
const FADE_START = 0.0

/** Scroll progress (0-1) at which component is fully hidden */
const FADE_END = 0.20

/** Scroll progress at which glow accent peaks */
const GLOW_PEAK = 0.08

/** Maximum blur amount in pixels */
const MAX_BLUR = 48

/** Maximum glow opacity */
const MAX_GLOW_OPACITY = 0.10

/** Saturation adjustment for backdrop filter */
const SATURATION = "1.02"

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutQuad(t: number): number {
  return 1 - Math.pow(1 - t, 2)
}

export function ScrollBottomBlur() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ticking = useRef(false)

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

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
  const { opacity, blurAmount, glowOpacity } = useMemo(() => {
    // Opacity: 1 at start, 0 at FADE_END with cubic ease-out
    const fadeProgress = Math.min(1, Math.max(0, (scrollProgress - FADE_START) / (FADE_END - FADE_START)))
    const opacity = 1 - easeOutCubic(fadeProgress)

    // Blur: reduces gradually as user scrolls
    const blurAmount = prefersReducedMotion ? 0 : MAX_BLUR * (1 - fadeProgress * 0.7)

    // Glow: peaks at GLOW_PEAK, then fades
    let glowOpacity = 0
    if (scrollProgress <= GLOW_PEAK) {
      glowOpacity = easeOutQuad(scrollProgress / GLOW_PEAK) * MAX_GLOW_OPACITY
    } else if (scrollProgress < FADE_END) {
      const glowFade = (scrollProgress - GLOW_PEAK) / (FADE_END - GLOW_PEAK)
      glowOpacity = MAX_GLOW_OPACITY * (1 - easeOutQuad(glowFade))
    }

    return { opacity, blurAmount, glowOpacity }
  }, [scrollProgress, prefersReducedMotion])

  // Don't render when effectively invisible
  if (opacity < 0.01) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[25]"
      style={{
        height: "min(50vh, 400px)",
        opacity,
        transition: "opacity 150ms ease-out",
      }}
    >
      {/* Main gradient layer with blur */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top,
            hsl(var(--background)) 0%,
            hsl(var(--background)) 15%,
            hsla(var(--background) / 0.95) 30%,
            hsla(var(--background) / 0.8) 50%,
            hsla(var(--background) / 0.4) 70%,
            hsla(var(--background) / 0.1) 85%,
            hsla(var(--background) / 0) 100%
          )`,
          backdropFilter: `blur(${blurAmount}px) saturate(${SATURATION})`,
          WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${SATURATION})`,
          maskImage: "linear-gradient(to top, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
        }}
      />

      {/* Subtle glow accent */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "80%",
          height: "60%",
          background: `radial-gradient(ellipse at center bottom,
            hsla(var(--accent) / ${glowOpacity}) 0%,
            transparent 70%
          )`,
          filter: "blur(40px)",
          opacity: glowOpacity > 0 ? 1 : 0,
          transition: "opacity 200ms ease-out",
        }}
      />
    </div>
  )
}
