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
import SideTray from "@/app/new/components/SideTray"

import { useSystemTheme } from "@/hooks/use-system-theme"

// Theme blend scroll range (85% to 100% of page)
const THEME_BLEND_START = 0.85
const THEME_BLEND_END = 1.0

const PRIORITY_IMAGE_COUNT = 3

// Ease-in for theme blend: gradual start, accelerates toward end (scrolling down)
function easeInQuad(t: number): number {
  return t * t
}

// Ease-out for theme blend: immediate response, gradual finish (scrolling up)
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

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
  const lastScrollY = useRef(0)

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

          // Slower, sweeter transition: 20vh to 90vh (hero lingers longer)
          const transitionStart = viewportHeight * 0.2
          const transitionEnd = viewportHeight * 0.9

          if (scrollY <= transitionStart) {
            setScrollProgress(0)
          } else if (scrollY >= transitionEnd) {
            setScrollProgress(1)
          } else {
            const progress = (scrollY - transitionStart) / (transitionEnd - transitionStart)
            // Gentle ease-out curve - hero fades slowly, sweetly
            setScrollProgress(1 - Math.pow(1 - progress, 2))
          }

          // Continuous theme blend based on scroll position
          const scrollHeight = document.documentElement.scrollHeight - viewportHeight
          const totalProgress = scrollY / scrollHeight

          // Detect scroll direction
          const isScrollingDown = scrollY > lastScrollY.current
          lastScrollY.current = scrollY

          let themeBlend = 0
          if (totalProgress >= THEME_BLEND_START) {
            themeBlend = (totalProgress - THEME_BLEND_START) / (THEME_BLEND_END - THEME_BLEND_START)
            themeBlend = Math.min(1, Math.max(0, themeBlend))
          }

          // Apply directional easing for delightful feel
          // Down: gradual start → decisive finish | Up: immediate response → gradual return
          const easedBlend = isScrollingDown
            ? easeInQuad(themeBlend)
            : easeOutQuad(themeBlend)

          // Set CSS custom properties for color-mix interpolation
          // Light mode: 0% → 100% (scroll to dark)
          // Dark mode: 100% → 0% (scroll to light) - invert the blend
          const finalBlend = prefersDarkRef.current
            ? (1 - easedBlend) * 100  // Dark mode: start at 100%, go to 0%
            : easedBlend * 100         // Light mode: start at 0%, go to 100%
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

  // Derived values from scroll progress - beautiful eased transitions
  const heroBlur = scrollProgress * 24
  const heroScale = 1 - (scrollProgress * 0.1)
  const heroOpacity = 1 - (scrollProgress * 0.8)
  const heroY = scrollProgress * -40

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
                  Hello, I&apos;m <span className="font-[family-name:var(--font-edu-marist)]">Raf</span>.
                  <br/>
                  I design AI softwares and products.
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
              color-mix(in srgb, var(--bg), transparent ${70 - scrollProgress * 70}%) 25%,
              color-mix(in srgb, var(--bg), transparent ${40 - scrollProgress * 40}%) 50%,
              color-mix(in srgb, var(--bg), transparent ${15 - scrollProgress * 15}%) 75%,
              var(--bg) 100%
            )`,
            opacity: Math.min(1, 0.4 + scrollProgress * 1.2),
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
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] gap-x-8 md:gap-x-16">
              {/* Empty left column for grid alignment */}
              <div className="hidden md:block" />

              {/* Footer content - right column */}
              <div className="space-y-5">
                {/* Bio & Location */}
                <div className="space-y-3">
                  <p className="type-body">
                  9+ years of experience across startups and large organizations.
                    <br className="hidden md:block"/>
                    <span className="block mt-3 md:mt-0 md:inline opacity-80">Accountable from ambiguity to outcomes.

                    </span>
                    <br className="hidden md:block"/>
                    <span className="block mt-3 md:mt-0 md:inline opacity-80">Opinionated work, shaped with people who care.

                    </span>

                  </p>
                  <p className="type-body">
                  Moving to London, UK, in Q2 2026. 
                    <br/>
                    <span className="opacity-80">Born on the Amalfi Coast, Italy, in the 90s. <br className="hidden md:block"/>Based in <span className="line-through opacity-50">Lisbon</span> <span className="line-through opacity-50">NYC</span> Toronto, Canada.</span>
                  </p>
                </div>

              

                {/* Writing & Principles */}
                <div className="space-y-1 pt-5">
                  <span
                    onClick={() => setIsWritingOpen(true)}
                    className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer block"
                  >
                    Writing
                  </span>
                  <p className="type-caption opacity-80 dark:opacity-90"><span className="opacity-50 italic font-[family-name:var(--font-edu-marist)] mr-1.5">I</span>How you do anything is how you do everything.</p>
                  <p className="type-caption opacity-80 dark:opacity-90"><span className="opacity-50 italic font-[family-name:var(--font-edu-marist)] mr-1.5">II</span>Progress over movement.</p>
                  <p className="type-caption opacity-80 dark:opacity-90"><span className="opacity-50 italic font-[family-name:var(--font-edu-marist)] mr-1.5">III</span>Yoga mat, coffee shops and quiet spaces.</p>

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
