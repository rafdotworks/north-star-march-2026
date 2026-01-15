/**
 * ============================================================================
 * NAVIGATION ITEM COMPONENT - app/components/NavigationItem.tsx
 * ============================================================================
 * 
 * Reusable navigation menu item component for the main page navigation.
 * Handles click and keyboard interactions with consistent styling and accessibility.
 * 
 * FEATURES:
 * - Full keyboard accessibility (Enter and Space key support)
 * - Mobile-optimized tap targets
 * - Desktop hover effects with group interaction
 * - Consistent styling across all navigation items
 * - ARIA labels for screen readers
 * 
 * ACCESSIBILITY:
 * - role="button": Semantically indicates clickable element
 * - tabIndex={0}: Makes it keyboard focusable
 * - onKeyDown: Handles Enter and Space key presses
 * - aria-label: Screen reader description
 * 
 * INTERACTION STATES:
 * - Mobile: active:scale-[0.98] - Visual feedback on tap
 * - Desktop: hover:!text-foreground - Text color change on hover
 * - group-hover: All items slightly fade when hovering menu group
 * 
 * STYLING NOTES:
 * - -mx-2 px-2: Negative margin + padding creates larger tap target on mobile
 * - WebkitTapHighlightColor: 'transparent' - Removes iOS tap highlight
 * - userSelect: 'none' - Prevents text selection on interaction
 * 
 * @component
 * @see app/page.tsx for usage examples
 */

"use client"

import React, { memo } from "react"

/**
 * Props for NavigationItem component.
 * 
 * @interface NavigationItemProps
 * @property {string} label - The text label to display
 * @property {string} articleId - The article ID to open ("about" | "works" | "writing")
 * @property {(articleId: string) => void} onClick - Callback when item is clicked
 * @property {string} ariaLabel - ARIA label for accessibility
 */
interface NavigationItemProps {
  label: string
  articleId: "about" | "works" | "writing"
  onClick: (articleId: "about" | "works" | "writing") => void
  ariaLabel: string
}

/**
 * NavigationItem Component
 * 
 * A reusable navigation menu item with keyboard and mouse interaction support.
 * 
 * @param {NavigationItemProps} props - Component props
 * @returns {JSX.Element} The NavigationItem component
 */
function NavigationItem({ label, articleId, onClick, ariaLabel }: NavigationItemProps) {
  /**
   * Handles keyboard navigation (Enter and Space keys).
   * 
   * Prevents default browser behavior and triggers the same action as click.
   * 
   * @param {React.KeyboardEvent<HTMLDivElement>} event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(articleId)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(articleId)}
      onKeyDown={handleKeyDown}
      className="type-nav cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/nav:opacity-30 md:group-hover/nav:text-muted-foreground/30 md:hover:!opacity-60 md:hover:!text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:rounded-sm transition-all duration-200"
      aria-label={ariaLabel}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        outline: 'none'
      }}
    >
      {label}
    </div>
  )
}

/**
 * Memoized NavigationItem component to prevent unnecessary re-renders.
 * 
 * Only re-renders when props change, improving performance when parent
 * component updates but navigation items remain the same.
 */
export default memo(NavigationItem)

