"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { WorkImageContainer } from "@/app/components/hover"
import useAnimationLevel from "@/hooks/useAnimationLevel"
import { pageTurnVariants } from "@/components/animations/imageTransitions"
import {
  IMAGE_SOURCES,
  NAVIGATION_DEBOUNCE,
  IMAGE_QUALITY,
  INITIAL_IMAGE_COUNT,
} from "@/app/config/portfolioConfig"
import {
  getProjectFromSrc,
  getVideoForSrc,
  getCaptionForSrc,
  getAltText,
  parseCaption,
  renderYearWithRolling,
  generatePlaceholder,
} from "@/app/utils/portfolioUtils"

interface WorksPanelProps {
  isOpen: boolean
  onClose: () => void
}

const EASING = {
  smooth: [0.4, 0.0, 0.2, 1] as const,
  spring: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1.0] as const,
} as const

const panelVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 35,
      duration: 0.5,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: EASING.smooth,
    },
  },
} as const

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASING.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: EASING.smooth,
    },
  },
} as const

export default function WorksPanel({ isOpen, onClose }: WorksPanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lastDirection, setLastDirection] = useState<1 | -1>(1)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [imageWidth, setImageWidth] = useState<number | null>(null)
  const imageMeasureRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const animationLevel = useAnimationLevel()

  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages((prev) => {
      if (prev[src]) {
        return prev
      }
      return { ...prev, [src]: true }
    })
  }, [])

  const navigateBy = useCallback(
    (delta: number) => {
      const dir: 1 | -1 = delta >= 0 ? 1 : -1
      setLastDirection(dir)
      setCurrentImageIndex((prev) => {
        const length = IMAGE_SOURCES.length
        return (prev + delta + length) % length
      })
    },
    []
  )

  const handleOpenVideoModal = (imageSrc: string) => {
    const videoUrl = getVideoForSrc(imageSrc)
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl)
      setIsVideoModalOpen(true)
    }
  }

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false)
    setCurrentVideoUrl(null)
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isVideoModalOpen) {
          handleCloseVideoModal()
        } else {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, isVideoModalOpen, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isVideoModalOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault()
          navigateBy(-1)
          break
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault()
          navigateBy(1)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, isVideoModalOpen, navigateBy])

  // Measure image width for caption alignment
  useEffect(() => {
    const el = imageMeasureRef.current
    if (!el) return

    const update = () => setImageWidth(el.offsetWidth)
    update()

    const observer = new ResizeObserver(() => update())
    observer.observe(el)
    window.addEventListener("resize", update)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [currentImageIndex])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-background/50 backdrop-blur-sm transition-colors duration-200 z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            {/* Works Panel - Right side half-screen */}
            <motion.div
              key="panel"
              className="fixed right-0 top-0 h-full w-1/2 bg-background transition-colors duration-200 z-50 overflow-hidden"
              variants={shouldReduceMotion ? undefined : panelVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
              exit={shouldReduceMotion ? undefined : "exit"}
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="relative h-full flex flex-col">
                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-6 right-6 z-10 p-2 group"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02, rotate: 15 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  transition={{ duration: 0.4, ease: EASING.gentle }}
                  aria-label="Close"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    color: 'rgb(115, 115, 115)',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ pointerEvents: 'none' }}
                  >
                    <path
                      d="M1 1L11 11M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>

                {/* Carousel Container */}
                <div
                  className="flex items-end justify-center flex-1 px-8 pb-8 md:pb-12"
                  onMouseEnter={() => setIsSlideshowPaused(true)}
                  onMouseLeave={() => setIsSlideshowPaused(false)}
                >
                  <div className="relative w-full flex items-start justify-center">
                    <div
                      className="relative w-full max-w-4xl"
                      style={{ 
                        perspective: "1200px",
                      }}
                    >
                      {IMAGE_SOURCES.map((src, index) => (
                        <motion.div
                          key={src}
                          className="relative w-full"
                          variants={pageTurnVariants(animationLevel, lastDirection)}
                          initial="initial"
                          animate={
                            index === currentImageIndex ? "animate" : "exit"
                          }
                          exit="exit"
                          style={{
                            zIndex: index === currentImageIndex ? 2 : 1,
                            pointerEvents:
                              index === currentImageIndex ? "auto" : "none",
                            display: index === currentImageIndex ? "block" : "none",
                            visibility: index === currentImageIndex ? "visible" : "hidden",
                          }}
                        >
                          <div className="flex flex-col items-center w-full relative">
                            {index === currentImageIndex && (
                              <>
                                <div
                                  className={`absolute left-0 top-0 w-[38%] z-[60] ${loadedImages[src] && !isNavigating ? "cursor-w-resize" : ""}`}
                                  style={{
                                    height: 'calc(100% + 10rem)',
                                    pointerEvents: loadedImages[src] && !isNavigating ? "auto" : "none",
                                    cursor: loadedImages[src] && !isNavigating ? "w-resize" : "default"
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (isNavigating || !loadedImages[src]) return
                                    setIsNavigating(true)
                                    navigateBy(-1)
                                    window.setTimeout(
                                      () => setIsNavigating(false),
                                      NAVIGATION_DEBOUNCE
                                    )
                                  }}
                                />
                                <div
                                  className={`absolute right-0 top-0 w-[38%] z-[60] ${loadedImages[src] && !isNavigating ? "cursor-e-resize" : ""}`}
                                  style={{
                                    height: 'calc(100% + 10rem)',
                                    pointerEvents: loadedImages[src] && !isNavigating ? "auto" : "none",
                                    cursor: loadedImages[src] && !isNavigating ? "e-resize" : "default"
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (isNavigating || !loadedImages[src]) return
                                    setIsNavigating(true)
                                    navigateBy(1)
                                    window.setTimeout(
                                      () => setIsNavigating(false),
                                      NAVIGATION_DEBOUNCE
                                    )
                                  }}
                                />
                                <div className="absolute left-[38%] top-0 w-[24%] z-[95] pointer-events-none" style={{ height: 'calc(100% + 10rem)' }} />
                              </>
                            )}
                            <WorkImageContainer
                              src={src}
                              alt={getAltText(src, index)}
                              width={800}
                              height={600}
                              hasVideo={!!getVideoForSrc(src)}
                              onVideoClick={() => handleOpenVideoModal(src)}
                              onMouseEnter={() => setIsSlideshowPaused(true)}
                              onMouseLeave={() => setIsSlideshowPaused(false)}
                              onLoad={() => handleImageLoad(src)}
                              priority={index < INITIAL_IMAGE_COUNT}
                              loading={
                                index < INITIAL_IMAGE_COUNT ? "eager" : "lazy"
                              }
                              placeholder="blur"
                              blurDataURL={generatePlaceholder(1200, 900)}
                              sizes="(min-width: 1280px) 50vw, 100vw"
                              quality={IMAGE_QUALITY}
                              isLoaded={!!loadedImages[src]}
                            />
                            {index === currentImageIndex && (
                              <>
                                <div
                                  ref={imageMeasureRef}
                                  className="w-full max-w-[800px] hidden"
                                />
                                {/* Caption directly below image */}
                                <div
                                  className="w-full mt-6 mb-8"
                                  style={{
                                    maxWidth: imageWidth
                                      ? `${imageWidth}px`
                                      : "min(92vw, 1200px)",
                                  }}
                                >
                              {(() => {
                                const currentSrc = IMAGE_SOURCES[currentImageIndex]
                                const caption = getCaptionForSrc(currentSrc)
                                if (!caption) return null
                                const parsed = parseCaption(caption)

                                return (
                                  <motion.div
                                    key={
                                      getProjectFromSrc(currentSrc) ??
                                      currentImageIndex
                                    }
                                    initial={{
                                      opacity: 0,
                                      filter: "blur(12px) saturate(0.96)",
                                    }}
                                    animate={{
                                      opacity: 1,
                                      filter: "blur(0px) saturate(1)",
                                    }}
                                    transition={{
                                      duration: 2.2,
                                      ease: [0.16, 1, 0.3, 1],
                                    }}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-6">
                                      {parsed.year && (
                                        <motion.span
                                          key={`year-${currentImageIndex}`}
                                          className="text-xs leading-normal text-muted-foreground transition-colors duration-200"
                                          initial={{
                                            opacity: 0,
                                            filter: "blur(12px) saturate(0.96)",
                                          }}
                                          animate={{
                                            opacity: 1,
                                            filter: "blur(0px) saturate(1)",
                                          }}
                                          transition={{
                                            duration: 2.2,
                                            ease: [0.16, 1, 0.3, 1],
                                          }}
                                        >
                                          {renderYearWithRolling(parsed.year)}
                                        </motion.span>
                                      )}
                                      <motion.span
                                        key={`caption-${currentImageIndex}`}
                                        initial={{
                                          opacity: 0,
                                          filter: "blur(12px) saturate(0.96)",
                                        }}
                                        animate={{
                                          opacity: 1,
                                          filter: "blur(0px) saturate(1)",
                                        }}
                                        transition={{
                                          duration: 2.2,
                                          ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className="text-xs leading-normal sm:text-right text-muted-foreground transition-colors duration-200"
                                      >
                                        {parsed.description}
                                      </motion.span>
                                    </div>
                                  </motion.div>
                                )
                              })()}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
              onClick={handleCloseVideoModal}
            />
            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6"
              onClick={handleCloseVideoModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-modal-title"
              tabIndex={-1}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
                className="relative w-full max-w-5xl"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="video-modal-title" className="sr-only">
                  Project video
                </h2>
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    src={currentVideoUrl ?? ""}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Project Video"
                    style={{ background: "#000000" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

