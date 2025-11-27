/**
 * ============================================================================
 * WORK CARD COMPONENT
 * ============================================================================
 *
 * Displays a single work project in the two-column grid layout.
 *
 * GRID STRUCTURE (each card spans multiple rows):
 * Row 1: Year + Role + Contract Type (left) | Title (right)
 * Row 2: Empty (left) | Description (right)
 * Row 3: Empty (left) | Images (right) - full width, vertical stack
 *
 * NOTE: Role and contract type labels are now shown as a sticky element in the left column,
 * managed by the parent page component.
 *
 * FEATURES:
 * - Responsive typography
 * - Full-width images in vertical stack
 * - Optimized image loading (priority for above-fold content)
 */

"use client"

import React, { memo, useMemo, useCallback } from "react"
import Image from "next/image"

/** Base z-index for sticky label stacking */
const Z_INDEX_BASE = 10

interface WorkCardProps {
  year: string
  role: string
  contractType: string
  title: string
  description: string
  images: string[]
  altText: string
  priority?: boolean
  projectIndex?: number
}

/**
 * WorkCard Component
 *
 * Renders a project card with year, role, contract type, title, description, and images.
 * Spans multiple grid rows (year+role+contract/title, description, images).
 *
 * Features minimal typography and full-width images in vertical stack.
 * Wrapped in memo() to prevent unnecessary re-renders when parent state changes.
 */
export const WorkCard = memo(function WorkCard({
  year,
  role,
  contractType,
  title,
  description,
  images,
  altText,
  priority = false,
  projectIndex = 0
}: WorkCardProps) {
  // Memoize description parsing to avoid recalculation on each render
  const descriptionLines = useMemo(
    () => description.split('\n').filter(line => line.trim() !== ''),
    [description]
  )

  // Memoize event handler to prevent new function creation on each render
  const preventDefault = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault()
  }, [])
  return (
    <div className="contents">
      {/* ========================================================================
       * ROW 1: YEAR + ROLE + CONTRACT TYPE + TITLE
       * ======================================================================== */}

      {/* Year, role and contract type label - left column (sticky on desktop) */}
      <div
        className="text-left md:text-right text-[11px] text-muted-foreground/50 font-light pt-6 md:pt-8 first:pt-0 md:sticky md:top-12 md:bg-background self-baseline"
        style={{ zIndex: Z_INDEX_BASE + projectIndex }}
      >
        <div>{year}</div>
        <div className="mt-0.5">{role}</div>
        <div className="mt-0.5">{contractType}</div>
      </div>

      {/* Title - right column */}
      <h2 className="text-sm font-normal text-foreground pt-3 md:pt-8 first:pt-0 self-baseline font-edu-marist">
        {title}
      </h2>

      {/* ========================================================================
         * ROW 2: EMPTY + DESCRIPTION
         * ======================================================================== */}

      {/* Empty left column */}
      <div className="hidden md:block" />

      {/* Description - right column */}
      <p className="text-xs text-muted-foreground/60 leading-relaxed mt-1">
        {descriptionLines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < descriptionLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>

      {/* ========================================================================
         * ROW 3: EMPTY + IMAGE GALLERY (VERTICAL STACK, FULL WIDTH)
         * ======================================================================== */}

      {/* Empty left column */}
      <div className="hidden md:block" />

      {/* Full-width vertical media stack - right column */}
      <div className="mt-3 md:mt-4 mb-16 md:mb-10 flex flex-col gap-3 md:gap-4">
        {images.map((src, idx) => {
          const isVideo = /\.(mov|mp4|webm)$/i.test(src)

          return (
            <div
              key={`${src}-${idx}`}
              className="relative w-full select-none"
              onDragStart={preventDefault}
              onContextMenu={preventDefault}
            >
              {isVideo ? (
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto object-contain"
                />
              ) : (
                <Image
                  src={src}
                  alt={`${altText} - Image ${idx + 1}`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="w-full h-auto object-contain pointer-events-none"
                  loading={priority && idx === 0 ? "eager" : "lazy"}
                  priority={priority && idx === 0}
                  quality={85}
                  draggable={false}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
