"use client"

import { motion } from "framer-motion"

import ContactLinksNav from "@/app/components/layout/ContactLinksNav"
import {
  CONTENT_AREA_WIDE_MAX_WIDTH,
  CONTENT_AREA_WIDE_PADDING,
} from "@/app/components/layout/Section"
import SideTray from "@/app/components/page-specific/SideTray"
import HomepageIdentityTrigger from "@/app/components/pages/homepage/HomepageIdentityTrigger"
import SharedHomepageWorkGallery from "@/app/components/pages/SharedHomepageWorkGallery"
import { useHomepageTrayController } from "@/app/components/pages/homepage/useHomepageTrayController"
import { useHomepageScrollEffects } from "@/app/components/pages/useHomepageScrollEffects"
import { FOOTER_CONFIG } from "@/app/config/footerConfig"
import {
  HOME_WORK_DESKTOP_SECTIONS,
  HOME_WORK_MOBILE_SECTIONS,
  type HomeWorkDesktopSections,
  type HomeWorkMobileSections,
} from "@/app/config/homepageWorkGallery"

type WorkRow = {
  company: string
  role: string
  emphasisClass: string
  groupBreakBefore?: boolean
}

const workRows: ReadonlyArray<WorkRow> = [
  {
    company: "Walmart",
    role: "Staff AI Product Designer",
    emphasisClass: "opacity-100",
  },
  {
    company: "Obvious",
    role: "AI Product Designer",
    emphasisClass: "opacity-100",
    groupBreakBefore: true,
  },
  {
    company: "Theoriq",
    role: "Founding Designer, Design Engineer",
    emphasisClass: "opacity-[0.9]",
  },
  {
    company: "Coinbase",
    role: "Senior Product Designer",
    emphasisClass: "opacity-[0.82]",
  },
  {
    company: "Voiceflow",
    role: "Senior Product Designer",
    emphasisClass: "opacity-[0.74]",
  },
  {
    company: "...",
    role: "Designer, Front-End",
    emphasisClass: "opacity-[0.66]",
  },
]

const secondaryMetaTextClasses = "text-[11px] leading-[1.58] md:text-[13px] md:leading-[1.58]"
const companyCellClasses =
  `w-[5.8rem] pr-4 align-top ${secondaryMetaTextClasses} text-[var(--fg)] md:w-[8.9rem] md:pr-8`

const roleCellClasses =
  `max-w-[26rem] align-top pl-1 ${secondaryMetaTextClasses} text-pretty text-[var(--fg-muted)] md:max-w-[34rem] md:pl-2`

const sectionBreakPaddingClasses = "pt-4 md:pt-5"
const mobileMetaTextClasses = "text-[13px] leading-[1.6]"
const footerPrincipleClasses =
  `${secondaryMetaTextClasses} font-edu-marist leading-[1.54] tracking-[-0.01em] text-[var(--fg-muted)]`
const footerContactNavClasses = `${secondaryMetaTextClasses} text-[var(--fg-muted)]`
const footerContactLinkClasses =
  "block w-full flex items-baseline justify-end gap-1 tracking-normal opacity-[0.78] hover:opacity-100 focus-visible:opacity-100"
const mobileContactLinkClasses =
  "mobile-home-contact-link inline-flex items-center gap-1 text-[14px] leading-[1.5] !opacity-100 !transition-[opacity,text-decoration-color,box-shadow] !duration-150"

const ROOT_HOME_WORK_MOBILE_SECTIONS = {
  ...HOME_WORK_MOBILE_SECTIONS,
  // lead: ["obv1"],
  lead: ["walm5"],
  current: ["walm6"],
} as const satisfies HomeWorkMobileSections

const ROOT_HOME_WORK_DESKTOP_SECTIONS = {
  ...HOME_WORK_DESKTOP_SECTIONS,
  // featured: ["obv1"],
  featured: ["walm5"],
  walmart: ["walm6"],
} as const satisfies HomeWorkDesktopSections

