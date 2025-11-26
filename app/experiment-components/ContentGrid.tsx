/**
 * ============================================================================
 * CONTENT GRID COMPONENT
 * ============================================================================
 *
 * Two-column grid layout wrapper for the experimental page.
 * Inspired by ryhan.me's editorial layout with generous whitespace.
 *
 * GRID STRUCTURE:
 * - Mobile: Single column stack
 * - Desktop: Two columns (narrow left label column + wide right content column)
 * - Left column: ~240-300px (labels, years, metadata) - right-aligned
 * - Right column: Fluid width (main content) - left-aligned
 * - Gap: Generous horizontal and vertical spacing
 *
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Stacks to single column with reduced padding
 * - Tablet: Introduces two-column grid with medium gaps
 * - Desktop: Full grid with maximum spacing and wider container
 */

import React from "react"

interface ContentGridProps {
  children: React.ReactNode
}

/**
 * ContentGrid Component
 *
 * Wraps all page content in a responsive two-column grid system.
 */
export function ContentGrid({ children }: ContentGridProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-8 md:px-20 pt-0 md:pt-0 pb-8 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-x-8 md:gap-x-16 gap-y-1 md:gap-y-2">
          {children}
        </div>
      </div>
    </div>
  )
}
