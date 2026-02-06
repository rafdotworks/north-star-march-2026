"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import FooterLink from "@/app/components/layout/FooterLink"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"
import SideTray from "@/app/components/page-specific/SideTray"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

export default function Page() {
  const timezoneMessage = useTimezoneMessage()
  const { prefersDark, isReady } = useSystemTheme()
  const shouldReduceMotion = useReducedMotion()

  // Story tray state
  const [selectedStory, setSelectedStory] = useState<string | null>(null)

  // Writing tray state
  const [isWritingOpen, setIsWritingOpen] = useState(false)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // Theme inversion state (driven by wheel gesture)
  const [themeInverted, setThemeInverted] = useState(false)
  const prefersDarkRef = useRef(prefersDark)
  const wheelAccumRef = useRef(0)
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Location message reveal state (one-way animation on theme invert)
  const [hasShownLocationMessage, setHasShownLocationMessage] = useState(false)

  // ============================================================================
  // MEMOIZED STYLES - Prevent object recreation on every render
  // ============================================================================
  const containerStyle = useMemo(() => ({
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
    transition: 'background-color var(--theme-transition-duration) var(--theme-transition-easing), color var(--theme-transition-duration) var(--theme-transition-easing)'
  }), [])

  useEffect(() => {
    prefersDarkRef.current = prefersDark
  }, [prefersDark])

  // ============================================================================
  // WHEEL-GESTURE THEME TOGGLE
  // ============================================================================
  // Page is a fixed 100vh viewport — no actual scrolling occurs.
  // Wheel/trackpad gestures toggle the theme inversion instead.
  //
  // How it works:
  // 1. Accumulate wheel deltaY over a 200ms window
  // 2. When accumulated delta exceeds threshold (50px), toggle theme
  // 3. Reset accumulator after toggle or timeout
  // 4. Scroll down → invert theme, scroll up → revert to original
  // ============================================================================
  useEffect(() => {
    const WHEEL_THRESHOLD = 50

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      wheelAccumRef.current += e.deltaY

      // Reset accumulator after 200ms of inactivity
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
      wheelTimerRef.current = setTimeout(() => {
        wheelAccumRef.current = 0
      }, 200)

      // Toggle when accumulated delta exceeds threshold
      if (Math.abs(wheelAccumRef.current) >= WHEEL_THRESHOLD) {
        const scrollingDown = wheelAccumRef.current > 0

        setThemeInverted((prev) => {
          const next = scrollingDown
          if (next === prev) return prev
          return next
        })

        wheelAccumRef.current = 0
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
    }
  }, [])

  // ============================================================================
  // LOCATION MESSAGE REVEAL — trigger one-way animation when theme inverts
  // ============================================================================
  useEffect(() => {
    if (themeInverted && !hasShownLocationMessage) {
      setHasShownLocationMessage(true)
    }
  }, [themeInverted, hasShownLocationMessage])

  // ============================================================================
  // THEME BLEND — apply CSS custom properties when themeInverted changes
  // ============================================================================
  useEffect(() => {
    if (!isReady || typeof document === 'undefined') return

    const themeBlend = themeInverted ? 1 : 0

    // Light mode: 0% → 100% (normal → dark)
    // Dark mode: 100% → 0% (normal → light)
    const finalBlend = prefersDarkRef.current
      ? (1 - themeBlend) * 100
      : themeBlend * 100

    document.documentElement.style.setProperty('--theme-blend', `${finalBlend}%`)
    document.documentElement.style.setProperty('--theme-blend-num', `${finalBlend / 100}`)
  }, [themeInverted, isReady])

  // Set initial theme blend based on system preference
  useEffect(() => {
    if (isReady && typeof document !== 'undefined') {
      const initialBlend = prefersDark ? '100%' : '0%'
      const initialBlendNum = prefersDark ? '1' : '0'
      document.documentElement.style.setProperty('--theme-blend', initialBlend)
      document.documentElement.style.setProperty('--theme-blend-num', initialBlendNum)
    }
  }, [isReady, prefersDark])

  // ============================================================================
  // URL SYNCING FOR WRITING MODAL
  // ============================================================================

  // Effect 1: Read URL on mount and auto-open modal if query param present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const writingSlug = params.get('writings')
    if (writingSlug) {
      setIsWritingOpen(true)
      setSelectedWritingArticle(writingSlug)
    }
  }, [])

  // Effect 2: Update URL when modal state changes (for sharing)
  useEffect(() => {
    if (isWritingOpen && selectedWritingArticle) {
      const newUrl = `/?writings=${selectedWritingArticle}`
      window.history.pushState({}, '', newUrl)
    } else if (!isWritingOpen) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('writings')) {
        window.history.pushState({}, '', '/')
      }
    }
  }, [isWritingOpen, selectedWritingArticle])

  // Effect 3: Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const writingSlug = params.get('writings')
      if (writingSlug) {
        setIsWritingOpen(true)
        setSelectedWritingArticle(writingSlug)
      } else {
        setIsWritingOpen(false)
        setSelectedWritingArticle(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // ============================================================================
  // ANIMATION VARIANTS — Location message reveal
  // ============================================================================

  // Reduced motion variant (accessibility)
  const locationMessageReducedMotion = {
    initial: { opacity: 0 },
    animate: {
      opacity: 0.5,
      transition: { duration: 0.3 }
    }
  } as const

  // Full motion variant (blur-to-focus with height expansion)
  const locationMessageVariants = {
    initial: {
      height: 0,
      opacity: 0,
      filter: "blur(20px)",
      y: 16,
      scale: 0.96
    },
    animate: {
      height: "auto" as const,
      opacity: 0.5,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        height: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },      // EASING.spring
        opacity: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1.0] as const, delay: 0.2 },  // EASING.gentle
        filter: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const },  // EASING.textReveal
        y: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },           // EASING.spring
        scale: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const }        // EASING.spring
      }
    }
  } as const

  return (
    <div className="h-screen overflow-hidden" style={containerStyle}>
      {/* ================================================================
       * SINGLE 100VH HERO — all content in one viewport
       * Three zones: intro (top), bio (middle), meta (bottom)
       * ================================================================ */}
      <main className="h-full w-full max-w-[1400px] mx-auto px-4 md:px-20">
        <div className="h-full grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16">
          <div className="md:col-start-2 h-full flex flex-col justify-center">

            {/* ——— BLOCK 1: Name + location ——— */}
            <div className="max-w-[600px] mb-6">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>
                <span className="font-edu-marist">Raf V.</span>
              </p>
              <p className="text-xs leading-relaxed opacity-60" style={{ color: 'var(--fg)' }}>
                Toronto, Canada → London, UK
              </p>
            </div>

            {/* ——— BLOCK 2: Origin + Current role ——— */}
            <div className="space-y-2  max-w-[600px] mb-6">
              {/* Origin */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--fg)' }}>
                I am a designer and design engineer who grew up on the Amalfi Coast, Italy.
              </p>

              {/* Current role */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--fg)' }}>
                <span className="font-medium">Currently I am designing AI-powered recommendation interfaces and their systems for Walmart</span>{" "}
                <span className="opacity-80">as a Staff UX Designer focusing on trust, transparency, and safe adoption at enterprise scale.</span>
              </p>
            </div>

            {/* ——— BLOCK 3: History + Personal ——— */}
            <div className="space-y-2 max-w-[600px] mb-6">
              {/* History - Theoriq */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--fg)' }}>
                I have designed AI Skills for Obvious and was founding designer and design engineer at Theoriq
                <span className="opacity-80">, where I scaled brand, marketing and product from 0 → 140k active users in 6 months working closely with Engineer and Research.</span>
              </p>

              {/* History - Previous roles */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--fg)' }}>
                Previously, I covered senior design roles at Coinbase {" "}
                <span className="opacity-50">(developer tools) </span> and Voiceflow{" "}
                <span className="opacity-50">(AI Agents, onboarding and activation). Before that, design systems at Zalando and more.</span>
              </p>

              {/* Personal */}
              <p className="text-xs leading-relaxed opacity-50" style={{ color: 'var(--fg)' }}>
                I studied software engineering and my career started in brand design. I am also an avid writer, photographer and yogi. I{" "}
                <span
                  onClick={() => setIsWritingOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setIsWritingOpen(true)
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecorationColor = 'color-mix(in srgb, currentColor 50%, transparent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecorationColor = 'color-mix(in srgb, currentColor 20%, transparent)'
                  }}
                  className="underline underline-offset-2 cursor-pointer transition-all duration-200"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    textDecorationColor: 'color-mix(in srgb, currentColor 20%, transparent)'
                  }}
                >
                  write
                </span>
                {" "}as a form of meditation. I enjoy thoughtful offices and workspaces.
              </p>
            </div>

            {/* ——— BLOCK 4: Timezone message (animated reveal on theme invert) ——— */}
            <AnimatePresence mode="wait">
              {hasShownLocationMessage && (
                <motion.p
                  key="location-message"
                  variants={shouldReduceMotion ? locationMessageReducedMotion : locationMessageVariants}
                  initial="initial"
                  animate="animate"
                  className="text-2xs font-[family-name:var(--font-mono)] max-w-[600px] mb-6 transition-colors duration-200 overflow-hidden"
                  style={{ willChange: 'height, opacity, filter' }}
                >
                  {timezoneMessage}
                </motion.p>
              )}
            </AnimatePresence>

            {/* ——— BLOCK 5: Contact links ——— */}
            <nav className="flex items-center gap-4 group/nav max-w-[600px]">
              <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
              <FooterLink href="mailto:raf@raf.works" label="Email" />
              <FooterLink href="https://x.com/rafdotworks" label="X" external />
            </nav>

          </div>
        </div>
      </main>

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
