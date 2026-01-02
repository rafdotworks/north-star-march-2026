/**
 * ============================================================================
 * SECTION DIVIDER COMPONENT
 * ============================================================================
 *
 * Horizontal line that spans both columns of the grid layout.
 * Separates the header section from the works section.
 *
 * USAGE:
 * - Spans both columns (col-span-1 on mobile, col-span-2 on desktop)
 * - Uses theme-aware border color
 * - Generous vertical spacing
 */

import React from "react"

/**
 * SectionDivider Component
 *
 * Renders a horizontal divider line that spans both grid columns.
 * Features subtle opacity for minimal aesthetic.
 */
export function SectionDivider() {
  return (
    <div className="col-span-1 md:col-span-2 border-t border-border/20 my-6 md:my-8" />
  )
}
