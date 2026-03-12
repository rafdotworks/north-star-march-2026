/**
 * ============================================================================
 * SIDE TRAY COMPONENT - app/new/components/SideTray.tsx
 * ============================================================================
 * 
 * A slide-in side panel component that displays About content and Writing articles.
 * Supports dual-mode operation: normal mode (About) and writing mode (article list + content).
 * 
 * ARCHITECTURE:
 * - Client-side rendered with Framer Motion animations
 * - Responsive: Mobile (bottom sheet) vs Desktop (right side panel)
 * - Markdown rendering with custom typography components
 * - Article loading via API with error handling
 * - Nested navigation for writing mode (list → article)
 * 
 * DUAL-MODE OPERATION:
 * 
 * 1. NORMAL MODE (isWritingMode = false):
 *    - Used for "About" content
 *    - Single view: Shows about content directly
 *    - articleId: "about" string
 * 
 * 2. WRITING MODE (isWritingMode = true):
 *    - Used for "Writing" section
 *    - Two-step navigation:
 *      a) List view: Shows allWritings array when articleId === null
 *      b) Article view: Shows specific article when articleId is set
 *    - Requires onArticleSelect prop to handle article selection
 *    - Supports nested trays (list tray → article tray)
 * 
 * ANIMATION SYSTEM:
 * - Uses Framer Motion for smooth, performant animations
 * - Respects prefers-reduced-motion for accessibility
 * - Custom easing curves for natural motion
 * - Multi-stage animations (backdrop, tray, content)
 * - Mobile-optimized variants (slide up from bottom)
 * - Desktop variants (slide in from right with 3D transforms)
 * 
 * ARTICLE LOADING:
 * - Fetches articles from /api/article/[id] endpoint
 * - Parses frontmatter using gray-matter
 * - Handles loading, error, and success states
 * - Custom hook (useArticleLoader) manages article state
 * 
 * MARKDOWN RENDERING:
 * - Custom ReactMarkdown components for typography
 * - Consistent styling with design system
 * - External link detection and icon display
 * - Theme-aware color transitions
 * 
 * @component
 * @see app/page.tsx for usage examples
 */

"use client"

import React, { useEffect, useLayoutEffect, useState, useCallback, useRef, memo, useMemo } from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import matter from "gray-matter"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Sheet from "react-modal-sheet"
import FooterLink from "@/app/components/layout/FooterLink"
import InlineExternalLink, { HERO_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"
import { COMPANY_LINKS } from "@/app/config/companyLinks"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { useLocationWeather } from "@/hooks/use-timezone-message"
import { EASING } from "@/components/animations/constants"
import { markdownComponents } from "@/app/components/markdown/markdownComponents"
import { storyMarkdownComponents } from "@/app/components/markdown/storyMarkdownComponents"
import { trayMarkdownComponents } from "@/app/components/markdown/trayMarkdownComponents"
import { StoryHeader } from "@/app/components/story"
import {
  allWritings,
  writings,
  personalNotes
} from "@/app/config/writingsConfig"
import { PHOTOS } from "@/app/config/photosConfig"
import type { StoryFrontmatter } from "@/app/types/story"

/** Roman numerals I–XIV for photo credits (1-based index). */
const PHOTO_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"] as const

function getPhotoCreditName(photo: { alt?: string; src: string }): string {
  return (photo.alt ?? photo.src).replace(/\s+[23]$/, "").trim()
}

/**
 * Props for SideTray component.
 * 
 * @interface SideTrayProps
 * @property {string | null} articleId - The article ID to display, or null to show list (writing mode) or close tray
 * @property {() => void} onClose - Callback when tray should be closed
 * @property {boolean} [isWritingMode=false] - If true, enables writing mode with two-step navigation
 * @property {(articleId: string | null) => void} [onArticleSelect] - Callback when article is selected (required in writing mode)
 * 
 * @example
 * // Normal mode (About)
 * <SideTray 
 *   articleId="about" 
 *   onClose={() => setSelectedArticle(null)} 
 * />
 * 
 * @example
 * // Writing mode (with article selection)
 * <SideTray 
 *   articleId={selectedWritingArticle}
 *   onClose={handleClose}
 *   isWritingMode={true}
 *   onArticleSelect={setSelectedWritingArticle}
 * />
 */
interface SideTrayProps {
  articleId: string | null
  onClose: () => void
  /** Close only the Writing panel when stacked (About + Writing); reveals About */
  onCloseWritingOnly?: () => void
  isWritingMode?: boolean
  isAboutMode?: boolean
  onArticleSelect?: (articleId: string | null) => void
  /** Called when user clicks "write" in about tagline; page can switch tray to writing mode */
  onSwitchToWriting?: () => void
  /** Called when user clicks "photograph" in about tagline; page can switch tray to photos mode */
  onSwitchToPhotograph?: () => void
  /** Close only the Photos panel when stacked (About + Photos); reveals About */
  onClosePhotosOnly?: () => void
  isPhotosMode?: boolean
  /** API base path for fetching content (default: "/api/article") */
  apiBasePath?: string
}

/**
 * Parsed article content structure.
 *
 * @interface ArticleContent
 * @property {string} title - Article title from frontmatter
 * @property {string} date - Article date from frontmatter
 * @property {string} content - Article markdown content (without frontmatter)
 * @property {StoryFrontmatter} [frontmatter] - Full frontmatter for stories
 */
interface ArticleContent {
  title: string
  date: string
  content: string
  /** Full frontmatter for story rendering */
  frontmatter?: StoryFrontmatter
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

/** Backdrop fade-in duration (slightly longer than out for a more deliberate entrance). */
const TRAY_BACKDROP_IN = 0.35
/** Backdrop fade-out duration (quick, so the background reasserts itself). */
const TRAY_BACKDROP_OUT = 0.25

/**
 * Backdrop animation variants.
 * 
 * Fades in/out the semi-transparent backdrop behind the tray.
 * Provides visual separation and enables click-outside-to-close.
 * 
 * ENHANCED FOR MOBILE:
 * - Faster entrance (0.35s) to establish visual hierarchy before modal
 * - Coordinated timing with modal entrance for polished feel
 * - Scale animation removed to prevent visible rectangle artifact
 */
const backdropVariants = {
  hidden: { 
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: TRAY_BACKDROP_IN,
      ease: EASING.smooth
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TRAY_BACKDROP_OUT,
      ease: EASING.smooth
    }
  }
} as const

/**
 * Desktop tray animation variants.
 * 
 * Creates a sophisticated 3D slide-in effect from the right side.
 * 
 * ANIMATION STAGES:
 * 1. x: Slides in from 100% (off-screen right) to 0
 * 2. scale: Slightly scales up from 0.98 to 1 (subtle zoom effect)
 * 3. rotateY: Rotates from -5deg to 0 (3D perspective effect)
 * 
 * TIMING:
 * - x: Spring animation (natural bounce) - 0.5s
 * - scale: Elastic easing with 0.1s delay - 0.6s
 * - rotateY: Spring easing with 0.05s delay - 0.7s
 * 
 * The staggered delays create a layered, sophisticated entrance.
 * Exit animation keeps panel in place (x: 0, scale: 1, rotateY: 0) and
 * only fades out opacity for elegant, non-sliding dismissal.
 */
const trayVariants = {
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
        stiffness: 180,
        damping: 28,
        mass: 1,
        duration: 0.7
      },
      scale: {
        duration: 0.8,
        ease: EASING.elastic,
        delay: 0.1
      },
      rotateY: {
        duration: 0.9,
        ease: EASING.spring,
        delay: 0.05
      }
    }
  },
  exit: {
    x: "100%",
    scale: 0.98,
    rotateY: -5,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: EASING.gentle
    }
  }
} as const

/**
 * Content fade-in animation variants.
 * 
 * Creates a smooth blur-to-focus effect when content loads.
 * 
 * ANIMATION:
 * - opacity: Fades from 0 to 1
 * - filter: Blurs from 8px to 0px (creates focus effect)
 * 
 * TIMING:
 * - Both animations start after 0.3s delay (allows tray to slide in first)
 * - opacity: 0.6s duration
 * - filter: 0.8s duration (slightly longer for smooth blur transition)
 * 
 * This creates a layered animation: tray slides in, then content fades in.
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
 * List item animation variants (for article lists).
 * 
 * Creates a staggered entrance effect for list items.
 * 
 * ANIMATION:
 * - opacity: Fades in
 * - x: Slides in from -20px (left)
 * - filter: Blurs from 4px to 0px
 * 
 * STAGGERING:
 * - Each item has a delay of i * 0.04s (40ms per item)
 * - Creates a cascading effect as items appear sequentially
 * 
 * @param {number} i - Index of the item (used for delay calculation)
 */
const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)"
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: EASING.stagger,
      delay: i * 0.04,
      filter: {
        duration: 0.5,
        ease: EASING.gentle
      }
    }
  })
}

/**
 * Mobile-optimized list item animation variants.
 * 
 * Simplified animation for mobile to avoid distracting "line update" effect.
 * Removes blur, slide, and stagger effects that create a cascading "checking" appearance.
 * 
 * ANIMATION:
 * - opacity: Simple fade-in (0 → 1)
 * - No blur: Removed to eliminate scanning effect
 * - No slide: Removed to eliminate wave effect
 * - No stagger: All items appear simultaneously for clean appearance
 * 
 * TIMING:
 * - Duration: 0.3s with smooth easing
 * - All items animate together for instant, clean appearance
 */
const mobileListItemVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: EASING.smooth
    }
  }
}

/**
 * Close button animation variants.
 * 
 * Beautiful entrance animation coordinated with tray entrance.
 * Appears after tray slides in, creating a polished, inspiring feel.
 * 
 * ANIMATION:
 * - opacity: Fades from 0 to 1
 * - scale: Scales from 0.9 to 1 (subtle zoom-in effect)
 * 
 * TIMING:
 * - Delay: 0.6s (appears after tray finishes sliding in ~0.5s)
 * - Duration: 0.5s for smooth, elegant appearance
 * - Creates inspiring reveal effect as tray settles
 */
const closeButtonVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: {
        duration: 0.5,
        ease: EASING.smooth,
        delay: 0.6
      },
      scale: {
        duration: 0.5,
        ease: EASING.elastic,
        delay: 0.6
      }
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: EASING.smooth
    }
  }
} as const

/** Unified duration for mobile stack transitions (back recede + front slide) so they feel like one motion. */
const MOBILE_STACK_DURATION = 0.35

/**
 * Mobile stacked sheet: back panel recedes when a new sheet is on top.
 * Same feedback language as desktop SideTray (blur/opacity/offset).
 *
 * When stacked: opacity 0.9, scale 0.96, translateY(8) so the sheet feels behind and "taller".
 */
