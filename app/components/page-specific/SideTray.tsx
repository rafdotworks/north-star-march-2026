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

import React, { useEffect, useState, useCallback, useRef, memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import matter from "gray-matter"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Sheet from "react-modal-sheet"
import FooterLink from "@/app/components/layout/FooterLink"
import InlineExternalLink, { SUBTLE_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"
import { COMPANY_LINKS } from "@/app/config/companyLinks"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { useLocationWeather } from "@/hooks/use-timezone-message"
import { EASING } from "@/components/animations/constants"
import { markdownComponents } from "@/app/components/markdown/markdownComponents"
import { storyMarkdownComponents } from "@/app/components/markdown/storyMarkdownComponents"
import { StoryHeader } from "@/app/components/story"
import {
  allWritings,
  writings,
  personalNotes
} from "@/app/config/writingsConfig"
import type { StoryFrontmatter } from "@/app/types/story"

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
      duration: 0.35,
      ease: EASING.smooth
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
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
function SideTray({ articleId, onClose, onCloseWritingOnly, isWritingMode = false, isAboutMode = false, onArticleSelect, onSwitchToWriting, apiBasePath = "/api/article" }: SideTrayProps) {
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
  const [viewMode, setViewMode] = useState<'list' | 'article' | 'about' | 'writing-list'>('list')
  
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

  /** Stacked mode: About tray pushed left + blurred, Writing tray on top (desktop only) */
  const isStacked = isAboutMode && isWritingMode && !isMobile

  /** When true, front (Writing) panel is animating out before we call onCloseWritingOnly */
  const [isWritingPanelExiting, setIsWritingPanelExiting] = useState(false)
  const showStackedFrontPanel = isStacked || isWritingPanelExiting

  const handleCloseWritingPanel = useCallback(() => {
    if (!onCloseWritingOnly) return
    if (isStacked) {
      setIsWritingPanelExiting(true)
    } else {
      onCloseWritingOnly()
    }
  }, [isStacked, onCloseWritingOnly])

  /** Called when front (Writing) panel exit animation finishes. Close is triggered by back panel's onAnimationComplete instead to avoid jump. */
  const handleWritingPanelExitComplete = useCallback(() => {
    // No-op: onCloseWritingOnly is called from back panel's onAnimationComplete when its reveal finishes
  }, [])

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
   * Scroll position preservation for smooth navigation.
   * Stores scroll positions for different views (list, articles) to restore when navigating back.
   * Key format: "viewMode-articleId" (e.g., "writing-list-null", "article-article-id-1")
   */
  const scrollPositionRef = useRef<{[key: string]: number}>({})

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
        duration: 0.2
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

  // ============================================================================
  // ARTICLE LOADING LOGIC
  // ============================================================================

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
      // On mobile, when user switched to writing from About, show writing list in same sheet.
      // On desktop, stacked mode shows About in back + Writing in front panel.
      if (isWritingMode && (isMobile || !isAboutMode)) {
        setViewMode('writing-list')
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
  }, [articleId, loadArticle, resetContent, isWritingMode, isAboutMode, isMobile, saveScrollPosition, restoreScrollPosition])

  // ============================================================================
  // BODY SCROLL: intentionally not locked on desktop so the page can still scroll
  // when the tray is open. Mobile scroll locking is handled by react-modal-sheet.
  // ============================================================================

  // ============================================================================
  // MOBILE SHEET: SNAP TO 90% ON ARTICLE SELECT
  // ============================================================================

  /**
   * When an article is selected on mobile, programmatically snap the sheet
   * to the 90% snap point for better reading experience.
   */
  useEffect(() => {
    if (!isMobile || !articleId || articleId === 'about') return
    // Snap to index 2 (90%) after a brief delay to allow content to load
    const timer = setTimeout(() => {
      sheetRef.current?.snapTo(2)
    }, 100)
    return () => clearTimeout(timer)
  }, [isMobile, articleId])

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
  // Show tray if: writing mode (always show), about mode (always show), or articleId is set (normal mode)
  const shouldShowTray = isWritingMode || isAboutMode || articleId !== null

  /**
   * Handles Escape key to close the tray.
   * 
   * Only active when tray is open (articleId is not null).
   * Removes event listener when tray closes to prevent memory leaks.
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
        if (showStackedFrontPanel && onCloseWritingOnly) handleCloseWritingPanel()
        else onClose()
      }
    }

    if (shouldShowTray) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [shouldShowTray, showStackedFrontPanel, onClose, onCloseWritingOnly, handleCloseWritingPanel])

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

  // ============================================================================
  // VIEW CONTENT (shared between mobile Sheet and desktop side panel)
  // ============================================================================

  /**
   * The AnimatePresence block with all view modes.
   * Rendered inside Sheet.Content (mobile) or the scrollable div (desktop).
   */
  const viewContent = (
    <AnimatePresence mode="wait">
      {viewMode === 'writing-list' ? (
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
              <motion.div
                key={article.id}
                custom={i}
                variants={activeListItemVariants}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  if (onArticleSelect) {
                    onArticleSelect(article.id)
                  }
                }}
                className="cursor-pointer space-y-1"
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
            ))}
          </div>

          {/* PERSONAL NOTES SECTION - Collapsible */}
          <div className="mt-8">
            <motion.button
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 0.5, filter: 'blur(0px)' }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => setPersonalNotesExpanded(!personalNotesExpanded)}
              className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer flex items-center gap-1.5 w-full mb-2 text-left group/notes"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
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
                    <motion.div
                      key={article.id}
                      custom={i + writings.length}
                      variants={activeListItemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => {
                        if (onArticleSelect) {
                          onArticleSelect(article.id)
                        }
                      }}
                      className="cursor-pointer space-y-1"
                      whileHover={{ x: 4, opacity: 1 }}
                      transition={{ duration: 0.2, ease: EASING.smooth }}
                    >
                      <p
                        className="text-xs transition-colors duration-200"
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
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : viewMode === 'about' ? (
        // About content — COMPACT / modal typography: 16 → 14 → 12 (lead → body → caption)
        <motion.div
          key="about"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col h-full justify-between"
        >
          {/* Text Content Section - at top (fade: full opacity at top, subtler toward bottom) */}
          <div className="tray-about-text-fade">
            <div className="space-y-6">
              {/* 1. Opening (primary) */}
              <p className="text-base text-foreground leading-relaxed transition-colors duration-200 font-medium">
                Hello, I am Raf. I&apos;ve been shipping code since before the tooling made it easy.
              </p>

              {/* Body: background, roles, values, place, personal */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  Studied software engineering in Naples before design pulled me in. Picked up a few awards since.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  My career began in hospitality, brand and web design.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  Early on, an internship at <InlineExternalLink href={COMPANY_LINKS.apple} underlineStyle="subtle">Apple</InlineExternalLink> as a UX/UI Designer.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  I designed Skills and AI workflows at <InlineExternalLink href={COMPANY_LINKS.obvious} underlineStyle="subtle">Obvious</InlineExternalLink>. I was Founding designer at <InlineExternalLink href={COMPANY_LINKS.theoriq} underlineStyle="subtle">Theoriq</InlineExternalLink>, leading product design, design engineering, front-end and marketing.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  Before that: <InlineExternalLink href={COMPANY_LINKS.coinbase} underlineStyle="subtle">Coinbase Developer Platform</InlineExternalLink>, <InlineExternalLink href={COMPANY_LINKS.voiceflow} underlineStyle="subtle">Voiceflow</InlineExternalLink> and more.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  I care about systems that feel fast, logical, and respectful of attention.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  Grew up on the Amalfi Coast. Based in Toronto.
                </p>
                <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                  I{" "}
                  {onSwitchToWriting ? (
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
                      className={`cursor-pointer select-none ${SUBTLE_UNDERLINE_CLASSES}`}
                      style={{ WebkitTapHighlightColor: "transparent" }}
                      whileTap={{ scale: 0.97, opacity: 0.85 }}
                      transition={{ duration: 0.15 }}
                    >
                      write
                    </motion.span>
                  ) : (
                    "write"
                  )}
                  , photograph, and spend time on a yoga mat or chasing light through workspaces.
                </p>
              </div>

              {/* Location/weather (label style, just above links) */}
              <p className="text-xs font-[family-name:var(--font-mono)] leading-[1.4] opacity-60 transition-colors duration-200 pt-2">
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
      ) : viewMode === 'list' ? (
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
            className="mt-4 text-xs type-caption cursor-pointer"
            style={{
              color: trayColors.fgMuted,
              background: 'transparent',
              border: 'none',
              padding: 0,
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
        // Article/Story content
        <motion.div
          key="article"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-6"
        >
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
                : markdownComponents
            }
          >
            {content.content}
          </ReactMarkdown>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  // ============================================================================
  // MOBILE RENDER PATH (react-modal-sheet)
  // ============================================================================

  if (isMobile) {
    return (
      <Sheet
        ref={sheetRef}
        isOpen={shouldShowTray}
        onClose={onClose}
        snapPoints={[0, 0.5, 0.9]}
        initialSnap={1}
        tweenConfig={{ ease: "easeOut", duration: 0.3 }}
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

          {/* Close button — floating over content */}
          <motion.button
            onClick={onClose}
            className="absolute top-3 right-5 z-10 p-2.5 group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASING.smooth }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              color: trayColors.fgMuted,
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </motion.button>

          {/* Back button for article view - only in writing mode */}
          {viewMode === 'article' && articleId !== "all" && isWritingMode && (
            <motion.button
              initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              onClick={() => {
                if (isWritingMode && onArticleSelect) {
                  onArticleSelect(null)
                } else {
                  setViewMode('list')
                  resetContent()
                }
              }}
              className="absolute top-2 left-4 z-10 p-2 group"
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
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
                <path d="M7 1L2 6L7 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}

          <Sheet.Content
            style={{
              paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))",
            }}
          >
            <div
              className={`px-6 pt-8 pb-8 ${viewMode === 'about' ? 'flex flex-col min-h-full' : ''}`}
              style={{ ...cssVarScoping, color: trayColors.fg }}
            >
              {viewContent}
            </div>
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
      <AnimatePresence>
        {shouldShowTray && (
          <>
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
              animate="visible"
              exit="exit"
              onClick={showStackedFrontPanel && onCloseWritingOnly ? handleCloseWritingPanel : onClose}
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
              animate="visible"
              exit="exit"
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
                    x: isWritingPanelExiting ? 0 : -80,
                    filter: isWritingPanelExiting ? 'blur(0px)' : 'blur(12px)',
                    opacity: isWritingPanelExiting ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.45, ease: EASING.smooth }}
                  onAnimationComplete={() => {
                    if (isWritingPanelExiting) {
                      onCloseWritingOnly?.()
                      setIsWritingPanelExiting(false)
                    }
                  }}
                  style={{
                    pointerEvents: 'none',
                    backgroundColor: trayColors.bg,
                    color: trayColors.fg,
                  }}
                >
                    <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto px-8 pt-16 pb-8 flex flex-col">
                      <div className="flex flex-col min-h-full justify-between">
                        <div className="tray-about-text-fade">
                          <div className="space-y-6">
                            <p className="text-base text-foreground leading-relaxed transition-colors duration-200 font-medium">
                              Hello, I am Raf. I&apos;ve been shipping code since before the tooling made it easy.
                            </p>
                            <div className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              Studied software engineering in Naples before design pulled me in. Picked up a few awards since.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              My career began in hospitality, brand and web design.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              Early on, an internship at <InlineExternalLink href={COMPANY_LINKS.apple} underlineStyle="subtle">Apple</InlineExternalLink> as a UX/UI Designer.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              I designed Skills and AI workflows at <InlineExternalLink href={COMPANY_LINKS.obvious} underlineStyle="subtle">Obvious</InlineExternalLink>. I was Founding designer at <InlineExternalLink href={COMPANY_LINKS.theoriq} underlineStyle="subtle">Theoriq</InlineExternalLink>, leading product design, design engineering, front-end and marketing.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              Before that: <InlineExternalLink href={COMPANY_LINKS.coinbase} underlineStyle="subtle">Coinbase Developer Platform</InlineExternalLink>, <InlineExternalLink href={COMPANY_LINKS.voiceflow} underlineStyle="subtle">Voiceflow</InlineExternalLink> and more.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              I care about systems that feel fast, logical, and respectful of attention.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              Grew up on the Amalfi Coast. Based in Toronto.
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.5] transition-colors duration-200">
                              I{" "}
                              {onSwitchToWriting ? (
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
                                  className={`cursor-pointer select-none ${SUBTLE_UNDERLINE_CLASSES}`}
                                  style={{ WebkitTapHighlightColor: "transparent" }}
                                  whileTap={{ scale: 0.97, opacity: 0.85 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  write
                                </motion.span>
                              ) : (
                                "write"
                              )}
                              , photograph, and spend time on a yoga mat or chasing light through workspaces.
                            </p>
                          </div>
                            <p className="text-xs font-[family-name:var(--font-mono)] leading-[1.4] opacity-60 transition-colors duration-200 pt-2">
                              Currently in {city}{temperature ? ` where it's ${temperature}${description ? ` and ${description}` : ""}` : ""}.
                            </p>
                          </div>
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
                {/* Front panel: Writing — slides in from right, slides out on close */}
                <AnimatePresence onExitComplete={handleWritingPanelExitComplete}>
                  {showStackedFrontPanel && (
                  <motion.div
                    key="writing-stack-panel"
                    className="absolute inset-0 z-10"
                    initial={{ x: '100%' }}
                    animate={{ x: isWritingPanelExiting ? '100%' : 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 180, damping: 28, mass: 1 }}
                    style={{
                      backgroundColor: trayColors.bg,
                      color: trayColors.fg,
                    }}
                  >
                    <div className="h-full flex flex-col">
                      {articleId !== null && onArticleSelect && (
                        <motion.button
                          onClick={() => onArticleSelect(null)}
                          className="absolute top-6 left-6 z-10 p-2 group"
                          aria-label="Back to list"
                          style={{ background: 'transparent', border: 'none', outline: 'none', color: trayColors.fgMuted, WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
                          whileHover={{ scale: 1.02, x: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L2 6L7 11" /></svg>
                        </motion.button>
                      )}
                      {onCloseWritingOnly && (
                        <motion.button
                          onClick={handleCloseWritingPanel}
                          className="absolute top-6 right-6 z-10 p-1.5 group"
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
                      <motion.div
                        className="flex-1 overflow-y-auto px-8 pt-16 pb-8"
                        initial={shouldReduceMotion ? undefined : { opacity: 0 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                        transition={shouldReduceMotion ? undefined : { duration: 0.35, delay: 0.15, ease: EASING.smooth }}
                      >
                        {articleId === null ? (
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
                                <motion.div
                                  key={article.id}
                                  custom={i}
                                  variants={activeListItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  onClick={() => onArticleSelect?.(article.id)}
                                  className="cursor-pointer space-y-1"
                                  whileHover={{ x: 4, opacity: 1 }}
                                  transition={{ duration: 0.2, ease: EASING.smooth }}
                                >
                                  <p className="text-xs transition-colors duration-200" style={{ color: i < 2 ? trayColors.fg : trayColors.fgMuted }}>{article.title}</p>
                                  <p className="text-[10px] font-light transition-colors duration-200" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>{article.date}</p>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-8">
                              <motion.button
                                initial={{ opacity: 0, filter: 'blur(4px)' }}
                                animate={{ opacity: 0.5, filter: 'blur(0px)' }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                onClick={() => setPersonalNotesExpanded(!personalNotesExpanded)}
                                className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer flex items-center gap-1.5 w-full mb-2 text-left group/notes"
                                style={{ background: 'transparent', border: 'none', padding: 0, WebkitTapHighlightColor: 'transparent', color: trayColors.fgMuted }}
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
                                      <motion.div
                                        key={article.id}
                                        custom={i + writings.length}
                                        variants={activeListItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        onClick={() => onArticleSelect?.(article.id)}
                                        className="cursor-pointer space-y-1"
                                        whileHover={{ x: 4, opacity: 1 }}
                                        transition={{ duration: 0.2, ease: EASING.smooth }}
                                      >
                                        <p className="text-xs transition-colors duration-200" style={{ color: i < 1 ? trayColors.fg : trayColors.fgMuted }}>{article.title}</p>
                                        <p className="text-[10px] font-light transition-colors duration-200" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>{article.date}</p>
                                      </motion.div>
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
                            <motion.button onClick={() => articleId && loadArticle(articleId)} className="mt-4 text-xs type-caption cursor-pointer" style={{ color: trayColors.fgMuted, background: 'transparent', border: 'none', padding: 0, textDecoration: 'underline' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>Try again</motion.button>
                          </motion.div>
                        ) : content ? (
                          <motion.div key="article" variants={activeViewTransitionVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                            {apiBasePath === "/api/story" && content.frontmatter && <StoryHeader frontmatter={content.frontmatter} isMobile={isMobile} />}
                            <ReactMarkdown components={apiBasePath === "/api/story" ? storyMarkdownComponents : markdownComponents}>{content.content}</ReactMarkdown>
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
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
            >
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-1.5 group"
                variants={shouldReduceMotion ? undefined : closeButtonVariants}
                initial={shouldReduceMotion ? undefined : "hidden"}
                animate={shouldReduceMotion ? undefined : "visible"}
                exit={shouldReduceMotion ? undefined : "exit"}
                whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 15 }}
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
                  className="absolute top-6 left-6 z-10 p-2 group"
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
        </>
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