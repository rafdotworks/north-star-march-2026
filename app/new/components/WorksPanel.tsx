/**
 * ============================================================================
 * WORKS PANEL COMPONENT - app/new/components/WorksPanel.tsx
 * ============================================================================
 * 
 * A right-side panel component that displays a portfolio carousel with work timeline.
 * Shows portfolio images in a navigable carousel with keyboard and click navigation.
 * 
 * ARCHITECTURE:
 * - Client-side rendered with Framer Motion animations
 * - Right-side panel (50% width on desktop)
 * - Image carousel with page-turn animations
 * - Work timeline that highlights current project
 * - Video modal for projects with videos
 * - Click-outside-to-close functionality
 * 
 * CAROUSEL FUNCTIONALITY:
 * - Navigate images with arrow keys (← → ↑ ↓)
 * - Click left/right sides of image to navigate
 * - Page-turn animation transitions between images
 * - Respects animation level preference (user setting)
 * - Image preloading for smooth navigation
 * 
 * WORK TIMELINE:
 * - Displays work experience organized by type (Full-Time, Contract, Studio)
 * - Highlights current project's work entry
 * - Smooth transitions when navigating between projects
 * - Maps project keys to work experience identifiers
 * 
 * KEYBOARD NAVIGATION:
 * - Arrow keys (← → ↑ ↓) navigate carousel
 * - Escape key closes panel
 * - Disabled when video modal is open
 * 
 * IMAGE LOADING STRATEGY:
 * - Initial images loaded with priority (eager)
 * - Remaining images lazy-loaded
 * - Preloading for smooth navigation
 * - Loading state tracking
 * 
 * VIDEO MODAL:
 * - Opens when clicking play button on images with videos
 * - Vimeo embed with autoplay
 * - Escape key closes modal
 * - Click-outside-to-close
 * 
 * @component
 * @see app/new/page.tsx for usage examples
 */

"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { WorkImageContainer } from "@/app/components/hover"
import useAnimationLevel from "@/hooks/useAnimationLevel"
import { pageTurnVariants } from "@/components/animations/imageTransitions"
import { useIsMobile } from "@/hooks/use-mobile"
import { EASING } from "@/components/animations/constants"
import {
  IMAGE_SOURCES,
  NAVIGATION_DEBOUNCE,
  IMAGE_QUALITY,
  INITIAL_IMAGE_COUNT,
  getHighlightedWorkEntry,
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

/**
 * Props for WorksPanel component.
 * 
 * @interface WorksPanelProps
 * @property {boolean} isOpen - Whether the panel is currently open
 * @property {() => void} onClose - Callback when panel should be closed
 * 
 * @example
 * <WorksPanel 
 *   isOpen={selectedArticle === "works"} 
 *   onClose={() => setSelectedArticle(null)} 
 * />
 */
interface WorksPanelProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================
// 
// Easing curves are imported from shared constants file.
// @see components/animations/constants.ts

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Desktop panel animation variants.
 * 
 * Slides in from right with 3D perspective effect.
 * Same animation style as SideTray for consistency.
 * 
 * ANIMATION STAGES:
 * 1. x: Slides from 100% (off-screen) to 0
 * 2. scale: Scales from 0.98 to 1 (subtle zoom)
 * 3. rotateY: Rotates from -5deg to 0 (3D effect)
 */
const panelVariants = {
  hidden: {
    x: "100%",
    scale: 0.98,
    rotateY: -5,
  },
  visible: {
    x: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      x: {
        type: "spring" as const,
        stiffness: 300,
        damping: 35,
        duration: 0.5
      },
      scale: {
        duration: 0.6,
        ease: EASING.elastic,
        delay: 0.1
      },
      rotateY: {
        duration: 0.7,
        ease: EASING.spring,
        delay: 0.05
      }
    }
  },
  exit: {
    x: "100%",
    scale: 0.98,
    rotateY: -5,
    transition: {
      duration: 0.35,
      ease: EASING.smooth
    }
  },
} as const

