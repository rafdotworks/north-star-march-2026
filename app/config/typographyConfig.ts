/**
 * ============================================================================
 * TYPOGRAPHY CONFIGURATION - app/config/typographyConfig.ts
 * ============================================================================
 *
 * Centralized typography system configuration for programmatic access.
 *
 * EXPORTS:
 * - TYPOGRAPHY_SCALE: Golden Ratio size progression (10px–26px)
 * - HEADING_HIERARCHIES: Three heading scales (primary, compact, minimal)
 * - SEMANTIC_CLASSES: Semantic typography class names
 * - FONT_FAMILIES: Font family utility classes
 * - LINE_HEIGHTS: Line height constants
 * - LETTER_SPACING: Letter spacing constants
 *
 * See TYPOGRAPHY.md for complete documentation and usage guidelines.
 */

/**
 * Golden Ratio Typography Scale (φ ≈ 1.618, 14px anchor)
 * Maps 1:1 with Tailwind fontSize scale in tailwind.config.js
 */
export const TYPOGRAPHY_SCALE = {
  '2xs': '10px',  // Labels, timestamps, uppercase section headers
  'xs': '12px',   // Metadata (year, role, contract type), captions
  'sm': '14px',   // Body text, descriptions, navigation (anchor point)
  'base': '16px', // Modal content, emphasized body text
  'lg': '20px',   // Subheadings
  'xl': '22px',   // Page titles, main headings, "Raf" name
  '2xl': '26px',  // Hero name (desktop), large display text
} as const

/**
 * Typography Scale Type (for type safety)
 */
export type TypographySize = keyof typeof TYPOGRAPHY_SCALE

/**
 * Three Standard Heading Hierarchies
 * 
 * Choose based on context:
 * - PRIMARY: Full articles, long-form content (maximum readability)
 * - COMPACT: Modal content, side panels (constrained space)
 * - MINIMAL: Story pages, dense layouts (subtle hierarchy)
 */
export const HEADING_HIERARCHIES = {
  /**
   * PRIMARY HIERARCHY
   * For: Full articles, writing pages, long-form content
   * Used in: markdownComponents.tsx
   */
  primary: {
    h1: 'text-xl',   // 22px - Main article title
    h2: 'text-lg',   // 20px - Section headings
    h3: 'text-base', // 16px - Subsection headings
    h4: 'text-sm',   // 14px - Minor headings
  },
  
  /**
   * COMPACT HIERARCHY
   * For: Modal content, side panels, constrained spaces
   * Used in: markdownBaseStyles.tsx, AboutModalContent, BlueprintContent
   */
  compact: {
    h1: 'text-base', // 16px - Modal title
    h2: 'text-sm',   // 14px - Section headings
    h3: 'text-xs',   // 12px - Subsection headings
  },
  
  /**
   * MINIMAL HIERARCHY
   * For: Story pages, dense content, minimal layouts
   * Used in: storyMarkdownComponents.tsx
   */
  minimal: {
    h1: 'text-sm', // 14px - Story title
    h2: 'text-xs', // 12px - Section headings
    h3: 'text-xs', // 12px - Subsection headings (same as h2)
  },
} as const

/**
 * Heading Hierarchy Type (for type safety)
 */
export type HeadingHierarchy = keyof typeof HEADING_HIERARCHIES

/**
 * Semantic Typography Classes
 * Defined in app/globals.css lines 11-42
 * 
 * Use semantic classes when:
 * - Styling repeating patterns (work cards, footer links)
 * - Meaning is more important than appearance
 * - Consistency across similar elements is critical
 */
export const SEMANTIC_CLASSES = {
  /**
   * CAPTION: Quiet, secondary text (12px)
   * Use for: Principles, timestamps, meta information, footer links
   */
  caption: 'type-caption',
  
  /**
   * BODY: Default body text for secondary content (14px, muted)
   * Use for: Work descriptions, secondary content, navigation (desktop)
   */
  body: 'type-body',
  
  /**
   * BODY PRIMARY: Emphasized body text (14px, primary color)
   * Use for: Hero intro, important descriptions, call-to-action text
   */
  bodyPrimary: 'type-body-primary',
  
  /**
   * TITLE: Work card titles (22px, Edu Marist)
   * Use for: Work card titles, project names, feature headings
   */
  title: 'type-title',
} as const

