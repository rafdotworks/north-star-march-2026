"use client"

import Image from "next/image"
import { motion } from "framer-motion"

import { renderAboutCopyText } from "@/app/components/copy/AboutCopyText"
import ContactLinksNav from "@/app/components/layout/ContactLinksNav"
import { HERO_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"
import LocationWeatherMessage from "@/app/components/layout/LocationWeatherMessage"
import { ABOUT_BIO_COPY } from "@/app/config/aboutModalConfig"
import { ABOUT_TRAY_IMAGE } from "@/app/config/photosConfig"
import { SEMANTIC_TYPOGRAPHY } from "@/app/config/typographyConfig"

interface AboutTrayBiographyProps {
  isMobile: boolean
  onSwitchToWriting?: () => void
  onSwitchToPhotograph?: () => void
  city: string
  temperature: string
  description: string
}

export default function AboutTrayBiography({
  isMobile,
  onSwitchToWriting,
  onSwitchToPhotograph,
  city,
  temperature,
  description,
}: AboutTrayBiographyProps) {
  const hasTrayImage = Boolean(ABOUT_TRAY_IMAGE)
  const headingSize = isMobile
    ? SEMANTIC_TYPOGRAPHY.pageTitle.mobile
    : SEMANTIC_TYPOGRAPHY.pageTitle.desktop
  const bodyText = isMobile
    ? `${SEMANTIC_TYPOGRAPHY.body.mobile} ${SEMANTIC_TYPOGRAPHY.body.lineHeight}`
    : `${SEMANTIC_TYPOGRAPHY.body.desktop} ${SEMANTIC_TYPOGRAPHY.body.lineHeight}`
  const headingMeasure = hasTrayImage ? "max-w-[45ch]" : "max-w-full"
  const bodyMeasure = hasTrayImage ? "w-full max-w-none" : "max-w-[39ch]"
  const mobilePresenceCopy = `${ABOUT_BIO_COPY.location} ${ABOUT_BIO_COPY.outsideWork}`
  const renderInlineAction = (token: "write" | "photograph") => {
    const onClick = token === "write" ? onSwitchToWriting : onSwitchToPhotograph

    if (!onClick) {
      return <span className="opacity-[0.82]">{token}</span>
    }

    return (
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={`Open ${token}`}
        className={`inline-flex cursor-pointer appearance-none bg-transparent p-0 align-baseline text-inherit ${HERO_UNDERLINE_CLASSES}`}
        style={{
          WebkitTapHighlightColor: "transparent",
          background: "transparent",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
        whileTap={{ scale: 0.98, opacity: 0.85 }}
        transition={{ duration: 0.15 }}
      >
        {token}
      </motion.button>
    )
  }

  return (
    <div className={`flex min-h-full ${hasTrayImage ? "w-full" : "max-w-[45ch]"} flex-col text-pretty transition-colors duration-200`}>
      <div className="tray-about-text-fade flex-1 pb-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex flex-col gap-4 md:gap-5">
              <p className={`font-edu-marist ${headingSize} ${SEMANTIC_TYPOGRAPHY.pageTitle.lineHeight} ${headingMeasure} text-balance text-foreground`}>
                {ABOUT_BIO_COPY.lead}
              </p>
              {ABOUT_TRAY_IMAGE ? (
                <figure className="flex w-screen max-w-none flex-col gap-2 self-start -mx-6 md:-mx-8 md:w-[500px]">
                  <div className="relative h-48 w-full overflow-hidden md:h-56">
                    <Image
                      src={ABOUT_TRAY_IMAGE.src}
                      alt={ABOUT_TRAY_IMAGE.alt ?? "Personal photograph"}
                      fill
                      sizes="(max-width: 767px) 100vw, 500px"
                      className="object-cover object-center"
                    />
                  </div>
                  {ABOUT_TRAY_IMAGE.caption && (
                    <figcaption className="type-caption text-[10px] leading-tight text-foreground opacity-[0.44]">
                      {ABOUT_TRAY_IMAGE.caption}
                    </figcaption>
                  )}
                </figure>
              ) : null}
            </div>
            <p className={`${bodyText} ${bodyMeasure} text-pretty text-foreground opacity-[0.72]`}>
              {ABOUT_BIO_COPY.path}
            </p>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <p className={`${bodyText} ${bodyMeasure} text-pretty text-foreground opacity-[0.86]`}>
              {renderAboutCopyText(ABOUT_BIO_COPY.currentRole, { renderActionToken: renderInlineAction })}
            </p>
            <p className={`${bodyText} ${bodyMeasure} text-pretty text-foreground opacity-[0.7]`}>
              {renderAboutCopyText(ABOUT_BIO_COPY.previousRole, { renderActionToken: renderInlineAction })}
            </p>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {isMobile ? (
                <p className={`${bodyText} ${bodyMeasure} text-pretty text-foreground opacity-[0.62]`}>
                  {renderAboutCopyText(mobilePresenceCopy, { renderActionToken: renderInlineAction })}
                </p>
              ) : (
                <>
                  <p className={`${bodyText} ${bodyMeasure} text-pretty text-foreground opacity-[0.62]`}>
                    {ABOUT_BIO_COPY.location}
                  </p>
                  <p className={`${bodyText} ${bodyMeasure} text-pretty text-foreground opacity-[0.56]`}>
                    {renderAboutCopyText(ABOUT_BIO_COPY.outsideWork, { renderActionToken: renderInlineAction })}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-3">
        <LocationWeatherMessage city={city} temperature={temperature} description={description} />
        <ContactLinksNav
          ariaLabel="About tray contact links"
          className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2 group/nav opacity-[0.72]"
          linkClassName="inline-flex items-center gap-1"
        />
      </div>
    </div>
  )
}
