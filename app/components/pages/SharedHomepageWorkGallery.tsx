"use client"

import Image from "next/image"
import { motion, type MotionValue } from "framer-motion"
import type { MutableRefObject } from "react"

import { Section } from "@/app/components/layout/Section"
import { VimeoInlineEmbed } from "@/app/components/media/VimeoInlineEmbed"
import {
  HOME_WORK_DESKTOP_SECTIONS,
  HOME_WORK_FIGURES,
  HOME_WORK_MOBILE_SECTIONS,
  type HomeWorkDesktopSections,
  type HomeWorkFigure,
  type HomeWorkFigureKey,
  type HomeWorkMobileSections,
} from "@/app/config/homepageWorkGallery"
import { IMAGE_QUALITY, PROJECT_VIDEOS } from "@/app/config/portfolioConfig"
import { LOAD_FOCUS } from "@/components/animations/LoadingAnimations"

const WORK_GALLERY_COLUMN = "col-span-1 md:col-span-2 lg:col-span-3"
const WORK_GALLERY_STACK = "flex flex-col gap-6 md:gap-8"
const WORK_CAPTION_LABEL_STYLE = { opacity: 0.86 }
const WORK_CAPTION_CONTEXT_INITIAL = { opacity: 0, y: 3, filter: "blur(4px)" }
const WORK_CAPTION_CONTEXT_VISIBLE = { opacity: 0.72, y: 0, filter: "blur(0px)" }
const WORK_CAPTION_VIEWPORT = { once: true, amount: 0.6 }

export type HomepageWorkGalleryRefs = {
  mobileFirstWorkImageRef: MutableRefObject<HTMLDivElement | null>
  desktopFirstWorkImageRef: MutableRefObject<HTMLDivElement | null>
  theoriqVideoRef: MutableRefObject<HTMLDivElement | null>
  coinbaseSectionRef: MutableRefObject<HTMLDivElement | null>
}

type WorkGalleryFigureProps = {
  figure: HomeWorkFigure
  shouldReduceMotion: boolean
  hideCaption?: boolean
  imageRef?: MutableRefObject<HTMLDivElement | null>
  imageScale?: MotionValue<number> | number
}

type SharedHomepageWorkGalleryProps = {
  desktopSections?: HomeWorkDesktopSections
  isMobile: boolean
  shouldReduceMotion: boolean
  hideCaptions?: boolean
  firstImageScale: MotionValue<number> | number
  mobileSections?: HomeWorkMobileSections
  refs: HomepageWorkGalleryRefs
}

function WorkGalleryFigure({
  figure,
  shouldReduceMotion,
  hideCaption = false,
  imageRef,
  imageScale,
}: WorkGalleryFigureProps) {
  const assignImageRef = (node: HTMLDivElement | null) => {
    if (imageRef) {
      imageRef.current = node
    }
  }

  const imageElement = (
    <Image
      src={figure.src}
      alt={figure.alt}
      width={2400}
      height={1600}
      sizes="100vw"
      className="h-auto w-full"
      priority={figure.priority}
      loading={figure.priority ? undefined : "lazy"}
      quality={IMAGE_QUALITY}
    />
  )

  const media =
    typeof imageScale !== "undefined" ? (
      <motion.div
        ref={assignImageRef}
        className="w-full"
        style={{
          scale: imageScale,
          transformOrigin: "center center",
        }}
      >
        {imageElement}
      </motion.div>
    ) : imageRef ? (
      <div ref={assignImageRef} className="w-full">
        {imageElement}
      </div>
    ) : (
      imageElement
    )

  return (
    <figure className={`m-0 ${hideCaption ? "" : "flex flex-col gap-[10px] md:gap-3"}`}>
      {media}
      {!hideCaption && (
        <figcaption
          className="flex min-w-0 items-baseline gap-x-4 md:gap-x-6"
          aria-label={`${figure.caption.label}. ${figure.caption.context}`}
        >
          <span
            className="shrink-0 font-edu-marist text-xs leading-[1.38] text-[var(--fg)]"
            style={WORK_CAPTION_LABEL_STYLE}
          >
            {figure.caption.label}
          </span>
          <motion.span
            initial={shouldReduceMotion ? false : WORK_CAPTION_CONTEXT_INITIAL}
            whileInView={shouldReduceMotion ? undefined : WORK_CAPTION_CONTEXT_VISIBLE}
            viewport={shouldReduceMotion ? undefined : WORK_CAPTION_VIEWPORT}
            transition={{ duration: 0.34, delay: 0.04, ease: LOAD_FOCUS.EASE }}
            className="ml-auto shrink-0 whitespace-nowrap text-right text-xs leading-[1.45] text-[var(--fg-muted)]"
          >
            {figure.caption.context}
          </motion.span>
        </figcaption>
      )}
    </figure>
  )
}

