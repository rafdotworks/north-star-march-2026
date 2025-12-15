"use client"

import React, { useEffect, useState, useRef } from "react"
import FooterLink from "@/app/components/FooterLink"
import { WorkCard } from "@/app/components/WorkCard"
import { ScrollBottomBlur } from "@/app/components/ScrollBottomBlur"
import { ScrollTopBlur } from "@/app/components/ScrollTopBlur"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"
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

// ============================================================================
// THEME TOGGLE (disabled - uncomment to enable scroll-based color inversion)
// ============================================================================
// import { useSystemTheme } from "@/hooks/use-system-theme"
// const SCROLL_THEME_THRESHOLD = 0.5
//
// Inside component:
// const { prefersDark, isReady } = useSystemTheme()
// const [isThemeToggled, setIsThemeToggled] = useState<boolean>(false)
//
// useEffect(() => {
//   const handleScroll = () => {
//     if (!ticking.current) {
//       requestAnimationFrame(() => {
//         const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
//         const scrollProgress = window.scrollY / scrollHeight
//         setIsThemeToggled(scrollProgress >= SCROLL_THEME_THRESHOLD)
//         ticking.current = false
//       })
//       ticking.current = true
//     }
//   }
//   window.addEventListener('scroll', handleScroll, { passive: true })
//   return () => window.removeEventListener('scroll', handleScroll)
// }, [])
//
// // XOR logic: invert theme when scroll crosses threshold
// const effectiveTheme = isReady ? (prefersDark !== isThemeToggled) : prefersDark
//
// useEffect(() => {
//   if (typeof document !== 'undefined' && isReady) {
//     const theme = effectiveTheme ? "dark" : "light"
//     document.documentElement.setAttribute('data-theme', theme)
//   }
// }, [effectiveTheme, isReady])
// ============================================================================

const PRIORITY_IMAGE_COUNT = 3

export default function Page() {
  const timezoneMessage = useTimezoneMessage()

  // Scroll-based hero blur with eased progress
  const [scrollProgress, setScrollProgress] = useState(0)
  const ticking = useRef(false)

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

          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Derived values from scroll progress - beautiful eased transitions
  const heroBlur = scrollProgress * 24
  const heroScale = 1 - (scrollProgress * 0.1)
  const heroOpacity = 1 - (scrollProgress * 0.8)
  const heroY = scrollProgress * -40

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                  Hello, I&apos;m Raf.
                  <br/>
                  I design AI software.
                </p>

                {/* Experience */}
                <p className="type-body">
                  I&apos;ve spent almost a decade designing across startups and large organizations.
                  <br/>
                  I care about collaboratively shaping opinionated, fast and emotionally considered products.
                </p>

                {/* Location & Lifestyle */}
                <p className="type-body">
                  Born on the Amalfi Coast. Based in Toronto.
                  <br/>
                  Moving to London UK in Q2 2026.
                </p>

                {/* Contact Links */}
                <nav className="flex flex-col gap-1 group/nav pt-2">
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

        {/* Soft gradient transition as works come in */}
        <div
          className="h-40 -mt-40 relative z-10"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)'
          }}
        />

        {/* Works section with solid background */}
        <div className="bg-background min-h-screen pointer-events-auto">
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
                  />
                )
              })}

              {/* Bottom divider */}
              <div className="col-span-1 md:col-span-2 border-t border-border/20 my-6 md:my-8" />

              {/* Footer hero - spans both columns, content at bottom */}
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-end gap-0 md:gap-8 lg:gap-16 min-h-[50vh] justify-end py-[10vh] md:pt-[20vh] md:pb-[10vh]">
                {/* Empty left column for grid alignment */}
                <div className="hidden md:block md:w-[180px] lg:w-[200px] flex-shrink-0" />

                {/* Footer content - right column */}
                <div className="flex flex-col md:flex-1">
                  {/* Principles */}
                  <div className="space-y-1">
                    <p className="type-caption">— How you do anything is how you do everything</p>
                    <p className="type-caption">— Always happy, never satisfied</p>
                    <p className="type-caption">— Progress over movement</p>
                  </div>

                  <p className="type-caption transition-colors duration-200 mt-10">
                    {timezoneMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll blur effects */}
      <ScrollBottomBlur />
      <ScrollTopBlur />
    </div>
  )
}