/**
 * Mobile panel animation variants.
 * 
 * Enhanced multi-dimensional animation for smoother, more inspiring entrance.
 * Slides up from bottom with scale, opacity, and refined spring physics.
 * 
 * ANIMATION ENHANCEMENTS:
 * - y: Slides up from 100% (off-screen bottom) to 0
 * - scale: Subtle zoom-in effect (0.96 → 1.0) for materialization
 * - opacity: Smooth fade-in (0.8 → 1.0) for elegant appearance
 * - Spring physics: Refined parameters (stiffness: 320, damping: 38) for smoother motion
 * - Exit: Quick, responsive spring for satisfying dismissal
 * 
 * TIMING:
 * - Entrance: ~0.5s with natural spring physics for fluid motion
 * - Exit: ~0.3s for responsive dismissal
 * - Matches SideTray animation for consistency
 */
const mobilePanelVariants = {
  hidden: { 
    y: "100%",
    scale: 0.96,
    opacity: 0.8
  },
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 38,
      mass: 0.85,
      duration: 0.5
    }
  },
  exit: {
    y: "100%",
    scale: 0.96,
    opacity: 0.8,
    transition: {
      type: "spring" as const,
      stiffness: 450,
      damping: 40,
      mass: 0.65,
      duration: 0.3
    }
  },
} as const

/**
 * Content fade-in animation variants.
 * 
 * Creates blur-to-focus effect when panel content loads.
 * Same as SideTray for consistency.
 */
const contentVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(8px)"
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      opacity: {
        duration: 0.6,
        ease: EASING.smooth,
        delay: 0.3
      },
      filter: {
        duration: 0.8,
        ease: EASING.gentle,
        delay: 0.3
      }
    }
  },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      duration: 0.25,
      ease: EASING.smooth
    }
  }
} as const

/**
 * Backdrop animation variants.
 * 
 * Fades in/out the semi-transparent backdrop.
 * Enables click-outside-to-close functionality.
 * 
 * ENHANCED FOR MOBILE:
 * - Adds subtle scale effect (0.98 → 1.0) for depth perception
 * - Faster entrance (0.35s) to establish visual hierarchy before modal
 * - Coordinated timing with modal entrance for polished feel
 */
const backdropVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: EASING.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: EASING.smooth,
    },
  },
} as const

/**
 * Timeline row animation variants.
 * 
 * Synchronized with image transition (2.2s duration) for consistent, delightful feel.
 * Uses same easing curve as image transition: [0.16, 1, 0.3, 1]
 * 
 * ANIMATION STAGES:
 * - highlighted: Full opacity, slight scale, no blur (feels connected to image)
 * - unhighlighted: Reduced opacity, normal scale, no blur
 * 
 * TIMING:
 * - Duration: 2.2s (matches image transition)
 * - Delay: 0.15s (subtle delay so table highlight feels connected to image transition)
 * - Easing: [0.16, 1, 0.3, 1] (same as image transition)
 */
const TIMELINE_TRANSITION_DURATION = 2.2
const TIMELINE_TRANSITION_DELAY = 0.15
const TIMELINE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
// CSS transition string for color animations (matches Framer Motion timing)
const TIMELINE_COLOR_TRANSITION = `color ${TIMELINE_TRANSITION_DURATION}s cubic-bezier(${TIMELINE_EASE.join(', ')}) ${TIMELINE_TRANSITION_DELAY}s`

const timelineRowVariants = {
  highlighted: {
    opacity: 1,
    scale: 1.02,
    filter: "blur(0px)",
    transition: {
      duration: TIMELINE_TRANSITION_DURATION,
      ease: TIMELINE_EASE,
      delay: TIMELINE_TRANSITION_DELAY,
    },
  },
  unhighlighted: {
    opacity: 0.5,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: TIMELINE_TRANSITION_DURATION,
      ease: TIMELINE_EASE,
      delay: TIMELINE_TRANSITION_DELAY,
    },
  },
} as const

