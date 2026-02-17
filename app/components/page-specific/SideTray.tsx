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
import FooterLink from "@/app/components/layout/FooterLink"
import { SUBTLE_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"
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
 * Mobile-optimized animation variants (iOS-inspired).
 *
 * Tuned to match the feel of native iOS bottom sheets:
 * - Snappy present with a firm settle (no bounce/overshoot)
 * - Slide-down dismiss so the sheet leaves the way it came
 * - Slight scale on hidden state for depth
 *
 * Spring parameters modeled after UIKit's default sheet presentation:
 * stiffness ~300, damping ~30 → fast rise, firm stop.
 */
const mobileTrayVariants = {
  hidden: {
    y: "100%",
    scale: 0.97,
    opacity: 0,
  },
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    y: "100%",
    scale: 0.97,
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
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
  const { content, isLoading, error, loadArticle, resetContent } = useArticleLoader(apiBasePath)

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
  const writingListBackdropRef = useRef<HTMLDivElement>(null)
  const mainBackdropRef = useRef<HTMLDivElement>(null)
  
  /**
   * Current drag position for drag-to-dismiss functionality (mobile only).
   * Tracks the Y offset during drag gesture.
   */
  const [dragY, setDragY] = useState(0)
  
  /**
   * Refs to tray containers for drag functionality.
   */
  const writingListTrayRef = useRef<HTMLDivElement>(null)
  const mainTrayRef = useRef<HTMLDivElement>(null)
  
  /**
   * Refs to scrollable content containers for scroll-to-dismiss detection.
   */
  const writingListContentRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  
  /**
   * Track if scroll-to-dismiss is currently active (prevents normal scrolling).
   * Using ref for the internal tracking to avoid effect re-runs.
   */
  const isScrollDismissingRef = useRef(false)
  
  /**
   * Track last touch position for scroll-to-dismiss detection.
   */
  const lastTouchYRef = useRef<number | null>(null)
  
  /**
   * Scroll position for desktop article view blur effect.
   * Tracks scrollTop of mainContentRef to apply blur to header buttons.
   * Only used on desktop when viewing a writing article.
   */
  const [scrollTop, setScrollTop] = useState(0)

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
  const isNestedWritingTray = isWritingMode && articleId !== null

  // ============================================================================
  // RESPONSIVE ANIMATION VARIANTS
  // ============================================================================
  // mobileTrayVariants is defined at module level for performance optimization
  
  /**
   * Selects appropriate animation variants based on device and accessibility preferences.
   * 
   * - Mobile: Uses mobileTrayVariants (slide up from bottom)
   * - Desktop: Uses trayVariants (slide in from right with 3D effects)
   * - Reduced motion: Disables animations (undefined variants)
   */
  const activeTrayVariants = isMobile ? mobileTrayVariants : trayVariants
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
      if (isAboutMode) {
        setViewMode('about')
      } else if (isWritingMode) {
        setViewMode('writing-list')
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
  }, [articleId, loadArticle, resetContent, isWritingMode, isAboutMode, saveScrollPosition, restoreScrollPosition])

  // ============================================================================
  // DRAG-TO-DISMISS HANDLERS (MOBILE ONLY)
  // ============================================================================
  
  /**
   * Tracks the initial touch Y position to determine if drag started in top 20%.
   */
  const dragStartYRef = useRef<number | null>(null)
  
  /**
   * Handles drag start - resets drag position and tracks initial touch position.
   */
  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (!isMobile) return
    setDragY(0)
    
    // Get initial touch Y position
    let clientY = 0
    if (event instanceof TouchEvent && event.touches.length > 0) {
      clientY = event.touches[0].clientY
    } else if (event instanceof MouseEvent || event instanceof PointerEvent) {
      clientY = event.clientY
    }
    
    dragStartYRef.current = clientY
  }
  
  /**
   * Checks if drag started in the top 20% of the modal.
   */
  const isDragInTopArea = (): boolean => {
    if (!dragStartYRef.current) return false
    
    const modalTop = 0 // Modal starts at top of viewport
    const modalHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
    const top20Percent = modalHeight * 0.2
    const dragStartY = dragStartYRef.current
    
    // Check if drag started within top 20% of viewport
    return dragStartY <= (modalTop + top20Percent)
  }
  
  /**
   * Handles drag event - updates drag position for visual feedback.
   * Only allows downward dragging (positive Y values) if drag started in top 20%.
   */
  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    if (!isMobile) return
    
    // Only allow drag if started in top 20% of modal
    if (!isDragInTopArea()) {
      setDragY(0)
      return
    }
    
    // Only track downward drags (positive Y)
    if (info.offset.y > 0) {
      setDragY(info.offset.y)
    }
  }
  
  /**
   * Handles drag end - determines if tray should close based on threshold and velocity.
   * 
   * CLOSING CONDITIONS:
   * - Dragged down more than 30% of viewport height (or 150px minimum)
   * - OR dragged with sufficient velocity downward (> 500px/s)
   * 
   * If threshold not met, tray snaps back to original position.
   * Only processes if drag started in top 20% of modal.
   */
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    if (!isMobile) return
    
    // Only process if drag started in top 20%
    if (!isDragInTopArea()) {
      setDragY(0)
      dragStartYRef.current = null
      return
    }
    
    const viewportHeight = window.innerHeight
    const threshold = Math.max(viewportHeight * 0.2, 120) // 20% of viewport or 120px — iOS-like shorter commit distance
    const velocityThreshold = 300 // px/s — respond faster to flick gestures
    
    // Close if dragged beyond threshold OR if velocity is high enough
    if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
      onClose()
    }
    
    // Reset drag position
    setDragY(0)
    dragStartYRef.current = null
  }

  // ============================================================================
  // SCROLL-TO-DISMISS DETECTION (MOBILE ONLY)
  // ============================================================================
  
  /**
   * Handles scroll-to-dismiss: converts scroll gestures at top of content into drag gestures.
   * 
   * When content is scrolled to top (scrollTop === 0) and user tries to scroll down,
   * immediately converts the scroll gesture into drag-to-dismiss animation.
   * 
   * Works with both wheel events (desktop trackpad) and touchmove events (mobile).
   */
  useEffect(() => {
    // Calculate values here to avoid dependency on variables declared later
    const shouldShow = isWritingMode || articleId !== null
    const showWritingList = isWritingMode && articleId === null
    
    if (!isMobile || !shouldShow) return
    
    const contentRef = showWritingList ? writingListContentRef : mainContentRef
    const contentEl = contentRef.current
    if (!contentEl) return
    
    let scrollStartY = 0
    let accumulatedDragY = 0
    
    /**
     * Handles wheel events (trackpad/mouse wheel).
     * Detects scroll down attempts when at top of content.
     */
    const handleWheel = (e: WheelEvent) => {
      if (isScrollDismissingRef.current) {
        e.preventDefault()
        // Continue accumulating drag
        const delta = Math.min(e.deltaY, 50)
        accumulatedDragY = Math.min(accumulatedDragY + delta, window.innerHeight * 0.5)
        setDragY(accumulatedDragY)
        return
      }

      // Only trigger if content is at top and scrolling down
      if (contentEl.scrollTop === 0 && e.deltaY > 0) {
        e.preventDefault()
        isScrollDismissingRef.current = true
        accumulatedDragY = Math.min(e.deltaY, 50)
        setDragY(accumulatedDragY)
      } else if (contentEl.scrollTop > 0) {
        // If content is scrolled, allow normal scrolling
        isScrollDismissingRef.current = false
        accumulatedDragY = 0
        setDragY(0)
      }
    }
    
    /**
     * Handles touch start - tracks initial touch position.
     */
    const handleTouchStart = (e: TouchEvent) => {
      if (contentEl.scrollTop === 0) {
        scrollStartY = e.touches[0].clientY
        lastTouchYRef.current = scrollStartY
        accumulatedDragY = 0
      } else {
        lastTouchYRef.current = null
      }
    }
    
    /**
     * Handles touch move - detects scroll down attempts when at top.
     */
    const handleTouchMove = (e: TouchEvent) => {
      if (!lastTouchYRef.current) return

      const currentY = e.touches[0].clientY
      const deltaY = currentY - lastTouchYRef.current

      // Only trigger if content is at top and moving down
      if (contentEl.scrollTop === 0 && deltaY > 0) {
        e.preventDefault()
        isScrollDismissingRef.current = true
        accumulatedDragY = Math.min(accumulatedDragY + deltaY, window.innerHeight * 0.5)
        setDragY(accumulatedDragY)
        lastTouchYRef.current = currentY
      } else if (contentEl.scrollTop > 0) {
        // If content is scrolled, allow normal scrolling
        isScrollDismissingRef.current = false
        accumulatedDragY = 0
        setDragY(0)
        lastTouchYRef.current = null
      } else if (deltaY < 0) {
        // Scrolling up at top - don't trigger dismiss
        isScrollDismissingRef.current = false
        accumulatedDragY = 0
        setDragY(0)
        lastTouchYRef.current = currentY
      }
    }
    
    /**
     * Handles touch end - determines if should close based on accumulated dragY.
     */
    const handleTouchEnd = () => {
      if (isScrollDismissingRef.current && accumulatedDragY > 0) {
        // Use same threshold logic as drag-to-dismiss
        const viewportHeight = window.innerHeight
        const threshold = Math.max(viewportHeight * 0.2, 120)

        if (accumulatedDragY > threshold) {
          onClose()
        } else {
          // Snap back
          setDragY(0)
        }
      }

      isScrollDismissingRef.current = false
      accumulatedDragY = 0
      lastTouchYRef.current = null
    }

    // Add event listeners
    contentEl.addEventListener('wheel', handleWheel, { passive: false })
    contentEl.addEventListener('touchstart', handleTouchStart, { passive: true })
    contentEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    contentEl.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      contentEl.removeEventListener('wheel', handleWheel)
      contentEl.removeEventListener('touchstart', handleTouchStart)
      contentEl.removeEventListener('touchmove', handleTouchMove)
      contentEl.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, isWritingMode, articleId, onClose]) // Removed isScrollDismissing - now using ref

  // ============================================================================
  // BODY SCROLL LOCK
  // ============================================================================

  /**
   * Locks body scroll when tray is open.
   * Prevents background page from scrolling while tray content remains scrollable.
   */
  useEffect(() => {
    const shouldShow = isWritingMode || articleId !== null
    if (!shouldShow) return

    // Store scroll position before locking
    const scrollY = window.scrollY

    // Lock body scroll - simpler approach that doesn't cause jumps
    document.body.style.overflow = 'hidden'

    return () => {
      // Restore scroll
      document.body.style.overflow = ''
    }
  }, [isWritingMode, articleId])

  // ============================================================================
  // PULL-TO-REFRESH PREVENTION
  // ============================================================================

  /**
   * Prevents browser pull-to-refresh when modal is open.
   *
   * Adds CSS and JS prevention to body/document to disable pull-to-refresh
   * behavior that could interfere with drag-to-dismiss.
   */
  useEffect(() => {
    // Calculate value here to avoid dependency on variable declared later
    const shouldShow = isWritingMode || articleId !== null
    if (!isMobile || !shouldShow) return

    // Prevent pull-to-refresh on body
    const originalStyle = document.body.style.overscrollBehaviorY
    document.body.style.overscrollBehaviorY = 'none'

    // Prevent default touchmove when at top of page
    const preventPullToRefresh = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY > 0) {
        // Only prevent if we're at the top and trying to scroll down
        const touch = e.touches[0]
        const startY = touch.clientY

        // Check if this is a pull-to-refresh gesture (starting near top)
        if (startY < 100) {
          e.preventDefault()
        }
      }
    }

    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

    return () => {
      document.body.style.overscrollBehaviorY = originalStyle
      document.removeEventListener('touchmove', preventPullToRefresh)
    }
  }, [isMobile, isWritingMode, articleId])

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

  // Legacy conditions kept for reference (no longer used for tray rendering)
  // Tray stays mounted, viewMode controls content switching
  const showWritingListTray = isWritingMode && articleId === null
  const showWritingArticleTray = isWritingMode && articleId !== null
  const showNormalTray = !isWritingMode && articleId !== null
  
  // Calculate blur intensity for desktop article view header buttons
  // Only applies on desktop, in article view, in writing mode
  const shouldApplyBlur = !isMobile && viewMode === 'article' && isWritingMode
  const blurValue = shouldApplyBlur ? Math.min(scrollTop / 50, 8) : 0
  const blurStyle = shouldApplyBlur && blurValue > 0 
    ? { filter: `blur(${blurValue}px)`, transition: 'filter 0.3s ease-out' }
    : { filter: 'blur(0px)', transition: 'filter 0.3s ease-out' }
  
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
              className={`fixed inset-0 transition-colors duration-200 z-40 border-0 outline-none ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-2xl'}`}
              style={{
                backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.3)' : `color-mix(in srgb, ${trayColors.bg}, transparent 60%)`,
                ...(isMobile ? { overscrollBehavior: 'none', touchAction: 'none' } : {})
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

            {/* Side tray with 3D perspective and mobile optimization */}
            {/*
            Mobile: Full-screen bottom sheet covering entire viewport
            Desktop: Right-side panel with fixed width
            */}
            <motion.div
              ref={mainTrayRef}
              key="tray"
              /* Theme matches system preference — no data-theme override */
              className={`fixed ${isMobile ? 'inset-x-0 bottom-0 rounded-t-2xl' : 'right-0 top-0 h-full w-full md:w-[500px]'} transition-colors duration-200`}
              variants={activeTrayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              // Drag-to-dismiss functionality (mobile only)
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                // Theme-aware colors matching system preference
                backgroundColor: trayColors.bg,
                color: trayColors.fg,
                ...(isMobile ? {
                  // iOS-style: sheet starts below status bar, leaving a peek of content
                  top: 'max(env(safe-area-inset-top, 0px), 10px)',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 32px rgba(0,0,0,0.12)',
                  y: dragY,
                  // Visual feedback during drag — subtle opacity fade
                  opacity: dragY > 0 ? Math.max(0.85, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.3) : 1,
                } : { transformStyle: "preserve-3d", perspective: "1200px" }),
                // Consistent z-index (no jumping with mode="wait")
                zIndex: 50,
              }}
            >
            {/* CSS variable scoping wrapper — ensures Tailwind classes (text-foreground,
                text-muted-foreground) and custom-property classes (.type-caption using
                var(--fg-muted)) resolve to system-preference colors inside the tray,
                even when the page's --theme-blend has been scroll-inverted. Uses a plain
                <div> because Framer Motion's MotionStyle does not accept CSS custom properties. */}
            <div
              className="h-full flex flex-col"
              style={{
                '--foreground': prefersDark ? '220 15% 95%' : '220 15% 10%',
                '--muted-foreground': prefersDark ? '220 10% 70%' : '220 10% 35%',
                '--border': prefersDark ? '220 12% 18%' : '220 12% 86%',
                '--fg': prefersDark ? 'hsl(220 15% 95%)' : 'hsl(220 15% 10%)',
                '--fg-muted': prefersDark ? 'hsl(220 10% 70%)' : 'hsl(220 10% 35%)',
                '--border-color': prefersDark ? 'hsl(220 12% 18%)' : 'hsl(220 12% 86%)',
              } as React.CSSProperties}
            >
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
                    <div
                      className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-12 pb-8' : 'px-8 pt-16 pb-8'} flex flex-col`}
                      style={isMobile ? { paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))', overscrollBehavior: 'none', touchAction: 'pan-y' as const } : {}}
                    >
                      <div className="flex flex-col min-h-full justify-between">
                        <div className="space-y-6">
                          <p className="text-sm text-foreground leading-relaxed transition-colors duration-200 font-medium">
                            Hello, I am Raf. AI Designer and design engineer. I&apos;ve been shipping code since before the tooling made it easy.
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                              I care about systems that feel fast, logical, and respectful of attention.
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                              Grew up on the Amalfi Coast. Based in Toronto, moving to London in 2026.
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                              I{" "}
                              {onSwitchToWriting ? (
                                <span className={`cursor-pointer select-none ${SUBTLE_UNDERLINE_CLASSES}`} style={{ WebkitTapHighlightColor: "transparent" }}>write</span>
                              ) : (
                                "write"
                              )}
                              , photograph, and spend time on a yoga mat or chasing light through workspaces.
                            </p>
                          </div>
                          <p className="text-2xs font-[family-name:var(--font-mono)] leading-relaxed opacity-60 transition-colors duration-200 pt-2">
                            Currently in {city}{temperature ? ` where it's ${temperature}${description ? ` and ${description}` : ""}` : ""}.
                          </p>
                        </div>
                        <nav className="flex flex-col gap-1 group/nav pt-2">
                          <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
                          <FooterLink href="mailto:raf@raf.works" label="Email" />
                          <FooterLink href="/cv" label="CV" />
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
                        className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-12 pb-8' : 'px-8 pt-16 pb-8'}`}
                        style={isMobile ? { paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))', overscrollBehavior: 'none', touchAction: 'pan-y' as const } : {}}
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
              {/* Mobile drag handle — iOS-style pill */}
              {isMobile && (
                <div 
                  className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: 36,
                      height: 5,
                      backgroundColor: trayColors.fgMuted,
                      opacity: dragY > 0 ? 0.4 : 0.25,
                      transition: 'opacity 0.15s ease',
                    }}
                  />
                </div>
              )}

              {/* Minimal close button - Subtle and smaller */}
              <motion.button
                onClick={onClose}
                className={`absolute ${isMobile ? 'top-5 right-5' : 'top-6 right-6'} z-10 ${isMobile ? 'p-2.5' : 'p-1.5'} group`}
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
                  className={`absolute ${isMobile ? 'top-4 left-4' : 'top-6 left-6'} z-10 p-2 group`}
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
                className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-12 pb-8' : 'px-8 pt-16 pb-8'} ${viewMode === 'about' ? 'flex flex-col' : ''}`}
                style={isMobile ? {
                  paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))',
                  overscrollBehavior: 'none',
                  touchAction: 'pan-y'
                } : {}}
              >
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
                    // About content with sophisticated transitions
                    <motion.div
                      key="about"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex flex-col h-full justify-between"
                    >
                      {/* 
                      Work Timeline - INTENTIONALLY HIDDEN
                      This timeline table has been removed from the About modal.
                      Work information is now available in the Works panel instead.
                      DO NOT UNCOMMENT - this content should never be shown.
                      */}
                      {/* 
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Full-Time</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2024–2025</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Theoriq · Founding AI Designer, Design Engineer</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2023–2024</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">CurbCutOS · Product Design Lead, Accessibility</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2022–2023</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Crypto Stealth Startup · Senior Product AI Designer, Design Lead</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2020–2021</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Artscapy · Founding AI Designer</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Contract</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2025</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Voiceflow · Senior Product AI Designer, AI Agents</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2025</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Coinbase · Senior Product AI Designer, Developer Tools</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2021–2022</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Zalando · Senior Product AI Designer, Design System</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2021</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">TravelNest · Senior Product AI Designer</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2019</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Apple Developer Academy · UX/UI Design Intern</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Studio</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2016–present</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Never Before Seen Studio · Freelance AI Designer, Design Lead</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      */}

                      {/* Text Content Section - at top */}
                      <div className="space-y-6">
                        {/* 1. Opening (primary) */}
                        <p className="text-sm text-foreground leading-relaxed transition-colors duration-200 font-medium">
                          Hello, I am Raf. AI Designer and design engineer. I&apos;ve been shipping code since before the tooling made it easy.
                        </p>

                        {/* 2–4. Body (secondary) */}
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                            I care about systems that feel fast, logical, and respectful of attention.
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                            Grew up on the Amalfi Coast. Based in Toronto, moving to London in 2026.
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                            I{" "}
                            {onSwitchToWriting ? (
                              <span
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
                              >
                                write
                              </span>
                            ) : (
                              "write"
                            )}
                            , photograph, and spend time on a yoga mat or chasing light through workspaces.
                          </p>
                        </div>

                        {/* 5. Location/weather (label style, just above links) */}
                        <p className="text-2xs font-[family-name:var(--font-mono)] leading-relaxed opacity-60 transition-colors duration-200 pt-2">
                          Currently in {city}{temperature ? ` where it's ${temperature}${description ? ` and ${description}` : ""}` : ""}.
                        </p>
                      </div>

                      {/* Contact Links Section - at bottom */}
                      <nav className="flex flex-col gap-1 group/nav pt-2">
                        <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
                        <FooterLink href="mailto:raf@raf.works" label="Email" />
                        <FooterLink href="/cv" label="CV" />
                        <FooterLink href="https://x.com/rafdotworks" label="X" external />
                      </nav>

                    </motion.div>
                  ) : viewMode === 'list' ? (
                    // Show all articles list with enhanced transitions (legacy mode, not used in writing mode)
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
                    // Article/Story content with sophisticated transitions
                    <motion.div
                      key="article"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* Story header for story content */}
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