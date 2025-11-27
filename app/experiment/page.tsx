/**
 * ============================================================================
 * EXPERIMENTAL LAYOUT PAGE - Ryhan.me Inspired
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

import React, { useEffect, useState, useCallback } from "react"
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
import { ContentGrid } from "../experiment-components/ContentGrid"
import { WorkCard } from "../experiment-components/WorkCard"
import { SectionDivider } from "../experiment-components/SectionDivider"
import { ScrollBottomBlur } from "../experiment-components/ScrollBottomBlur"
import NavigationItem from "@/app/components/NavigationItem"
import SideTray from "@/app/new/components/SideTray"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"

// ============================================================================
// CONSTANTS
// ============================================================================

/** Scroll threshold for theme toggle (0-1, where 0.5 = 50% scroll) */
const SCROLL_THEME_THRESHOLD = 0.5

/** Number of projects to prioritize for image loading */
const PRIORITY_IMAGE_COUNT = 2

/**
 * Main Experiment Page Component
 */
export default function ExperimentPage() {
  // Theme system integration
  const { prefersDark, isReady } = useSystemTheme()

  // Scroll-based theme toggle (triggers at 50% scroll)
  const [isThemeToggled, setIsThemeToggled] = useState<boolean>(false)

  // Timezone message
  const timezoneMessage = useTimezoneMessage()

  // Navigation state management
  const [selectedArticle, setSelectedArticle] = useState<"about" | "writing" | null>(null)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // Scroll-based theme toggle at threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = window.scrollY / scrollHeight
      setIsThemeToggled(scrollProgress >= SCROLL_THEME_THRESHOLD)
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

  // Event handlers for navigation
  const handleNavClick = useCallback((articleId: "about" | "works" | "writing") => {
    setSelectedArticle(articleId === "works" ? null : articleId)
  }, [])

  const handleSideTrayClose = useCallback(() => {
    if (selectedArticle === "writing") {
      // Close the entire writing tray (both list and article views)
      setSelectedArticle(null)
      setSelectedWritingArticle(null)
    } else {
      setSelectedArticle(null)
    }
  }, [selectedArticle])

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
          <h1 className="text-lg md:text-xl font-light text-foreground tracking-wide leading-tight font-edu-marist">
            Raf V.
          </h1>
        </div>

        {/* Title, about text, and links - right column, baseline-aligned with name */}
        <div className="flex flex-col flex-1">
          {/* Title - baseline-aligned with "Raf. V" */}
          <span className="text-xs md:text-sm text-muted-foreground/60 font-light leading-tight mb-4 md:mb-5">
            Senior AI Product Designer
          </span>


          {/* Navigation items */}
          <nav className="flex flex-col gap-0 group/nav">
            <NavigationItem
              label="About"
              articleId="about"
              onClick={handleNavClick}
              ariaLabel="About Raf"
            />
            <NavigationItem
              label="Writing"
              articleId="writing"
              onClick={handleNavClick}
              ariaLabel="View Writing"
            />
          </nav>
        </div>
      </div>

      {/* ========================================================================
       * SECTION DIVIDER
       * ======================================================================== */}
      <SectionDivider />

      {/* ========================================================================
       * WORKS SECTION
       * ======================================================================== */}
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

      {/* ========================================================================
       * FOOTER SECTION - DIVIDER + TIMEZONE/WEATHER MESSAGE
       * ======================================================================== */}
      
      {/* Divider - spans both columns */}
      <SectionDivider />

      {/* Footer content - aligned with project titles (right column) */}
      {/* Empty left column */}
      <div className="hidden md:block" />

      {/* Timezone/Weather message - right column, aligned with project titles */}
      <div className="pt-4 md:pt-6 pb-12 md:pb-16">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed transition-colors duration-200">
          {timezoneMessage}
        </p>

        {/* Footer links */}
        <nav className="flex flex-row gap-4 group/nav pt-3">
          <a
            href="https://www.linkedin.com/in/raffaelevitaledesign/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/40 md:group-hover/nav:text-muted-foreground/30 md:hover:!text-muted-foreground/60 leading-[1.5]"
            style={{
              WebkitTapHighlightColor: 'transparent',
              transition: 'color var(--theme-transition-duration, 2s) var(--theme-transition-easing, ease)'
            }}
          >
            LinkedIn
          </a>
          <a
            href="/cv"
            className="text-[10px] text-muted-foreground/40 md:group-hover/nav:text-muted-foreground/30 md:hover:!text-muted-foreground/60 leading-[1.5]"
            style={{
              WebkitTapHighlightColor: 'transparent',
              transition: 'color var(--theme-transition-duration, 2s) var(--theme-transition-easing, ease)'
            }}
          >
            CV
          </a>
          <a
            href="https://x.com/lfgraf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/40 md:group-hover/nav:text-muted-foreground/30 md:hover:!text-muted-foreground/60 leading-[1.5]"
            style={{
              WebkitTapHighlightColor: 'transparent',
              transition: 'color var(--theme-transition-duration, 2s) var(--theme-transition-easing, ease)'
            }}
          >
            X
          </a>
        </nav>
      </div>
      </ContentGrid>

      {/* Scroll-based bottom blur effect */}
      <ScrollBottomBlur />

      {/* SideTray component for About and Writing */}
      <SideTray
        articleId={selectedArticle === "writing" ? selectedWritingArticle : selectedArticle === "about" ? "about" : null}
        onClose={handleSideTrayClose}
        isWritingMode={selectedArticle === "writing"}
        onArticleSelect={selectedArticle === "writing" ? setSelectedWritingArticle : undefined}
      />
    </>
  )
}
