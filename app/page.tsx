"use client"

import React, { useEffect, useState, useRef } from "react"
import FooterLink from "@/app/components/FooterLink"
import { WorkCard } from "@/app/components/WorkCard"
import { ScrollBottomBlur } from "@/app/components/ScrollBottomBlur"
import { ScrollTopBlur } from "@/app/components/ScrollTopBlur"
import { SectionDivider } from "@/app/components/SectionDivider"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"
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
import SideTray from "@/app/new/components/SideTray"

import { useSystemTheme } from "@/hooks/use-system-theme"

// Theme blend threshold: instant snap at 93% scroll
const THEME_BLEND_THRESHOLD = 0.93

const PRIORITY_IMAGE_COUNT = 3

export default function Page() {
  const timezoneMessage = useTimezoneMessage()
  const { prefersDark, isReady } = useSystemTheme()

  // Story tray state
  const [selectedStory, setSelectedStory] = useState<string | null>(null)

  // Writing tray state
  const [isWritingOpen, setIsWritingOpen] = useState(false)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // Scroll-based hero blur with eased progress
  const [scrollProgress, setScrollProgress] = useState(0)
  const ticking = useRef(false)
  const prefersDarkRef = useRef(prefersDark)

  // Keep ref in sync with state
  useEffect(() => {
    prefersDarkRef.current = prefersDark
  }, [prefersDark])

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

          // Binary theme blend based on scroll position: instant snap at threshold
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

          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll)
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', transition: 'background-color 1s cubic-bezier(0.4, 0, 0.2, 1), color 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-x-8 md:gap-x-16">
              {/* Empty left column for grid alignment */}
              <div className="hidden md:block" />

              {/* Hero content - right column, aligns with project titles */}
              <div className="space-y-5">
                {/* Greeting & Role */}
                <p className="type-body-primary">
                  Hi, I&apos;m <span className="font-[family-name:var(--font-edu-marist)]">Raf</span>.
                  <br/>
                  I design products for the age of AI.
                  </p>

                {/* Contact Links */}
                <nav className="flex flex-col items-start gap-1 group/nav pt-2">
                  <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
                  <FooterLink href="mailto:raf@raf.works" label="Email" />
                  {/* <FooterLink href="/cv" label="CV" /> */}
                  <FooterLink href="https://x.com/lfgraf" label="X" external />
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
          <div className="w-full max-w-[1400px] mx-auto px-0 sm:px-4 md:px-20 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-x-8 md:gap-x-16 gap-y-1 md:gap-y-2">

              {/* Works */}
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
                    hasStory={PROJECT_HAS_STORY[projectKey] || false}
                    onReadStory={() => setSelectedStory(projectKey)}
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
        <div className="min-h-screen flex items-center pointer-events-auto" style={{ backgroundColor: 'var(--bg)', transition: 'background-color 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div className="w-full max-w-[1400px] mx-auto px-0 sm:px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-x-8 md:gap-x-16">
              {/* Empty left column for grid alignment */}
              <div className="hidden md:block" />

              {/* Footer content - right column */}
              <div className="space-y-5">
                {/* SECTION 1: About (Bio) */}
                <div className="space-y-1">
                  {/* Static header - no interactivity */}
                  <span className="type-caption opacity-50 dark:opacity-70 block">
                    {FOOTER_CONFIG.bio.sectionLabel}
                  </span>
                  {/* Bio content */}
                  <p className="type-body">
                    {FOOTER_CONFIG.bio.paragraphs.map((paragraph, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <><br className="hidden md:block"/></>}
                        <span
                          className={`${index === 0 ? '' : 'block mt-3 md:mt-0 md:inline'} ${paragraph.isSecondary ? 'opacity-80' : ''}`}
                        >
                          {paragraph.text}
                        </span>
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                {/* SECTION 2: Location */}
                <div className="space-y-1">
                  {/* Static header - no interactivity */}
                  <span className="type-caption opacity-50 dark:opacity-70 block">
                    {FOOTER_CONFIG.location.sectionLabel}
                  </span>
                  {/* Location content */}
                  <p className="type-body">
                    {FOOTER_CONFIG.location.info.futureMove}
                    <br/>
                    <span className="opacity-80">
                      {FOOTER_CONFIG.location.info.origin} <br className="hidden md:block"/>
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
