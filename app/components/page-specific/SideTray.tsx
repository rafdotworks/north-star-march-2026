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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Sheet from "react-modal-sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { useLocationWeather } from "@/hooks/use-timezone-message"
import { EASING } from "@/components/animations/constants"
import { allWritings } from "@/app/config/writingsConfig"
import AboutTrayBiography from "@/app/components/page-specific/side-tray/AboutTrayBiography"
import { ArticleErrorView, ArticleView } from "@/app/components/page-specific/side-tray/ArticleView"
import {
  backdropVariants,
  closeButtonVariants,
  contentVariants,
  listItemVariants,
  mobileListItemVariants,
  mobileStackBackVariants,
  mobileStackFrontVariants,
  MOBILE_STACK_DURATION,
  MOBILE_SHEET_SNAP_POINTS,
  MOBILE_SHEET_TWEEN,
  trayVariants,
  viewTransitionVariants,
} from "@/app/components/page-specific/side-tray/animations"
import PhotosView from "@/app/components/page-specific/side-tray/PhotosView"
import type { SideTrayProps, ViewModeType } from "@/app/components/page-specific/side-tray/types"
import { useArticleLoader } from "@/app/components/page-specific/side-tray/useArticleLoader"
import WritingListView from "@/app/components/page-specific/side-tray/WritingListView"

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
  const [viewMode, setViewMode] = useState<ViewModeType>('list')
  
  /**
   * Accessibility: Respects user's motion preference.
   * When true, animations are simplified or disabled.
   */
  const shouldReduceMotion = useReducedMotion() ?? false
  
  /**
   * Responsive: Detects if user is on mobile device.
   * Used to switch between mobile (bottom sheet) and desktop (side panel) layouts.
  */
  const isMobile = useIsMobile()
  const initialMobileSnapIndex = isAboutMode && !isWritingMode && !isPhotosMode ? 1 : 0

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
   * Scrollable desktop content container.
   * Used for scroll position preservation and header blur state.
   */
  const mainContentRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll position for desktop article view blur effect.
   * Tracks scrollTop of mainContentRef to apply blur to header buttons.
   * Only used on desktop when viewing a writing article.
   */
  const [scrollTop, setScrollTop] = useState(0)

  /**
   * Ref for react-modal-sheet imperative API (mobile only).
   * Allows programmatic snapping to the large detent when content needs more room.
   */
  const sheetRef = useRef<React.ComponentRef<typeof Sheet>>(null)

  /**
   * Current snap point index (0 = large detent, 1 = medium detent, 2 = dismissed).
   * Tracked both imperatively and reactively so mobile content ownership can switch
   * between sheet drag and inner scrolling without waiting on DOM inspection.
   */
  const currentSnapIndexRef = useRef<number>(initialMobileSnapIndex)
  const lastOpenMobileSnapIndexRef = useRef<number>(initialMobileSnapIndex)
  const dismissedMobileSnapIndex = MOBILE_SHEET_SNAP_POINTS.length - 1
  const [mobileSnapIndex, setMobileSnapIndex] = useState<number | null>(null)
  const resolvedMobileSnapIndex = mobileSnapIndex ?? initialMobileSnapIndex
  const isMobileFullyExpanded = !isMobile || resolvedMobileSnapIndex === 0
  const mobileSingleSheetScrollRef = useRef<HTMLDivElement>(null)
  const mobileStackFrontScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollPositionsRef = useRef<{ [key: string]: number }>({})

  /**
   * Pointer start position for interactive row taps.
   * We keep article taps reliable without blocking the sheet scroller's touch state.
   */
  const pointerStartPosRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  /** More forgiving than 15px so slight scroll or movement still registers as tap. */
  const TAP_MOVE_THRESHOLD_PX = 24
  /** Guard so pointer taps and click fallback don't both fire onArticleSelect for the same tap. */
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
  const getActiveMobileScrollKey = useCallback(() => (
    isMobileStacked
      ? `${mobileStackFrontViewMode}-${articleId ?? 'null'}`
      : `${viewMode}-${articleId ?? 'null'}`
  ), [isMobileStacked, mobileStackFrontViewMode, viewMode, articleId])

  const syncActiveMobileScrollPosition = useCallback((scrollTop: number, key = getActiveMobileScrollKey()) => {
    mobileScrollPositionsRef.current[key] = scrollTop
  }, [getActiveMobileScrollKey])

  const restoreActiveMobileScrollPosition = useCallback((
    element: HTMLDivElement | null,
    key = getActiveMobileScrollKey()
  ) => {
    if (!element) return

    const savedScrollTop = mobileScrollPositionsRef.current[key]
    if (savedScrollTop === undefined) return

    requestAnimationFrame(() => {
      element.scrollTop = savedScrollTop
    })
  }, [getActiveMobileScrollKey])

  const handleActiveMobileScrollCapture = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    syncActiveMobileScrollPosition(event.currentTarget.scrollTop)
  }, [syncActiveMobileScrollPosition])

  const restoreMobileSheetToLastOpenSnap = useCallback(() => {
    if (!isMobile) return

    const nextSnapIndex = lastOpenMobileSnapIndexRef.current
    currentSnapIndexRef.current = nextSnapIndex
    setMobileSnapIndex(nextSnapIndex)

    requestAnimationFrame(() => {
      sheetRef.current?.snapTo(nextSnapIndex)
    })
  }, [isMobile])

  const handleMobileSheetDismiss = useCallback(() => {
    if (isMobile && isMobileStacked) {
      if (mobileStackFrontViewMode === "article" && onArticleSelect) {
        restoreMobileSheetToLastOpenSnap()
        onArticleSelect(null)
        return
      }

      if (mobileStackFrontViewMode === "writing-list" && onCloseWritingOnly) {
        restoreMobileSheetToLastOpenSnap()
        onCloseWritingOnly()
        return
      }

      if (mobileStackFrontViewMode === "photos" && onClosePhotosOnly) {
        restoreMobileSheetToLastOpenSnap()
        onClosePhotosOnly()
        return
      }
    }

    onClose()
  }, [
    isMobile,
    isMobileStacked,
    mobileStackFrontViewMode,
    onArticleSelect,
    onCloseWritingOnly,
    onClosePhotosOnly,
    onClose,
    restoreMobileSheetToLastOpenSnap,
  ])

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
    if (mainContentRef.current) {
      const viewKey = `${viewMode}-${articleId || 'null'}`
      scrollPositionRef.current[viewKey] = mainContentRef.current.scrollTop
    }
  }, [viewMode, articleId])

  /**
   * Restore scroll position after view changes.
   * Retrieves and applies scroll position from ref for target view.
   */
  const restoreScrollPosition = useCallback(() => {
    const viewKey = `${viewMode}-${articleId || 'null'}`

    if (mainContentRef.current && scrollPositionRef.current[viewKey] !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = scrollPositionRef.current[viewKey]
        }
      })
    }
  }, [viewMode, articleId])

  /**
   * Single handler for article tap so pointer taps and click fallback don't both fire.
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

  const handleInteractivePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      pointerStartPosRef.current = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
      }
      return
    }

    event.stopPropagation()
    pointerStartPosRef.current = null
  }, [])

  const clearInteractivePointer = useCallback(() => {
    pointerStartPosRef.current = null
  }, [])

  const handleInteractiveArticlePointerUp = useCallback((
    event: React.PointerEvent<HTMLElement>,
    articleId: string
  ) => {
    const start = pointerStartPosRef.current
    pointerStartPosRef.current = null

    if (!start || start.pointerId !== event.pointerId) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y

    if (dx * dx + dy * dy < TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
      handleArticleTap(articleId)
    }
  }, [handleArticleTap])

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
  // MOBILE SHEET: SNAP TO LARGE DETENT ON ARTICLE SELECT
  // ============================================================================

  /**
   * When an article is selected on mobile, snap the sheet to the large detent immediately
   * so the sheet expansion and content change feel like one action.
   */
  useEffect(() => {
    if (!isMobile || !articleId || articleId === 'about') return
    sheetRef.current?.snapTo(0)
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
  // Show tray if: writing mode, photos mode, about mode (always show), or articleId is set (normal mode)
  const shouldShowTray = isWritingMode || isPhotosMode || isAboutMode || articleId !== null

  useEffect(() => {
    if (!isMobile || !shouldShowTray) {
      currentSnapIndexRef.current = initialMobileSnapIndex
      lastOpenMobileSnapIndexRef.current = initialMobileSnapIndex
      setMobileSnapIndex(null)
    }
  }, [initialMobileSnapIndex, isMobile, shouldShowTray])

  useEffect(() => {
    if (!isMobile || !shouldShowTray || !isMobileFullyExpanded) return

    const activeScrollElement = isMobileStacked
      ? mobileStackFrontScrollRef.current
      : mobileSingleSheetScrollRef.current

    restoreActiveMobileScrollPosition(activeScrollElement)
  }, [
    isMobile,
    shouldShowTray,
    isMobileFullyExpanded,
    isMobileStacked,
    mobileStackFrontViewMode,
    viewMode,
    articleId,
    restoreActiveMobileScrollPosition,
  ])

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
  const renderViewContent = (displayMode?: ViewModeType) => {
    const mode = displayMode ?? viewMode
    return (
      <AnimatePresence mode="wait">
        {mode === "writing-list" ? (
          <WritingListView
            isMobile={isMobile}
            trayColors={trayColors}
            transitionVariants={activeViewTransitionVariants}
            activeListItemVariants={activeListItemVariants}
            personalNotesExpanded={personalNotesExpanded}
            onTogglePersonalNotes={() => setPersonalNotesExpanded((expanded) => !expanded)}
            onArticleTap={handleArticleTap}
            onPointerDown={handleInteractivePointerDown}
            onPointerCancel={clearInteractivePointer}
            onArticlePointerUp={handleInteractiveArticlePointerUp}
          />
      ) : mode === "photos" ? (
        <motion.div
          key="photos"
          variants={activeViewTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <PhotosView trayColors={trayColors} shouldReduceMotion={shouldReduceMotion} flushMobileEdges={isMobile} />
        </motion.div>
      ) : mode === "about" ? (
        // About content — COMPACT / modal typography: 16 → 14 → 12 (lead → body → caption)
        <motion.div
          key="about"
          variants={activeViewTransitionVariants}
          initial={skipAboutEntrance ? false : "initial"}
          animate="animate"
          exit="exit"
          className="flex h-full flex-col"
        >
          {/* Text content — editorial hierarchy with a single anchored ambient footer */}
          <AboutTrayBiography
            isMobile={isMobile}
            onSwitchToWriting={onSwitchToWriting}
            onSwitchToPhotograph={onSwitchToPhotograph}
            city={city}
            temperature={temperature}
            description={description}
          />
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
        <ArticleErrorView
          error={error}
          onRetry={() => {
            if (articleId) {
              void loadArticle(articleId)
            }
          }}
          trayColors={trayColors}
        />
      ) : content ? (
        <ArticleView
          content={content}
          apiBasePath={apiBasePath}
          isMobile={isMobile}
          transitionVariants={activeViewTransitionVariants}
        />
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
        onClose={handleMobileSheetDismiss}
        snapPoints={[...MOBILE_SHEET_SNAP_POINTS]}
        initialSnap={initialMobileSnapIndex}
        onSnap={(index) => {
          currentSnapIndexRef.current = index
          if (index !== dismissedMobileSnapIndex) {
            lastOpenMobileSnapIndexRef.current = index
          }
          setMobileSnapIndex(index)
        }}
        tweenConfig={MOBILE_SHEET_TWEEN}
        prefersReducedMotion={!!shouldReduceMotion}
      >
        <Sheet.Container
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${trayColors.bg} 97%, white 3%) 0%, ${trayColors.bg} 22%, ${trayColors.bg} 100%)`,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            boxShadow: '0 -8px 24px rgba(15,23,42,0.08), 0 -22px 64px rgba(15,23,42,0.18)',
            overflow: 'hidden',
          }}
        >
          <Sheet.Header
            style={{
              paddingTop: "max(0.3rem, calc(env(safe-area-inset-top, 0px) * 0.12))",
            }}
          >
            <div className="pointer-events-none flex w-full justify-center px-5 pb-2 pt-3">
              <div
                className="h-1.5 w-10 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${trayColors.fg} 18%, white 62%)`,
                  boxShadow: "0 1px 0 rgba(255,255,255,0.38) inset, 0 0 0 1px rgba(255,255,255,0.08)",
                  opacity: 0.96,
                }}
              />
            </div>
          </Sheet.Header>

          {/* Back button for article detail only. Nested writing/photos sheets intentionally omit the chevron. */}
          {((isMobileStacked && mobileStackFrontViewMode === "article") ||
            (!isMobileStacked && viewMode === "article" && articleId !== "all" && isWritingMode)) && (
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
              className="absolute left-4 top-4 z-20 p-2 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
              whileHover={{ scale: 1.02, x: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASING.gentle }}
              aria-label="Back to list"
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

          {isMobileStacked && (
            (mobileStackFrontViewMode === "writing-list" && onCloseWritingOnly) ||
            (mobileStackFrontViewMode === "photos" && onClosePhotosOnly)
          ) && (
            <motion.button
              initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
              animate={{ opacity: 0.6, x: 0, filter: "blur(0px)" }}
              onClick={handleMobileSheetDismiss}
              className="absolute right-4 top-4 z-20 p-1.5 group focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.35, ease: EASING.gentle }}
              aria-label={mobileStackFrontViewMode === "photos" ? "Close photographs" : "Close writings"}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                boxShadow: "none",
                color: trayColors.fgMuted,
                WebkitTapHighlightColor: "transparent",
                cursor: "pointer",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              >
                <path d="M18 6L6 18M6 6l12 12" />
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
                    background: `linear-gradient(180deg, color-mix(in srgb, ${trayColors.bg} 97%, white 3%) 0%, ${trayColors.bg} 22%, ${trayColors.bg} 100%)`,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    boxShadow: "0 -6px 18px rgba(15,23,42,0.08), 0 -18px 48px rgba(15,23,42,0.14)",
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
                  {isMobileFullyExpanded ? (
                    <Sheet.Scroller
                      ref={mobileStackFrontScrollRef}
                      draggableAt="both"
                      onScrollCapture={handleActiveMobileScrollCapture}
                      className="flex-1 min-h-0 px-6 pt-8 pb-8"
                    >
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
                    </Sheet.Scroller>
                  ) : (
                    <div className="flex-1 min-h-0 overflow-hidden px-6 pt-8 pb-8">
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
                  )}
                </motion.div>
              </>
            ) : (
              isMobileFullyExpanded ? (
                <Sheet.Scroller
                  ref={mobileSingleSheetScrollRef}
                  draggableAt="both"
                  onScrollCapture={handleActiveMobileScrollCapture}
                >
                  <div
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
              ) : (
                <div className="h-full overflow-hidden">
                  <div
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
                </div>
              )
            )}
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop
          onTap={handleMobileSheetDismiss}
          style={{
            backgroundColor: `color-mix(in srgb, ${trayColors.bg}, transparent 76%)`,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
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
                    x: (isWritingPanelExiting || isPhotosPanelExiting) ? 0 : -48,
                    filter: (isWritingPanelExiting || isPhotosPanelExiting) ? 'blur(0px)' : 'blur(8px)',
                    opacity: (isWritingPanelExiting || isPhotosPanelExiting) ? 1 : 0.82,
                  }}
                  transition={{ duration: 0.42, ease: EASING.smooth }}
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
                      <div className="flex min-h-full flex-col">
                        <AboutTrayBiography
                          isMobile={isMobile}
                          onSwitchToWriting={onSwitchToWriting}
                          onSwitchToPhotograph={onSwitchToPhotograph}
                          city={city}
                          temperature={temperature}
                          description={description}
                        />
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
                          <PhotosView trayColors={trayColors} shouldReduceMotion={shouldReduceMotion} />
                        ) : articleId === null ? (
                          <WritingListView
                            isMobile={isMobile}
                            trayColors={trayColors}
                            transitionVariants={activeViewTransitionVariants}
                            activeListItemVariants={activeListItemVariants}
                            personalNotesExpanded={personalNotesExpanded}
                            onTogglePersonalNotes={() => setPersonalNotesExpanded((expanded) => !expanded)}
                            onArticleTap={handleArticleTap}
                            onPointerDown={handleInteractivePointerDown}
                            onPointerCancel={clearInteractivePointer}
                            onArticlePointerUp={handleInteractiveArticlePointerUp}
                          />
                        ) : error ? (
                          <ArticleErrorView
                            error={error}
                            onRetry={() => {
                              if (articleId) {
                                void loadArticle(articleId)
                              }
                            }}
                            trayColors={trayColors}
                          />
                        ) : content ? (
                          <ArticleView
                            content={content}
                            apiBasePath={apiBasePath}
                            isMobile={isMobile}
                            transitionVariants={activeViewTransitionVariants}
                          />
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
