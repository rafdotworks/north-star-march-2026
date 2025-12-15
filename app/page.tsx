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

import { useSystemTheme } from "@/hooks/use-system-theme"

const SCROLL_THEME_THRESHOLD = 0.98

const PRIORITY_IMAGE_COUNT = 3

export default function Page() {
  const timezoneMessage = useTimezoneMessage()
  const { prefersDark, isReady } = useSystemTheme()

  // Scroll-based hero blur with eased progress
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isThemeToggled, setIsThemeToggled] = useState(false)
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

          // Theme toggle at page end
          const scrollHeight = document.documentElement.scrollHeight - viewportHeight
          const totalProgress = scrollY / scrollHeight
          setIsThemeToggled(totalProgress >= SCROLL_THEME_THRESHOLD)

          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // XOR logic: invert theme when at page end
  const effectiveTheme = isReady ? (prefersDark !== isThemeToggled) : prefersDark

  useEffect(() => {
    if (typeof document !== 'undefined' && isReady) {
      document.documentElement.setAttribute('data-theme', effectiveTheme ? "dark" : "light")
    }
  }, [effectiveTheme, isReady])

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
                  I&apos;ve spent 9+ years designing across startups and large organizations.
                  <br className="hidden md:block"/>
                  <span className="block mt-3 md:mt-0 md:inline">I care about building opinionated and emotionally considered products with passionate people.</span>
                  </p>

                {/* Location & Lifestyle */}
                <p className="type-body">
                  Born on the Amalfi Coast. Based in Toronto.
                  <br/>
                  Moving to London UK in Q2 2026.
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
              hsla(var(--background) / ${0.3 + scrollProgress * 0.7}) 25%,
              hsla(var(--background) / ${0.6 + scrollProgress * 0.4}) 50%,
              hsla(var(--background) / ${0.85 + scrollProgress * 0.15}) 75%,
              hsl(var(--background)) 100%
            )`,
            opacity: Math.min(1, 0.4 + scrollProgress * 1.2),
            transform: `translateY(${(1 - Math.min(1, scrollProgress * 1.5)) * 16}px)`,
            transition: 'opacity 100ms ease-out',
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

              {/* Footer hero - spans both columns, centered like main hero */}
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center gap-0 md:gap-8 lg:gap-16 min-h-screen justify-center py-[15vh]">
                {/* Empty left column for grid alignment */}
                <div className="hidden md:block md:w-[180px] lg:w-[200px] flex-shrink-0" />

                {/* Footer content - right column */}
                <div className="flex flex-col md:flex-1">
                  {/* Principles */}
                  <div className="space-y-1">
                    <p className="type-caption">— How you do anything is how you do everything</p>
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
