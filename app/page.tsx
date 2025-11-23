/**
 * ============================================================================
 * MAIN HOMEPAGE COMPONENT - app/page.tsx
 * ============================================================================
 * 
 * This is the main web page entry point for the portfolio site. It provides
 * a minimal, elegant interface for navigating between About, Works, and Writing
 * sections.
 * 
 * ARCHITECTURE:
 * - Client-side rendered component with responsive layout
 * - Mobile-first design with desktop enhancements
 * - Theme system that inverts system preference (dark by default)
 * - Three main navigation sections: About, Works, Writing
 * - SideTray component for About and Writing content
 * - WorksPanel component for portfolio showcase
 * 
 * KEY FEATURES:
 * 1. Theme Inversion: Shows opposite of system preference (defaults to dark)
 * 2. Timezone Display: Shows relative timezone difference from Toronto
 * 3. Responsive Layout: Mobile (column) vs Desktop (grid with side panels)
 * 4. Navigation Flow: State-driven content panels that slide in from sides
 * 5. Accessibility: Full keyboard navigation and ARIA labels
 * 
 * COMPONENT HIERARCHY:
 * ```
 * Page
 * ├── Main Layout (responsive grid/column)
 * │   ├── Column 1: Name & Title
 * │   ├── Column 2: Navigation Menu (About, Works, Writing)
 * │   └── Timezone Message (mobile inline, desktop absolute)
 * ├── SideTray (for About & Writing content)
 * └── WorksPanel (for portfolio showcase)
 * ```
 * 
 * STATE MANAGEMENT:
 * - selectedArticle: Controls which main section is open ("about" | "works" | "writing" | null)
 * - selectedWritingArticle: Controls which specific writing article is displayed (when in writing mode)
 * - timezoneMessage: Dynamic message showing timezone difference from Toronto
 * 
 * NAVIGATION FLOW:
 * 1. User clicks "About" → SideTray opens with about content
 * 2. User clicks "Works" → WorksPanel opens (right side, 50% width)
 * 3. User clicks "Writing" → SideTray opens in writing mode (shows list first)
 *    → User selects article → SideTray shows nested article view
 * 
 * LAYOUT HANDLING:
 * - The root layout wraps all children in mobile-gutter div
 * - This page needs edge-to-edge background, so we use negative margins
 * - Mobile-gutter adds: max(16px, calc(env(safe-area-inset-left, 0px) + 16px))
 * - We counteract with negative margins that match
 * 
 * @component
 * @returns {JSX.Element} The main page component
 * 
 * NOTE: Metadata is handled in the root layout (app/layout.tsx).
 * Client components cannot export metadata in Next.js App Router.
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import SideTray from "./new/components/SideTray"
import WorksPanel from "./new/components/WorksPanel"
import { useSystemTheme } from "@/hooks/use-system-theme"
import { useTimezoneMessage } from "@/hooks/use-timezone-message"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Type for main navigation article IDs.
 * 
 * Defines the valid values for selectedArticle state.
 * Improves type safety and autocomplete support.
 */
type ArticleId = "about" | "works" | "writing" | null

/**
 * Main page component for the portfolio entry point.
 * 
 * Handles navigation state, theme management, and timezone display.
 * Renders responsive layout with conditional side panels.
 */
