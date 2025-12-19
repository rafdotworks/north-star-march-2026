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
 * - Velocity-based transitions: fast scroll = instant, slow scroll = smooth
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

/** Velocity thresholds for transition duration (px/s) */
const VELOCITY_FAST = 500  // Above this = instant (0ms)
const VELOCITY_SLOW = 200  // Below this = smooth (150ms)
const MAX_TRANSITION_MS = 150

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function ScrollTopBlur() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [transitionMs, setTransitionMs] = useState(MAX_TRANSITION_MS)
  const ticking = useRef(false)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight
          const progress = scrollY / (documentHeight - windowHeight)

          // Calculate scroll velocity (px/s)
          const now = Date.now()
          const deltaY = Math.abs(scrollY - lastScrollY.current)
          const deltaTime = now - lastTime.current
          const velocity = deltaTime > 0 ? (deltaY / deltaTime) * 1000 : 0

          // Map velocity to transition duration
          // Fast (>500px/s) = 0ms, Slow (<200px/s) = 150ms, interpolate between
          let duration: number
          if (velocity > VELOCITY_FAST) {
            duration = 0
          } else if (velocity < VELOCITY_SLOW) {
            duration = MAX_TRANSITION_MS
          } else {
            duration = Math.round(
              MAX_TRANSITION_MS * (1 - (velocity - VELOCITY_SLOW) / (VELOCITY_FAST - VELOCITY_SLOW))
            )
          }

          lastScrollY.current = scrollY
          lastTime.current = now

          setScrollProgress(progress)
          setTransitionMs(duration)
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
        transition: `opacity ${transitionMs}ms ease-out`,
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
          transition: `opacity ${transitionMs}ms ease-out`,
        }}
      />
    </div>
  )
}
