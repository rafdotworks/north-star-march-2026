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
 * - Begins appearing at 70% scroll progress (approaching footer)
 * - Fully visible by 90% scroll progress (at footer)
 * - Covers and hides the lingering sticky label from the last project
 *
 * PERFORMANCE:
 * - Uses requestAnimationFrame for smooth scroll handling
 * - Passive scroll listener for better scroll performance
 * - Conditional rendering when fully hidden
 */

"use client"

import { useEffect, useState, useRef } from "react"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Scroll progress (0-1) at which fade begins */
const FADE_START = 0.75

/** Scroll progress (0-1) at which component is fully visible */
const FADE_END = 0.98

/** Blur amount for backdrop filter */
const BLUR_AMOUNT = 60

/** Saturation adjustment for backdrop filter */
const SATURATION = "1.02"

export function ScrollTopBlur() {
  const [opacity, setOpacity] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight

          // Calculate scroll progress (0 to 1)
          const scrollProgress = scrollY / (documentHeight - windowHeight)

          // Calculate opacity based on scroll progress
          let newOpacity = 0

          if (scrollProgress >= FADE_END) {
            newOpacity = 1
            setIsVisible(true)
          } else if (scrollProgress > FADE_START) {
            const fadeRange = FADE_END - FADE_START
            const fadeProgress = (scrollProgress - FADE_START) / fadeRange
            newOpacity = fadeProgress
            setIsVisible(true)
          } else {
            newOpacity = 0
            setIsVisible(false)
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

  // Don't render if not visible
  if (!isVisible && opacity === 0) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-[25]"
      style={{
        height: "200px",
        opacity: opacity,
        background: "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background)) 60%, hsla(var(--background) / 0.9) 80%, hsla(var(--background) / 0) 100%)",
        backdropFilter: `blur(${BLUR_AMOUNT}px) saturate(${SATURATION})`,
        WebkitBackdropFilter: `blur(${BLUR_AMOUNT}px) saturate(${SATURATION})`,
        maskImage: "linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.7) 75%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.7) 75%, transparent 100%)",
      }}
    />
  )
}
