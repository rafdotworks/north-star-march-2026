/**
 * ============================================================================
 * MARKDOWN BASE STYLES - app/components/markdown/markdownBaseStyles.tsx
 * ============================================================================
 *
 * Shared styling foundation for all markdown rendering across the site.
 * Provides consistent typography, spacing, and opacity hierarchy inspired
 * by the footer's well-balanced design principles.
 *
 * TYPOGRAPHY HIERARCHY: COMPACT (for modal content, side panels)
 * - h1: text-base (16px) - Modal title
 * - h2: text-sm (14px) - Section headings
 * - h3: text-xs (12px) - Subsection headings
 * - p, li: text-xs (12px) - Body text
 *
 * See TYPOGRAPHY.md for complete typography system documentation.
 *
 * EXPORTS:
 * - baseTextClasses: Shared text styling (size, color, line-height)
 * - baseSpacingClasses: Spacing configuration for lists, quotes, etc.
 * - BaseLinkComponent: Unified link component with external detection
 *
 * DESIGN PRINCIPLES:
 * - Footer-inspired opacity hierarchy (90-95% for secondary elements)
 * - Generous line-height (1.9) for optimal readability
 * - Balanced spacing (16px between list items, 24px for blockquotes)
 * - list-outside for better optical alignment
 * - Theme-aware colors via CSS variables
 *
 * Used by:
 * - app/components/markdown/markdownComponents.tsx
 * - app/components/markdown/storyMarkdownComponents.tsx
 */

import { ExternalLinkIcon } from "@/app/components/icons/ExternalLinkIcon"

/**
 * Base text styling shared across all markdown elements.
 * Uses site's color variables for theme awareness.
 *
 * COMPACT HIERARCHY (Golden Ratio scale):
 * - h1: text-base (16px) - Modal title
 * - h2: text-sm (14px) - Section headings
 * - h3: text-xs (12px) - Subsection headings
 * - p, li: text-xs (12px) - Body text
 * - code: text-2xs (10px) - Inline code
 */
export const baseTextClasses = {
  // Body text: 12px with generous line-height
  body: "text-xs text-muted-foreground leading-[1.9] transition-colors duration-200",

  // Headings: Use Edu Marist font with varying sizes
  h1: "font-edu-marist text-base font-light text-foreground tracking-wider transition-colors duration-200",
  h2: "font-edu-marist text-sm font-normal text-foreground/80 transition-colors duration-200",
  h3: "font-edu-marist text-xs font-medium text-foreground/80 transition-colors duration-200",

  // Inline code: Smaller size with monospace font
  code: "text-2xs font-mono text-foreground transition-colors duration-200",

  // Links: Match body text with hover state
  link: "text-xs text-muted-foreground transition-colors duration-200",
}

/**
 * Spacing configuration following footer's rhythm:
 * - space-y-4 (16px): Between list items
 * - my-6 (24px): Vertical margin for blockquotes
 * - mb-4 (16px): Bottom margin for paragraphs
 */
export const baseSpacingClasses = {
  // Paragraph spacing
  paragraph: "mb-4",

  // List spacing (generous breathing room)
  list: "mb-4 space-y-4",
  listItem: "pl-5", // Proper indent for list-outside markers (20px)

  // Blockquote spacing (substantial margin)
  blockquote: "my-6",

  // Heading spacing (progressive scale)
  h1Margin: "mb-6 mt-8",
  h2Margin: "mb-4 mt-7",
  h3Margin: "mb-3 mt-5",

  // Divider spacing
  hr: "my-6",
}

/**
 * Opacity levels for visual hierarchy (footer-inspired).
 * Creates depth without changing font sizes.
 */
export const baseOpacityClasses = {
  // Secondary elements (blockquotes, de-emphasized text)
  secondary: "opacity-90",

  // Code blocks (subtle separation)
  code: "opacity-95",
}

/**
 * Unified external link component.
 * Detects external URLs and adds:
 * - target="_blank" for external links
 * - Security attributes (rel="noopener noreferrer")
 * - 10px icon on hover (desktop only)
 *
 * @param href - Link destination
 * @param children - Link content
 */
export const BaseLinkComponent = ({
  href,
  children
}: {
  href?: string
  children?: React.ReactNode
}) => {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://')

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group/link inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hover:!text-foreground transition-colors duration-200 visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none"
      style={{
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
      {isExternal && (
        <ExternalLinkIcon
          size={10}
          className="hidden md:block w-[10px] h-[10px] opacity-0 md:group-hover/link:opacity-70 transition-opacity duration-200"
        />
      )}
    </a>
  )
}

/**
 * Constants for consistent sizing across components.
 */
export const ICON_SIZE = 10 // px, for external link icons
