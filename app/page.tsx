"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import FooterLink from "@/app/components/layout/FooterLink"
import InlineExternalLink from "@/app/components/layout/InlineExternalLink"
import { useLocationWeather } from "@/hooks/use-timezone-message"
import SideTray from "@/app/components/page-specific/SideTray"
import { useSystemTheme } from "@/hooks/use-system-theme"


export default function Page() {
  const { city, temperature } = useLocationWeather()
  const { prefersDark, isReady } = useSystemTheme()
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

  // Touch gesture tracking for mobile theme toggle
  const touchStartY = useRef(0)
  const touchAccumRef = useRef(0)

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

    // Touch handlers for mobile swipe gestures
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchAccumRef.current = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY.current - e.touches[0].clientY
      touchAccumRef.current = deltaY

      if (Math.abs(touchAccumRef.current) >= WHEEL_THRESHOLD) {
        const swipingDown = touchAccumRef.current > 0

        setThemeInverted((prev) => {
          const next = swipingDown
          if (next === prev) return prev
          return next
        })

        touchAccumRef.current = 0
        touchStartY.current = e.touches[0].clientY
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
    }
  }, [])

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
  // MOBILE SCROLL LOCK — prevent rubber-banding on iOS/Android
  // ============================================================================
  useEffect(() => {
    document.documentElement.classList.add('no-mobile-scroll')
    return () => {
      document.documentElement.classList.remove('no-mobile-scroll')
    }
  }, [])

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

  return (
    <div className="h-dvh overflow-hidden" style={containerStyle}>
      {/* ================================================================
       * SINGLE 100VH HERO — all content in one viewport
       * Three zones: intro (top), bio (middle), meta (bottom)
       * ================================================================ */}
      <main className="h-full w-full max-w-[1400px] md:mx-auto px-3 md:px-20">
        <div className="h-full grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16">
          <div className="md:col-start-2 h-full flex flex-col pt-16 md:pt-0 md:justify-center pb-safe">

            {/* Scrollable content area on mobile if content overflows */}
            <div className="flex-1 overflow-hidden min-h-0 md:flex-initial md:overflow-visible">

            {/* ——— BLOCK 1: Name + location ——— */}
            <div className="max-w-[600px] mb-4 md:mb-6">
              <p className="text-sm leading-relaxed">
                <span className="font-edu-marist">Raf V.</span>
              </p>
              <p className="text-2xs font-[family-name:var(--font-mono)] leading-relaxed opacity-60">
                Toronto (CA) → London (UK)
              </p>
            </div>

            {/* ——— BLOCK 2: Current role + History ——— */}
            <div className="space-y-2 max-w-[600px] mb-4 md:mb-6">
              <p className="text-sm md:text-xs leading-relaxed">
                <span className="font-medium">Designer and design engineer currently at <InlineExternalLink href="https://www.walmart.com">Walmart</InlineExternalLink> as Staff UX Designer,</span>{" "}
                <span className="opacity-80">designing AI recommendation systems for Sellers with focus on trust, transparency, and enterprise adoption.</span>
              </p>
              <p className="text-sm md:text-xs leading-relaxed">
                <span className="opacity-60">Previously designed AI interfaces and Skills at <InlineExternalLink href="https://obvious.ai">Obvious</InlineExternalLink>, founding designer at <InlineExternalLink href="https://theoriq.ai">Theoriq</InlineExternalLink> and Senior Product Designer for <InlineExternalLink href="https://www.coinbase.com/developer-platform/">Coinbase Developer Platform</InlineExternalLink>.</span>{" "}
                <span className="opacity-50">Before that, designed AI agents and improved activation at <InlineExternalLink href="https://voiceflow.com">Voiceflow</InlineExternalLink>, led Design Systems at <InlineExternalLink href="https://partner.zalando.com">Zalando</InlineExternalLink> and more.</span>
              </p>
            </div>

            {/* ——— BLOCK 3: Personal ——— */}
            <div className="max-w-[600px] mb-4 md:mb-6">
              <p className="text-sm md:text-xs leading-relaxed opacity-40">
                I grew up on the Amalfi Coast where I studied software engineering. Started my career in hospitality and brand design. I{" "}
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
                , photograph, and practice yoga. Currently in {city}{temperature ? ` where it's ${temperature}` : ''}.
              </p>
            </div>

            </div>
            {/* End scrollable content wrapper */}

            {/* ——— BLOCK 5: Contact links ——— */}
            <nav
              className="flex items-center gap-4 group/nav max-w-[600px] flex-shrink-0 pt-2 md:pt-4"
            >
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
