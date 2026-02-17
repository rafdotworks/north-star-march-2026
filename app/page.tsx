"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import FooterLink from "@/app/components/layout/FooterLink"
import InlineExternalLink, { SUBTLE_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"
import { Section } from "@/app/components/layout/Section"
import { VimeoInlineEmbed } from "@/app/components/media/VimeoInlineEmbed"
import SideTray from "@/app/components/page-specific/SideTray"
import { FOOTER_CONFIG } from "@/app/config/footerConfig"
import { PROJECT_VIDEOS } from "@/app/config/portfolioConfig"
import { useSystemTheme } from "@/hooks/use-system-theme"


export default function Page() {
  const { prefersDark, isReady } = useSystemTheme()

  // Writing tray state
  const [isWritingOpen, setIsWritingOpen] = useState(false)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)

  // About tray state
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  // Theme inversion: triggered when first Theoriq images enter viewport (after hero blur)
  const [themeInverted, setThemeInverted] = useState(false)
  const prefersDarkRef = useRef(prefersDark)
  const theoriqSectionRef = useRef<HTMLDivElement>(null)
  const firstImageWrapperRef = useRef<HTMLDivElement>(null)

  // First image expand-on-scroll: scale from 0.75 → 1 as image enters viewport
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: firstImageWrapperRef,
    offset: ["start end", "start start"],
  })
  const firstImageScale = useTransform(scrollYProgress, [0, 1], [0.75, 1])

  // Scroll-based hero blur progress (0 = no blur, 1 = fully blurred/faded)
  const [scrollProgress, setScrollProgress] = useState(0)
  const ticking = useRef(false)

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
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const vh = window.innerHeight
          const progress = Math.min(1, Math.max(0, scrollY / (vh * 0.8)))
          setScrollProgress(1 - Math.pow(1 - progress, 3))
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
      <main className="h-dvh w-full max-w-[1400px] md:mx-auto px-3 md:px-24">
        <div
          className="h-full grid grid-cols-1 md:grid-cols-[auto_1fr_auto] md:grid-rows-[auto_auto_auto] gap-x-[2.5vw] md:gap-x-10 gap-y-0 md:gap-y-0 content-start md:content-center items-start md:items-baseline pt-16 md:pt-0 pb-safe overflow-auto md:overflow-visible min-h-0"
          style={{
            filter: `blur(${heroBlur}px)`,
            transform: `scale(${heroScale})`,
            opacity: heroOpacity,
            willChange: scrollProgress > 0 ? 'filter, transform, opacity' : 'auto'
          }}
        >
          {/* Row 1, Col 1: Identity */}
          <div className="mb-4 md:mb-0 text-left">
            <p className="text-sm leading-relaxed">
              <span
                onClick={() => {
                  setIsAboutOpen(true)
                  setIsWritingOpen(false)
                  setSelectedWritingArticle(null)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setIsAboutOpen(true)
                    setIsWritingOpen(false)
                    setSelectedWritingArticle(null)
                  }
                }}
                className={`font-edu-marist cursor-pointer select-none ${SUBTLE_UNDERLINE_CLASSES}`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Raf V.
              </span>
            </p>
            {/* <p className="text-2xs font-[family-name:var(--font-mono)] leading-relaxed opacity-60">
              AI Designer
            </p> */}
          </div>

          {/* Col 2: single cell spanning 3 rows, unified spacing between blocks */}
          <div className={`max-w-[600px] mb-4 md:mb-0 md:row-span-3 text-left flex flex-col ${heroStackGap}`}>
            <p className="text-sm md:text-xs leading-relaxed">
              AI Designer and Design Engineer
            </p>
            <div className="flex flex-col gap-1.5 md:gap-0 mt-2.5">
              <p className="text-sm md:text-xs leading-relaxed">
                <span className="opacity-80">Currently at <InlineExternalLink href="https://www.walmart.com">Walmart</InlineExternalLink> designing AI-powered recommendations</span>
              </p>
              <p className="text-sm md:text-xs leading-relaxed">
                <span className="opacity-60">Previously <InlineExternalLink href="https://theoriq.ai" underlineStyle="subtle">Theoriq</InlineExternalLink>, <InlineExternalLink href="https://www.coinbase.com/developer-platform/" underlineStyle="subtle">Coinbase</InlineExternalLink>, <InlineExternalLink href="https://voiceflow.com" underlineStyle="subtle">Voiceflow</InlineExternalLink>, <InlineExternalLink href="https://partner.zalando.com" underlineStyle="subtle">Zalando</InlineExternalLink> and more</span>
              </p>
            </div>
          </div>

          {/* Row 1, Col 3: Links (same as About side tray, vertical stack) */}
          <div className="max-w-[600px] mb-4 md:mb-0 hidden md:block flex flex-col md:justify-self-end">
            <nav className={`flex flex-col w-full ${heroStackGap} group/nav`} aria-label="Contact and links">
              <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external className="block w-full flex justify-end items-center gap-1" />
              <FooterLink href="mailto:raf@raf.works" label="Email" className="block w-full flex justify-end items-center gap-1" />
              <FooterLink href="https://x.com/rafdotworks" label="X" external className="block w-full flex justify-end items-center gap-1" />
            </nav>
          </div>

          {/* Row 2, Col 1: empty */}
          <div className="hidden md:block" aria-hidden />

          {/* Row 2, Col 3: empty */}
          <div className="hidden md:block" aria-hidden />

          {/* Row 3, Col 1: empty */}
          <div className="hidden md:block" aria-hidden />

          {/* Row 3, Col 3: empty */}
          <div className="hidden md:block" aria-hidden />
        </div>
      </main>

      {/* ================================================================
       * WORK — one section per project, 8–10vh spacing, equal-column grid
       * Order: current-ai, obv, walm, theo, cb, vf, atl, zl, ew
       * ================================================================ */}
      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <motion.div
            ref={firstImageWrapperRef}
            className="w-full"
            style={{
              scale: shouldReduceMotion ? 1 : firstImageScale,
              transformOrigin: "center center",
            }}
          >
            <Image src="/work/current-ai.webp" alt="Current AI work - animated preview of AI assistant interface" width={2400} height={1600} sizes="100vw" className="w-full h-auto" priority quality={85} />
          </motion.div>
          <Image src="/work/q2-26-works/obv/obv-1.png" alt="Obvious work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" priority quality={85} />
          <Image src="/work/q2-26-works/obv/obv-2.png" alt="Obvious work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" priority quality={85} />
        </div>
      </Section>

      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          {/* <Image src="/work/q2-26-works/walm/walm-1.png" alt="Walmart work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
          {/* <Image src="/work/q2-26-works/walm/walm-2.png" alt="Walmart work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
          <Image src="/work/q2-26-works/walm/walm-3.png" alt="Walmart work 3" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          {/* <Image src="/work/q2-26-works/walm/walm-4.png" alt="Walmart work 4" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} /> */}
        </div>
      </Section>

      <Section wide>
        <div ref={theoriqSectionRef} className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/theo/theo-1.png" alt="Theoriq work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          {PROJECT_VIDEOS.theo && (
            <VimeoInlineEmbed videoUrl={PROJECT_VIDEOS.theo} className="w-full" />
          )}
          <Image src="/work/q2-26-works/theo/theo-2.png" alt="Theoriq work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/theo/theo-3.png" alt="Theoriq work 3" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/cb/cb-1.png" alt="Coinbase work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/cb/cb-2.png" alt="Coinbase work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/cb/cb-3.png" alt="Coinbase work 3" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/cb/cb-4.png" alt="Coinbase work 4" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/cb/cb-5.png" alt="Coinbase work 5" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/vf/vf-1.png" alt="Voiceflow work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/vf/vf-2.png" alt="Voiceflow work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/atl/atl-1.png" alt="Atlan work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/atl/atl-2.png" alt="Atlan work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/zl/zl-1.png" alt="Zalando work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/zl/zl-2.png" alt="Zalando work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      <Section wide>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-2">
          <Image src="/work/q2-26-works/ew/ew-1.png" alt="Elsewhere work 1" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-2.png" alt="Elsewhere work 2" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-3.png" alt="Elsewhere work 3" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-4.png" alt="Elsewhere work 4" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-5.png" alt="Elsewhere work 5" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-6.png" alt="Elsewhere work 6" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
          <Image src="/work/q2-26-works/ew/ew-7.png" alt="Elsewhere work 7" width={2400} height={1600} sizes="100vw" className="w-full h-auto" loading="lazy" quality={85} />
        </div>
      </Section>

      {/* ================================================================
       * FOOTER — principles + contact links (mirrors hero layout)
       * ================================================================ */}
      <footer
        className="w-full max-w-[1400px] mx-auto px-3 md:px-24 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-[2.5vw] md:gap-x-10 items-baseline pb-[16vh]"
        aria-label="Footer"
      >
        <div className="max-w-[600px] flex flex-col gap-1 text-left">
          {FOOTER_CONFIG.writing.principles.map(({ number, text }) => (
            <p key={number} className="type-caption font-edu-marist leading-relaxed text-muted-foreground/80">
              <span className="opacity-70">{number}</span> {text}
            </p>
          ))}
        </div>
        <div className="max-w-[600px] flex flex-col mb-4 md:mb-0 md:justify-self-end">
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
