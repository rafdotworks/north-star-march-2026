/**
 * ============================================================================
 * DEC-2025 PAGE - app/dec-2025/page.tsx
 * ============================================================================
 *
 * Two-column grid layout inspired by ryhan.me, showcasing work in a clean,
 * editorial style with significant whitespace and elegant typography.
 *
 * LAYOUT:
 * - Left column: Labels, role, contract type, metadata (narrow, right-aligned)
 * - Right column: Content (wider, left-aligned)
 * - Responsive: Stacks to single column on mobile
 *
 * CONTENT:
 * - Header: Name, title, location, social links
 * - Divider: Horizontal line
 * - Works: All portfolio projects with role, contract type, title, description (with year), image
 */

"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSystemTheme } from "@/hooks/use-system-theme"
import {
  PROJECT_ORDER,
  PROJECTS,
  PROJECT_CAPTIONS,
  PROJECT_YEARS,
  PROJECT_ROLES,
  PROJECT_CONTRACT_TYPES,
  PROJECT_DISPLAY_NAMES,
  IMAGE_ALT_TEXT
} from "@/app/config/portfolioConfig"
import { ContentGrid } from "../components/page-specific/ContentGrid"
import { WorkCard } from "../components/media/WorkCard"
import { SectionDivider } from "../components/layout/SectionDivider"
import { ScrollBottomBlur } from "../components/layout/ScrollBottomBlur"
import FooterLink from "../components/layout/FooterLink"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Scroll threshold for theme toggle (0-1, where 0.5 = 50% scroll) */
const SCROLL_THEME_THRESHOLD = 0.5

/** Number of projects to prioritize for image loading */
const PRIORITY_IMAGE_COUNT = 3

/**
 * Dec 2025 Page Component
 */
export default function Dec2025Page() {
  // Theme system integration
  const { prefersDark, isReady } = useSystemTheme()

  // Scroll-based theme toggle (triggers at 50% scroll)
  const [isThemeToggled, setIsThemeToggled] = useState<boolean>(false)

  // Timezone message
  const timezoneMessage = useTimezoneMessage()

  // Scroll-based theme toggle at threshold (throttled with rAF)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
          const scrollProgress = window.scrollY / scrollHeight
          setIsThemeToggled(scrollProgress >= SCROLL_THEME_THRESHOLD)
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // XOR logic: invert theme when scroll crosses threshold
  // prefersDark=true + isThemeToggled=false → dark
  // prefersDark=true + isThemeToggled=true → light (inverted)
  const effectiveTheme = isReady ? (prefersDark !== isThemeToggled) : prefersDark

  // Apply theme to html element
  useEffect(() => {
    if (typeof document !== 'undefined' && isReady) {
      const theme = effectiveTheme ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [effectiveTheme, isReady])

  return (
    <>
      <ContentGrid>
      {/* ========================================================================
         * HEADER SECTION
         * ======================================================================== */}

      {/* Header wrapper - spans both columns, uses flex for baseline alignment, takes 80% viewport height */}
      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-baseline gap-0 md:gap-8 lg:gap-16 min-h-[80vh] justify-center md:justify-start py-[10vh] md:pt-[20vh] md:pb-[20vh]">
        {/* Name - left column, right-aligned, baseline-aligned with title */}
        <div className="text-left md:text-right md:w-[180px] lg:w-[200px] flex-shrink-0">
          <h1 className="type-heading">
            Raf V.
          </h1>
        </div>

        {/* Title and links - right column, baseline-aligned with name */}
        <div className="flex flex-col flex-1">
          {/* Title - baseline-aligned with "Raf. V" */}
          <span className="text-xs md:text-sm text-muted-foreground/60 font-light leading-tight mb-4 md:mb-5 text-shimmer">
            AI Senior Product Designer
          </span>
        </div>
      </div>

      {/* ========================================================================
       * SECTION DIVIDER
       * ======================================================================== */}
      <SectionDivider />

      {/* ========================================================================
       * WORKS SECTION - Wrapper contains sticky elements
       * ======================================================================== */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-x-8 md:gap-x-16 gap-y-1 md:gap-y-2">
        {PROJECT_ORDER.map((projectKey, index) => {
          const project = PROJECTS[projectKey]
          const images = project.images
          const title = PROJECT_DISPLAY_NAMES[projectKey] || projectKey
          const altText = IMAGE_ALT_TEXT[images[0]] || `${title} project showcase`

          return (
            <WorkCard
              key={projectKey}
              year={PROJECT_YEARS[projectKey] || ""}
              role={PROJECT_ROLES[projectKey] || ""}
              contractType={PROJECT_CONTRACT_TYPES[projectKey] || ""}
              title={title}
              description={PROJECT_CAPTIONS[projectKey]}
              images={images}
              altText={altText}
              priority={index < PRIORITY_IMAGE_COUNT}
              projectIndex={index}
            />
          )
        })}

        {/* Divider inside works wrapper */}
        <div className="col-span-1 md:col-span-2 border-t border-border/20 my-6 md:my-8" />

        {/* Spacer to let sticky label scroll away */}
        <div className="col-span-1 md:col-span-2 h-[50vh]" />
      </div>

      {/* ========================================================================
       * FOOTER SECTION - HERO-STYLE WITH CONTENT AT BOTTOM
       * ======================================================================== */}

      {/* Footer hero - spans both columns, content at bottom */}
      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-end gap-0 md:gap-8 lg:gap-16 min-h-[50vh] justify-end py-[10vh] md:pt-[20vh] md:pb-[10vh]">
        {/* Empty left column for grid alignment */}
        <div className="hidden md:block md:w-[180px] lg:w-[200px] flex-shrink-0" />

        {/* Footer content - right column, md:flex-1 for width on desktop only */}
        <div className="flex flex-col md:flex-1">
          <p className="type-body-sm transition-colors duration-200">
            {timezoneMessage}
          </p>

          {/* Footer links */}
          <nav className="flex flex-row gap-5 group/nav pt-3">
            <FooterLink href="https://www.linkedin.com/in/raffaelevitaledesign/" label="LinkedIn" external />
            <FooterLink href="mailto:raf@raf.works" label="Email" />
            <FooterLink href="https://x.com/rafdotworks" label="X" external />
          </nav>
        </div>
      </div>
      </ContentGrid>

      {/* Scroll-based blur effects */}
      <ScrollBottomBlur />
    </>
  )
}
