"use client"

import React, { useEffect, useState, useRef } from "react"
import { useReducedMotion } from "framer-motion"
import FooterLink from "@/app/components/layout/FooterLink"
import { WorkCard } from "@/app/components/media/WorkCard"
import { ScrollBottomBlur } from "@/app/components/layout/ScrollBottomBlur"
import { ScrollTopBlur } from "@/app/components/layout/ScrollTopBlur"
import { SectionDivider } from "@/app/components/layout/SectionDivider"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  PROJECT_ORDER,
  PROJECTS,
  PROJECT_CAPTIONS,
  PROJECT_YEARS,
  PROJECT_ROLES,
  PROJECT_CONTRACT_TYPES,
  PROJECT_DISPLAY_NAMES,
  IMAGE_ALT_TEXT,
  PROJECT_HAS_STORY
} from "@/app/config/portfolioConfig"
import { FOOTER_CONFIG } from "@/app/config/footerConfig"
import SideTray from "@/app/components/page-specific/SideTray"

import { useSystemTheme } from "@/hooks/use-system-theme"

// Theme blend threshold: instant snap at 93% scroll
const THEME_BLEND_THRESHOLD = 0.93

const PRIORITY_IMAGE_COUNT = 3

export default function Page() {
  const timezoneMessage = useTimezoneMessage()
  const { prefersDark, isReady } = useSystemTheme()
  const isMobile = useIsMobile()

  // Story tray state
  const [selectedStory, setSelectedStory] = useState<string | null>(null)

  // Writing tray state
  const [isWritingOpen, setIsWritingOpen] = useState(false)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // Scroll-based hero blur with eased progress
  const [scrollProgress, setScrollProgress] = useState(0)
  const ticking = useRef(false)
  const prefersDarkRef = useRef(prefersDark)

  // Footer scroll-based blur with eased progress
  const [footerScrollProgress, setFooterScrollProgress] = useState(0)
  const [footerRevealProgress, setFooterRevealProgress] = useState(0)
  const footerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  // Metadata blur + opacity for project cards
  const [metadataOpacityValues, setMetadataOpacityValues] = useState<Array<{ blur: number; opacity: number }>>([])
  const metadataRefs = useRef<(HTMLDivElement | null)[]>([])

  // Keep refs in sync with state for scroll handler
  const isMobileRef = useRef(isMobile)
  const prefersReducedRef = useRef(prefersReduced)

  useEffect(() => {
    prefersDarkRef.current = prefersDark
  }, [prefersDark])

  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])

  useEffect(() => {
    prefersReducedRef.current = prefersReduced
  }, [prefersReduced])

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const viewportHeight = window.innerHeight

          // Dramatic, slower transition: 10vh to 95vh (hero lingers longer, fades deeper)
          const transitionStart = viewportHeight * 0.1
          const transitionEnd = viewportHeight * 0.95

          if (scrollY <= transitionStart) {
            setScrollProgress(0)
          } else if (scrollY >= transitionEnd) {
            setScrollProgress(1)
          } else {
            const progress = (scrollY - transitionStart) / (transitionEnd - transitionStart)
            // Dramatic cubic ease-out - hero lingers longer, accelerates beautifully
            setScrollProgress(1 - Math.pow(1 - progress, 3))
          }

          // ========================================================================
          // BINARY THEME BLEND SYSTEM
          // ========================================================================
          // Design decision: Binary (instant snap) rather than gradual transition
          // - Creates clear visual distinction between sections
          // - 93% threshold chosen through user testing - late enough to feel natural
          //   but early enough that footer content is visible after transition
          // - Ties to footer reveal (85-100%), creating cohesive scroll experience
          //
          // How it works:
          // 1. Calculate total page scroll progress (0-1)
          // 2. At 93% scroll, instantly flip from 0 to 1 (no gradual blend)
          // 3. Set CSS custom properties that drive color-mix() in CSS
          // 4. Light mode: starts at 0%, snaps to 100% (light→dark)
          //    Dark mode: starts at 100%, snaps to 0% (dark→light, inverted)
          //
          // CSS integration: --theme-blend used in color-mix() for smooth 1s transitions
          // despite instant value change (CSS handles the visual smoothness)
          // ========================================================================
          const scrollHeight = document.documentElement.scrollHeight - viewportHeight
          const totalProgress = scrollY / scrollHeight

          // Binary threshold: 0 or 1 (instant snap at 93%)
          const themeBlend = totalProgress >= THEME_BLEND_THRESHOLD ? 1 : 0

          // Set CSS custom properties for color-mix interpolation
          // Light mode: 0% → 100% (scroll to dark)
          // Dark mode: 100% → 0% (scroll to light) - invert the blend
          const finalBlend = prefersDarkRef.current
            ? (1 - themeBlend) * 100  // Dark mode: 100% or 0%
            : themeBlend * 100         // Light mode: 0% or 100%
          document.documentElement.style.setProperty('--theme-blend', `${finalBlend}%`)
          // Numeric version for calc() operations (0-1)
          document.documentElement.style.setProperty('--theme-blend-num', `${finalBlend / 100}`)

          // Unified footer effects based on total page scroll progress
          // Both blur AND reveal use the same 85%-100% range
          const FOOTER_START = 0.85  // Start after last project divider
          const FOOTER_END = 1.0     // Complete at page end

          let footerEffectProgress = 0
          if (totalProgress <= FOOTER_START) {
            footerEffectProgress = 1  // Fully blurred/hidden
          } else if (totalProgress >= FOOTER_END) {
            footerEffectProgress = 0  // Fully sharp/revealed
          } else {
            // Map 85%-100% scroll to 1→0 (inverted: starts blurred, ends sharp)
            const effectRange = FOOTER_END - FOOTER_START
            const progressInRange = totalProgress - FOOTER_START
            const rawProgress = progressInRange / effectRange
            // Inverted: 1 (blurred) → 0 (sharp)
            footerEffectProgress = 1 - rawProgress
          }

          // Use SAME progress for both effects
          setFooterScrollProgress(footerEffectProgress)
          setFooterRevealProgress(1 - footerEffectProgress)  // Inverted for reveal mask

          // ========================================================================
          // METADATA BLUR + OPACITY EFFECT - Blur + fade as next project metadata approaches
          // ========================================================================
          // Calculate blur + opacity for each project's metadata based on proximity to next
          const effectValues = metadataRefs.current.map((metadataEl, index) => {
            // Skip if mobile, reduced motion, or no element
            if (!metadataEl || isMobileRef.current || prefersReducedRef.current) {
              return { blur: 0, opacity: 1 }  // Fully visible, no blur
            }

            const rect = metadataEl.getBoundingClientRect()
            const stickyPosition = 48 // md:top-12 = 48px

            // Get next metadata element
            const nextMetadataEl = metadataRefs.current[index + 1]
            if (!nextMetadataEl) return { blur: 0, opacity: 1 }  // Last item, no effects

            const nextRect = nextMetadataEl.getBoundingClientRect()
            const nextMetadataTop = nextRect.top

            // Calculate distance from next metadata to overlap point
            const triggerDistance = 50  // Start effects at 50px away
            const overlapPoint = stickyPosition + rect.height
            const distanceToOverlap = nextMetadataTop - overlapPoint

            if (distanceToOverlap > triggerDistance) {
              return { blur: 0, opacity: 1 }  // Too far, no effects
            } else if (distanceToOverlap <= 0) {
              return { blur: 4, opacity: 0 }  // Fully overlapped, max blur + transparent
            } else {
              // Progressive effects: both increase as distance closes
              const progress = 1 - (distanceToOverlap / triggerDistance)
              return {
                blur: progress * 4,      // 0px → 4px blur
                opacity: 1 - progress    // 1 → 0 opacity (fade to dark)
              }
            }
          })

          setMetadataOpacityValues(effectValues)

          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ============================================================================
  // URL SYNCING FOR WRITING MODAL
  // ============================================================================
  // Enables shareable URLs for articles while preserving modal UX
  //
  // HOW IT WORKS:
  // 1. Direct link (/?writings=personal-blueprint) auto-opens modal
  // 2. Clicking article in modal updates URL for sharing
  // 3. Browser back/forward buttons work naturally
  // 4. Modal preserves smooth animations from footer clicks
  //
  // BENEFIT: Best of both worlds - elegant modal + shareable links!
  // ============================================================================

  // Effect 1: Read URL on mount and auto-open modal if query param present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const writingSlug = params.get('writings')

    // If URL contains ?writings=slug, open modal automatically
    if (writingSlug) {
      setIsWritingOpen(true)
      setSelectedWritingArticle(writingSlug)
    }
  }, [])

  // Effect 2: Update URL when modal state changes (for sharing)
  useEffect(() => {
    if (isWritingOpen && selectedWritingArticle) {
      // Article selected → Add query param
      // Example: raf.works → raf.works/?writings=personal-blueprint
      const newUrl = `/?writings=${selectedWritingArticle}`
      window.history.pushState({}, '', newUrl)
    } else if (!isWritingOpen) {
      // Modal closed → Remove query param
      const params = new URLSearchParams(window.location.search)
      if (params.get('writings')) {
        window.history.pushState({}, '', '/') // Clean URL
      }
    }
  }, [isWritingOpen, selectedWritingArticle])

  // Effect 3: Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Read URL after back/forward button click
      const params = new URLSearchParams(window.location.search)
      const writingSlug = params.get('writings')

      // Sync modal state with URL
      if (writingSlug) {
        // URL has param → Open modal with that article
        setIsWritingOpen(true)
        setSelectedWritingArticle(writingSlug)
      } else {
        // URL has no param → Close modal
        setIsWritingOpen(false)
        setSelectedWritingArticle(null)
      }
    }

    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Set initial theme blend based on system preference
  useEffect(() => {
    if (isReady && typeof document !== 'undefined') {
      // CSS handles initial --theme-blend via media query
      // This ensures it's set correctly on first load
      const initialBlend = prefersDark ? '100%' : '0%'
      const initialBlendNum = prefersDark ? '1' : '0'
      document.documentElement.style.setProperty('--theme-blend', initialBlend)
      document.documentElement.style.setProperty('--theme-blend-num', initialBlendNum)
    }
  }, [isReady, prefersDark])

  // Derived values from scroll progress - dramatic eased transitions
  const heroBlur = scrollProgress * 32
  const heroScale = 1 - (scrollProgress * 0.12)
  const heroOpacity = 1 - (scrollProgress * 0.8)
  const heroY = scrollProgress * -48

  // Footer blur derived values - subtle, readable effect
  const footerBlur = prefersReduced ? 0 : footerScrollProgress * 16  // Max 16px (vs hero's 32px)
  const footerOpacity = Math.max(0.2, 1 - (footerScrollProgress * 0.6))  // Fade 60%, min 20%
  const footerY = footerScrollProgress * -24  // Subtle upward drift (vs hero's -48px)

  return (
    <div className="min-h-screen -mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', transition: 'background-color 1s cubic-bezier(0.4, 0, 0.2, 1), color 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {/* ================================================================
       * HERO SECTION - Fixed in background, blurs beautifully on scroll
       * ================================================================ */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="min-h-screen flex items-center"
          style={{
            filter: `blur(${heroBlur}px)`,
            transform: `scale(${heroScale}) translateY(${heroY}px)`,
            opacity: heroOpacity,
            willChange: 'filter, transform, opacity'
          }}
        >
          {/* Use same container and grid as works section for alignment */}
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16">
              {/* Hero content - right column, aligns with project titles */}
              <div className="space-y-5 md:col-start-2">
                {/* Greeting & Role */}
                <p className="type-body-primary">
 <span className="font-[family-name:var(--font-edu-marist)]">Raf</span> designs products for the age of A.I.
                  </p>

                {/* Contact Links */}
                <nav className="flex flex-col items-start gap-1 group/nav pt-2">
                  <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
                  <FooterLink href="mailto:raf@raf.works" label="Email" />
                  {/* <FooterLink href="/cv" label="CV" /> */}
                  <FooterLink href="https://x.com/rafdotworks" label="X" external />
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
       * SCROLLABLE CONTENT - Works section scrolls over hero
       * ================================================================ */}
      <main className="relative z-10 pointer-events-none">
        {/* Spacer for hero - allows hero to be visible before works */}
        <div className="h-screen" />

        {/* Scroll-reactive gradient transition as works come in */}
        <div
          className="h-48 -mt-48 relative z-10"
          style={{
            background: `linear-gradient(to bottom,
              transparent 0%,
              color-mix(in srgb, var(--bg), transparent ${65 - scrollProgress * 65}%) 25%,
              color-mix(in srgb, var(--bg), transparent ${35 - scrollProgress * 35}%) 50%,
              color-mix(in srgb, var(--bg), transparent ${10 - scrollProgress * 10}%) 75%,
              var(--bg) 100%
            )`,
            opacity: Math.min(1, 0.5 + scrollProgress * 1.3),
            transform: `translateY(${(1 - Math.min(1, scrollProgress * 1.5)) * 16}px)`,
            transition: 'opacity 100ms ease-out',
          }}
        />

        {/* Works section with solid background */}
        <div className="min-h-screen pointer-events-auto" style={{ backgroundColor: 'var(--bg)', transition: 'background-color 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-20 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16 gap-y-1 md:gap-y-2">

              {/* Works */}
              {PROJECT_ORDER.map((projectKey, index) => {
                const project = PROJECTS[projectKey]
                const images = project.images
                const title = PROJECT_DISPLAY_NAMES[projectKey] || projectKey
                const altText = IMAGE_ALT_TEXT[images[0]] || `${title} project showcase`

                // Get blur + opacity effects for this project
                const effects = metadataOpacityValues[index] || { blur: 0, opacity: 1 }

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
                    hasStory={PROJECT_HAS_STORY[projectKey] || false}
                    onReadStory={() => setSelectedStory(projectKey)}
                    metadataBlur={effects.blur}
                    metadataOpacity={effects.opacity}
                    metadataRef={(el) => { metadataRefs.current[index] = el }}
                  />
                )
              })}

              {/* Divider before footer */}
              <SectionDivider />

            </div>
          </div>
        </div>

        {/* ================================================================
         * FOOTER SECTION - Independent full-viewport section like hero
         * ================================================================ */}
        <div
          ref={footerRef}
          className="min-h-screen flex items-center pointer-events-auto"
          style={{
            backgroundColor: 'var(--bg)',
            transition: 'background-color 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `blur(${footerBlur}px)`,
            opacity: footerOpacity,
            transform: `translateY(${footerY}px)`,
            willChange: 'filter, opacity, transform'
          }}>
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16">
              {/* Footer content - right column */}
              <div
                className="space-y-5 md:col-start-2"
                style={{
                  maskImage: `linear-gradient(to bottom,
                    black 0%,
                    black ${footerRevealProgress * 100}%,
                    rgba(0,0,0,0.7) ${footerRevealProgress * 100 + 15}%,
                    rgba(0,0,0,0.4) 100%
                  )`,
                  WebkitMaskImage: `linear-gradient(to bottom,
                    black 0%,
                    black ${footerRevealProgress * 100}%,
                    rgba(0,0,0,0.7) ${footerRevealProgress * 100 + 15}%,
                    rgba(0,0,0,0.4) 100%
                  )`
                }}
              >
                {/* SECTION 1: About (Bio) */}
                <div className="space-y-1">
                  {/* Clickable header - opens personal blueprint in writing tray */}
                  <span
                    onClick={() => {
                      setIsWritingOpen(true)
                      setSelectedWritingArticle("personal-blueprint")
                    }}
                    className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer block"
                  >
                    {FOOTER_CONFIG.bio.sectionLabel}
                  </span>
                  {/* Bio content */}
                  <p className="type-body">
                    {FOOTER_CONFIG.bio.paragraphs.map((paragraph, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <br />}
                        <span className={paragraph.isSecondary ? 'opacity-80' : ''}>
                          {paragraph.text}
                        </span>
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                {/* SECTION 2: Location */}
                <div className="space-y-1">
                  {/* Clickable header - opens "moving-to-europe" article */}
                  <span
                    onClick={() => {
                      setIsWritingOpen(true)
                      setSelectedWritingArticle("moving-to-europe")
                    }}
                    className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer block"
                  >
                    {FOOTER_CONFIG.location.sectionLabel}
                  </span>
                  {/* Location content */}
                  <p className="type-body">
                    {FOOTER_CONFIG.location.info.futureMove}
                    <br/>
                    <span className="opacity-80">
                      {FOOTER_CONFIG.location.info.origin} <br />
                      Based in {FOOTER_CONFIG.location.info.currentBases.map((base, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && ' '}
                          <span className={base.isPrevious ? 'line-through opacity-50' : ''}>
                            {base.city}
                          </span>
                        </React.Fragment>
                      ))}.
                    </span>
                  </p>
                </div>

                {/* SECTION 3: Writing (existing clickable section) */}
                <div className="space-y-1">
                  {/* Clickable header - keeps all interactivity */}
                  <span
                    onClick={() => setIsWritingOpen(true)}
                    className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer block"
                  >
                    {FOOTER_CONFIG.writing.sectionLabel}
                  </span>
                  {/* Writing principles */}
                  {FOOTER_CONFIG.writing.principles.map((principle, index) => (
                    <p key={index} className="type-caption opacity-80 dark:opacity-90">
                      <span className="opacity-50 italic font-[family-name:var(--font-edu-marist)] mr-1.5">
                        {principle.number}
                      </span>
                      {principle.text}
                    </p>
                  ))}
                </div>

                <p className="type-caption opacity-50 transition-colors duration-200 pt-5 font-[family-name:var(--font-mono)]">
                  {timezoneMessage}
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll blur effects */}
      <ScrollBottomBlur />
      <ScrollTopBlur />

      {/* Story side tray */}
      <SideTray
        articleId={selectedStory}
        onClose={() => setSelectedStory(null)}
        apiBasePath="/api/story"
      />

      {/* Writing side tray */}
      <SideTray
        articleId={isWritingOpen ? selectedWritingArticle : null}
        onClose={() => {
          setIsWritingOpen(false)
          setSelectedWritingArticle(null)
        }}
        isWritingMode={isWritingOpen}
        onArticleSelect={setSelectedWritingArticle}
      />
    </div>
  )
}
