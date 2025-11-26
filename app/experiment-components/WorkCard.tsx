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
 * managed by the parent ExperimentPage component.
 *
 * FEATURES:
 * - Responsive typography
 * - Full-width images in vertical stack
 * - Optimized image loading (priority for above-fold content)
 */

"use client"

import React from "react"
import Image from "next/image"

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
 */
export function WorkCard({
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
  return (
    <div className="contents">
      {/* ========================================================================
       * ROW 1: YEAR + ROLE + CONTRACT TYPE + TITLE
       * ======================================================================== */}

      {/* Year, role and contract type label - left column (sticky on desktop, replaces previous) */}
      <div 
        className="text-right text-[11px] text-muted-foreground/50 font-light pt-6 md:pt-8 first:pt-0 md:sticky md:top-12 md:bg-background self-baseline"
        style={{ zIndex: 10 + projectIndex }}
      >
        <div>{year}</div>
        <div className="mt-0.5">{role}</div>
        <div className="mt-0.5">{contractType}</div>
      </div>

      {/* Title - right column */}
      <h2 className="text-xs font-normal text-foreground pt-6 md:pt-8 first:pt-0 self-baseline">
        {title}
      </h2>

      {/* ========================================================================
         * ROW 2: EMPTY + DESCRIPTION
         * ======================================================================== */}

      {/* Empty left column */}
      <div className="hidden md:block" />

      {/* Description - right column */}
      <p className="text-xs text-muted-foreground/60 leading-relaxed mt-1">
        {description.split('\n').filter(line => line.trim() !== '').map((line, index, array) => (
          <React.Fragment key={index}>
            {line}
            {index < array.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>

      {/* ========================================================================
         * ROW 3: EMPTY + IMAGE GALLERY (VERTICAL STACK, FULL WIDTH)
         * ======================================================================== */}

      {/* Empty left column */}
      <div className="hidden md:block" />

      {/* Full-width vertical image stack - right column */}
      <div className="mt-3 md:mt-4 mb-8 md:mb-10 flex flex-col gap-3 md:gap-4">
        {images.map((imageSrc, idx) => (
          <div
            key={`${imageSrc}-${idx}`}
            className="relative w-full select-none"
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={imageSrc}
              alt={`${altText} - Image ${idx + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto object-contain pointer-events-none"
              loading={priority && idx === 0 ? "eager" : "lazy"}
              priority={priority && idx === 0}
              quality={85}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
