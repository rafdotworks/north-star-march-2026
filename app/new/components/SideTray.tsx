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

import React, { useEffect, useState, useCallback, useRef, memo } from "react"
import ReactMarkdown from "react-markdown"
import matter from "gray-matter"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import FooterLink from "@/app/components/FooterLink"
import { useIsMobile } from "@/hooks/use-mobile"
import { EASING } from "@/components/animations/constants"
import { markdownComponents } from "@/app/components/markdown/markdownComponents"
import { allWritings } from "@/app/config/writingsConfig"

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
  isWritingMode?: boolean
  onArticleSelect?: (articleId: string | null) => void
}

/**
 * Parsed article content structure.
 * 
 * @interface ArticleContent
 * @property {string} title - Article title from frontmatter
 * @property {string} date - Article date from frontmatter
 * @property {string} content - Article markdown content (without frontmatter)
 */
interface ArticleContent {
  title: string
  date: string
  content: string
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
    x: 0,
    scale: 1,
    rotateY: 0,
    opacity: 0,
    transition: {
      opacity: {
        duration: 0.3,
        ease: EASING.smooth
      }
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
    scale: 0.96,
    y: 12,
    rotateX: -5,
    filter: "blur(12px)"
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: EASING.elastic,
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    rotateX: 5,
    filter: "blur(8px)",
    transition: {
      duration: 0.3,
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
function useArticleLoader() {
  const [content, setContent] = useState<ArticleContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadArticle = useCallback(async (articleId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/article/${articleId}`)

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
        content: parsed.content
      })
    } catch (err) {
      console.error("Error loading article:", err)
      setError(err instanceof Error ? err.message : "Failed to load article")
      setContent(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
function SideTray({ articleId, onClose, isWritingMode = false, onArticleSelect }: SideTrayProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  /**
   * Article loading hook - manages fetching, parsing, and state for articles.
   */
  const { content, isLoading, error, loadArticle, resetContent } = useArticleLoader()
  
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
  
  /**
   * Mobile-optimized animation variants.
   * 
   * Enhanced multi-dimensional animation for smoother, more inspiring entrance.
   * Slides up from bottom with scale, opacity, and refined spring physics.
   * 
   * ANIMATION ENHANCEMENTS:
   * - y: Slides up from 100% (off-screen bottom) to 0
   * - scale: Subtle zoom-in effect (0.96 → 1.0) for materialization
   * - opacity: Smooth fade-in (0.8 → 1.0) for elegant appearance
 * - Spring physics: Refined parameters (stiffness: 320, damping: 38) for smoother motion
 * - Exit: Keeps panel in place (y: 0, scale: 1) and only fades out opacity for elegant dismissal
 * 
 * TIMING:
 * - Entrance: ~0.5s with natural spring physics for fluid motion
 * - Exit: ~0.3s smooth fade-only (no slide) for responsive dismissal
 */
  const mobileTrayVariants = {
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
      y: 0,
      scale: 1,
      opacity: 0,
      transition: {
        opacity: {
          duration: 0.3,
          ease: EASING.smooth
        }
      }
    }
  } as const

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
    if (!articleId) {
      resetContent()
      if (isWritingMode) {
        setViewMode('writing-list')
      } else {
        setViewMode('list')
      }
      return
    }

    if (articleId === "all") {
      resetContent()
      setViewMode('list')
      return
    }

    if (articleId === "about") {
      resetContent()
      setViewMode('about')
      return
    }

    // If in writing mode and articleId is set, show the article
    if (isWritingMode) {
      setViewMode('article')
      loadArticle(articleId)
      return
    }

    // Load the specific article
    setViewMode('article')
    loadArticle(articleId)
  }, [articleId, loadArticle, resetContent, isWritingMode])

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
    const threshold = Math.max(viewportHeight * 0.3, 150) // 30% of viewport or 150px minimum
    const velocityThreshold = 500 // px/s
    
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
        const threshold = Math.max(viewportHeight * 0.3, 150)

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
  
  /**
   * Handles Escape key to close the tray.
   * 
   * Only active when tray is open (articleId is not null).
   * Removes event listener when tray closes to prevent memory leaks.
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (articleId) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [articleId, onClose])

  // ============================================================================
  // MARKDOWN RENDERING COMPONENTS
  // ============================================================================
  // 
  // Markdown components are imported from shared file.
  // @see app/components/markdown/markdownComponents.tsx

  // Determine if we should show the tray
  // Show tray if: writing mode (always show), or articleId is set (normal mode)
  const shouldShowTray = isWritingMode || articleId !== null
  
  // For writing mode: show list tray when no article selected, show article tray when article selected
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
      {/* Writing list tray (first tray when in writing mode) */}
      <AnimatePresence>
        {showWritingListTray && (
          <>
            {/* Backdrop */}
            <motion.div
              ref={writingListBackdropRef}
              key="writing-list-backdrop"
              className={`fixed inset-0 transition-colors duration-200 z-40 border-0 outline-none ${isMobile ? 'bg-background/95 backdrop-blur-sm' : 'bg-background/50 backdrop-blur-md'}`}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
              style={isMobile ? {
                overscrollBehavior: 'none',
                touchAction: 'none'
              } : {}}
              onAnimationStart={(definition) => {
                // Disable pointer events when exit animation starts
                // This allows hover events to work immediately after closing
                if (definition === 'exit' && writingListBackdropRef.current) {
                  writingListBackdropRef.current.style.pointerEvents = 'none'
                }
              }}
            />

            {/* Writing list tray */}
            {/* 
            Mobile: Full-screen bottom sheet covering entire viewport
            Desktop: Right-side panel with fixed width
            */}
            <motion.div
              ref={writingListTrayRef}
              key="writing-list-tray"
              className={`fixed ${isMobile ? 'inset-0 rounded-t-3xl' : 'right-0 top-0 h-full w-full md:w-[500px]'} ${isMobile ? 'backdrop-blur-xl backdrop-saturate-150 bg-background/100 border-t border-border/20' : 'bg-background'} transition-colors duration-200 z-50`}
              variants={activeTrayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              // Drag-to-dismiss functionality (mobile only)
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={isMobile ? {
                // Cover full viewport including safe areas
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: '100dvh',
                minHeight: '100dvh',
                maxHeight: '100dvh',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                y: dragY,
                // Visual feedback during drag
                opacity: dragY > 0 ? Math.max(0.7, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.5) : 1,
                scale: dragY > 0 ? Math.max(0.95, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.1) : 1,
              } : { transformStyle: "preserve-3d", perspective: "1200px" }}
            >
              <motion.div
                className="h-full flex flex-col"
                variants={shouldReduceMotion ? undefined : activeContentVariants}
                initial={shouldReduceMotion ? undefined : "hidden"}
                animate={shouldReduceMotion ? undefined : "visible"}
              >
                {/* Mobile drag handle */}
                {isMobile && (
                  <motion.div 
                    className="flex justify-center py-3 pt-4 pb-2 cursor-grab active:cursor-grabbing"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    animate={{
                      scale: dragY > 0 ? 1.1 : 1,
                      opacity: dragY > 0 ? 0.6 : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: EASING.smooth
                    }}
                  >
                    <motion.div 
                      className="w-12 h-1.5 rounded-full bg-muted transition-colors duration-200"
                      animate={{
                        backgroundColor: dragY > 0 
                          ? 'hsl(var(--muted-foreground))' 
                          : 'hsl(var(--muted))',
                        width: dragY > 0 ? 48 : 48,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: EASING.smooth
                      }}
                    />
                  </motion.div>
                )}

                {/* Close button - Subtle and smaller */}
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
                    color: 'hsl(var(--muted-foreground))',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    opacity: 0.6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                    e.currentTarget.style.opacity = '0.6'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                    e.currentTarget.style.opacity = '0.6'
                  }}
                >
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

                {/* Content */}
                <div
                  ref={writingListContentRef}
                  className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-14 pb-8' : 'px-8 pt-16 pb-8'}`}
                  style={isMobile ? {
                    paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))',
                    overscrollBehavior: 'none',
                    touchAction: 'pan-y'
                  } : {}}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="writing-list"
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
                              if (onArticleSelect) {
                                onArticleSelect(article.id)
                              }
                            }}
                            className="cursor-pointer space-y-1 transition-opacity duration-200"
                            whileHover={{ x: 4, opacity: 1 }}
                            transition={{ duration: 0.2, ease: EASING.smooth }}
                          >
                            <p className={`text-xs transition-colors duration-200 ${i < 2 ? 'text-foreground' : 'text-muted-foreground md:group-hover/writings:text-muted-foreground/60 md:hover:!text-foreground'}`}>{article.title}</p>
                            <p className="text-xs text-muted-foreground transition-colors duration-200">{article.date}</p>
                          </motion.div>
                          {i === 1 && (
                            <div className="pt-1 pb-1">
                              <hr className="border-border/30 transition-colors duration-200" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Writing article tray (nested tray when article selected) or normal tray */}
      <AnimatePresence>
        {(showWritingArticleTray || showNormalTray) && (
          <>
            {/* Backdrop - always show to enable click-outside-to-close */}
            <motion.div
              ref={mainBackdropRef}
              key="backdrop"
              className={`fixed inset-0 transition-colors duration-200 z-40 border-0 outline-none ${isMobile ? 'bg-background/95 backdrop-blur-sm' : 'bg-background/50 backdrop-blur-md'}`}
              style={isMobile ? {
                overscrollBehavior: 'none',
                touchAction: 'none'
              } : {}}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
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
              className={`fixed ${isMobile ? 'inset-0 rounded-t-3xl' : 'right-0 top-0 h-full w-full md:w-[500px]'} ${isMobile ? 'backdrop-blur-xl backdrop-saturate-150 bg-background/100 border-t border-border/20' : 'bg-background'} transition-colors duration-200`}
              variants={activeTrayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              // Drag-to-dismiss functionality (mobile only)
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                ...(isMobile ? {
                  // Cover full viewport including safe areas
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '100dvh',
                  minHeight: '100dvh',
                  maxHeight: '100dvh',
                  paddingTop: 'env(safe-area-inset-top, 0px)',
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  y: dragY,
                  // Visual feedback during drag
                  opacity: dragY > 0 ? Math.max(0.7, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.5) : 1,
                  scale: dragY > 0 ? Math.max(0.95, 1 - (dragY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 0.1) : 1,
                } : { transformStyle: "preserve-3d", perspective: "1200px" }),
                // Higher z-index for nested writing tray
                zIndex: isNestedWritingTray ? 60 : 50,
              }}
            >
            <motion.div
              className="h-full flex flex-col"
              variants={shouldReduceMotion ? undefined : activeContentVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
            >
              {/* Mobile drag handle */}
              {isMobile && (
                <motion.div 
                  className="flex justify-center py-3 pt-4 pb-2 cursor-grab active:cursor-grabbing"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  animate={{
                    scale: dragY > 0 ? 1.1 : 1,
                    opacity: dragY > 0 ? 0.6 : 1,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: EASING.smooth
                  }}
                >
                  <motion.div 
                    className="w-12 h-1.5 rounded-full bg-muted transition-colors duration-200"
                    animate={{
                      backgroundColor: dragY > 0 
                        ? 'hsl(var(--muted-foreground))' 
                        : 'hsl(var(--muted))',
                      width: dragY > 0 ? 48 : 48,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: EASING.smooth
                    }}
                  />
                </motion.div>
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
                  color: 'hsl(var(--muted-foreground))',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  opacity: 0.6,
                  ...blurStyle
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                    e.currentTarget.style.opacity = '0.6'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
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

              {/* Back button for article view */}
              {viewMode === 'article' && articleId !== "all" && (
                <motion.button
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
                  transition={{ duration: 0.3, ease: EASING.gentle }}
                  aria-label="Back to list"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'hsl(var(--muted-foreground))',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    ...blurStyle
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
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
                className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-14 pb-8' : 'px-8 pt-16 pb-8'} ${viewMode === 'about' ? 'flex flex-col' : ''}`}
                style={isMobile ? {
                  paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))',
                  overscrollBehavior: 'none',
                  touchAction: 'pan-y'
                } : {}}
              >
                <AnimatePresence mode="wait">
                  {viewMode === 'writing-list' ? (
                    // Writing list view
                    <motion.div
                      key="writing-list"
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
                              if (onArticleSelect) {
                                onArticleSelect(article.id)
                              }
                            }}
                            className="cursor-pointer space-y-1 transition-opacity duration-200"
                            whileHover={{ x: 4, opacity: 1 }}
                            transition={{ duration: 0.2, ease: EASING.smooth }}
                          >
                            <p className={`text-xs transition-colors duration-200 ${i < 2 ? 'text-foreground' : 'text-muted-foreground md:group-hover/writings:text-muted-foreground/60 md:hover:!text-foreground'}`}>{article.title}</p>
                            <p className="text-xs text-muted-foreground transition-colors duration-200">{article.date}</p>
                          </motion.div>
                          {i === 1 && (
                            <div className="pt-1 pb-1">
                              <hr className="border-border/30 transition-colors duration-200" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
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
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Theoriq · Founding Product Designer</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2023–2024</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">CurbCutOS · Product Design Lead, Accessibility</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2022–2023</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Crypto Stealth Startup · Senior Product Designer, Design Lead</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2020–2021</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Artscapy · Founding Designer</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider transition-colors duration-200">Contract</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2025</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Voiceflow · Senior Product Designer, AI Agents</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2025</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Coinbase · Senior Product Designer, Developer Tools</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2021–2022</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Zalando · Senior Product Designer, Design System</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs text-muted-foreground/70 font-light tabular-nums transition-colors duration-200">2021</span>
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">TravelNest · Senior Product Designer</p>
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
                              <p className="text-xs text-muted-foreground transition-colors duration-200 text-right">Never Before Seen Studio · Freelance Designer, Design Lead</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      */}

                      {/* Text Content Section - at top */}
                      <div className="space-y-6">
                        {/* Opening */}
                        <div className="space-y-2">
                        <p className="text-xs leading-relaxed transition-colors duration-200">
                        <span className="text-foreground">Hello, I&apos;m Raf. I am designing AI softwares across early stage teams and enterprise retail. </span>
                        <span className="text-muted-foreground">I&apos;ve spent almost a decade designing across startups and large organizations.</span>
                        </p>
                        </div>

                           {/* Today */}
                           <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                           I care about contributing to products, systems and experiences that feel fast, logical and emotionally considered, especially in domains where clarity directly shapes performance and impact.
                           </p>
                        {/* <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
Before that, I contributed and shipped design systems, developer tools, and product design foundations across teams like Theoriq, Coinbase, Zalando, Voiceflow and more.
                        </p> */}

                         

                

                        {/* Location */}
                        <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                        I grew up on the Amalfi Coast in Italy. I&apos;m based in Toronto, often in Lisbon and New York. You&apos;ll usually find me on a yoga mat, on a bike, or chasing light through quiet spaces.
                        </p>

                        {/* Principles */}
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground transition-colors duration-200">— How you do anything is how you do everything</p>
                          <p className="text-xs text-muted-foreground transition-colors duration-200">— Always happy, never satisfied</p>
                          <p className="text-xs text-muted-foreground transition-colors duration-200">— Progress over movement</p>
                        </div>
                      </div>

                      {/* Contact Links Section - at bottom */}
                      <nav className="flex flex-col gap-1 group/nav pt-2">
                        <FooterLink href="https://linkedin.com/in/raffaelevitaledesign" label="LinkedIn" external />
                        <FooterLink href="mailto:raf@raf.works" label="Email" />
                        <FooterLink href="/cv" label="CV" />
                        <FooterLink href="https://x.com/lfgraf" label="X" external />
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
                            <p className={`text-xs transition-colors duration-200 ${i < 2 ? 'text-foreground' : 'text-muted-foreground md:group-hover/writings:text-muted-foreground/60 md:hover:!text-foreground'}`}>{article.title}</p>
                            <p className="text-xs text-muted-foreground transition-colors duration-200">{article.date}</p>
                          </motion.div>
                          {i === 1 && (
                            <div className="pt-1 pb-1">
                              <hr className="border-border/30 transition-colors duration-200" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </motion.div>
                  ) : error ? (
                    // Error state
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-8"
                    >
                      <p className="text-xs text-muted-foreground mb-2 transition-colors duration-200">Unable to load this article</p>
                      <p className="text-xs text-muted-foreground transition-colors duration-200">{error}</p>
                      <motion.button
                        onClick={() => articleId && loadArticle(articleId)}
                        className="mt-4 text-xs text-primary hover:text-foreground transition-colors duration-200 underline"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try again
                      </motion.button>
                    </motion.div>
                  ) : content ? (
                    // Article content with sophisticated transitions
                    <motion.div
                      key="article"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-6"
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {content.content}
                      </ReactMarkdown>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  )
}

// Memoize to prevent re-renders when parent state changes
export default memo(SideTray)