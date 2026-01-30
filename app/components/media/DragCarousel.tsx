/**
 * ============================================================================
 * DRAG CAROUSEL - app/components/media/DragCarousel.tsx
 * ============================================================================
 *
 * Horizontal carousel with native smooth scrolling.
 * Uses browser's native overflow scroll for optimal performance and UX.
 *
 * FEATURES:
 * - Smooth horizontal scroll (magic mouse, trackpad, touch)
 * - Hardware-accelerated touch scrolling on mobile
 * - No JavaScript scroll calculations - fully native
 * - Hidden scrollbar with maintained functionality
 * - Consistent behavior across desktop and mobile
 *
 * Used by: WorkCard.tsx for projects with carousel enabled
 */

"use client"

import React from "react"

interface DragCarouselProps {
  children: React.ReactNode
  className?: string
}

/**
 * Horizontal carousel with native smooth scrolling.
 * Uses CSS overflow-x for smooth, hardware-accelerated scrolling.
 */
export function DragCarousel({
  children,
  className = ""
}: DragCarouselProps) {
  return (
    <div 
      className={`overflow-x-auto hide-scrollbar ${className}`}
      style={{ 
        scrollbarWidth: 'none',  // Firefox
        WebkitOverflowScrolling: 'touch',  // iOS momentum scrolling
        scrollBehavior: 'smooth'  // Smooth scrolling animation
      }}
      role="region"
      aria-label="Image carousel"
    >
      <div className="flex gap-3 pb-2">
        {children}
      </div>
    </div>
  )
}

export default DragCarousel
