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

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useSystemTheme } from "@/hooks/use-system-theme"
import {
  PROJECT_ORDER,
  PROJECTS,
  PROJECT_CAPTIONS,
  PROJECT_YEARS,
  PROJECT_ROLES,
  PROJECT_CONTRACT_TYPES,
  IMAGE_ALT_TEXT
} from "@/app/config/portfolioConfig"
import { ContentGrid } from "../experiment-components/ContentGrid"
import { WorkCard } from "../experiment-components/WorkCard"
import { SectionDivider } from "../experiment-components/SectionDivider"
import NavigationItem from "@/app/components/NavigationItem"
import SideTray from "@/app/new/components/SideTray"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"

/**
 * Utility: Parse caption to extract description
 * Year is now separate from description, so we just return the caption as-is
 */
function parseCaption(caption: string): { description: string } {
  // Description no longer contains year prefix, so we return it directly
  return {
    description: caption
  }
}

/**
 * Utility: Get human-readable project title
 */
function getProjectTitle(projectKey: string): string {
  const titles: Record<string, string> = {
    theo: "Theoriq",
    cb: "Coinbase Developer Platform",
    vf: "Voiceflow",
    atlas: "Crypto Platforms",
    defituna: "DeFi Tuna",
    curbcut: "CurbCut",
    zalando: "Zalando B2B Design System",
    earlyworks: "Early Works",
    nationalArchives: "National Archives"
  }
  return titles[projectKey] || projectKey
}

/**
 * Main Experiment Page Component
 */
export default function ExperimentPage() {
  // Theme system integration
  const { prefersDark, isReady } = useSystemTheme()
  const shouldShowDark = prefersDark && isReady

  // Atlas theme toggle state
  const [isInAtlasSection, setIsInAtlasSection] = useState<boolean>(false)
  const [hasEnteredAtlas, setHasEnteredAtlas] = useState<boolean>(false)
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false)
  const [originalTheme, setOriginalTheme] = useState<boolean | null>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  // Timezone message
  const timezoneMessage = useTimezoneMessage()

  // Sticky year, role and contract type labels state
  const [currentYear, setCurrentYear] = useState<string>("")
  const [currentRole, setCurrentRole] = useState<string>("")
  const [currentContractType, setCurrentContractType] = useState<string>("")
  const projectRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Navigation state management
  const [selectedArticle, setSelectedArticle] = useState<"about" | "writing" | null>(null)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // Initialize year, role and contract type with first project on mount
  useEffect(() => {
    if (PROJECT_ORDER.length > 0) {
      const firstProjectKey = PROJECT_ORDER[0]
      setCurrentYear(PROJECT_YEARS[firstProjectKey] || "")
      setCurrentRole(PROJECT_ROLES[firstProjectKey] || "")
      setCurrentContractType(PROJECT_CONTRACT_TYPES[firstProjectKey] || "")
    }
  }, [])

  // Store original theme preference on mount (only once)
  useEffect(() => {
    if (isReady && originalTheme === null) {
      setOriginalTheme(shouldShowDark)
    }
  }, [isReady, shouldShowDark, originalTheme])

  // Calculate effective theme: toggle when atlas is entered, stay toggled until end of page
  const effectiveTheme = (() => {
    if (originalTheme === null || !isReady) {
      // Not ready yet, use system preference
      return shouldShowDark
    }
    
    // If we've entered atlas and haven't reached the end, keep theme toggled
    if (hasEnteredAtlas && !hasReachedEnd) {
      return !originalTheme
    }
    
    // Otherwise: use original theme
    return originalTheme
  })()

  // Apply theme to html element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const theme = effectiveTheme ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [effectiveTheme])

  // Intersection Observer for sticky year, role and contract type, and atlas theme toggle
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible project (highest intersection ratio)
        let mostVisible: { projectKey: string; ratio: number } | null = null
        let atlasIsIntersecting = false
        let atlasRatio = 0
        
        entries.forEach((entry) => {
          const projectKey = entry.target.getAttribute('data-project-key')
          
          // Track atlas project specifically
          if (projectKey === 'atlas') {
            atlasIsIntersecting = entry.isIntersecting
            atlasRatio = entry.intersectionRatio
          }
          
          // Find most visible project for year/role/contract type updates
          if (entry.isIntersecting) {
            if (projectKey && entry.intersectionRatio > (mostVisible?.ratio || 0)) {
              mostVisible = { projectKey, ratio: entry.intersectionRatio }
            }
          }
        })

        // Update atlas section state based on visibility
        // Consider atlas "in view" when the sentinel element is intersecting
        // Since sentinel is at the start of the project, any intersection means we're viewing it
        setIsInAtlasSection(atlasIsIntersecting)

        // Update year, role and contract type based on most visible project
        if (mostVisible) {
          const { projectKey } = mostVisible
          setCurrentYear(PROJECT_YEARS[projectKey] || "")
          setCurrentRole(PROJECT_ROLES[projectKey] || "")
          setCurrentContractType(PROJECT_CONTRACT_TYPES[projectKey] || "")
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10% 0px -50% 0px'
      }
    )

    // Observe all project sentinel elements
    projectRefs.current.forEach((element) => {
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

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
          <h1 className="text-lg md:text-xl font-light text-foreground tracking-wide leading-tight">
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
        const caption = PROJECT_CAPTIONS[projectKey]
        const { description } = parseCaption(caption)
        const images = project.images
        const altText = IMAGE_ALT_TEXT[images[0]] || `${getProjectTitle(projectKey)} project showcase`
        const year = PROJECT_YEARS[projectKey] || ""
        const role = PROJECT_ROLES[projectKey] || ""
        const contractType = PROJECT_CONTRACT_TYPES[projectKey] || ""

        return (
          <React.Fragment key={projectKey}>
            {/* Observer target - spans both columns, positioned at start of project */}
            <div
              ref={(el) => {
                if (el) projectRefs.current.set(projectKey, el)
              }}
              data-project-key={projectKey}
              className="col-span-1 md:col-span-2 h-px pointer-events-none"
              aria-hidden="true"
            />
            <div className="contents">
              <WorkCard
                year={year}
                role={role}
                contractType={contractType}
                title={getProjectTitle(projectKey)}
                description={description}
                images={images}
                altText={altText}
                priority={index < 2} // Priority load first 2 images
                projectIndex={index}
              />
            </div>
          </React.Fragment>
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
      </div>
      </ContentGrid>

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
