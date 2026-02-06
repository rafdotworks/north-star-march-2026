/**
 * ============================================================================
 * HeroSection - app/components/layout/HeroSection.tsx
 * ============================================================================
 *
 * Reusable hero section component with simplified scroll-based blur effects.
 * 
 * FEATURES:
 * - Individual scroll progress tracking per section
 * - Moderate blur effects (max 8px) on scroll exit
 * - Subtle opacity fade (min 85%)
 * - Moderate Y translation for parallax effect
 * - Maintains consistent grid layout across all sections
 * - Respects reduced motion preferences
 * 
 * USAGE:
 * <HeroSection sectionIndex={0}>
 *   <div>Your hero content here</div>
 * </HeroSection>
 * 
 * Used by: app/page.tsx for all hero sections (intro, about, location, writings)
 */

"use client"

import React, { useEffect, useState, useRef } from "react"
import { useReducedMotion } from "framer-motion"

interface HeroSectionProps {
  children: React.ReactNode
  sectionIndex: number // For scroll calculations
  className?: string
}

export function HeroSection({ children, sectionIndex, className = "" }: HeroSectionProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const ticking = useRef(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current && sectionRef.current) {
        requestAnimationFrame(() => {
          if (!sectionRef.current) return

          const rect = sectionRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          
          // Calculate progress as section scrolls through viewport
          // 0 = section bottom at viewport bottom (entering)
          // 1 = section top at viewport top (exiting)
          
          const sectionBottom = rect.bottom
          const sectionTop = rect.top
          const sectionHeight = rect.height
          
          // Section is entering from bottom
          if (sectionBottom > viewportHeight) {
            setScrollProgress(0)
          }
          // Section is exiting from top
          else if (sectionTop < 0 && Math.abs(sectionTop) > sectionHeight * 0.5) {
            setScrollProgress(1)
          }
          // Section is in viewport
          else {
            // Calculate how much of the section has scrolled past viewport top
            const scrolled = Math.max(0, viewportHeight - sectionBottom)
            const scrollRange = sectionHeight + viewportHeight
            const progress = scrolled / scrollRange
            
            // Ease out curve for smoother effect
            const easedProgress = 1 - Math.pow(1 - progress, 2)
            setScrollProgress(easedProgress)
          }

          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll effects - noticeable blur on exit, but no heavy residual banner
  const blur = prefersReduced ? 0 : scrollProgress * 8 // Max 8px (visible but not a thick banner)
  const opacity = 0.85 + (1 - scrollProgress) * 0.15 // 85% → 100%
  const translateY = scrollProgress * -16 // Moderate drift

  return (
    <div
      ref={sectionRef}
      className={`min-h-screen flex items-center pointer-events-auto ${className}`}
      style={{
        backgroundColor: 'var(--bg)',
        transition: 'background-color var(--theme-transition-duration) var(--theme-transition-easing)',
        filter: `blur(${blur}px)`,
        opacity: opacity,
        transform: `translateY(${translateY}px)`,
        willChange: 'filter, opacity, transform'
      }}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16">
          {/* Content - right column */}
          <div className="md:col-start-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
