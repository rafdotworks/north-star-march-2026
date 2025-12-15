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

import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from "react"
import { PictureImage } from "./PictureImage"

/** Base z-index for sticky label stacking */
const Z_INDEX_BASE = 10

/** Fallback gradient shown when image fails to load */
const IMAGE_ERROR_FALLBACK = "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.1) 100%)"

/** Simple gray blur placeholder for instant visual feedback (no text) */
const BLUR_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=="

/** Lazy-loaded video that only loads/plays when visible in viewport */
function LazyVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' } // Start loading slightly before visible
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={isVisible ? src : undefined}
      autoPlay={isVisible}
      muted
      loop
      playsInline
      preload="none"
      className="w-full h-auto object-contain"
    />
  )
}

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
  // Track failed images to show fallback
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Memoize description parsing to avoid recalculation on each render
  const descriptionLines = useMemo(
    () => description.split('\n').filter(line => line.trim() !== ''),
    [description]
  )

  // Memoize event handler to prevent new function creation on each render
  const preventDefault = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault()
  }, [])

  // Handle image load errors gracefully
  const handleImageError = useCallback((src: string) => {
    setFailedImages(prev => new Set(prev).add(src))
  }, [])

  return (
    <div className="flex flex-col md:contents">
      {/* ========================================================================
       * ROW 1: YEAR + ROLE + CONTRACT TYPE + TITLE
       * ======================================================================== */}

      {/* Year, role and contract type label - left column (sticky on desktop) */}
      <div
        className="type-caption text-left md:text-right pt-2 md:pt-8 first:md:pt-0 md:sticky md:top-12 md:bg-background self-baseline"
        style={{ zIndex: Z_INDEX_BASE + projectIndex }}
      >
        <div>{year}</div>
        <div className="mt-0.5">{role}</div>
        <div className="mt-0.5">{contractType}</div>
      </div>

      {/* Title - right column */}
      <h2 className="type-title pt-6 md:pt-8 first:pt-0 self-baseline -order-1 md:order-none">
        {title}
      </h2>

      {/* ========================================================================
         * ROW 2: EMPTY + DESCRIPTION
         * ======================================================================== */}

      {/* Empty left column */}
      <div className="hidden md:block" />

      {/* Description - right column */}
      <p className="type-body mt-3 md:mt-0">
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
      <div className="mt-5 md:mt-4 mb-16 md:mb-10 flex flex-col gap-3 md:gap-4">
        {images.map((src, idx) => {
          const isVideo = /\.(mov|mp4|webm)$/i.test(src)
          const hasFailed = failedImages.has(src)

          return (
            <div
              key={`${src}-${idx}`}
              className="relative w-full select-none"
              onDragStart={preventDefault}
              onContextMenu={preventDefault}
            >
              {isVideo ? (
                <LazyVideo src={src} />
              ) : hasFailed ? (
                // Fallback for failed images - maintains aspect ratio
                <div
                  className="w-full aspect-[3/2] rounded-sm"
                  style={{ background: IMAGE_ERROR_FALLBACK }}
                  aria-label={`${altText} - Image unavailable`}
                />
              ) : (
                <PictureImage
                  src={src}
                  alt={`${altText} - Image ${idx + 1}`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="w-full h-auto object-contain pointer-events-none"
                  loading={priority ? "eager" : "lazy"}
                  priority={priority}
                  quality={85}
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  draggable={false}
                  onError={() => handleImageError(src)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
