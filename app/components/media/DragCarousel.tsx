/**
 * ============================================================================
 * DRAG CAROUSEL - app/components/media/DragCarousel.tsx
 * ============================================================================
 *
 * Horizontal carousel with drag, wheel, keyboard, and mobile support.
 * Dual rendering modes: Framer Motion (desktop) vs CSS scroll-snap (mobile).
 *
 * FEATURES:
 * - Horizontal drag/swipe navigation (desktop + mobile)
 * - Mouse wheel horizontal scroll (desktop only)
 * - Keyboard navigation with Arrow Left/Right (desktop only)
 * - Native CSS scroll-snap on mobile for hardware acceleration
 * - Touch and mouse support with momentum physics
 * - Respects reduced motion preferences
 * - Accessible with ARIA labels and keyboard focus
 *
 * Used by: WorkCard.tsx for projects with carousel enabled
 */

"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import { motion, useMotionValue, useReducedMotion, animate } from "framer-motion"

// Animation constants
const WHEEL_SCROLL_RATIO = 0.4 // Scroll 40% of container width per wheel
const SLIDE_WIDTH = 800 // px
const SLIDE_GAP = 12 // px (from gap-3)
const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
}

interface DragCarouselProps {
  children: React.ReactNode
  className?: string
  isMobile?: boolean // Enable mobile CSS scroll-snap mode
}

/**
 * Horizontal drag carousel with dual rendering modes.
 * Desktop: Framer Motion with drag + wheel + keyboard.
 * Mobile: Native CSS scroll-snap for performance.
 */
export function DragCarousel({
  children,
  className = "",
  isMobile = false
}: DragCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const x = useMotionValue(0)

  // Calculate drag constraints based on content width
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })

  const updateConstraints = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      // Allow dragging left by the overflow amount
      setDragConstraints({
        left: -(scrollWidth - clientWidth),
        right: 0
      })
    }
  }, [])

  // Update constraints on mount and when children change
  useEffect(() => {
    updateConstraints()
    // Also update on resize
    window.addEventListener("resize", updateConstraints)
    return () => window.removeEventListener("resize", updateConstraints)
  }, [updateConstraints, children])

  // Clamp value within constraints
  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max)
  }, [])

  // Mouse wheel horizontal scroll (desktop only)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (shouldReduceMotion || isMobile) return

    e.preventDefault()

    const delta = e.deltaY || e.deltaX
    const containerWidth = containerRef.current?.clientWidth || 800
    const scrollAmount = containerWidth * WHEEL_SCROLL_RATIO

    // Calculate new position within constraints
    const currentX = x.get()
    const newX = clamp(
      currentX - (delta > 0 ? scrollAmount : -scrollAmount),
      dragConstraints.left,
      dragConstraints.right
    )

    // Animate to new position with spring
    animate(x, newX, SPRING_CONFIG)
  }, [x, dragConstraints, clamp, shouldReduceMotion, isMobile])

  // Keyboard navigation (desktop only)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (shouldReduceMotion || isMobile) return

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()

      const slideWidth = SLIDE_WIDTH + SLIDE_GAP
      const direction = e.key === 'ArrowLeft' ? 1 : -1
      const currentX = x.get()
      const newX = clamp(
        currentX + (direction * slideWidth),
        dragConstraints.left,
        dragConstraints.right
      )

      // Animate to new position with spring
      animate(x, newX, SPRING_CONFIG)
    }
  }, [x, dragConstraints, clamp, shouldReduceMotion, isMobile])

  // Attach wheel event listener (desktop only)
  useEffect(() => {
    if (isMobile) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel, isMobile])

  // Attach keyboard event listener (desktop only)
  useEffect(() => {
    if (isMobile) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, isMobile])

  // MOBILE RENDERING: Native CSS scroll-snap
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className={`overflow-x-auto hide-scrollbar scroll-snap-x-mandatory ${className}`}
        role="region"
        aria-label="Image carousel"
      >
        <div className="flex gap-3">
          {React.Children.map(children, (child, idx) => (
            <div
              key={idx}
              className="scroll-snap-center"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // DESKTOP RENDERING: Framer Motion with drag + wheel + keyboard
  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{
        cursor: isDragging ? "grabbing" : "grab"
      }}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <motion.div
        className="flex gap-3"
        drag={shouldReduceMotion ? false : "x"}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{
          x,
          touchAction: "pan-y"
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default DragCarousel