/**
 * Timeline text opacity animation variants.
 * 
 * Note: Color transitions are handled via CSS transitions with matching timing
 * (see className transitions on motion.span and motion.p elements).
 * This is because Framer Motion cannot directly animate CSS custom properties.
 */
const timelineTextVariants = {
  highlighted: {
    opacity: 1,
    transition: {
      duration: TIMELINE_TRANSITION_DURATION,
      ease: TIMELINE_EASE,
      delay: TIMELINE_TRANSITION_DELAY,
    },
  },
  unhighlighted: {
    opacity: 1,
    transition: {
      duration: TIMELINE_TRANSITION_DURATION,
      ease: TIMELINE_EASE,
      delay: TIMELINE_TRANSITION_DELAY,
    },
  },
  unhighlightedSubtle: {
    opacity: 1,
    transition: {
      duration: TIMELINE_TRANSITION_DURATION,
      ease: TIMELINE_EASE,
      delay: TIMELINE_TRANSITION_DELAY,
    },
  },
} as const


/**
 * WorksPanel Component
 * 
 * Displays a portfolio carousel with work timeline in a right-side panel.
 * 
 * @param {WorksPanelProps} props - Component props
 * @returns {JSX.Element} The WorksPanel component
 */
export default function WorksPanel({ isOpen, onClose }: WorksPanelProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Current image index in the carousel (0-based).
   */
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  /**
   * Last navigation direction (1 = forward, -1 = backward).
   * Used for page-turn animation direction.
   */
  const [lastDirection, setLastDirection] = useState<1 | -1>(1)
  
  /**
   * Whether carousel is currently navigating (debouncing).
   * Prevents rapid clicking from causing multiple navigations.
   */
  const [isNavigating, setIsNavigating] = useState(false)
  
  /**
   * Whether slideshow is paused (when user hovers over image).
   * Currently not used for auto-play, but available for future use.
   */
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false)
  
  /**
   * Tracks which images have been loaded.
   * Used to enable click navigation only after image loads.
   */
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  
  /**
   * Whether video modal is currently open.
   */
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  
  /**
   * Current video URL for the modal.
   * Set when user clicks play button on an image with a video.
   */
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  
  /**
   * Measured width of the current image.
   * Used for caption alignment (currently hidden but available).
   */
  const [imageWidth, setImageWidth] = useState<number | null>(null)
  
  /**
   * Ref to measure image width for caption alignment.
   */
  const imageMeasureRef = useRef<HTMLDivElement | null>(null)
  
  /**
   * Accessibility: Respects user's motion preference.
   */
  const shouldReduceMotion = useReducedMotion()
  
  /**
   * User's animation level preference.
   * Used to adjust page-turn animation intensity.
   */
  const animationLevel = useAnimationLevel()
  
  /**
   * Responsive: Detects if user is on mobile device.
   */
  const isMobile = useIsMobile()
  
  /**
   * Ref for backdrop element to disable pointer events during exit animation.
   * This allows hover events to work immediately after closing the panel.
   */
  const backdropRef = useRef<HTMLDivElement>(null)
  
  /**
   * Current drag position for drag-to-dismiss functionality (mobile only).
   * Tracks the Y offset during drag gesture.
   */
  const [dragY, setDragY] = useState(0)
  
  /**
   * Ref to the panel container for drag functionality.
   */
  const panelRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // RESPONSIVE ANIMATION VARIANTS
  // ============================================================================
  
  /**
   * Selects appropriate animation variants based on device and accessibility.
   * 
   * - Mobile: slide up from bottom (mobilePanelVariants)
   * - Desktop: slide in from right with 3D effect (panelVariants)
   * - Reduced motion: Disables animations (undefined)
   */
  const activePanelVariants = isMobile ? mobilePanelVariants : panelVariants
  // On mobile, disable content fade-in animation to ensure immediate visibility
  // Desktop keeps the blur-to-focus effect for polish
  const activeContentVariants = shouldReduceMotion ? undefined : (isMobile ? {
    hidden: { 
      opacity: 0,
      y: 12
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: EASING.smooth,
        delay: 0.1
      }
    }
  } as const : contentVariants)

  // ============================================================================
  // DERIVED STATE
  // ============================================================================
  
  /**
   * Gets current image source, project key, and highlighted work entry.
   * 
   * Used to:
   * - Display the correct image
   * - Highlight the correct timeline entry
   * - Determine if video is available
   */
  const currentImageSrc = IMAGE_SOURCES[currentImageIndex] || null
  const currentProject = currentImageSrc ? getProjectFromSrc(currentImageSrc) : null
  const highlightedEntry = getHighlightedWorkEntry(currentProject)

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles image load completion.
   * 
   * Marks image as loaded in loadedImages state.
   * This enables click navigation only after image is ready.
   * 
   * @param {string} src - The image source path
   */
  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages((prev) => {
      if (prev[src]) {
        return prev
      }
      return { ...prev, [src]: true }
    })
  }, [])

  /**
   * Navigates carousel by a given delta (positive = forward, negative = backward).
   * 
   * CAROUSEL LOGIC:
   * - Uses modulo arithmetic for circular navigation
   * - Wraps around: going forward from last image goes to first, and vice versa
   * - Updates lastDirection for page-turn animation
   * 
   * @param {number} delta - Number of images to move (positive = forward, negative = backward)
   * 
   * @example
   * navigateBy(1)  // Move to next image
   * navigateBy(-1) // Move to previous image
   */
  const navigateBy = useCallback(
    (delta: number) => {
      const dir: 1 | -1 = delta >= 0 ? 1 : -1
      setLastDirection(dir)
      setCurrentImageIndex((prev) => {
        const length = IMAGE_SOURCES.length
        // Modulo arithmetic ensures circular navigation
        return (prev + delta + length) % length
      })
    },
    []
  )

  /**
   * Opens video modal for an image that has an associated video.
   * 
   * @param {string} imageSrc - The image source path
   */
  const handleOpenVideoModal = (imageSrc: string) => {
    const videoUrl = getVideoForSrc(imageSrc)
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl)
      setIsVideoModalOpen(true)
    }
  }

  /**
   * Closes video modal and clears video URL.
   */
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false)
    setCurrentVideoUrl(null)
  }

  // ============================================================================
  // DRAG-TO-DISMISS HANDLERS (MOBILE ONLY)
  // ============================================================================
  
  /**
   * Tracks if drag is currently active.
   */
  const [isDragging, setIsDragging] = useState(false)
  
  /**
   * Handles drag start - resets drag position and marks as dragging.
   */
  const handleDragStart = () => {
    if (!isMobile) return
    setDragY(0)
    setIsDragging(true)
  }
  
  /**
   * Handles drag event - updates drag position for visual feedback.
   * Only allows downward dragging (positive Y values).
   */
  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    if (!isMobile) return
    // Only track downward drags (positive Y)
    if (info.offset.y > 0) {
      setDragY(info.offset.y)
    } else {
      setDragY(0)
    }
  }
  
  /**
   * Handles drag end - determines if panel should close based on threshold and velocity.
   * 
   * CLOSING CONDITIONS:
   * - Dragged down more than 25% of viewport height (or 120px minimum)
   * - OR dragged with sufficient velocity downward (> 400px/s)
   * 
   * If threshold not met, panel snaps back to original position with spring animation.
   */
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    if (!isMobile) return
    
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
    const threshold = Math.max(viewportHeight * 0.25, 120) // 25% of viewport or 120px minimum
    const velocityThreshold = 400 // px/s
    
    // Close if dragged beyond threshold OR if velocity is high enough
    if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
      onClose()
    }
    
    // Reset drag position with smooth animation
    setDragY(0)
    setIsDragging(false)
  }

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================
  
  /**
   * Handles Escape key to close panel or video modal.
   * 
   * PRIORITY:
   * 1. If video modal is open → close modal
   * 2. Otherwise → close panel
   * 
   * Only active when panel is open.
   */
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

  /**
   * Handles arrow key navigation for carousel.
   * 
   * KEYBOARD CONTROLS:
   * - ArrowLeft / ArrowUp: Previous image (navigateBy(-1))
   * - ArrowRight / ArrowDown: Next image (navigateBy(1))
   * 
   * SAFETY:
   * - Disabled when panel is closed
   * - Disabled when video modal is open (to avoid conflicts)
   * - Ignores key presses when user is typing in input/textarea
   */
  useEffect(() => {
    if (!isOpen || isVideoModalOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't interfere with text input
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

  /**
   * Measures image width for caption alignment.
   * 
   * Uses ResizeObserver to track image width changes.
   * Currently used for caption alignment (though captions are hidden).
   * 
   * SUGGESTED IMPROVEMENT:
   * Consider removing if captions remain hidden, or extract to a custom hook.
   */
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
            {/* 
            Mobile: Full-screen backdrop covering entire viewport
            Desktop: Full-screen backdrop to blur entire page and enable click-outside-to-close
            */}
            <motion.div
              ref={backdropRef}
              key="backdrop"
              className={`fixed inset-0 transition-colors duration-200 z-40 ${isMobile ? 'bg-background/95 backdrop-blur-sm' : 'bg-background/50 backdrop-blur-md'}`}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
              onAnimationStart={(definition) => {
                // Disable pointer events when exit animation starts
                // This allows hover events to work immediately after closing
                if (definition === 'exit' && backdropRef.current) {
                  backdropRef.current.style.pointerEvents = 'none'
                }
              }}
            />

            {/* Works Panel */}
            {/* 
            Mobile: Full-screen bottom sheet covering entire viewport with timeline table at top and carousel below
            Desktop: Right-side half-screen panel (w-1/2)
            */}
            <motion.div
              ref={panelRef}
              key="panel"
              className={`fixed ${isMobile ? 'inset-0 rounded-t-3xl' : 'right-0 top-0 h-full w-1/2'} ${isMobile ? 'backdrop-blur-xl backdrop-saturate-150 bg-background/100 border-t border-border/20' : 'bg-background'} transition-colors duration-200 z-50 overflow-hidden`}
              variants={shouldReduceMotion ? undefined : activePanelVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : (
                isMobile && dragY > 0 
                  ? {
                      // Merge variant animation with drag properties
                      y: dragY,
                      opacity: Math.max(0.75, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.4),
                      scale: Math.max(0.96, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.08),
                    }
                  : "visible" // Use variant "visible" state when not dragging
              )}
              exit={shouldReduceMotion ? undefined : "exit"}
              // Drag-to-dismiss functionality (mobile only)
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              dragMomentum={false}
              dragPropagation={false}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                zIndex: 50, // Ensure panel appears above backdrop (z-40)
                ...(isMobile ? {
                  // Cover full viewport including safe areas
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '100dvh',
                  maxHeight: '100dvh',
                  paddingTop: 'env(safe-area-inset-top, 0px)',
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  // Only apply drag transforms when actively dragging
                  // When not dragging, variant animation controls position
                  ...(dragY > 0 ? {
                    y: dragY,
                    opacity: Math.max(0.75, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.4),
                    scale: Math.max(0.96, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.08),
                  } : {})
                } : {
                  // Desktop: Preserve 3D transform for side panel
                  paddingTop: 'env(safe-area-inset-top, 0px)',
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  transformStyle: "preserve-3d",
                  perspective: "1200px"
                })
              }}
            >
              <motion.div
                className={`relative h-full flex flex-col overflow-hidden`}
                variants={activeContentVariants}
                initial={activeContentVariants ? "hidden" : undefined}
                animate={activeContentVariants ? "visible" : undefined}
                style={{
                  // CRITICAL: Ensure content is always visible on mobile (no animation variants)
                  // Desktop uses animation variants for blur-to-focus effect
                  opacity: activeContentVariants ? undefined : 1,
                }}
              >
                {/* Mobile drag handle - more prominent and interactive */}
                {isMobile && (
                  <motion.div 
                    className="flex justify-center items-center py-4 pt-5 pb-3 cursor-grab active:cursor-grabbing touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: '56px',
                    }}
                    animate={{
                      scale: dragY > 0 ? 1.05 : 1,
                      opacity: dragY > 0 ? 0.7 : 1,
                    }}
                    transition={{
                      duration: 0.15,
                      ease: EASING.smooth
                    }}
                  >
                    <motion.div 
                      className="w-14 h-1.5 rounded-full bg-muted transition-colors duration-200"
                      animate={{
                        backgroundColor: dragY > 0 
                          ? 'hsl(var(--foreground))' 
                          : 'hsl(var(--muted-foreground))',
                        width: dragY > 0 ? 56 : 56,
                        scale: dragY > 0 ? 1.2 : 1,
                      }}
                      transition={{
                        duration: 0.15,
                        ease: EASING.smooth
                      }}
                    />
                  </motion.div>
                )}

                {/* Close button - larger and more accessible on mobile */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                  className={`absolute ${isMobile ? 'top-4 right-4' : 'top-6 right-6'} z-50 ${isMobile ? 'p-4' : 'p-2'} group touch-manipulation`}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 15 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  transition={{ duration: 0.2, ease: EASING.smooth }}
                  aria-label="Close panel"
                  style={{
                    background: isMobile ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    color: 'rgb(115, 115, 115)',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    borderRadius: isMobile ? '50%' : 'none',
                    minWidth: isMobile ? '44px' : 'auto',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                    if (isMobile) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                    if (isMobile) {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid hsl(var(--foreground))'
                    e.currentTarget.style.outlineOffset = '2px'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none'
                  }}
                >
                  <svg
                    width={isMobile ? "16" : "12"}
                    height={isMobile ? "16" : "12"}
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ pointerEvents: 'none' }}
                  >
                    <path
                      d="M1 1L11 11M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth={isMobile ? "1.5" : "1"}
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>

                {/* Work Timeline Table - at top */}
                {/* 
                Mobile: Compact table at top, no scrolling - fits viewport
                Desktop: Fixed position with standard padding
                */}
                <div 
                  className={`relative z-20 ${isMobile ? 'px-6 pt-2 pb-2' : 'px-8 pt-12 pb-3'} bg-background`}
                  style={{
                    // CRITICAL: Ensure timeline is always visible - force opacity to prevent invisible content
                    opacity: 1,
                  }}
                >
                  <div className={`${isMobile ? 'space-y-1' : 'space-y-1.5'}`}>
                    {/* Full-Time Roles */}
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Full-Time</p>
                      <div className="space-y-1">
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2024–2025'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2024–2025'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2024–2025'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2024–2025
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2024–2025'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2024–2025'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Theoriq · Founding Product Designer
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2023–2024'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2023–2024'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2023–2024'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2023–2024
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2023–2024'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2023–2024'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            CurbCutOS · Product Design Lead, Accessibility
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2022–2023'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2022–2023'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2022–2023'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2022–2023
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2022–2023'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2022–2023'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Crypto Stealth Startup · Senior Product Designer, Design Lead
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2020–2021'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2020–2021'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2020–2021'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2020–2021
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2020–2021'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'fulltime' && highlightedEntry?.identifier === '2020–2021'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Artscapy · Founding Designer
                          </motion.p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Contract Roles */}
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Contract</p>
                      <div className="space-y-1">
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'vf'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'vf'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'vf'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2025
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'vf'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'vf'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Voiceflow · Senior Product Designer, AI Agents
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'cb'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'cb'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'cb'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2025
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'cb'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2025' && currentProject === 'cb'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Coinbase · Senior Product Designer, Developer Tools
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021–2022'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021–2022'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021–2022'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2021–2022
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021–2022'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021–2022'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Zalando · Senior Product Designer, Design System
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2021
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2021'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            TravelNest · Senior Product Designer
                          </motion.p>
                        </motion.div>
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2019'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2019'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2019'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2019
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2019'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'contract' && highlightedEntry?.identifier === '2019'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Apple Developer Academy · UX/UI Design Intern
                          </motion.p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Studio */}
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Studio</p>
                      <div className="space-y-1">
                        <motion.div
                          className="flex justify-between items-start"
                          variants={shouldReduceMotion ? undefined : timelineRowVariants}
                          animate={
                            highlightedEntry?.section === 'studio' && highlightedEntry?.identifier === '2016–present'
                              ? 'highlighted'
                              : 'unhighlighted'
                          }
                        >
                          <motion.span
                            className={`text-xs font-light tabular-nums ${
                              highlightedEntry?.section === 'studio' && highlightedEntry?.identifier === '2016–present'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'studio' && highlightedEntry?.identifier === '2016–present'
                                ? 'highlighted'
                                : 'unhighlightedSubtle'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            2016–present
                          </motion.span>
                          <motion.p
                            className={`text-xs text-right ${
                              highlightedEntry?.section === 'studio' && highlightedEntry?.identifier === '2016–present'
                                ? 'text-foreground'
                                : 'text-muted-foreground/50'
                            }`}
                            variants={shouldReduceMotion ? undefined : timelineTextVariants}
                            animate={
                              highlightedEntry?.section === 'studio' && highlightedEntry?.identifier === '2016–present'
                                ? 'highlighted'
                                : 'unhighlighted'
                            }
                            style={
                              shouldReduceMotion
                                ? {}
                                : {
                                    transition: TIMELINE_COLOR_TRANSITION,
                                  }
                            }
                          >
                            Never Before Seen Studio · Freelance Designer, Design Lead
                          </motion.p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel Container */}
                {/* 
                Mobile: Carousel below timeline table, no scrolling - fits viewport
                Desktop: Fixed position with hover pause
                */}
                <div
                  className={`relative z-10 flex items-end justify-center flex-1 ${isMobile ? 'px-6 pt-1 pb-6' : 'px-8 pt-2 pb-8 md:pb-12'} min-h-0`}
                  onMouseEnter={() => !isMobile && setIsSlideshowPaused(true)}
                  onMouseLeave={() => !isMobile && setIsSlideshowPaused(false)}
                  style={isMobile ? {
                    paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
                    // More flexible height calculation - ensure minimum space for images
                    maxHeight: 'calc(100dvh - 280px)',
                    minHeight: '200px', // Ensure minimum height so images are always visible
                    overflow: 'hidden',
                  } : {}}
                >
                  <div className="relative w-full flex items-start justify-center" style={isMobile ? { minHeight: '200px' } : {}}>
                    <div
                      className="relative w-full max-w-4xl"
                      style={{ 
                        perspective: "1200px",
                        ...(isMobile ? { minHeight: '200px' } : {}),
                      }}
                    >
                      {IMAGE_SOURCES.map((src, index) => {
                        const isCurrent = index === currentImageIndex
                        return (
                        <motion.div
                          key={src}
                          className="relative w-full"
                          variants={pageTurnVariants(animationLevel, lastDirection)}
                          initial="initial"
                          animate={
                            isCurrent ? "animate" : "exit"
                          }
                          exit="exit"
                          style={{
                            zIndex: isCurrent ? 2 : 1,
                            pointerEvents: isCurrent ? "auto" : "none",
                            // Always render current image, or first image on mobile when panel opens
                            display: isCurrent ? "block" : "none",
                            visibility: isCurrent ? "visible" : "hidden",
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
                              // On mobile, show images even if not fully loaded to prevent black screen
                              isLoaded={isMobile ? (loadedImages[src] ?? true) : !!loadedImages[src]}
                            />
                            {index === currentImageIndex && (
                              <>
                                <div
                                  ref={imageMeasureRef}
                                  className="w-full max-w-[800px] hidden"
                                />
                                {/* Caption directly below image - Temporarily hidden for evaluation */}
                                {/* <div
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
                                </div> */}
                              </>
                            )}
                          </div>
                        </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
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