function renderWorkFigureSequence(
  figureKeys: readonly HomeWorkFigureKey[],
  shouldReduceMotion: boolean,
  hideCaptions = false,
) {
  return figureKeys.map((key) => (
    <WorkGalleryFigure
      key={key}
      figure={HOME_WORK_FIGURES[key]}
      shouldReduceMotion={shouldReduceMotion}
      hideCaption={hideCaptions}
    />
  ))
}

export default function SharedHomepageWorkGallery({
  desktopSections = HOME_WORK_DESKTOP_SECTIONS,
  isMobile,
  shouldReduceMotion,
  hideCaptions = false,
  firstImageScale,
  mobileSections = HOME_WORK_MOBILE_SECTIONS,
  refs,
}: SharedHomepageWorkGalleryProps) {
  const mobileLeadFigure = HOME_WORK_FIGURES[mobileSections.lead[0]]
  const desktopLeadFigure = HOME_WORK_FIGURES[desktopSections.featured[0]]
  const leadImageScale = shouldReduceMotion ? 1 : firstImageScale

  if (isMobile) {
    return (
      <Section wide spacing="tight" className="pt-[12vh]">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          <WorkGalleryFigure
            figure={mobileLeadFigure}
            shouldReduceMotion={shouldReduceMotion}
            hideCaption={hideCaptions}
            imageRef={refs.mobileFirstWorkImageRef}
            imageScale={leadImageScale}
          />
          {renderWorkFigureSequence(mobileSections.current, shouldReduceMotion, hideCaptions)}
          <div className={WORK_GALLERY_STACK}>
            {PROJECT_VIDEOS.theo && (
              <div ref={refs.theoriqVideoRef}>
                <VimeoInlineEmbed videoUrl={PROJECT_VIDEOS.theo} className="w-full" />
              </div>
            )}
            {renderWorkFigureSequence(mobileSections.theoriq, shouldReduceMotion, hideCaptions)}
          </div>
          <div ref={refs.coinbaseSectionRef}>
            {renderWorkFigureSequence(mobileSections.coinbase, shouldReduceMotion, hideCaptions)}
          </div>
          {renderWorkFigureSequence(mobileSections.voiceflow, shouldReduceMotion, hideCaptions)}
          {renderWorkFigureSequence(mobileSections.atlas, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>
    )
  }

  return (
    <>
      <Section wide spacing="tight" className="pt-[12vh]">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          <WorkGalleryFigure
            figure={desktopLeadFigure}
            shouldReduceMotion={shouldReduceMotion}
            hideCaption={hideCaptions}
            imageRef={refs.desktopFirstWorkImageRef}
            imageScale={leadImageScale}
          />
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {renderWorkFigureSequence(desktopSections.walmart, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {PROJECT_VIDEOS.theo && (
            <div ref={refs.theoriqVideoRef}>
              <VimeoInlineEmbed videoUrl={PROJECT_VIDEOS.theo} className="w-full" />
            </div>
          )}
          {renderWorkFigureSequence(desktopSections.theoriq, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div ref={refs.coinbaseSectionRef} className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {renderWorkFigureSequence(desktopSections.coinbase, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {renderWorkFigureSequence(desktopSections.voiceflow, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {renderWorkFigureSequence(desktopSections.atlas, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {renderWorkFigureSequence(desktopSections.zalando, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>

      <Section wide spacing="tight">
        <div className={`${WORK_GALLERY_COLUMN} ${WORK_GALLERY_STACK}`}>
          {renderWorkFigureSequence(desktopSections.earlyWorks, shouldReduceMotion, hideCaptions)}
        </div>
      </Section>
    </>
  )
}