/**
 * Semantic Class Type (for type safety)
 */
export type SemanticClass = keyof typeof SEMANTIC_CLASSES

/**
 * Font Family Utility Classes
 * 
 * Three-tier font system:
 * - BODY: Ronzino (default body font)
 * - ACCENT: Edu Marist (headings, emphasis, special names)
 * - MONO: CoFo Sans Mono (code, technical content)
 */
export const FONT_FAMILIES = {
  /**
   * BODY: Ronzino Regular
   * Applied automatically to body element
   * Use: Default for all text unless specified otherwise
   */
  body: 'font-sans',
  
  /**
   * ACCENT: Edu Marist Regular
   * Includes automatic letter-spacing: -0.02em
   * Use: Headings, emphasis, special names (e.g., "Raf")
   */
  accent: 'font-edu-marist',
  
  /**
   * MONO: CoFo Sans Mono Regular
   * Use: Code blocks, inline code, technical content
   */
  mono: 'font-mono',
} as const

/**
 * Font Family Type (for type safety)
 */
export type FontFamily = keyof typeof FONT_FAMILIES

/**
 * Line Height System
 * Defined in app/globals.css lines 66-71
 * 
 * Two-tier system:
 * - TIGHT: Headings, compact text blocks, navigation
 * - NORMAL: All body text, descriptions, UI elements
 * - RELAXED: Long-form content, article paragraphs
 */
export const LINE_HEIGHTS = {
  /**
   * TIGHT: 1.25
   * Use for: Headings (h1-h6), compact text, navigation, labels
   * Tailwind: leading-tight
   */
  tight: '1.25',
  
  /**
   * NORMAL: 1.5
   * Use for: Body text, descriptions, UI elements
   * Tailwind: leading-[1.5]
   */
  normal: '1.5',
  
  /**
   * RELAXED: 1.625
   * Use for: Long-form content, article paragraphs, markdown body
   * Tailwind: leading-relaxed
   */
  relaxed: '1.625',
} as const

/**
 * Line Height Type (for type safety)
 */
export type LineHeight = keyof typeof LINE_HEIGHTS

/**
 * Letter Spacing System
 * 
 * Three levels:
 * - TIGHT: Edu Marist headings (auto-applied)
 * - BODY: All body text (auto-applied globally)
 * - WIDE: Special emphasis (name headings)
 */
export const LETTER_SPACING = {
  /**
   * TIGHT: -0.02em
   * Auto-applied to: .font-edu-marist class
   * Use: Headings, accent text (creates cohesive word shapes)
   */
  tight: '-0.02em',
  
  /**
   * BODY: -0.01em
   * Auto-applied to: body element globally
   * Use: All body text (subtle tightening for readability)
   */
  body: '-0.01em',
  
  /**
   * WIDE: 0.025em
   * Tailwind: tracking-wide
   * Use: Special emphasis, primary identifiers (e.g., "Raf V.")
   */
  wide: '0.025em',
} as const

/**
 * Letter Spacing Type (for type safety)
 */
export type LetterSpacing = keyof typeof LETTER_SPACING

/**
 * Responsive Breakpoint for Typography
 * Mobile: < 768px, Desktop: >= 768px
 */
export const TYPOGRAPHY_BREAKPOINT = 768 as const

/**
 * Helper function to get typography scale value
 */
export function getTypographySize(size: TypographySize): string {
  return TYPOGRAPHY_SCALE[size]
}

/**
 * Helper function to get heading class for a specific hierarchy
 */
export function getHeadingClass(
  hierarchy: HeadingHierarchy,
  level: 'h1' | 'h2' | 'h3' | 'h4'
): string {
  const hierarchyObj = HEADING_HIERARCHIES[hierarchy]
  return (hierarchyObj as Record<string, string>)[level] || ''
}

/**
 * Helper function to get semantic class
 */
export function getSemanticClass(semantic: SemanticClass): string {
  return SEMANTIC_CLASSES[semantic]
}

/**
 * Helper function to get font family class
 */
export function getFontFamily(font: FontFamily): string {
  return FONT_FAMILIES[font]
}