const mobileStackBackVariants = {
  single: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
  stacked: {
    opacity: 0.9,
    scale: 0.96,
    y: 8,
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
} as const

/**
 * Mobile stacked sheet: front panel slides up into view.
 * Same duration and easing as back recede so the stack feels like one motion.
 */
const mobileStackFrontVariants = {
  hidden: {
    opacity: 0,
    y: "100%",
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
} as const

/**
 * View transition variants (for switching between list/article/about views).
 *
 * Creates a sophisticated, inspiring transition when switching views within the tray.
 * Content materializes into focus with a smooth blur-to-focus effect and subtle motion.
 *
 * ANIMATION:
 * - opacity: Fades in/out
 * - scale: Slightly scales from 0.96 to 1 (subtle zoom)
 * - y: Slides up from 12px to 0 (subtle upward motion)
 * - rotateX: Rotates from -5deg to 0 (3D perspective)
 * - filter: Blurs from 12px to 0px (dramatic focus effect)
 *
 * TIMING:
 * - duration: 0.7s (longer for smoother, more inspiring feel)
 * - delayChildren: 0.15s (slightly longer delay for better layering)
 * - staggerChildren: 0.08s between each child animation
 *
 * This creates a smooth, layered transition where content feels like it's
 * materializing into focus rather than just fading in.
 */
const viewTransitionVariants = {
  initial: {
    opacity: 0,
    filter: "blur(8px)"
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: EASING.smooth,
      staggerChildren: 0.06,
      delayChildren: 0.1
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
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for loading and managing article content.
 * 
 * Handles:
 * - Fetching articles from API endpoint
 * - Parsing frontmatter (title, date) from markdown
 * - Loading, error, and success states
 * - Content reset when article changes
 * 
 * API ENDPOINT:
 * Fetches from /api/article/[id] which returns markdown content with frontmatter.
 * 
 * FRONTMATTER PARSING:
 * Uses gray-matter to parse YAML frontmatter from markdown files.
 * Extracts title and date, leaving content as markdown string.
 * 
 * ERROR HANDLING:
 * - Catches fetch errors and parsing errors
 * - Sets error message for display
 * - Resets content on error
 * 
 * @returns {Object} Object containing:
 *   - content: Parsed article content (title, date, content) or null
 *   - isLoading: Boolean indicating if article is currently loading
 *   - error: Error message string or null
 *   - loadArticle: Function to load an article by ID
 *   - resetContent: Function to reset content state
 * 
 * @example
 * const { content, isLoading, error, loadArticle } = useArticleLoader()
 * loadArticle("working-philosophy")
 */
function useArticleLoader(apiBasePath: string = "/api/article") {
  const [content, setContent] = useState<ArticleContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadArticle = useCallback(async (articleId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBasePath}/${articleId}`)

      if (!response.ok) {
        throw new Error(`Failed to load article: ${response.status}`)
      }

      const data = await response.json()

      if (!data.content) {
        throw new Error("Article content is empty")
      }

      // Use gray-matter to parse frontmatter
      const parsed = matter(data.content)

      setContent({
        title: parsed.data.title || "Untitled",
        date: typeof parsed.data.date === 'string'
          ? parsed.data.date
          : parsed.data.date?.toLocaleDateString() || "",
        content: parsed.content,
        // Include full frontmatter for story rendering
        frontmatter: {
          title: parsed.data.title || "Untitled",
          role: parsed.data.role,
          company: parsed.data.company,
          year: parsed.data.year,
          heroImage: parsed.data.heroImage,
          heroAlt: parsed.data.heroAlt,
        }
      })
    } catch (err) {
      console.error("Error loading article:", err)
      setError(err instanceof Error ? err.message : "Failed to load article")
      setContent(null)
    } finally {
      setIsLoading(false)
    }
  }, [apiBasePath])

  const resetContent = useCallback(() => {
    setContent(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { content, isLoading, error, loadArticle, resetContent }
}

/**
 * SideTray Component
 * 
 * A slide-in side panel for displaying About content and Writing articles.
 * Supports dual-mode operation with sophisticated animations and responsive design.
 * 
 * MODES:
 * 
 * 1. Normal Mode (isWritingMode = false):
 *    - Displays About content when articleId === "about"
 *    - Single view, no navigation
 * 
 * 2. Writing Mode (isWritingMode = true):
 *    - Two-step navigation: List → Article
 *    - Shows article list when articleId === null
 *    - Shows article content when articleId is set
 *    - Requires onArticleSelect prop for navigation
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Slides up from bottom (bottom sheet style)
 * - Desktop: Slides in from right (side panel style)
 * 
 * ANIMATIONS:
 * - Respects prefers-reduced-motion
 * - Multi-stage animations (backdrop → tray → content)
 * - Smooth transitions between views
 * 
 * KEYBOARD NAVIGATION:
 * - Escape key closes the tray
 * - Full keyboard accessibility
 * 
 * @param {SideTrayProps} props - Component props
 * @returns {JSX.Element} The SideTray component
 */
function SideTray({ articleId, onClose, onCloseWritingOnly, onClosePhotosOnly, isWritingMode = false, isPhotosMode = false, isAboutMode = false, onArticleSelect, onSwitchToWriting, onSwitchToPhotograph, apiBasePath = "/api/article" }: SideTrayProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  /**
   * Article loading hook - manages fetching, parsing, and state for articles.
   */
  const { content, error, loadArticle, resetContent } = useArticleLoader(apiBasePath)

  /**
   * Location and weather for about tagline (city, temperature, description).
   */
  const { city, temperature, description } = useLocationWeather()
  
  /**
   * Current view mode within the tray.
   * 
   * - 'list': Article list view (legacy, not used in writing mode)
   * - 'article': Individual article content view
   * - 'about': About content view
   * - 'writing-list': Writing mode article list view
   */
  const [viewMode, setViewMode] = useState<'list' | 'article' | 'about' | 'writing-list' | 'photos'>('list')
  
  /**
   * Accessibility: Respects user's motion preference.
   * When true, animations are simplified or disabled.
   */
  const shouldReduceMotion = useReducedMotion()
  
  /**
   * Responsive: Detects if user is on mobile device.
   * Used to switch between mobile (bottom sheet) and desktop (side panel) layouts.
   */
  const isMobile = useIsMobile()

  /** Stacked mode: About tray pushed left + blurred, Writing or Photos panel on top (desktop only) */
  const isStacked = isAboutMode && (isWritingMode || isPhotosMode) && !isMobile

  /** Mobile stacked: two layers (back recedes, front slides up). Same feedback as desktop SideTray. */
  const isMobileStacked =
    isMobile &&
    ((isAboutMode && isWritingMode) ||
      (isAboutMode && isPhotosMode) ||
      (isWritingMode && articleId !== null && articleId !== "about"))
  /** Back panel view mode when isMobileStacked (level 0). */
  const mobileStackBackViewMode: "about" | "writing-list" | "photos" = isAboutMode && isWritingMode
    ? "about"
    : isAboutMode && isPhotosMode
      ? "about"
      : isWritingMode && articleId
        ? "writing-list"
        : "about"
  /** Front panel view mode when isMobileStacked (level 1). */
  const mobileStackFrontViewMode: "writing-list" | "photos" | "article" = isAboutMode && isWritingMode
    ? "writing-list"
    : isAboutMode && isPhotosMode
      ? "photos"
      : isWritingMode && articleId
        ? "article"
        : "writing-list"

  /** When true, front (Writing) panel is animating out before we call onCloseWritingOnly */
  const [isWritingPanelExiting, setIsWritingPanelExiting] = useState(false)
  /** When true, front (Photos) panel is animating out before we call onClosePhotosOnly */
  const [isPhotosPanelExiting, setIsPhotosPanelExiting] = useState(false)
  const showStackedFrontPanel = isStacked || isWritingPanelExiting || isPhotosPanelExiting

  /** When true, whole tray is animating out; onClose() is called after exit completes to avoid flash of list/about */
  const [isTrayExiting, setIsTrayExiting] = useState(false)

  const handleCloseWritingPanel = useCallback(() => {
    if (!onCloseWritingOnly) return
    if (isStacked) {
      aboutScrollWhenReturningFromStackedRef.current = backPanelScrollRef.current?.scrollTop ?? 0
      setIsWritingPanelExiting(true)
    } else {
      onCloseWritingOnly()
    }
  }, [isStacked, onCloseWritingOnly])

  const handleClosePhotosPanel = useCallback(() => {
    if (!onClosePhotosOnly) return
    if (isStacked) {
      aboutScrollWhenReturningFromStackedRef.current = backPanelScrollRef.current?.scrollTop ?? 0
      setIsPhotosPanelExiting(true)
    } else {
      onClosePhotosOnly()
    }
  }, [isStacked, onClosePhotosOnly])

  /** Called when front (Writing) panel exit animation finishes. Close is triggered by back panel's onAnimationComplete instead to avoid jump. */
  const handleWritingPanelExitComplete = useCallback(() => {
    // No-op: onCloseWritingOnly is called from back panel's onAnimationComplete when its reveal finishes
  }, [])

  /** When stacked, mark that we came from stacked so returning to About skips entrance animation */
  useEffect(() => {
    if (isStacked) justReturnedFromStackedRef.current = true
  }, [isStacked])

  /** When leaving stacked, restore main content scroll so About view does not jump */
  useEffect(() => {
    if (!isStacked && aboutScrollWhenReturningFromStackedRef.current !== undefined) {
      const saved = aboutScrollWhenReturningFromStackedRef.current
      aboutScrollWhenReturningFromStackedRef.current = undefined
      requestAnimationFrame(() => {
        if (mainContentRef.current) mainContentRef.current.scrollTop = saved
      })
    }
  }, [isStacked])

  /**
   * System theme detection for tray color scoping.
   * Used to set CSS variable overrides so Tailwind classes
   * (text-foreground, text-muted-foreground) resolve correctly
   * inside the tray regardless of the page's theme-blend state.
   */
  const { prefersDark } = useSystemTheme()

  /**
   * Calculate theme-aware colors for the tray.
   * Always uses CSS variables matching system preference so the
   * tray theme is consistent with the hero / page theme.
   *
   * Colors handled:
   * - Background: Main tray background
   * - Foreground: Primary text color
   * - Muted: Secondary/dimmed text color
   * - Border: Border and divider colors
   */
  const trayColors = useMemo(() => ({
    bg: 'var(--modal-bg)',
    fg: 'var(--modal-fg)',
    fgMuted: 'var(--modal-fg-muted)',
    border: 'var(--border-color)',
  }), [])

  /**
   * Personal Notes section expanded/collapsed state.
   * Default: collapsed (false) to give immediate focus to Writings section.
   */
  const [personalNotesExpanded, setPersonalNotesExpanded] = useState(false)

  /**
   * Refs for backdrop elements to disable pointer events during exit animation.
   * This allows hover events to work immediately after closing the tray.
   */
  const mainBackdropRef = useRef<HTMLDivElement>(null)

  /**
   * Ref to desktop tray container.
   */
  const mainTrayRef = useRef<HTMLDivElement>(null)

  /**
   * Refs to scrollable content containers (used for scroll position preservation
   * and desktop scroll-based blur effect).
   */
  const writingListContentRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll position for desktop article view blur effect.
   * Tracks scrollTop of mainContentRef to apply blur to header buttons.
   * Only used on desktop when viewing a writing article.
   */
  const [scrollTop, setScrollTop] = useState(0)

  /**
   * Ref for react-modal-sheet imperative API (mobile only).
   * Allows programmatic snapping (e.g., snap to 90% when article is selected).
   */
  const sheetRef = useRef<React.ComponentRef<typeof Sheet>>(null)

  /**
   * Current snap point index (0 = 90%, 1 = 50%, 2 = 0). Used for scroll-to-expand:
   * only expand when at 50% so we don't fight the user after they've dragged.
   */
  const currentSnapIndexRef = useRef<number>(1)

  /** Ref to the content div inside Sheet.Scroller (mobile single-sheet path) for scroll-to-expand. */
  const mobileScrollContentRef = useRef<HTMLDivElement>(null)

  /**
   * Touch start position for tap detection on mobile (avoids treating scroll as tap).
   * Article buttons call stopPropagation() in onTouchStart so the sheet scroll container
   * doesn't capture the touch; otherwise touchEnd may not fire on the button and tap does nothing.
   */
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)
  /** More forgiving than 15px so slight scroll or movement still registers as tap (fixes articles not opening on mobile). */
  const TAP_MOVE_THRESHOLD_PX = 24
  /** Guard so touchEnd + click don't both fire onArticleSelect for the same tap. */
  const articleTapHandledRef = useRef<{ id: string; t: number } | null>(null)
  const TAP_DEBOUNCE_MS = 450

  /**
   * Scroll position preservation for smooth navigation.
   * Stores scroll positions for different views (list, articles) to restore when navigating back.
   * Key format: "viewMode-articleId" (e.g., "writing-list-null", "article-article-id-1")
   */
  const scrollPositionRef = useRef<{[key: string]: number}>({})

  /**
   * When true, we were in stacked mode (About + Writing). Used so that when we
   * switch back to non-stacked About we skip the content entrance animation
   * and the About view stays still instead of "reloading".
   */
  const justReturnedFromStackedRef = useRef(false)

  /**
   * Ref to the back panel's scroll container (stacked desktop). Used to read
   * scroll position when closing the front panel so we can restore it when
   * switching back to the main About view and avoid text jump.
   */
  const backPanelScrollRef = useRef<HTMLDivElement>(null)
  /** Saved scroll position when returning from stacked; restored in useEffect when isStacked becomes false. */
  const aboutScrollWhenReturningFromStackedRef = useRef<number | undefined>(undefined)

  // ============================================================================
  // NESTED TRAY LOGIC
  // ============================================================================
  
  /**
   * Determines if we're showing a nested writing tray (article view within writing mode).
   * 
   * In writing mode:
   * - When articleId === null: Shows list tray (first level)
   * - When articleId !== null: Shows article tray (nested level, higher z-index)
   * 
   * This allows for proper layering when transitioning from list to article view.
   */

  // ============================================================================
  // RESPONSIVE ANIMATION VARIANTS
  // ============================================================================
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
  /**
   * Selects appropriate list item variants based on device.
   * 
   * - Mobile: Uses mobileListItemVariants (simple fade, no stagger/blur/slide)
   * - Desktop: Uses listItemVariants (staggered with blur and slide effects)
   */
  const activeListItemVariants = isMobile ? mobileListItemVariants : listItemVariants
  const activeViewTransitionVariants = shouldReduceMotion ? undefined : (isMobile ? {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: EASING.smooth
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: EASING.smooth
      }
    }
  } as const : viewTransitionVariants)

  // ============================================================================
  // SCROLL POSITION HELPERS
  // ============================================================================

  /**
   * Save current scroll position before view changes.
   * Stores scroll position in ref with unique key for current view.
   */
  const saveScrollPosition = useCallback(() => {
    const contentRef = isWritingMode && articleId === null ? writingListContentRef : mainContentRef
    if (contentRef.current) {
      const viewKey = `${viewMode}-${articleId || 'null'}`
      scrollPositionRef.current[viewKey] = contentRef.current.scrollTop
    }
  }, [viewMode, articleId, isWritingMode])

  /**
   * Restore scroll position after view changes.
   * Retrieves and applies scroll position from ref for target view.
   */
  const restoreScrollPosition = useCallback(() => {
    const viewKey = `${viewMode}-${articleId || 'null'}`
    const contentRef = isWritingMode && articleId === null ? writingListContentRef : mainContentRef

    if (contentRef.current && scrollPositionRef.current[viewKey] !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = scrollPositionRef.current[viewKey]
        }
      })
    }
  }, [viewMode, articleId, isWritingMode])

  /**
   * Single handler for article tap so touchEnd and click don't both fire (mobile).
   * Skips if the same article was already selected within TAP_DEBOUNCE_MS.
   */
  const handleArticleTap = useCallback((articleId: string) => {
    const now = Date.now()
    if (articleTapHandledRef.current?.id === articleId && now - articleTapHandledRef.current.t < TAP_DEBOUNCE_MS) {
      articleTapHandledRef.current = null
      return
    }
    onArticleSelect?.(articleId)
    articleTapHandledRef.current = { id: articleId, t: now }
    setTimeout(() => {
      articleTapHandledRef.current = null
    }, TAP_DEBOUNCE_MS)
  }, [onArticleSelect])

  // ============================================================================
  // ARTICLE LOADING LOGIC
  // ============================================================================

  /**
   * Reset article state before paint when switching to Writing list or Photos.
   * Prevents one-frame flash of stale article content in the stacked front panel.
   */
  useLayoutEffect(() => {
    if (articleId !== null) return
    if (isWritingMode || isPhotosMode) {
      resetContent()
      if (isWritingMode) setViewMode('writing-list')
      else if (isPhotosMode) setViewMode('photos')
    }
  }, [articleId, isWritingMode, isPhotosMode, resetContent])

  /**
   * Handles article loading and view mode switching based on articleId.
   * 
   * LOGIC FLOW:
   * 1. If articleId is null:
   *    - Reset content
   *    - Show list view (writing-list in writing mode, list otherwise)
   * 
   * 2. If articleId === "all":
   *    - Reset content
   *    - Show list view (legacy mode)
   * 
   * 3. If articleId === "about":
   *    - Reset content
   *    - Show about view (no API call needed)
   * 
   * 4. If articleId is a specific article ID:
   *    - Set view mode to 'article'
   *    - Load article from API
   * 
   * This effect runs whenever articleId, isWritingMode, or loading functions change.
   */
  useEffect(() => {
    // Save scroll position before view changes
    saveScrollPosition()

    if (!articleId) {
      resetContent()
      // On mobile, when user switched to writing/photos from About, show list/grid in same sheet.
      // On desktop, stacked mode shows About in back + Writing or Photos in front panel.
      if (isWritingMode && (isMobile || !isAboutMode)) {
        setViewMode('writing-list')
      } else if (isPhotosMode && (isMobile || !isAboutMode)) {
        setViewMode('photos')
      } else if (isAboutMode) {
        setViewMode('about')
      } else {
        setViewMode('list')
      }
      // Restore scroll position for list view
      requestAnimationFrame(() => restoreScrollPosition())
      return
    }

    if (articleId === "all") {
      resetContent()
      setViewMode('list')
      requestAnimationFrame(() => restoreScrollPosition())
      return
    }

    if (articleId === "about") {
      resetContent()
      setViewMode('about')
      requestAnimationFrame(() => restoreScrollPosition())
      return
    }

    // If in writing mode and articleId is set, show the article
    if (isWritingMode) {
      setViewMode('article')
      loadArticle(articleId)
      // Restore scroll position after content loads
      requestAnimationFrame(() => restoreScrollPosition())
      return
    }

    // Load the specific article
    setViewMode('article')
    loadArticle(articleId)
    requestAnimationFrame(() => restoreScrollPosition())
  }, [articleId, loadArticle, resetContent, isWritingMode, isPhotosMode, isAboutMode, isMobile, saveScrollPosition, restoreScrollPosition])

  // ============================================================================
  // BODY SCROLL: Lock when tray is open is handled in app/page.tsx (overflow: hidden).
  // ============================================================================

  // ============================================================================
  // MOBILE SHEET: SNAP TO 90% ON ARTICLE SELECT
  // ============================================================================

  /**
   * When an article is selected on mobile, snap the sheet to 90% immediately
   * so the sheet expansion and content change feel like one action.
   * snapPoints are [0.9, 0.5, 0] so index 0 = 90% (full), index 2 = 0% (dismissed).
   */
  useEffect(() => {
    if (!isMobile || !articleId || articleId === 'about') return
    sheetRef.current?.snapTo(0)
  }, [isMobile, articleId])

  // ============================================================================
  // MOBILE SHEET: SCROLL-TO-EXPAND (ABOUT ONLY)
  // ============================================================================

  /** Pixels scrolled down before expanding the sheet from 50% to 90%. */
  const SCROLL_EXPAND_THRESHOLD_PX = 48

  /**
   * When the bottom sheet is open at 50%, scrolling down inside the content
   * expands the sheet to 90%. Applies to all views (about, writing-list, photos, article)
   * in the single-sheet (non-stacked) mobile path. iOS-friendly: no need to hit the header to expand.
   */
  useEffect(() => {
    if (
      !isMobile ||
      isMobileStacked ||
      !(isWritingMode || isPhotosMode || isAboutMode || articleId !== null)
    ) return

    const contentEl = mobileScrollContentRef.current
    if (!contentEl) return

    let el: HTMLElement | null = contentEl.parentElement
    while (el) {
      const { scrollHeight, clientHeight } = el
      const overflowY = window.getComputedStyle(el).overflowY
      if ((overflowY === 'auto' || overflowY === 'scroll') && scrollHeight > clientHeight) break
      el = el.parentElement
    }
    const scrollContainer = el
    if (!scrollContainer) return

    const handleScroll = () => {
      if (currentSnapIndexRef.current === 1 && scrollContainer.scrollTop > SCROLL_EXPAND_THRESHOLD_PX) {
        sheetRef.current?.snapTo(0)
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [
    isMobile,
    viewMode,
    isMobileStacked,
    isWritingMode,
    isPhotosMode,
    isAboutMode,
    articleId,
  ])

  // ============================================================================
  // SCROLL-BASED BLUR FOR DESKTOP ARTICLE VIEW
  // ============================================================================
  
  /**
   * Tracks scroll position in desktop article view to apply blur effect to header buttons.
   * 
   * Only active when:
   * - Desktop (!isMobile)
   * - Article view (viewMode === 'article')
   * - Writing mode (isWritingMode === true)
   * 
   * Calculates blur intensity based on scroll position:
   * - 0px scroll = no blur
   * - Increasing scroll = more blur (capped at 8px)
   * 
   * Uses requestAnimationFrame for smooth performance.
   */
  useEffect(() => {
    // Only track scroll on desktop, in article view, in writing mode
    if (isMobile || viewMode !== 'article' || !isWritingMode) {
      setScrollTop(0)
      return
    }
    
    const contentEl = mainContentRef.current
    if (!contentEl) return
    
    let rafId: number | null = null
    
    const handleScroll = () => {
      if (rafId !== null) return
      
      rafId = requestAnimationFrame(() => {
        rafId = null
        setScrollTop(contentEl.scrollTop)
      })
    }
    
    contentEl.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial scroll position
    setScrollTop(contentEl.scrollTop)
    
    return () => {
      contentEl.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isMobile, viewMode, isWritingMode])

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================
  
  // Determine if we should show the tray (used by Escape handler and render)
  // Show tray if: writing mode, photos mode, about mode (always show), or articleId is set (normal mode)
  const shouldShowTray = isWritingMode || isPhotosMode || isAboutMode || articleId !== null

  /**
   * Handles Escape key to close the tray.
   * 
   * Only active when tray is open (articleId is not null).
   * Removes event listener when tray closes to prevent memory leaks.
   */
  /** Start tray exit animation, then call onClose when done (avoids flash of list/about when closing from article view) */
  const handleTrayCloseRequest = useCallback(() => {
    if (isTrayExiting) return
    setIsTrayExiting(true)
  }, [isTrayExiting])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Mobile stacked: pop front panel first (same as back button).
        if (isMobile && isMobileStacked) {
          if (mobileStackFrontViewMode === "article" && onArticleSelect) onArticleSelect(null)
          else if (isWritingMode && onCloseWritingOnly) onCloseWritingOnly()
          else if (isPhotosMode && onClosePhotosOnly) onClosePhotosOnly()
          return
        }
        // Desktop stacked: close front panel.
        if (showStackedFrontPanel) {
          if (isWritingMode && onCloseWritingOnly) handleCloseWritingPanel()
          else if (isPhotosMode && onClosePhotosOnly) handleClosePhotosPanel()
          return
        }
        // Mobile single sheet: close sheet. Desktop: run exit animation.
        if (isMobile) onClose()
        else handleTrayCloseRequest()
      }
    }

    if (shouldShowTray) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [shouldShowTray, showStackedFrontPanel, isWritingMode, isPhotosMode, onCloseWritingOnly, onClosePhotosOnly, handleCloseWritingPanel, handleClosePhotosPanel, handleTrayCloseRequest, isMobile, onClose, isMobileStacked, mobileStackFrontViewMode, onArticleSelect])

  // ============================================================================
  // MARKDOWN RENDERING COMPONENTS
  // ============================================================================
  //
  // Markdown components are conditionally applied based on API path:
  // - Regular articles: markdownComponents (from markdownComponents.tsx)
  // - Story articles: storyMarkdownComponents (from storyMarkdownComponents.tsx)
  //
  // Both share unified base styles (spacing, opacity, typography) from
  // markdownBaseStyles.tsx for consistency across all markdown content.
  //
  // @see app/components/markdown/markdownComponents.tsx
  // @see app/components/markdown/storyMarkdownComponents.tsx
  // @see app/components/markdown/markdownBaseStyles.tsx

  // Calculate blur intensity for desktop article view header buttons
  // Only applies on desktop, in article view, in writing mode
  const shouldApplyBlur = !isMobile && viewMode === 'article' && isWritingMode
  const blurValue = shouldApplyBlur ? Math.min(scrollTop / 50, 8) : 0
  const blurStyle = shouldApplyBlur && blurValue > 0
    ? { filter: `blur(${blurValue}px)`, transition: 'filter 0.3s ease-out' }
    : { filter: 'blur(0px)', transition: 'filter 0.3s ease-out' }

  /**
   * CSS custom property scoping for theme-aware colors inside the tray.
   * Ensures Tailwind classes and custom-property classes resolve correctly
   * regardless of the page's scroll-based theme-blend state.
   */
  const cssVarScoping = {
    '--foreground': prefersDark ? '220 15% 95%' : '220 15% 10%',
    '--muted-foreground': prefersDark ? '220 10% 70%' : '220 10% 35%',
    '--border': prefersDark ? '220 12% 18%' : '220 12% 86%',
    '--fg': prefersDark ? 'hsl(220 15% 95%)' : 'hsl(220 15% 10%)',
    '--fg-muted': prefersDark ? 'hsl(220 10% 70%)' : 'hsl(220 10% 35%)',
    '--border-color': prefersDark ? 'hsl(220 12% 18%)' : 'hsl(220 12% 86%)',
  } as React.CSSProperties

  /** Skip content entrance when returning from stacked (Writing) to About so About stays still */
  const skipAboutEntrance = !isMobile && !isStacked && isAboutMode && justReturnedFromStackedRef.current

  /** Clear "came from stacked" ref after we used it so next direct About open still animates */
  useEffect(() => {
    if (!skipAboutEntrance) return
    const id = requestAnimationFrame(() => {
      justReturnedFromStackedRef.current = false
    })
    return () => cancelAnimationFrame(id)
  }, [skipAboutEntrance])

  // ============================================================================
  // VIEW CONTENT (shared between mobile Sheet and desktop side panel)
  // ============================================================================

  /**
   * Renders content for a given view mode. Used for single-panel (viewContent) and for
   * mobile stacked back/front panels (renderViewContent(backMode) / renderViewContent(frontMode)).
   */
  type ViewModeType = "list" | "article" | "about" | "writing-list" | "photos"
  const renderViewContent = (displayMode?: ViewModeType) => {
    const mode = displayMode ?? viewMode
    return (
      <AnimatePresence mode="wait">
        {mode === "writing-list" ? (
        // Writing list view with both sections
        <motion.div
          key="writing-list"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* WRITINGS SECTION */}
          <motion.span
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 0.5, filter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="type-caption opacity-50 dark:opacity-70 block mb-2"
          >
            Writings
          </motion.span>

          <div className="space-y-4">
            {writings.map((article, i) => (
              <motion.button
                key={article.id}
                type="button"
                custom={i}
                variants={activeListItemVariants}
                initial="hidden"
                animate="visible"
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  if (e.touches?.[0]) {
                    touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                  }
                }}
                onTouchEnd={(e) => {
                  const start = touchStartPosRef.current
                  touchStartPosRef.current = null
                  if (!start || !onArticleSelect || !e.changedTouches?.[0]) return
                  const t = e.changedTouches[0]
                  const dx = t.clientX - start.x
                  const dy = t.clientY - start.y
                  if (dx * dx + dy * dy < TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
                    handleArticleTap(article.id)
                  }
                }}
                onClick={() => handleArticleTap(article.id)}
                className="tray-list-button cursor-pointer space-y-1 w-full text-left touch-manipulation border-0 bg-transparent p-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                style={{ WebkitTapHighlightColor: "transparent", outline: "none", touchAction: "manipulation" }}
                whileHover={{ x: 4, opacity: 1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: EASING.smooth }}
              >
                <p
                  className="text-xs transition-colors duration-200"
                  style={{ color: i < 2 ? trayColors.fg : trayColors.fgMuted }}
                >
                  {article.title}
                </p>
                <p
                  className="text-[10px] font-light transition-colors duration-200"
                  style={{ color: trayColors.fgMuted, opacity: 0.7 }}
                >
                  {article.date}
                </p>
              </motion.button>
            ))}
          </div>

          {/* PERSONAL NOTES SECTION - Collapsible */}
          <div className="mt-8">
            <motion.button
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 0.5, filter: 'blur(0px)' }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setPersonalNotesExpanded(!personalNotesExpanded)}
              className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer flex items-center gap-1.5 w-full mb-2 text-left group/notes focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                color: trayColors.fgMuted,
              }}
            >
              <span>Personal Notes</span>
              <svg
                width="6"
                height="6"
                viewBox="0 0 8 8"
                fill="none"
                stroke="currentColor"
                className={isMobile ? "opacity-50 cursor-pointer" : "opacity-0 group-hover/notes:opacity-50 transition-opacity duration-200 cursor-pointer"}
                style={{
                  transform: personalNotesExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                }}
              >
                <path
                  d="M2 1L5 4L2 7"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

            <AnimatePresence>
              {personalNotesExpanded && (
                <motion.div
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: EASING.smooth }}
                  className="space-y-4"
                >
                  {personalNotes.map((article, i) => (
                    <motion.button
                      key={article.id}
                      type="button"
                      custom={i + writings.length}
                      variants={activeListItemVariants}
                      initial="hidden"
                      animate="visible"
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        if (e.touches?.[0]) {
                          touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                        }
                      }}
                      onTouchEnd={(e) => {
                        const start = touchStartPosRef.current
                        touchStartPosRef.current = null
                        if (!start || !onArticleSelect || !e.changedTouches?.[0]) return
                        const t = e.changedTouches[0]
                        const dx = t.clientX - start.x
                        const dy = t.clientY - start.y
                        if (dx * dx + dy * dy < TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
                          handleArticleTap(article.id)
                        }
                      }}
                      onClick={() => handleArticleTap(article.id)}
                      className="tray-list-button cursor-pointer space-y-1 w-full text-left touch-manipulation border-0 bg-transparent p-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                      style={{ WebkitTapHighlightColor: "transparent", outline: "none", touchAction: "manipulation" }}
                      whileHover={{ x: 4, opacity: 1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: EASING.smooth }}
                    >
                      <p
                        className={`text-xs transition-colors duration-200 ${article.strikethrough ? "line-through opacity-70" : ""}`}
                        style={{ color: i < 1 ? trayColors.fg : trayColors.fgMuted }}
                      >
                        {article.title}
                      </p>
                      <p
                        className="text-[10px] font-light transition-colors duration-200"
                        style={{ color: trayColors.fgMuted, opacity: 0.7 }}
                      >
                        {article.date}
                      </p>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : mode === "photos" ? (
        <motion.div
          key="photos"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className={`flex flex-col gap-4 pb-8 ${isMobile ? '-mx-6' : ''}`}>
            {PHOTOS.map((photo, i) => (
              <motion.figure
                key={photo.src}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : i * 0.04, ease: EASING.smooth }}
                className="space-y-1 w-full"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2px] bg-muted/20">
                  <Image
                    src={photo.src}
                    alt={photo.alt ?? photo.src}
                    fill
                    sizes="(max-width: 500px) 100vw, 500px"
                    className="object-cover"
                  />
                </div>
                {photo.caption && (
                  <figcaption className="type-caption text-[10px] leading-tight px-6" style={{ color: trayColors.fgMuted, opacity: 0.8 }}>
                    {photo.caption}
                  </figcaption>
                )}
              </motion.figure>
            ))}
            <div className="flex flex-col gap-1 pt-2 pl-6">
              {PHOTOS.map((photo, i) => (
                <p key={photo.src} className="type-caption font-edu-marist leading-relaxed" style={{ color: trayColors.fgMuted, opacity: 0.8 }}>
                  <span className="opacity-70">{PHOTO_ROMAN[i]}</span> {getPhotoCreditName(photo)}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      ) : mode === "about" ? (
        // About content — COMPACT / modal typography: 16 → 14 → 12 (lead → body → caption)
        <motion.div
          key="about"
          variants={activeViewTransitionVariants}
          initial={skipAboutEntrance ? false : "initial"}
          animate="animate"
          exit="exit"
          className="flex flex-col h-full justify-between"
        >
          {/* Text Content Section — hero-like minimalism: one scale, opacity hierarchy, structural spacing */}
          <div className="tray-about-text-fade max-w-[600px]">
            <div className="flex flex-col gap-1 text-sm leading-relaxed transition-colors duration-200">
              <p className="font-edu-marist text-lg text-foreground">
                Hello, call me Raf. I&apos;ve been designing for the last 10 years and shipping code since the beginning.
              </p>
              <div className="mt-8 flex flex-col gap-1">
                <p className="text-foreground opacity-90">
                  Studied software engineering in Naples, Italy. My career began in hospitality, brand and web design.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-1">
                <p className="text-foreground opacity-80">
                  I&apos;m leading design for Seller AI at <InlineExternalLink href={COMPANY_LINKS.walmart} underlineStyle="subtle">Walmart</InlineExternalLink><span className="opacity-75">, where I am working at the intersection of AI systems and product design while building on the side.</span>
                </p>
                <p className="text-foreground opacity-80">
                  I designed Skills and AI workflows at <InlineExternalLink href={COMPANY_LINKS.obvious} underlineStyle="subtle">Obvious</InlineExternalLink>. I was Founding designer at <InlineExternalLink href={COMPANY_LINKS.theoriq} underlineStyle="subtle">Theoriq</InlineExternalLink><span className="opacity-75">, leading product design, front-end design engineering, and brand design.</span>
                </p>
                <p className="text-foreground opacity-80">
                  Before that: <InlineExternalLink href={COMPANY_LINKS.coinbase} underlineStyle="subtle">Coinbase Developer Platform</InlineExternalLink><span className="opacity-75"> design work, </span><InlineExternalLink href={COMPANY_LINKS.voiceflow} underlineStyle="subtle">Voiceflow</InlineExternalLink><span className="opacity-75"> for product activation </span>and more.
                </p>
              </div>
              <div className="my-10 flex flex-col gap-1">
                
                <div className="flex flex-col gap-1">
                  <p className="text-foreground opacity-70">
                    Grew up on the Amalfi Coast, Italy. Based in Toronto.
                  </p>
                  <p className="text-foreground opacity-70">
                    I{" "}
                    {(!isMobile && onSwitchToWriting) ? (
                      <motion.span
                        onClick={onSwitchToWriting}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            onSwitchToWriting()
                          }
                        }}
                        className={`cursor-pointer select-none ${HERO_UNDERLINE_CLASSES}`}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        whileTap={{ scale: 0.97, opacity: 0.85 }}
                        transition={{ duration: 0.15 }}
                      >
                        write
                      </motion.span>
                    ) : (
                      "write"
                    )}
                    ,{" "}
                    {(!isMobile && onSwitchToPhotograph) ? (
                      <motion.span
                        onClick={onSwitchToPhotograph}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            onSwitchToPhotograph()
                          }
                        }}
                        className={`cursor-pointer select-none ${HERO_UNDERLINE_CLASSES}`}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        whileTap={{ scale: 0.97, opacity: 0.85 }}
                        transition={{ duration: 0.15 }}
                      >
                        photograph
                      </motion.span>
                    ) : (
                      "photograph"
                    )}
                    , and spend time on a yoga mat or chasing light through workspaces.
                  </p>
                </div>
              </div>
              <p className="text-xs font-[family-name:var(--font-mono)] leading-[1.4] text-foreground opacity-60 min-h-5">
                Currently in {city}{temperature ? ` where it's ${temperature}${description ? ` and ${description}` : ""}` : ""}.
              </p>
            </div>
          </div>

          {/* Contact Links Section - at bottom */}
          <nav className="flex flex-col gap-1 group/nav pt-2">
            <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
            <FooterLink href="mailto:raf@raf.works" label="Email" />
            <FooterLink href="https://x.com/rafdotworks" label="X" external />
          </nav>

        </motion.div>
      ) : mode === "list" ? (
        // Show all articles list (legacy mode)
        <motion.div
          key="list"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-4 group/writings"
        >
          {allWritings.map((article, i) => (
            <React.Fragment key={article.id}>
              <motion.div
                custom={i}
                variants={activeListItemVariants}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  setViewMode('article')
                  loadArticle(article.id)
                }}
                className="cursor-pointer space-y-1 transition-opacity duration-200"
                whileHover={{ x: 4, opacity: 1 }}
                transition={{ duration: 0.2, ease: EASING.smooth }}
              >
                <p
                  className="text-xs transition-colors duration-200"
                  style={{ color: i < 2 ? trayColors.fg : trayColors.fgMuted }}
                >
                  {article.title}
                </p>
                <p
                  className="text-[10px] font-light transition-colors duration-200"
                  style={{ color: trayColors.fgMuted, opacity: 0.7 }}
                >
                  {article.date}
                </p>
              </motion.div>
              {i === 1 && (
                <div className="pt-1 pb-1">
                  <hr style={{ borderColor: trayColors.border, opacity: 0.3 }} className="transition-colors duration-200" />
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      ) : error ? (
        // Error state
        <motion.div
          key="error"
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: EASING.smooth }}
          className="text-center py-8"
        >
          <p className="text-xs mb-2" style={{ color: trayColors.fgMuted }}>
            Unable to load this article
          </p>
          <p className="text-[10px] font-light" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>
            {error}
          </p>
          <motion.button
            onClick={() => articleId && loadArticle(articleId)}
            className="mt-4 text-xs type-caption cursor-pointer focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
            style={{
              color: trayColors.fgMuted,
              background: 'transparent',
              border: 'none',
              padding: 0,
              outline: 'none',
              textDecoration: 'underline',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = trayColors.fg
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = trayColors.fgMuted
            }}
          >
            Try again
          </motion.button>
        </motion.div>
      ) : content ? (
        // Article/Story content — measure and landmark aligned with About tray
        <motion.div
          key="article"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-6"
        >
          <article aria-label={content.title || "Article"}>
            <div className="prose-article-narrow tray-about-text-fade">
              {apiBasePath === "/api/story" && content.frontmatter && (
                <StoryHeader
                  frontmatter={content.frontmatter}
                  isMobile={isMobile}
                />
              )}
              <ReactMarkdown
                components={
                  apiBasePath === "/api/story"
                    ? storyMarkdownComponents
                    : apiBasePath === "/api/article"
                      ? trayMarkdownComponents
                      : markdownComponents
                }
              >
                {content.content}
              </ReactMarkdown>
            </div>
          </article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  ); }; const viewContent = renderViewContent()

  // ============================================================================
  // MOBILE RENDER PATH (react-modal-sheet)
  // ============================================================================

  if (isMobile) {
    return (
      <Sheet
        ref={sheetRef}
        isOpen={shouldShowTray}
        onClose={onClose}
        snapPoints={[0.9, 0.5, 0]}
        initialSnap={isWritingMode ? 0 : 1}
        onSnap={(index) => { currentSnapIndexRef.current = index }}
        tweenConfig={{ ease: "easeOut", duration: 0.35 }}
        prefersReducedMotion={!!shouldReduceMotion}
      >
        <Sheet.Container
          style={{
            backgroundColor: trayColors.bg,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          <Sheet.Header />

          {/* Back/close button: when stacked, pops front panel (article→list, or Writing/Photos→About) */}
          {(isMobileStacked || (viewMode === "article" && articleId !== "all" && isWritingMode)) && (
            <motion.button
              initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              onClick={() => {
                if (isMobileStacked) {
                  if (mobileStackFrontViewMode === "article" && onArticleSelect) onArticleSelect(null)
                  else if (isWritingMode && onCloseWritingOnly) onCloseWritingOnly()
                  else if (isPhotosMode && onClosePhotosOnly) onClosePhotosOnly()
                } else if (isWritingMode && onArticleSelect) {
                  onArticleSelect(null)
                } else {
                  setViewMode("list")
                  resetContent()
                }
              }}
              className="absolute top-2 left-4 z-20 p-2 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
              whileHover={{ scale: 1.02, x: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASING.gentle }}
              aria-label={
                isMobileStacked && mobileStackFrontViewMode === "article"
                  ? "Back to list"
                  : isMobileStacked
                    ? "Back"
                    : "Back to list"
              }
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: trayColors.fgMuted,
                WebkitTapHighlightColor: "transparent",
                cursor: "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: "none" }}>
                <path d="M7 1L2 6L7 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}

          {/* Content drag enabled so at scroll top user can drag to expand (Sheet.Scroller draggableAt="top"); revert to disableDrag={isMobile} if accidental drags occur */}
          <Sheet.Content
            disableDrag={false}
            style={{
              paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))",
            }}
          >
            {isMobileStacked ? (
              <>
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                  <motion.div
                    className="absolute inset-0 flex flex-col min-h-full"
                    style={{ ...cssVarScoping, color: trayColors.fg }}
                    {...(shouldReduceMotion
                      ? { animate: { opacity: 0.9 } }
                      : {
                          variants: mobileStackBackVariants,
                          initial: "single",
                          animate: "stacked",
                        })}
                  >
                    <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-8 pb-8">
                      {renderViewContent(mobileStackBackViewMode)}
                    </div>
                  </motion.div>
                </div>
                <motion.div
                  key={isPhotosMode ? "photos-stack" : "writing-stack"}
                  role="dialog"
                  aria-modal="true"
                  aria-label={
                    mobileStackFrontViewMode === "article" && content
                      ? `Article: ${content.title}`
                      : mobileStackFrontViewMode === "photos"
                        ? "Photograph"
                        : "Writings"
                  }
                  className="absolute inset-0 z-10 flex flex-col min-h-full"
                  style={{
                    ...cssVarScoping,
                    color: trayColors.fg,
                    backgroundColor: trayColors.bg,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
                  }}
                  {...(shouldReduceMotion
                    ? { initial: false, animate: { opacity: 1 } }
                    : {
                        variants: mobileStackFrontVariants,
                        initial: "hidden",
                        animate: "visible",
                        exit: "exit",
                      })}
                >
                  <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-8 pb-8">
                    {mobileStackFrontViewMode === "article" ? (
                      <motion.div
                        key="stack-article-content"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: "12%" }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: MOBILE_STACK_DURATION, ease: EASING.smooth }}
                        className="min-h-full"
                      >
                        {renderViewContent(mobileStackFrontViewMode)}
                      </motion.div>
                    ) : (
                      renderViewContent(mobileStackFrontViewMode)
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              <Sheet.Scroller>
                <div
                  ref={mobileScrollContentRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={
                    viewMode === "about"
                      ? "About Raf"
                      : viewMode === "article" && content
                        ? `Article: ${content.title}`
                        : "Writings"
                  }
                  className={`px-6 pt-8 pb-8 ${viewMode === "about" ? "flex flex-col min-h-full" : ""}`}
                  style={{ ...cssVarScoping, color: trayColors.fg, WebkitTapHighlightColor: "transparent" }}
                >
                  {viewContent}
                </div>
              </Sheet.Scroller>
            )}
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={onClose} />
      </Sheet>
    )
  }

  // ============================================================================
  // DESKTOP RENDER PATH (Framer Motion AnimatePresence)
  // ============================================================================

  return (
    <>
      {/* Single persistent tray - content switches inside via nested AnimatePresence */}
      {/* Use (shouldShowTray || isTrayExiting) so we stay mounted during our own exit and don't flash list/about */}
      <AnimatePresence>
        {(shouldShowTray || isTrayExiting) && (
          <motion.div
            key="tray-wrapper"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            className="contents"
          >
            {/* Backdrop - always show to enable click-outside-to-close */}
            <motion.div
              ref={mainBackdropRef}
              key="backdrop"
              className="fixed inset-0 transition-colors duration-200 z-40 border-0 outline-none backdrop-blur-2xl"
              style={{
                backgroundColor: `color-mix(in srgb, ${trayColors.bg}, transparent 60%)`,
              }}
              variants={backdropVariants}
              initial="hidden"
              animate={isTrayExiting ? "exit" : "visible"}
              exit="exit"
              onClick={showStackedFrontPanel ? (isWritingMode && onCloseWritingOnly ? handleCloseWritingPanel : isPhotosMode && onClosePhotosOnly ? handleClosePhotosPanel : handleTrayCloseRequest) : handleTrayCloseRequest}
              onAnimationStart={(definition) => {
                // Disable pointer events when exit animation starts
                // This allows hover events to work immediately after closing
                if (definition === 'exit' && mainBackdropRef.current) {
                  mainBackdropRef.current.style.pointerEvents = 'none'
                }
              }}
            />

            {/* Desktop side tray with 3D perspective */}
            <motion.div
              ref={mainTrayRef}
              key="tray"
              className="fixed right-0 top-0 h-full w-full md:w-[500px] transition-colors duration-200"
              variants={trayVariants}
              initial="hidden"
              animate={isTrayExiting ? "exit" : "visible"}
              exit="exit"
              onAnimationComplete={(definition) => {
                if (isTrayExiting && definition === "exit") {
                  onClose()
                  // Unmount after parent has cleared state; wrapper exit is instant so no flash
                  setTimeout(() => setIsTrayExiting(false), 0)
                }
              }}
              style={{
                backgroundColor: trayColors.bg,
                color: trayColors.fg,
                transformStyle: "preserve-3d",
                perspective: "1200px",
                zIndex: 50,
              }}
            >
            {/* CSS variable scoping wrapper for theme-aware colors */}
            <div className="h-full flex flex-col" style={cssVarScoping}>
            {isStacked ? (
              <>
                {/* Back panel: About — pushed left and blurred when Writing is on top; eases back to center when Writing exits */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    x: (isWritingPanelExiting || isPhotosPanelExiting) ? 0 : -80,
                    filter: (isWritingPanelExiting || isPhotosPanelExiting) ? 'blur(0px)' : 'blur(12px)',
                    opacity: (isWritingPanelExiting || isPhotosPanelExiting) ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.5, ease: EASING.smooth }}
                  onAnimationComplete={() => {
                    if (isWritingPanelExiting) {
                      onCloseWritingOnly?.()
                      setIsWritingPanelExiting(false)
                    } else if (isPhotosPanelExiting) {
                      onClosePhotosOnly?.()
                      setIsPhotosPanelExiting(false)
                    }
                  }}
                  style={{
                    pointerEvents: 'none',
                    backgroundColor: trayColors.bg,
                    color: trayColors.fg,
                  }}
                >
                    <div className="h-full flex flex-col">
                    <div ref={backPanelScrollRef} className="flex-1 overflow-y-auto px-8 pt-16 pb-8 flex flex-col">
                      <div className="flex flex-col min-h-full justify-between">
                        <div className="tray-about-text-fade max-w-[600px]">
                          <div className="flex flex-col gap-1 text-sm leading-relaxed transition-colors duration-200">
                            <p className="font-edu-marist text-lg text-foreground">
                              Hello, call me Raf. I&apos;ve been designing for the last 10 years and shipping code since the beginning.
                            </p>
                            <div className="mt-8 flex flex-col gap-1">
                              <p className="text-foreground opacity-90">
                                Studied software engineering in Naples, Italy. My career began in hospitality, brand and web design.
                              </p>
                            </div>
                            <div className="mt-8 flex flex-col gap-1">
                              <p className="text-foreground opacity-80">
                                I&apos;m leading design for Seller AI at <InlineExternalLink href={COMPANY_LINKS.walmart} underlineStyle="subtle">Walmart</InlineExternalLink><span className="opacity-75">, where I am working at the intersection of AI systems and product design while building on the side.</span>
                              </p>
                              <p className="text-foreground opacity-80">
                                I designed Skills and AI workflows at <InlineExternalLink href={COMPANY_LINKS.obvious} underlineStyle="subtle">Obvious</InlineExternalLink>. I was Founding designer at <InlineExternalLink href={COMPANY_LINKS.theoriq} underlineStyle="subtle">Theoriq</InlineExternalLink><span className="opacity-75">, leading product design, front-end design engineering, and brand design.</span>
                              </p>
                              <p className="text-foreground opacity-80">
                                Before that: <InlineExternalLink href={COMPANY_LINKS.coinbase} underlineStyle="subtle">Coinbase Developer Platform</InlineExternalLink><span className="opacity-75"> design work, </span><InlineExternalLink href={COMPANY_LINKS.voiceflow} underlineStyle="subtle">Voiceflow</InlineExternalLink><span className="opacity-75"> for product activation </span>and more.
                              </p>
                            </div>
                            <div className="my-10 flex flex-col gap-1">
                              <p className="text-foreground opacity-70">
                                Grew up on the Amalfi Coast, Italy. Based in Toronto.
                              </p>
                              <p className="text-foreground opacity-70">
                                I{" "}
                                {(!isMobile && onSwitchToWriting) ? (
                                  <motion.span
                                    onClick={onSwitchToWriting}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        onSwitchToWriting()
                                      }
                                    }}
                                    className={`cursor-pointer select-none ${HERO_UNDERLINE_CLASSES}`}
                                    style={{ WebkitTapHighlightColor: "transparent" }}
                                    whileTap={{ scale: 0.97, opacity: 0.85 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    write
                                  </motion.span>
                                ) : (
                                  "write"
                                )}
                                ,{" "}
                                {(!isMobile && onSwitchToPhotograph) ? (
                                  <motion.span
                                    onClick={onSwitchToPhotograph}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        onSwitchToPhotograph()
                                      }
                                    }}
                                    className={`cursor-pointer select-none ${HERO_UNDERLINE_CLASSES}`}
                                    style={{ WebkitTapHighlightColor: "transparent" }}
                                    whileTap={{ scale: 0.97, opacity: 0.85 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    photograph
                                  </motion.span>
                                ) : (
                                  "photograph"
                                )}
                                , and spend time on a yoga mat or chasing light through workspaces.
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-[family-name:var(--font-mono)] leading-[1.4] text-foreground opacity-60 min-h-5">
                            Currently in {city}{temperature ? ` where it's ${temperature}${description ? ` and ${description}` : ""}` : ""}.
                          </p>
                        </div>
                        <nav className="flex flex-col gap-1 group/nav pt-2">
                          <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
                          <FooterLink href="mailto:raf@raf.works" label="Email" />
                          <FooterLink href="https://x.com/rafdotworks" label="X" external />
                        </nav>
                      </div>
                    </div>
                  </div>
                </motion.div>
                {/* Front panel: Writing or Photos — same entrance/exit as first modal (trayVariants) */}
                <AnimatePresence onExitComplete={handleWritingPanelExitComplete}>
                  {showStackedFrontPanel && (
                  <motion.div
                    key={isPhotosMode ? "photos-stack-panel" : "writing-stack-panel"}
                    className="absolute inset-0 z-10"
                    variants={trayVariants}
                    initial="hidden"
                    animate={isWritingPanelExiting || isPhotosPanelExiting ? "exit" : "visible"}
                    exit="exit"
                    style={{
                      backgroundColor: trayColors.bg,
                      color: trayColors.fg,
                    }}
                  >
                    <div className="h-full flex flex-col">
                      {!isPhotosMode && articleId !== null && onArticleSelect && (
                        <motion.button
                          onClick={() => onArticleSelect(null)}
                          className="absolute top-6 left-6 z-10 p-2 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                          aria-label="Back to list"
                          style={{ background: 'transparent', border: 'none', outline: 'none', color: trayColors.fgMuted, WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
                          whileHover={{ scale: 1.02, x: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L2 6L7 11" /></svg>
                        </motion.button>
                      )}
                      {(isWritingMode && onCloseWritingOnly) && (
                        <motion.button
                          onClick={handleCloseWritingPanel}
                          className="absolute top-6 right-6 z-10 p-1.5 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                          aria-label="Close writing"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            color: trayColors.fgMuted,
                            WebkitTapHighlightColor: 'transparent',
                            cursor: 'pointer',
                            opacity: 0.6,
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </motion.button>
                      )}
                      {isPhotosMode && onClosePhotosOnly && (
                        <motion.button
                          onClick={handleClosePhotosPanel}
                          className="absolute top-6 right-6 z-10 p-1.5 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                          aria-label="Close photographs"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            color: trayColors.fgMuted,
                            WebkitTapHighlightColor: 'transparent',
                            cursor: 'pointer',
                            opacity: 0.6,
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </motion.button>
                      )}
                      <motion.div
                        key={`stack-front-${isPhotosMode ? 'photos' : (articleId ?? 'list')}`}
                        className="flex-1 overflow-y-auto px-8 pt-16 pb-8"
                        variants={shouldReduceMotion ? undefined : contentVariants}
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate={shouldReduceMotion ? { opacity: 1 } : "visible"}
                      >
                        {isPhotosMode ? (
                          <div className="flex flex-col gap-4 pb-8">
                            {PHOTOS.map((photo, i) => (
                              <motion.figure
                                key={photo.src}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : i * 0.04, ease: EASING.smooth }}
                                className="space-y-1 w-full"
                              >
                                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2px] bg-muted/20">
                                  <Image
                                    src={photo.src}
                                    alt={photo.alt ?? photo.src}
                                    fill
                                    sizes="(max-width: 500px) 100vw, 500px"
                                    className="object-cover"
                                  />
                                </div>
                                {photo.caption && (
                                  <figcaption className="type-caption text-[10px] leading-tight" style={{ color: trayColors.fgMuted, opacity: 0.8 }}>
                                    {photo.caption}
                                  </figcaption>
                                )}
                              </motion.figure>
                            ))}
                            <div className="flex flex-col gap-1 pt-2">
                              {PHOTOS.map((photo, i) => (
                                <p key={photo.src} className="type-caption font-edu-marist leading-relaxed" style={{ color: trayColors.fgMuted, opacity: 0.8 }}>
                                  <span className="opacity-70">{PHOTO_ROMAN[i]}</span> {getPhotoCreditName(photo)}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : articleId === null ? (
                          <motion.div
                            key="writing-list"
                            variants={activeViewTransitionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            <motion.span
                              initial={{ opacity: 0, filter: 'blur(4px)' }}
                              animate={{ opacity: 0.5, filter: 'blur(0px)' }}
                              transition={{ duration: 0.4 }}
                              className="type-caption opacity-50 dark:opacity-70 block mb-2"
                            >
                              Writings
                            </motion.span>
                            <div className="space-y-4">
                              {writings.map((article, i) => (
                                <motion.button
                                  key={article.id}
                                  type="button"
                                  custom={i}
                                  variants={activeListItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => {
                                    e.stopPropagation()
                                    if (e.touches?.[0]) {
                                      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                                    }
                                  }}
                                  onTouchEnd={(e) => {
                                    const start = touchStartPosRef.current
                                    touchStartPosRef.current = null
                                    if (!start || !onArticleSelect || !e.changedTouches?.[0]) return
                                    const t = e.changedTouches[0]
                                    const dx = t.clientX - start.x
                                    const dy = t.clientY - start.y
                                    if (dx * dx + dy * dy < TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
                                      handleArticleTap(article.id)
                                    }
                                  }}
                                  onClick={() => handleArticleTap(article.id)}
                                  className="tray-list-button cursor-pointer space-y-1 w-full text-left touch-manipulation border-0 bg-transparent p-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                                  style={{ WebkitTapHighlightColor: "transparent", outline: "none", touchAction: "manipulation" }}
                                  whileHover={{ x: 4, opacity: 1 }}
                                  whileTap={{ scale: 0.98 }}
                                  transition={{ duration: 0.2, ease: EASING.smooth }}
                                >
                                  <p className="text-xs transition-colors duration-200" style={{ color: i < 2 ? trayColors.fg : trayColors.fgMuted }}>{article.title}</p>
                                  <p className="text-[10px] font-light transition-colors duration-200" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>{article.date}</p>
                                </motion.button>
                              ))}
                            </div>
                            <div className="mt-8">
                              <motion.button
                                initial={{ opacity: 0, filter: 'blur(4px)' }}
                                animate={{ opacity: 0.5, filter: 'blur(0px)' }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => setPersonalNotesExpanded(!personalNotesExpanded)}
                                className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer flex items-center gap-1.5 w-full mb-2 text-left group/notes touch-manipulation focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                                style={{ background: 'transparent', border: 'none', padding: 0, outline: 'none', WebkitTapHighlightColor: 'transparent', color: trayColors.fgMuted }}
                              >
                                <span>Personal Notes</span>
                                <svg width="6" height="6" viewBox="0 0 8 8" fill="none" stroke="currentColor" className={isMobile ? "opacity-50 cursor-pointer" : "opacity-0 group-hover/notes:opacity-50 transition-opacity duration-200 cursor-pointer"} style={{ transform: personalNotesExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-out, opacity 0.2s ease-out' }}>
                                  <path d="M2 1L5 4L2 7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </motion.button>
                              <AnimatePresence>
                                {personalNotesExpanded && (
                                  <motion.div initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease: EASING.smooth }} className="space-y-4">
                                    {personalNotes.map((article, i) => (
                                      <motion.button
                                        key={article.id}
                                        type="button"
                                        custom={i + writings.length}
                                        variants={activeListItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => {
                                          e.stopPropagation()
                                          if (e.touches?.[0]) {
                                            touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                                          }
                                        }}
                                        onTouchEnd={(e) => {
                                          const start = touchStartPosRef.current
                                          touchStartPosRef.current = null
                                          if (!start || !onArticleSelect || !e.changedTouches?.[0]) return
                                          const t = e.changedTouches[0]
                                          const dx = t.clientX - start.x
                                          const dy = t.clientY - start.y
                                          if (dx * dx + dy * dy < TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
                                            handleArticleTap(article.id)
                                          }
                                        }}
                                        onClick={() => handleArticleTap(article.id)}
                                        className="tray-list-button cursor-pointer space-y-1 w-full text-left touch-manipulation border-0 bg-transparent p-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                                        style={{ WebkitTapHighlightColor: "transparent", outline: "none", touchAction: "manipulation" }}
                                        whileHover={{ x: 4, opacity: 1 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: EASING.smooth }}
                                      >
                                        <p className={`text-xs transition-colors duration-200 ${article.strikethrough ? "line-through opacity-70" : ""}`} style={{ color: i < 1 ? trayColors.fg : trayColors.fgMuted }}>{article.title}</p>
                                        <p className="text-[10px] font-light transition-colors duration-200" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>{article.date}</p>
                                      </motion.button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        ) : error ? (
                          <motion.div key="error" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.4, ease: EASING.smooth }} className="text-center py-8">
                            <p className="text-xs mb-2" style={{ color: trayColors.fgMuted }}>Unable to load this article</p>
                            <p className="text-[10px] font-light" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>{error}</p>
                            <motion.button onClick={() => articleId && loadArticle(articleId)} className="mt-4 text-xs type-caption cursor-pointer focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0" style={{ color: trayColors.fgMuted, background: 'transparent', border: 'none', padding: 0, outline: 'none', textDecoration: 'underline' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>Try again</motion.button>
                          </motion.div>
                        ) : content ? (
                          <motion.div key="article" variants={activeViewTransitionVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                            <article aria-label={content.title || "Article"}>
                              <div className="prose-article-narrow tray-about-text-fade">
                                {apiBasePath === "/api/story" && content.frontmatter && <StoryHeader frontmatter={content.frontmatter} isMobile={isMobile} />}
                                <ReactMarkdown components={apiBasePath === "/api/story" ? storyMarkdownComponents : apiBasePath === "/api/article" ? trayMarkdownComponents : markdownComponents}>{content.content}</ReactMarkdown>
                              </div>
                            </article>
                          </motion.div>
                        ) : null}
                      </motion.div>
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
            <motion.div
              className="h-full flex flex-col"
              variants={shouldReduceMotion ? undefined : activeContentVariants}
              initial={shouldReduceMotion ? undefined : (skipAboutEntrance ? false : "hidden")}
              animate={shouldReduceMotion ? undefined : "visible"}
            >
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-1.5 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                variants={shouldReduceMotion ? undefined : closeButtonVariants}
                initial={shouldReduceMotion ? undefined : "hidden"}
                animate={shouldReduceMotion ? undefined : "visible"}
                exit={shouldReduceMotion ? undefined : "exit"}
                whileHover={shouldReduceMotion ? {} : { rotate: 15 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                transition={{ duration: 0.4, ease: EASING.gentle }}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: trayColors.fgMuted,
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  opacity: 0.6,
                  ...blurStyle
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = trayColors.fg
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = trayColors.fgMuted
                    e.currentTarget.style.opacity = '0.6'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.color = trayColors.fgMuted
                    e.currentTarget.style.opacity = '0.6'
                  }}
              >
                {/* X icon with thin strokes */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ pointerEvents: 'none' }}
                >
                  <path
                    d="M1 1L11 11M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>

              {/* Back button for article view - only in writing mode */}
              {viewMode === 'article' && articleId !== "all" && isWritingMode && (
                <motion.button
                  initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  onClick={() => {
                    if (isWritingMode && onArticleSelect) {
                      // For writing mode, go back to list
                      onArticleSelect(null)
                    } else {
                      setViewMode('list')
                      resetContent()
                    }
                  }}
                  className="absolute top-6 left-6 z-10 p-2 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                  whileHover={{ scale: 1.02, x: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, ease: EASING.gentle }}
                  aria-label="Back to list"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: trayColors.fgMuted,
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    ...blurStyle
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = trayColors.fg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = trayColors.fgMuted
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.color = trayColors.fgMuted
                  }}
                >
                  {/* Minimal arrow icon */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ pointerEvents: 'none' }}
                  >
                    <path
                      d="M7 1L2 6L7 11"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              )}

              {/* Content - adjusted padding to account for floating buttons */}
              <div
                ref={mainContentRef}
                className={`flex-1 overflow-y-auto px-8 pt-16 pb-8 ${viewMode === 'about' ? 'flex flex-col' : ''}`}
              >
                {viewContent}
              </div>
            </motion.div>
            )}
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Memoize to prevent re-renders when parent state changes
const MemoizedSideTray = memo(SideTray)

// Display name for React DevTools debugging
MemoizedSideTray.displayName = 'SideTray'

export default MemoizedSideTray