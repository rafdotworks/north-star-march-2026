/**
 * ============================================================================
 * SECTION COMPONENT - app/components/layout/Section.tsx
 * ============================================================================
 *
 * Full-width sectioned layout row with equal-width columns.
 * Used for the main page: hero and work sections.
 *
 * LAYOUT:
 * - Full width, horizontal padding (px-3 md:px-20), max-width 1400px (or 1600px + md:px-16 when wide)
 * - Grid: 1 col (mobile) → 2 cols (md) → 2 or 3 cols (lg per columns prop)
 * - Column gap: 2.5vw; items-start (top-aligned)
 *
 * SPACING:
 * - Default: mb-[16vh] between sections
 * - last: use padding-bottom instead of margin so page end has no extra gap
 *
 * Used by: app/page.tsx
 */

import React from "react"

interface SectionProps {
  children: React.ReactNode
  /** 2 = two equal columns at md/lg; 3 = three columns at lg (default) */
  columns?: 2 | 3
  /** When true, apply pb instead of mb for last section on page */
  last?: boolean
  /** When true, use wider max-width (1600px) and moderate desktop padding for more image space */
  wide?: boolean
  className?: string
}

const SECTION_PADDING = "px-3 md:px-20"
const SECTION_PADDING_WIDE = "px-3 md:px-16"
const SECTION_GAP = "gap-x-[2.5vw]"
const SECTION_SPACING = "mb-[16vh]"

/** Shared content-band constants for wide layout (work sections + footer). Single source of truth for horizontal edges. */
export const CONTENT_AREA_WIDE_MAX_WIDTH = "max-w-[1600px]"
export const CONTENT_AREA_WIDE_PADDING = SECTION_PADDING_WIDE

export function Section({ children, columns = 3, last = false, wide = false, className = "" }: SectionProps) {
  const gridCols =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  const maxWidth = wide ? CONTENT_AREA_WIDE_MAX_WIDTH : "max-w-[1400px]"
  const padding = wide ? SECTION_PADDING_WIDE : SECTION_PADDING

  return (
    <section
      className={`w-full ${maxWidth} mx-auto ${padding} ${gridCols} ${SECTION_GAP} grid items-start ${last ? "pb-[16vh]" : SECTION_SPACING} ${className}`.trim()}
    >
      {children}
    </section>
  )
}
