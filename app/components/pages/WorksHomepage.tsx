/**
 * Works homepage: original portfolio landing experience with hero, gallery, and side tray.
 */
"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { renderAboutCopyText } from "@/app/components/copy/AboutCopyText"
import ContactLinksNav from "@/app/components/layout/ContactLinksNav"
import InlineExternalLink from "@/app/components/layout/InlineExternalLink"
import { CONTENT_AREA_WIDE_MAX_WIDTH, CONTENT_AREA_WIDE_PADDING } from "@/app/components/layout/Section"
import SideTray from "@/app/components/page-specific/SideTray"
import HomepageIdentityTrigger from "@/app/components/pages/homepage/HomepageIdentityTrigger"
import SharedHomepageWorkGallery from "@/app/components/pages/SharedHomepageWorkGallery"
import { useHomepageTrayController } from "@/app/components/pages/homepage/useHomepageTrayController"
import { useWritingsUrlSync } from "@/app/components/pages/homepage/useWritingsUrlSync"
import { useHomepageScrollEffects } from "@/app/components/pages/useHomepageScrollEffects"
import { COMPANY_LINKS } from "@/app/config/companyLinks"
import { FOOTER_CONFIG } from "@/app/config/footerConfig"
import { MOBILE_HERO_COPY } from "@/app/config/aboutModalConfig"
import { SEMANTIC_TYPOGRAPHY } from "@/app/config/typographyConfig"

