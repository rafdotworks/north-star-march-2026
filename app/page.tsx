/**
 * Minimal portfolio homepage: hero, work gallery, footer, writing/about SideTray.
 */
"use client"

import React, { useCallback, useEffect, useState, useRef, useMemo } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import FooterLink from "@/app/components/layout/FooterLink"
import InlineExternalLink, { HERO_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"
import { Section, CONTENT_AREA_WIDE_MAX_WIDTH, CONTENT_AREA_WIDE_PADDING } from "@/app/components/layout/Section"
import { VimeoInlineEmbed } from "@/app/components/media/VimeoInlineEmbed"
import SideTray from "@/app/components/page-specific/SideTray"
import { FOOTER_CONFIG } from "@/app/config/footerConfig"
import { PROJECT_VIDEOS } from "@/app/config/portfolioConfig"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { LOAD_FOCUS } from "@/components/animations/LoadingAnimations"


export default function Page() {
  const { prefersDark, isReady } = useSystemTheme()

  // Writing tray state
  const [isWritingOpen, setIsWritingOpen] = useState(false)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // About tray state
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  /** Open About tray and close Writing; shared by click and touch so mobile tap works inside transformed hero */
  const openAboutTray = useCallback(() => {
    setIsAboutOpen(true)
    setIsWritingOpen(false)
    setSelectedWritingArticle(null)
  }, [])

  /** Touch start position for tap detection (avoid treating scroll as tap) */
  const aboutTriggerTouchStart = useRef<{ x: number; y: number } | null>(null)
  const TAP_MOVE_THRESHOLD_PX = 10

  // Theme inversion: triggered when first Theoriq images enter viewport (after hero blur)
  const [themeInverted, setThemeInverted] = useState(false)
  const prefersDarkRef = useRef(prefersDark)
  const theoriqSectionRef = useRef<HTMLDivElement>(null)
  /** Ref for the actual first image in the work area — entry effect target */
  const firstWorkImageRef = useRef<HTMLDivElement>(null)

  // Entry effect: scale 0.75 → 1 as the first work image (and only it) enters viewport
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: firstWorkImageRef,
    offset: ["start end", "start start"],
  })
  const firstImageScale = useTransform(scrollYProgress, [0, 1], [0.75, 1])

  // Scroll-based hero blur progress (0 = no blur, 1 = fully blurred/faded)
  const [scrollProgress, setScrollProgress] = useState(0)
  const ticking = useRef(false)

  // Load animation complete — hand off to scroll-driven hero style (blur/scale/opacity)
  const [loadComplete, setLoadComplete] = useState(false)

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
  // THEME SWITCH WHEN THEORIQ ENTERS VIEW — after hero blur, invert theme as first Theoriq images appear
  // ============================================================================
  useEffect(() => {
    const el = theoriqSectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry) setThemeInverted(entry.isIntersecting)
      },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
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
  // HERO BLUR ON SCROLL — blur/fade/scale hero as user scrolls to images
  // ============================================================================
  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, scrollY / (vh * 0.8)))
      setScrollProgress(1 - Math.pow(1 - progress, 3))
    }
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          updateProgress()
          ticking.current = false
        })
        ticking.current = true
      }
    }
    updateProgress() // run once on mount (e.g. if page loads while already scrolled)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ============================================================================
  // LOAD ANIMATION COMPLETE — gentle hero load then hand off to scroll-driven style
  // ============================================================================
  useEffect(() => {
    if (shouldReduceMotion) {
      setLoadComplete(true)
      return
    }
    const timer = setTimeout(() => setLoadComplete(true), 1700)
    const onScroll = () => {
      clearTimeout(timer)
      setLoadComplete(true)
    }
    window.addEventListener('scroll', onScroll, { once: true, passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [shouldReduceMotion])

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

  // Lock body scroll when side tray is open (writing or about)
  const trayOpen = isWritingOpen || isAboutOpen
  useEffect(() => {
    if (trayOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [trayOpen])

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
  // HERO BLUR DERIVED VALUES — three-phase transition from scrollProgress
  // Phase 1 (0-40%): Build up blur quickly
  // Phase 2 (40-70%): Linger at peak blur
  // Phase 3 (70-100%): Dramatic fade-out exit
  // ============================================================================
  let heroBlur: number, heroOpacity: number, heroScale: number

  if (scrollProgress < 0.4) {
    const p = scrollProgress / 0.4
    const e = 1 - Math.pow(1 - p, 2)
    heroBlur = e * 32
    heroOpacity = 1 - (e * 0.05)
    heroScale = 1 - (e * 0.03)
  } else if (scrollProgress < 0.7) {
    heroBlur = 32
    heroOpacity = 0.95
    heroScale = 0.97
  } else {
    const p = (scrollProgress - 0.7) / 0.3
    heroBlur = 32
    heroOpacity = 0.95 - (p * 0.75)
    heroScale = 0.97 - (p * 0.09)
  }

  const heroStackGap = "gap-1"

  return (
    <div className="min-h-dvh" style={containerStyle}>
      {/* ================================================================
       * HERO SECTION — first viewport with intro content
       * Followed by scrollable work image gallery
       * ================================================================ */}
      <main className="h-dvh w-full max-w-[1200px] md:mx-auto px-3 md:px-28">
        {/* Scroll-driven blur/scale/opacity on a plain div so it reliably updates with scroll (not overridden by Framer Motion) */}
        <div
          className="h-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-[2.5vw] md:gap-x-10 gap-y-0 content-end md:content-center items-end md:items-baseline pt-16 pt-safe md:pt-0 pb-16 pb-safe overflow-auto md:overflow-visible min-h-0 scrollbar-gutter-stable"
          style={{
            filter: `blur(${heroBlur}px)`,
            transform: `scale(${heroScale})`,
            opacity: heroOpacity,
            willChange: scrollProgress > 0 ? 'filter, transform, opacity' : 'auto'
          }}
        >
          {/* Load-in animation only: blur + fade in; after loadComplete, scroll-driven style above controls appearance */}
          <motion.div
            className="h-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-[2.5vw] md:gap-x-10 gap-y-0 content-end md:content-center items-end md:items-baseline min-h-0 col-span-1 md:col-span-2"
            initial={!shouldReduceMotion && !loadComplete ? { filter: `blur(${LOAD_FOCUS.BLUR_PX}px)`, opacity: 0 } : false}
            animate={!shouldReduceMotion && !loadComplete ? { filter: "blur(0px)", opacity: 1 } : false}
            transition={{ duration: LOAD_FOCUS.DURATION, ease: LOAD_FOCUS.EASE }}
            style={loadComplete ? undefined : { willChange: 'filter, opacity' }}
          >
          {/* Col 1: Identity */}
          <div className="mb-4 md:mb-0 text-left">
            <p className="text-sm leading-relaxed">
              <button
                type="button"
                onClick={openAboutTray}
                onTouchStart={(e) => {
                  const t = e.targetTouches[0]
                  if (t) aboutTriggerTouchStart.current = { x: t.clientX, y: t.clientY }
                }}
                onTouchEnd={(e) => {
                  const start = aboutTriggerTouchStart.current
                  aboutTriggerTouchStart.current = null
                  if (!start) return
                  const t = e.changedTouches[0]
                  if (!t) return
                  const dx = Math.abs(t.clientX - start.x)
                  const dy = Math.abs(t.clientY - start.y)
                  if (dx <= TAP_MOVE_THRESHOLD_PX && dy <= TAP_MOVE_THRESHOLD_PX) {
                    e.preventDefault()
                    openAboutTray()
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    openAboutTray()
                  }
                }}
                className={`font-edu-marist cursor-pointer select-none appearance-none border-0 p-0 text-left text-inherit outline-none ring-0 shadow-none ${HERO_UNDERLINE_CLASSES}`}
                style={{ background: "transparent", WebkitTapHighlightColor: "transparent", touchAction: "manipulation", WebkitAppearance: "none", MozAppearance: "none" }}
              >
                Raf V.
              </button>
            </p>
          </div>

          {/* Col 2: bio + contact row on desktop; bio only on mobile (contact in footer) */}
          <div className="mb-4 md:mb-0 flex flex-col md:flex-row md:gap-x-10 md:items-end min-w-0">
            {/* Bio block — same as before */}
            <div className={`max-w-[600px] text-left flex flex-col ${heroStackGap}`}>
              {/* Title block — mt-2 on mobile so this line sits lower (not second line moving up) */}
              <p className="mt-2 md:mt-0 text-sm md:text-xs leading-relaxed">
                AI Designer and Design Engineer
              </p>
              {/* Context block — mt-2 on mobile (tighter), mt-6 on desktop */}
              <div className="mt-2 md:mt-6">
                <p className="text-sm md:text-xs leading-relaxed">
                  <span className="opacity-80">Designing AI recommendations at <InlineExternalLink href="https://www.walmart.com">Walmart</InlineExternalLink>.</span>
                </p>
                <p className="hidden md:block text-sm md:text-xs leading-relaxed mt-1">
                  <span className="opacity-60">Previously <InlineExternalLink href="https://obvious.ai" underlineStyle="subtle">Obvious</InlineExternalLink>, <InlineExternalLink href="https://theoriq.ai" underlineStyle="subtle">Theoriq</InlineExternalLink>, <InlineExternalLink href="https://www.coinbase.com/developer-platform/" underlineStyle="subtle">Coinbase</InlineExternalLink>, <InlineExternalLink href="https://voiceflow.com" underlineStyle="subtle">Voiceflow</InlineExternalLink> and more.</span>
                </p>
                <div className="hidden md:block mt-6 text-sm md:text-xs leading-relaxed font-edu-marist">
                  <nav className="flex flex-row flex-wrap items-center gap-x-6 group/nav" aria-label="Contact and links">
                    <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external className="inline-flex items-center gap-1" />
                    <FooterLink href="mailto:raf@raf.works" label="Email" className="inline-flex items-center gap-1" />
                    <FooterLink href="https://x.com/rafdotworks" label="X" external className="inline-flex items-center gap-1" />
                  </nav>
                </div>
              </div>
              {/* Links block — mt-8 from context (structural release); hidden on desktop (links in context block) */}
              <div className="text-sm md:text-xs leading-relaxed font-edu-marist mt-8 md:hidden">
                <nav className="flex flex-row flex-wrap items-center gap-x-6 group/nav" aria-label="Contact and links">
                  <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external className="inline-flex items-center gap-1" />
                  <FooterLink href="mailto:raf@raf.works" label="Email" className="inline-flex items-center gap-1" />
                  <FooterLink href="https://x.com/rafdotworks" label="X" external className="inline-flex items-center gap-1" />
                </nav>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </main>

      {/* ================================================================
       * WORK — one section per project, 8–10vh spacing, equal-column grid
       * Order: obv, walm, theo, cb, vf, atl, zl, ew
       * ================================================================ */}
      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          {/* First image in work area — gets entry scale effect */}
          <motion.div
            ref={firstWorkImageRef}
            className="w-full"
            style={{
              scale: shouldReduceMotion ? 1 : firstImageScale,
              transformOrigin: "center center",
            }}
          >
            <Image src="/work/q2-26-works/obv/obv-1.png" alt="Obvious: chat interface with workflow progress and “remember this workflow” prompt" width={2400} height={1600} sizes="100vw" className="w-full h-auto" priority quality={85} />
          </motion.div>
          {/* <Image src="/work/q2-26-works/obv/obv-2.png" alt="Obvious: Skills dashboard with “Teach once” and trending workflow cards" width={2400} height={1600} sizes="100vw" className="w-full h-auto" priority quality={85} /> */}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          {/* <Image src="/work/q2-26-works/walm/walm-1.png" alt="Walmart: AI recommendations or product interface" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />  */}
          {/* <Image src="/work/q2-26-works/walm/walm-2.png" alt="Walmart: recommendations experience or dashboard" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
            {/* <Image src="/work/q2-26-works/walm/walm-3.png" alt="Walmart: AI-powered recommendations interface" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
          {/* <Image src="/work/q2-26-works/walm/walm-4.png" alt="Walmart: AI product or design detail" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
        <Image src="/work/q2-26-works/walm/walm-5.png" alt="Walmart: AI product or design detail" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div ref={theoriqSectionRef} className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          {PROJECT_VIDEOS.theo && (
            <VimeoInlineEmbed videoUrl={PROJECT_VIDEOS.theo} className="w-full" />
          )}
          <Image src="/work/q2-26-works/theo/theo-2.png" alt="Theoriq: Infinity Studio or Hub interface for AI agents" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/theo/theo-3.png" alt="Theoriq: agent workspace or marketplace view" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/theo/theo-4.png" alt="Theoriq: agent workspace or marketplace view" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/theo/theo-6.png" alt="Theoriq: agent workspace or marketplace view" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/cb/cb-1.png" alt="Coinbase Developer Platform: API docs or developer tools" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          {/* <Image src="/work/q2-26-works/cb/cb-2.png" alt="Coinbase Developer Platform: dashboard or project overview" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
          <Image src="/work/q2-26-works/cb/cb-3.png" alt="Coinbase Developer Platform: SQL Playground or query interface" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/cb/cb-4.png" alt="Coinbase Developer Platform: product surface or flow" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/cb/cb-5.png" alt="Coinbase Developer Platform: developer experience or onboarding" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/vf/vf-1.png" alt="Voiceflow: conversation design or dialog editor" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          {/* <Image src="/work/q2-26-works/vf/vf-2.png" alt="Voiceflow: agent builder or early activation flow" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
          <Image src="/work/q2-26-works/vf/vf-3.png" alt="Voiceflow: agent builder or early activation flow" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />  
          <Image src="/work/q2-26-works/vf/vf-4.png" alt="Voiceflow: agent builder or early activation flow" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/atl/atl-1.png" alt="Atlas: crypto marketplace or NFT collections" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/atl/atl-2.png" alt="Atlas: trading, borrowing, or analytics view" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> 
          <Image src="/work/q2-26-works/atl/atl-3.png" alt="Atlas: trading, borrowing, or analytics view" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/atl/atl-4.png" alt="Atlas: trading, borrowing, or analytics view" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/zl/zl-1.png" alt="Zalando B2B: design system documentation or guidelines" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/zl/zl-2.png" alt="Zalando B2B: design system components or patterns" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/zl/zl-3.png" alt="Zalando B2B: design system components or patterns" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/zl/zl-6.png" alt="Zalando B2B: design system components or patterns" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/ew/ew-1.png" alt="Early work: brand or interface design" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-2.png" alt="Early work: brand or product interface" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-3.png" alt="Early work: visual design or website" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-4.png" alt="Early work: product or brand project" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-5.png" alt="Early work: interface or identity" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-6.png" alt="Early work: design showcase" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-7.png" alt="Early work: portfolio piece" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      {/* ================================================================
       * FOOTER — principles + contact links. Same content band as work sections.
       * ================================================================ */}
      <footer
        className={`w-full ${CONTENT_AREA_WIDE_MAX_WIDTH} mx-auto ${CONTENT_AREA_WIDE_PADDING} grid grid-cols-[1fr_auto] gap-x-[2.5vw] md:gap-x-10 items-baseline pb-[16vh]`}
        aria-label="Footer"
      >
        <div className="min-w-0 max-w-prose flex flex-col gap-1 text-left">
          {FOOTER_CONFIG.writing.principles.map(({ number, text }) => (
            <p key={number} className="type-caption font-edu-marist leading-relaxed text-muted-foreground/80">
              <span className="opacity-70">{number}</span> {text}
            </p>
          ))}
        </div>
        <div className="flex flex-col mb-4 md:mb-0 justify-self-end">
          <nav className="flex flex-col w-full gap-1 group/nav" aria-label="Contact and links">
            <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external className="block w-full flex justify-end items-center gap-1" />
            <FooterLink href="mailto:raf@raf.works" label="Email" className="block w-full flex justify-end items-center gap-1" />
            <FooterLink href="https://x.com/rafdotworks" label="X" external className="block w-full flex justify-end items-center gap-1" />
          </nav>
        </div>
      </footer>

      {/* Side tray (writing + about modes) */}
      <SideTray
        articleId={isWritingOpen ? selectedWritingArticle : null}
        onClose={() => {
          setIsWritingOpen(false)
          setIsAboutOpen(false)
          setSelectedWritingArticle(null)
        }}
        onCloseWritingOnly={() => {
          setIsWritingOpen(false)
          setSelectedWritingArticle(null)
        }}
        isWritingMode={isWritingOpen}
        isAboutMode={isAboutOpen}
        onArticleSelect={setSelectedWritingArticle}
        onSwitchToWriting={() => {
          setIsWritingOpen(true)
        }}
      />
    </div>
  )
}
