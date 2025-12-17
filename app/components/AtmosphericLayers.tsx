/**
 * ============================================================================
 * ATMOSPHERIC LAYERS COMPONENT
 * ============================================================================
 *
 * Creates subtle ambient glow and color wash effects that add depth
 * and atmosphere to the page. All effects adapt to theme changes.
 *
 * LAYER ORDER (bottom to top):
 * - z-3: Color wash (very subtle tint)
 * - z-4: Ambient glow (soft center illumination)
 * - Vignette and grain are handled via body pseudo-elements in CSS
 *
 * BEHAVIOR:
 * - Fixed to viewport
 * - Non-interactive (pointer-events: none)
 * - Respects prefers-reduced-motion
 * - Smooth transition during theme changes
 */

"use client"

import { useEffect, useState } from "react"

export function AtmosphericLayers() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mql.matches)

    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Skip rendering for reduced motion preference
  if (prefersReducedMotion) return null

  return (
    <>
      {/* Color wash - very subtle tint overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 3,
          background: `hsla(var(--wash-hue), var(--wash-saturation), var(--wash-lightness), var(--wash-opacity))`,
          mixBlendMode: "overlay",
          transition: "background 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Ambient glow - soft radial illumination from center-top */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 4,
          background: `radial-gradient(
            ellipse var(--glow-size) at var(--glow-position),
            var(--glow-color) 0%,
            transparent 70%
          )`,
          transition: "background 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </>
  )
}