export default function Page() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Dynamic timezone message showing relative difference from Toronto timezone.
   * Updates every minute to account for potential timezone changes.
   * 
   * @example "Raf is 3 hours ahead of you"
   * @example "Raf is in your timezone"
   * 
   * @see useTimezoneMessage hook for implementation details
   */
  const timezoneMessage = useTimezoneMessage()
  
  /**
   * Controls which main navigation section is currently open.
   * 
   * Values:
   * - "about" → Opens SideTray with about content
   * - "works" → Opens WorksPanel (right side panel)
   * - "writing" → Opens SideTray in writing mode (shows article list first)
   * - null → No panel open, showing main page
   * 
   * @see SideTray component for how this prop is used
   */
  const [selectedArticle, setSelectedArticle] = useState<ArticleId>(null)
  
  /**
   * Controls which specific writing article is displayed when in writing mode.
   * 
   * Only used when selectedArticle === "writing". When set, SideTray shows
   * the article content instead of the article list.
   * 
   * @see SideTray component's isWritingMode and onArticleSelect props
   */
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)
  
  /**
   * System theme preference from useSystemTheme hook.
   * - prefersDark: true if system prefers dark mode
   * - isReady: true when theme detection is complete (prevents hydration mismatch)
   */
  const { prefersDark, isReady } = useSystemTheme()

  // ============================================================================
  // THEME MANAGEMENT
  // ============================================================================
  
  /**
   * Theme logic: Matches user's system preference.
   * 
   * LOGIC:
   * - Defaults to light during SSR/initial render (before isReady)
   * - If user prefers dark → show dark (prefersDark && isReady)
   * - If user prefers light → show light (!prefersDark && isReady)
   * 
   * The isReady check prevents hydration mismatches by ensuring we only
   * apply the theme after client-side detection completes.
   * 
   * @returns {boolean} true if dark theme should be shown
   */
  const shouldShowDark = useMemo(() => {
    // Show dark theme only when system prefers dark and detection is ready
    return prefersDark && isReady
  }, [prefersDark, isReady])

  // ============================================================================
  // THEME APPLICATION TO HTML ELEMENT
  // ============================================================================
  
  /**
   * Apply theme to html element to ensure full-page background color.
   * 
   * This useEffect runs when shouldShowDark changes and applies the
   * data-theme attribute to document.documentElement (html element).
   * This ensures the entire page (html/body) gets the correct background
   * color, not just the main element.
   * 
   * IMPORTANT: This must run on the client side only to avoid hydration
   * mismatches. The isReady check ensures we don't apply theme before
   * client-side detection completes.
   */
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const theme = shouldShowDark ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [shouldShowDark])

  // ============================================================================
  // DERIVED STATE
  // ============================================================================
  
  /**
   * Determines if Works panel is currently open.
   * Used to adjust main layout padding on desktop (makes room for panel).
   * 
   * When Works panel is open, desktop layout reduces right padding from 8 (2rem)
   * to 50% to accommodate the half-screen panel.
   */
  const isWorksPanelOpen = selectedArticle === "works"

  // ============================================================================
  // RENDER
  // ============================================================================
  
  /**
   * MOBILE-GUTTER HANDLING:
   * The root layout wraps all children in mobile-gutter div, but we need
   * edge-to-edge background for this page. We use negative margins to
   * counteract the mobile-gutter padding.
   * 
   * Mobile-gutter adds: max(16px, calc(env(safe-area-inset-left, 0px) + 16px))
   * We counteract with negative margins that match.
   */
  return (
    <div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
      <main
        /**
         * RESPONSIVE LAYOUT STRATEGY:
         * 
         * Mobile (< md breakpoint):
         * - flex-col: Vertical stack
         * - h-screen h-[100dvh]: Exact viewport height to prevent scrolling
         * - overflow-hidden: Prevents scrolling on mobile
         * - px-8: Horizontal padding
         * 
         * Desktop (>= md breakpoint):
         * - flex-row: Horizontal layout
         * - md:items-center: Vertically center content
         * - md:pl-20: Left padding (5rem)
         * - md:pr-[50%] or md:pr-8: Right padding adjusts based on Works panel
         *   - When Works panel open: 50% (makes room for half-screen panel)
         *   - When Works panel closed: 2rem (normal padding)
         * 
         * SAFE AREA HANDLING:
         * Uses CSS env() variables for devices with notches/safe areas:
         * - paddingTop: max(safe-area-inset-top, 4rem) - ensures content isn't hidden
         * - paddingBottom: max(safe-area-inset-bottom, 2rem) - ensures content isn't hidden
         * 
         * MOBILE SCROLLING PREVENTION:
         * - h-screen h-[100dvh]: Enforces exact viewport height (no min-height)
         * - overflow-hidden md:overflow-visible: Prevents scrolling on mobile, allows on desktop
         * - Content is constrained to fit within viewport using flexbox
         */
        className={`h-screen h-[100dvh] bg-background flex flex-col md:flex-row md:items-center px-0 md:pl-20 relative md:pt-0 transition-all duration-200 overflow-hidden md:overflow-visible ${isWorksPanelOpen ? 'md:pr-[50%]' : 'md:pr-8'} w-full`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
        }}
      >
        {/* ========================================================================
           * MAIN CONTENT AREA
           * ========================================================================
           * 
           * LAYOUT STRUCTURE:
           * Mobile: Single column, stacked vertically
           * Desktop: Two-column grid with 4rem gap
           * 
           * Column 1: Name and professional title
           * Column 2: Navigation menu (About, Works, Writing)
           */}
        <div className="flex flex-col items-start flex-1 md:flex-none md:grid md:grid-cols-2 md:gap-16 w-full md:w-auto md:items-baseline md:my-0 px-8 md:px-0 min-h-0 overflow-hidden md:overflow-visible">
          {/* Column 1 - Name and Title */}
          <div className="relative flex flex-col items-start md:items-start md:relative mb-12 md:mb-0 gap-1">
            {/* 
              Name heading - positioned absolutely above title on desktop
              On mobile: Normal flow, appears first
              On desktop: Absolute positioning, appears above title
            */}
            <h1 className="text-base md:text-base font-light text-foreground tracking-wide leading-[1.5] md:absolute md:bottom-full md:mb-1 transition-colors duration-200">Raf V</h1>
            {/* Professional title - always visible */}
            <p className="text-xs md:text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">Senior AI Product Designer</p>
          </div>

          {/* Column 2 - Navigation Menu */}
          <div className="flex justify-start md:block mb-12 md:mb-0">
            {/* 
              Navigation menu with hover effects
              group/menu: Enables group hover for all menu items
              Each item has individual hover states that work with group hover
            */}
            <div className="flex flex-col gap-1 group/menu">
              {/* 
                NAVIGATION ITEM: About
                
                Opens SideTray with about content when clicked.
                
                ACCESSIBILITY:
                - role="button": Semantically indicates clickable element
                - tabIndex={0}: Makes it keyboard focusable
                - onKeyDown: Handles Enter and Space key presses
                - aria-label: Screen reader description
                
                INTERACTION STATES:
                - Mobile: active:scale-[0.98] - Visual feedback on tap
                - Desktop: hover:!text-foreground - Text color change on hover
                - group-hover: All items slightly fade when hovering menu group
                
                STYLING NOTES:
                - -mx-2 px-2: Negative margin + padding creates larger tap target on mobile
                - WebkitTapHighlightColor: 'transparent' - Removes iOS tap highlight
                - userSelect: 'none' - Prevents text selection on interaction
              */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedArticle("about")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedArticle("about");
                  }
                }}
                className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
                aria-label="About Raf"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                About
              </div>
              {/* 
                NAVIGATION ITEM: Works
                
                Opens WorksPanel (right side panel) when clicked.
                WorksPanel shows portfolio carousel with work timeline.
                
                @see WorksPanel component for implementation details
              */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedArticle("works")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedArticle("works");
                  }
                }}
                className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
                aria-label="View Works"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                Works
              </div>
              {/* 
                NAVIGATION ITEM: Writing
                
                Opens SideTray in writing mode when clicked.
                Writing mode shows a two-step flow:
                1. First: Article list (allWritings array)
                2. Second: Selected article content (when user clicks an article)
                
                @see SideTray component's isWritingMode prop for implementation
              */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedArticle("writing")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedArticle("writing");
                  }
                }}
                className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
                aria-label="View Writing"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                Writing
              </div>
            </div>
          </div>
        </div>

        {/* 
          TIMEZONE MESSAGE - Mobile Layout
          
          Positioned absolutely at bottom-left of viewport on mobile.
          Uses safe area insets to avoid notches/device cutouts.
          Blurs when any side tray is open.
          
          POSITIONING:
          - bottom: max(1rem, safe-area-inset-bottom + 1rem)
          - left: max(2rem, safe-area-inset-left + 2rem) (matching px-8 padding)
          
          This ensures the message is always visible and not hidden by device UI.
        */}
        <div
          className="md:hidden absolute"
          style={{
            bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
            left: 'max(2rem, calc(env(safe-area-inset-left, 0px) + 2rem))'
          }}
        >
          <p 
            className="text-[10px] text-muted-foreground/50 leading-relaxed transition-all duration-200 whitespace-nowrap"
            style={{ filter: selectedArticle ? 'blur(4px)' : 'blur(0px)' }}
          >
            {timezoneMessage}
          </p>
        </div>

        {/* 
          TIMEZONE MESSAGE - Desktop Layout
          
          Positioned absolutely in bottom-left corner.
          Uses safe area insets to avoid notches/device cutouts.
          
          POSITIONING:
          - bottom: max(1.5rem, safe-area-inset-bottom + 1.5rem)
          - left: max(5rem, safe-area-inset-left + 5rem)
          
          This ensures the message is always visible and not hidden by device UI.
        */}
        <div
          className="hidden md:block absolute bottom-4 left-20"
          style={{
            bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
            left: 'max(5rem, calc(env(safe-area-inset-left, 0px) + 5rem))'
          }}
        >
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed transition-colors duration-200">{timezoneMessage}</p>
        </div>

        {/* ========================================================================
           * SIDE TRAY COMPONENT
           * ========================================================================
           * 
           * Handles display of About content and Writing articles.
           * 
           * PROPS LOGIC:
           * 
           * articleId:
           * - If writing mode: Uses selectedWritingArticle (specific article ID)
           * - If about mode: Uses "about" string
           * - Otherwise: null (tray closed)
           * 
           * isWritingMode:
           * - true when selectedArticle === "writing"
           * - Enables two-step navigation (list → article)
           * 
           * onArticleSelect:
           * - Only provided in writing mode
           * - Updates selectedWritingArticle when user selects an article
           * 
           * onClose:
           * - Writing mode: Closes both selectedArticle and selectedWritingArticle
           *   (handles nested state cleanup)
           * - Other modes: Only closes selectedArticle
           * 
           * @see SideTray component for detailed implementation
           */}
        <SideTray 
          articleId={selectedArticle === "writing" ? selectedWritingArticle : selectedArticle === "about" ? "about" : null} 
          onClose={() => {
            if (selectedArticle === "writing") {
              // Close the entire writing tray (both list and article views)
              // This ensures clean state when closing nested writing mode
              setSelectedArticle(null)
              setSelectedWritingArticle(null)
            } else {
              setSelectedArticle(null)
            }
          }}
          isWritingMode={selectedArticle === "writing"}
          onArticleSelect={selectedArticle === "writing" ? setSelectedWritingArticle : undefined}
        />
        
        {/* ========================================================================
           * WORKS PANEL COMPONENT
           * ========================================================================
           * 
           * Displays portfolio carousel with work timeline.
           * 
           * Opens as a right-side panel (50% width on desktop) when
           * selectedArticle === "works".
           * 
           * Features:
           * - Image carousel with keyboard navigation
           * - Work timeline that highlights current project
           * - Video modal for projects with videos
           * - Click-outside-to-close functionality
           * 
           * @see WorksPanel component for detailed implementation
           */}
        <WorksPanel 
          isOpen={selectedArticle === "works"} 
          onClose={() => setSelectedArticle(null)} 
        />
      </main>
    </div>
  )
}