export default function WorksHomepage() {
  const pathname = usePathname()
  const {
    isWritingOpen,
    isAboutOpen,
    isPhotosOpen,
    selectedWritingArticle,
    closeAllTrays,
    closeWritingTray,
    closePhotosTray,
    openAboutTray,
    openPhotosTray,
    selectWritingArticle,
    syncWritingFromUrl,
  } = useHomepageTrayController()
  const {
    containerStyle,
    heroStyle,
    isMobile,
    loadMotionProps,
    refs,
    shouldReduceMotion,
    firstImageScale,
  } = useHomepageScrollEffects()

  useWritingsUrlSync({
    pathname,
    isWritingOpen,
    selectedWritingArticle,
    syncWritingFromUrl,
  })

  const heroStackGap = "gap-1"

  return (
    <div className="min-h-dvh" style={containerStyle}>
      {/* ================================================================
       * HERO SECTION — first viewport with intro content
       * Followed by scrollable work image gallery
       * ================================================================ */}
      <main className={`h-dvh w-full max-w-[1200px] md:mx-auto px-3 md:px-28 ${isMobile ? "min-h-dvh" : ""}`}>
        {/* Scroll-driven blur/scale/opacity on a plain div so it reliably updates with scroll (not overridden by Framer Motion) */}
        <div
          className="h-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-[2.5vw] md:gap-x-10 gap-y-0 content-end md:content-center items-end md:items-baseline pt-16 pt-safe md:pt-0 pb-16 pb-safe overflow-auto md:overflow-visible min-h-0 scrollbar-gutter-stable"
          style={heroStyle}
        >
          {/* Load-in animation only: blur + fade in; after loadComplete, scroll-driven style above controls appearance */}
          <motion.div
            className={isMobile
              ? "h-full flex flex-col justify-end min-h-0 col-span-1 md:col-span-2 text-left max-w-[600px]"
              : "h-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-[2.5vw] md:gap-x-10 gap-y-0 content-end md:content-center items-end md:items-baseline min-h-0 col-span-1 md:col-span-2"
            }
            {...loadMotionProps}
          >
          {isMobile ? (
            /* Mobile hero: single column, spacing + opacity hierarchy */
            <div className="flex flex-col space-y-4 pb-5">
              <p className="font-edu-marist text-base leading-tight tracking-[-0.02em] text-balance text-[var(--fg)]">
                {MOBILE_HERO_COPY.name}
              </p>
              <p className={`${SEMANTIC_TYPOGRAPHY.body.mobile} ${SEMANTIC_TYPOGRAPHY.body.lineHeight} text-pretty text-[var(--fg)]`}>
                <span>{renderAboutCopyText(MOBILE_HERO_COPY.summaryPrimary)} </span>
                <span className="opacity-70">
                  {renderAboutCopyText(MOBILE_HERO_COPY.summarySecondary)}
                </span>
              </p>
              <p className={`${SEMANTIC_TYPOGRAPHY.body.mobile} ${SEMANTIC_TYPOGRAPHY.body.lineHeight} text-pretty text-[var(--fg)] opacity-60`}>
                {MOBILE_HERO_COPY.location}
              </p>
              <ContactLinksNav
                ariaLabel="Contact and links"
                className="flex flex-row flex-wrap items-center gap-x-6 group/nav opacity-75"
                linkClassName="inline-flex items-center gap-1"
              />
            </div>
          ) : (
            <>
          {/* Col 1: Identity (desktop only — opens About tray) */}
          <div className="mb-4 md:mb-0 text-left">
            <p className="font-edu-marist text-base leading-tight tracking-[-0.02em] text-[var(--fg)] text-balance md:text-lg">
              <HomepageIdentityTrigger onOpen={openAboutTray} className="font-edu-marist" />
            </p>
          </div>

          {/* Col 2: bio + contact row on desktop */}
          <div className="mb-4 md:mb-0 flex flex-col md:flex-row md:gap-x-10 md:items-end min-w-0">
            <div className={`max-w-[600px] text-left flex flex-col ${heroStackGap}`}>
              <p className="mt-2 md:mt-0 text-sm leading-[1.55] text-[var(--fg)] opacity-72">
                Designer and Design Engineer
              </p>
              <div className="mt-2 md:mt-5">
                <p className="text-sm leading-[1.6] text-pretty text-[var(--fg)]">
                  <span className="opacity-80">Designing AI workflows and recommendations at <InlineExternalLink href={COMPANY_LINKS.walmart}>Walmart</InlineExternalLink></span>
                </p>
                <p className="hidden md:block mt-1 text-sm leading-[1.6] text-pretty text-[var(--fg)]">
                  <span className="opacity-62">Previously <InlineExternalLink href={COMPANY_LINKS.theoriq} underlineStyle="subtle">Theoriq</InlineExternalLink>, <InlineExternalLink href={COMPANY_LINKS.obvious} underlineStyle="subtle">Obvious</InlineExternalLink>, <InlineExternalLink href={COMPANY_LINKS.coinbase} underlineStyle="subtle">Coinbase</InlineExternalLink>, <InlineExternalLink href={COMPANY_LINKS.voiceflow} underlineStyle="subtle">Voiceflow</InlineExternalLink> and more</span>
                </p>
                <div className="hidden md:block mt-6 opacity-75">
                  <ContactLinksNav
                    ariaLabel="Contact and links"
                    className="flex flex-row flex-wrap items-center gap-x-6 group/nav"
                    linkClassName="inline-flex items-center gap-1"
                  />
                </div>
              </div>
            </div>
          </div>
          </>
          )}
          </motion.div>
        </div>
      </main>

      {/* ================================================================
       * WORK — captioned gallery (mobile curation, desktop full sequence)
       * ================================================================ */}
      <SharedHomepageWorkGallery
        isMobile={isMobile}
        shouldReduceMotion={shouldReduceMotion}
        firstImageScale={firstImageScale}
        refs={refs}
      />

      {/* ================================================================
       * FOOTER — principles + contact links. Same content band as work sections.
       * ================================================================ */}
      <footer
        className={`w-full ${CONTENT_AREA_WIDE_MAX_WIDTH} mx-auto ${CONTENT_AREA_WIDE_PADDING} grid grid-cols-[1fr_auto] gap-x-[2.5vw] md:gap-x-10 items-baseline pb-10 md:pb-[16vh]`}
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
          <ContactLinksNav
            ariaLabel="Contact and links"
            className="flex flex-col w-full gap-1 group/nav"
            linkClassName="block w-full flex justify-end items-center gap-1"
          />
        </div>
      </footer>

      {/* Side tray (writing + about + photos modes) */}
      <SideTray
        articleId={isWritingOpen ? selectedWritingArticle : null}
        onClose={closeAllTrays}
        onCloseWritingOnly={closeWritingTray}
        onClosePhotosOnly={closePhotosTray}
        isWritingMode={isWritingOpen}
        isPhotosMode={isPhotosOpen}
        isAboutMode={isAboutOpen}
        onArticleSelect={selectWritingArticle}
        onSwitchToWriting={() => selectWritingArticle(null)}
        onSwitchToPhotograph={openPhotosTray}
      />
    </div>
  )
}
