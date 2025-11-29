/**
 * ============================================================================
 * SCROLL BOTTOM BLUR COMPONENT
 * ============================================================================
 *
 * A decorative overlay that creates a soft blur effect at the bottom of the
 * viewport. Fades out as the user scrolls down the page.
 *
 * BEHAVIOR:
 * - Visible at page load with full opacity
 * - Begins fading at 5% scroll progress
 * - Fully hidden by 25% scroll progress
 * - Once dismissed, never shows again (permanent until page refresh)
 *
 * PERFORMANCE:
 * - Uses requestAnimationFrame for smooth scroll handling
 * - Passive scroll listener for better scroll performance
 * - Conditional rendering when fully hidden
 *
 * NOTE: Backdrop blur can be expensive on low-end mobile devices.
 */

"use client"

import { useEffect, useState, useRef } from "react"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Scroll progress (0-1) at which fade begins */
const FADE_START = 0.05

/** Scroll progress (0-1) at which component is fully hidden */
const FADE_END = 0.15

/** Blur amount for backdrop filter (reduced for accessibility) */
const BLUR_AMOUNT = "40px"
const BLUR_AMOUNT_REDUCED = "0px"

/** Saturation adjustment for backdrop filter */
const SATURATION = "1.02"

export function ScrollBottomBlur() {
  const [opacity, setOpacity] = useState(1)
  const [isVisible, setIsVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ticking = useRef(false)
  const hasBeenDismissed = useRef(false) // Once dismissed, never show again

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
      // If already dismissed, don't process scroll
      if (hasBeenDismissed.current) return

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight

          // Calculate scroll progress (0 to 1)
          const scrollProgress = scrollY / (documentHeight - windowHeight)

          // Calculate opacity based on scroll progress
          let newOpacity = 1
          if (scrollProgress >= FADE_END) {
            newOpacity = 0
            setIsVisible(false)
            hasBeenDismissed.current = true // Permanently dismiss
          } else if (scrollProgress > FADE_START) {
            const fadeRange = FADE_END - FADE_START
            const fadeProgress = (scrollProgress - FADE_START) / fadeRange
            newOpacity = 1 - fadeProgress
          } else {
            newOpacity = 1
          }

          setOpacity(newOpacity)
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

  // Don't render if dismissed or fully faded out
  if (hasBeenDismissed.current || (!isVisible && opacity === 0)) {
    return null
  }

  const blurAmount = prefersReducedMotion ? BLUR_AMOUNT_REDUCED : BLUR_AMOUNT

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[25] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        height: "min(40vh, 300px)",
        opacity: opacity,
        background: "linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)) 20%, hsla(var(--background) / 0.9) 40%, hsla(var(--background) / 0.5) 65%, hsla(var(--background) / 0) 100%)",
        backdropFilter: `blur(${blurAmount}) saturate(${SATURATION})`,
        WebkitBackdropFilter: `blur(${blurAmount}) saturate(${SATURATION})`,
        maskImage: "linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 75%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 75%, transparent 100%)",
      }}
    />
  )
}