export default function HomeLanding() {
  const [currentWork, ...previousWork] = workRows
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
  } = useHomepageTrayController()
  const {
    containerStyle,
    heroStyle,
    loadMotionProps,
    mobileShellRef,
    mobileShellStyle,
    refs,
    shouldReduceMotion,
    isMobile,
    firstImageScale,
  } = useHomepageScrollEffects()

  return (
    <>
      <main className="min-h-dvh text-[var(--fg)]" style={containerStyle}>
          <section
            className="mx-auto hidden min-h-dvh w-full max-w-[1200px] items-center px-5 pb-8 pt-16 md:flex md:px-14 md:pb-10 md:pt-24"
            style={heroStyle}
          >
            <motion.div
              className="w-full max-w-[860px]"
              {...loadMotionProps}
            >
            <p className="font-edu-marist text-[15px] leading-tight tracking-[-0.02em] text-[var(--fg)] md:text-base">
              <HomepageIdentityTrigger onOpen={openAboutTray} />
            </p>

            <div className="mt-9 md:mt-10">
            <h1 className="max-w-[10.5ch] text-balance font-edu-marist text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.9] tracking-[-0.045em] text-[var(--fg)] md:max-w-[11.5ch]">
            Designer of AI Products
              </h1>
            </div>

            <table className="mt-12 w-full max-w-[52rem] border-separate text-left [border-spacing:0_0.18rem] md:mt-14 md:[border-spacing:0_0.28rem]">
              <caption className="sr-only">Work history</caption>
              <tbody>
                <tr>
                  <td className={`${companyCellClasses} ${currentWork.emphasisClass}`}>
                    {currentWork.company}
                  </td>
                  <td className={`${roleCellClasses} ${currentWork.emphasisClass}`}>
                    {currentWork.role}
                  </td>
                </tr>
                {previousWork.map((row) => (
                  <tr key={row.company}>
                    <td
                      className={`${companyCellClasses}${row.groupBreakBefore ? ` ${sectionBreakPaddingClasses}` : ""} ${row.emphasisClass}`}
                    >
                      {row.company}
                    </td>
                    <td
                      className={`${roleCellClasses}${row.groupBreakBefore ? ` ${sectionBreakPaddingClasses}` : ""} ${row.emphasisClass}`}
                    >
                      {row.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </motion.div>
          </section>

          <motion.section
            ref={mobileShellRef}
            className="mobile-full-bleed mb-0 md:hidden mobile-home-shell"
            style={mobileShellStyle}
          >
            <div className="mobile-home-stage">
              <motion.div
                className="mobile-home-stage-content"
                {...loadMotionProps}
              >
                <p className="font-edu-marist text-[15px] leading-tight tracking-[-0.02em] text-[var(--mobile-home-primary)]">
                  <HomepageIdentityTrigger onOpen={openAboutTray} />
                </p>

                <div className="mobile-home-hero">
                  <div className="mobile-home-hero-header">
                    <div className="mobile-home-hero-title">
                      <h1 className="mobile-home-title font-edu-marist text-[clamp(4rem,17vw,5.5rem)] leading-[0.88] tracking-[-0.02em]">
                        AI Designer
                      </h1>
                    </div>
                  </div>

                  <div className="mobile-home-work">
                    <div className="mobile-home-work-list mt-0">
                      <div className={`grid grid-cols-[minmax(0,5.25rem)_1fr] gap-x-3 ${currentWork.emphasisClass}`}>
                        <p className="text-[13px] leading-[1.58] text-[var(--mobile-home-primary)]">{currentWork.company}</p>
                        <p className={`${mobileMetaTextClasses} text-[var(--mobile-home-meta)]`}>{currentWork.role}</p>
                      </div>
                      {previousWork.map((row) => (
                        <div
                          key={row.company}
                          className={`grid grid-cols-[minmax(0,5.25rem)_1fr] gap-x-3 ${row.groupBreakBefore ? "pt-4" : ""} ${row.emphasisClass}`}
                        >
                          <p className="text-[13px] leading-[1.58] text-[var(--mobile-home-primary)]">{row.company}</p>
                          <p className={`${mobileMetaTextClasses} text-[var(--mobile-home-meta)]`}>{row.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ContactLinksNav
                    ariaLabel="Contact and links"
                    className="mobile-home-contact-list"
                    linkClassName={mobileContactLinkClasses}
                  />
                </div>
              </motion.div>
            </div>
              <div aria-hidden className="mobile-home-scrub-rail" />
          </motion.section>

          <div className="hidden md:block">
            <SharedHomepageWorkGallery
              desktopSections={ROOT_HOME_WORK_DESKTOP_SECTIONS}
              isMobile={isMobile}
              shouldReduceMotion={shouldReduceMotion}
              hideCaptions
              firstImageScale={firstImageScale}
              mobileSections={ROOT_HOME_WORK_MOBILE_SECTIONS}
              refs={refs}
            />
          </div>
      </main>

      <footer
        className={`hidden w-full ${CONTENT_AREA_WIDE_MAX_WIDTH} mx-auto ${CONTENT_AREA_WIDE_PADDING} grid-cols-[1fr_auto] gap-x-[2.5vw] items-baseline pb-10 md:grid md:gap-x-10 md:pb-[16vh]`}
        aria-label="Footer"
      >
        <div className="min-w-0 max-w-prose flex flex-col gap-1 text-left">
          {FOOTER_CONFIG.writing.principles.map(({ number, text }) => (
            <p key={number} className={footerPrincipleClasses}>
              <span className="opacity-70">{number}</span> {text}
            </p>
          ))}
        </div>
        <div className="flex flex-col mb-4 md:mb-0 justify-self-end">
          <ContactLinksNav
            ariaLabel="Contact and links"
            className={`flex flex-col w-full gap-[0.18rem] group/nav text-right ${footerContactNavClasses}`}
            linkClassName={footerContactLinkClasses}
          />
        </div>
      </footer>

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
    </>
  )
}
