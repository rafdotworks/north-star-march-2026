/**
 * ============================================================================
 * TYPOGRAPHY CONFIGURATION - app/config/typographyConfig.ts
 * ============================================================================
 *
 * Centralized typography system configuration for programmatic access.
 * The system is tuned for minimal identity: prefer body, secondary, and
 * caption for the main hero; max size for main hero = 22px (xl). Use
 * 26px (display) only for rare emphasis outside the hero.
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
  '2xl': '26px',  // Rare emphasis, large display; not for main hero identity
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
 * ============================================================================
 * SEMANTIC TYPOGRAPHY LAYER
 * ============================================================================
 * 
 * Maps semantic intent to responsive size classes.
 * Choose typography by meaning (Display, Heading, Body) not by size number.
 * For minimal identity: hero uses body, secondary, caption (and optionally
 * title); avoid Display (26px) for the main site hero—cap at 22px (xl).
 * 
 * Usage:
 * - Use semantic names when meaning matters more than exact size
 * - Automatically handles mobile/desktop responsive sizing
 * - Provides clear intent for future maintainers
 */
export const SEMANTIC_TYPOGRAPHY = {
  /**
   * DISPLAY: Largest, most prominent text
   * Use for: Rare emphasis, work card titles; NOT for main hero identity (max 22px there)
   */
  display: {
    mobile: 'text-xl',   // 22px - Fits mobile screens without overwhelming
    desktop: 'text-2xl', // 26px - Maximum impact on large screens
    lineHeight: 'leading-tight', // 1.25 - Tight for large text
    use: 'Rare emphasis, large headings; not for main site hero',
  },
  
  /**
   * PAGE TITLE: Main page identifier
   * Use for: Main page titles, primary section titles
   */
  pageTitle: {
    mobile: 'text-xl',   // 22px - Strong presence on mobile
    desktop: 'text-xl',  // 22px - Consistent across devices
    lineHeight: 'leading-tight', // 1.25
    use: 'Main page titles, work card titles, primary headings',
  },
  
  /**
   * HEADING: Section headings
   * Use for: Section headings, subsections, card headers
   */
  heading: {
    mobile: 'text-base', // 16px - Readable hierarchy on mobile
    desktop: 'text-lg',  // 20px - Clear hierarchy on desktop
    lineHeight: 'leading-tight', // 1.25
    use: 'Section headings, subsections, prominent labels',
  },
  
  /**
   * SUBHEADING: Minor headings
   * Use for: Subsection headings, card titles, emphasized labels
   */
  subheading: {
    mobile: 'text-sm',   // 14px - Compact but readable
    desktop: 'text-base', // 16px - Slightly larger on desktop
    lineHeight: 'leading-tight', // 1.25
    use: 'Subsection headings, card titles, category labels',
  },
  
  /**
   * BODY: Primary content text
   * Use for: Main content, descriptions, paragraphs
   */
  body: {
    mobile: 'text-sm',   // 14px - Optimal for mobile reading
    desktop: 'text-sm',  // 14px - Consistent (anchor point)
    lineHeight: 'leading-[1.5]', // 1.5 - Balanced readability
    use: 'Main content, descriptions, work descriptions',
  },
  
  /**
   * BODY LARGE: Emphasized content
   * Use for: Emphasized paragraphs, intro text, callouts
   */
  bodyLarge: {
    mobile: 'text-base', // 16px - Comfortable for longer reading
    desktop: 'text-base', // 16px - Consistent
    lineHeight: 'leading-relaxed', // 1.625 - More breathing room
    use: 'Emphasized paragraphs, intro text, important content',
  },
  
  /**
   * SECONDARY: De-emphasized text
   * Use for: Navigation, metadata, labels, supporting text
   */
  secondary: {
    mobile: 'text-sm',   // 14px - Larger for tap targets on mobile
    desktop: 'text-xs',  // 12px - Compact on desktop
    lineHeight: 'leading-[1.5]', // 1.5
    use: 'Navigation, metadata, labels, year/role indicators',
  },
  
  /**
   * CAPTION: Smallest text
   * Use for: Timestamps, fine print, subtle metadata
   */
  caption: {
    mobile: 'text-xs',   // 12px - Minimum readable size
    desktop: 'text-2xs', // 10px - Very compact on desktop
    lineHeight: 'leading-[1.4]', // 1.4 - Tighter for small text
    use: 'Timestamps, fine print, copyright, subtle metadata',
  },
} as const

/**
 * Semantic Typography Type (for type safety)
 */
export type SemanticTypography = keyof typeof SEMANTIC_TYPOGRAPHY

/**
 * ============================================================================
 * VERTICAL RHYTHM SYSTEM
 * ============================================================================
 * 
 * Explicit spacing rules for consistent vertical rhythm.
 * Base unit: 4px (Tailwind's default spacing unit)
 * Line height reference: 1.5 (24px for 16px text)
 * 
 * Principles:
 * - Paragraph spacing: 1.5× line-height (24px)
 * - Section spacing: 2× line-height (32px)
 * - Heading spacing: Progressive scale based on importance
 */
export const VERTICAL_RHYTHM = {
  /**
   * Base rhythm unit: 4px
   * All spacing should be multiples of this unit
   */
  unit: 4,
  
  /**
   * PARAGRAPH SPACING
   * Gap between body paragraphs (1.5× line-height)
   */
  paragraph: {
    gap: 'space-y-6',        // 24px between paragraphs
    marginBottom: 'mb-6',     // 24px after paragraphs
    use: 'Between body paragraphs, after paragraph blocks',
    pixels: '24px',
  },
  
  /**
   * HEADING TO CONTENT SPACING
   * Space below headings before content starts
   */
  headingToContent: {
    h1: 'mb-6',  // 24px - Generous space for major headings
    h2: 'mb-4',  // 16px - Moderate space for sections
    h3: 'mb-3',  // 12px - Tight space for subsections
    h4: 'mb-2',  // 8px - Minimal space for minor headings
    use: 'Space below headings before content',
  },
  
  /**
   * CONTENT TO HEADING SPACING
   * Space above headings after previous content (larger than below)
   */
  contentToHeading: {
    h1: 'mt-12', // 48px - Major section break
    h2: 'mt-8',  // 32px - Section break
    h3: 'mt-6',  // 24px - Subsection break
    h4: 'mt-4',  // 16px - Minor break
    use: 'Space above headings after previous content',
  },
  
  /**
   * SECTION SPACING
   * Large breaks between major sections
   */
  section: {
    gap: 'space-y-8',        // 32px between sections (2× line-height)
    marginBottom: 'mb-12',    // 48px after major sections
    use: 'Between major sections, after section blocks',
    pixels: '32px (gap), 48px (margin)',
  },
  
  /**
   * LIST SPACING
   * Spacing for ul/ol elements and their items
   */
  list: {
    gap: 'space-y-4',        // 16px between list items
    marginBottom: 'mb-4',     // 16px after list
    itemIndent: 'pl-5',      // 20px indent for list markers (list-outside)
    use: 'Between list items, after lists',
    pixels: '16px',
  },
  
  /**
   * BLOCKQUOTE SPACING
   * Generous spacing for visual separation
   */
  blockquote: {
    margin: 'my-6',          // 24px vertical margin
    padding: 'pl-4',         // 16px left padding
    use: 'Around blockquotes',
    pixels: '24px (vertical)',
  },
} as const

/**
 * Vertical Rhythm Type (for type safety)
 */
export type VerticalRhythmSection = keyof typeof VERTICAL_RHYTHM

/**
 * ============================================================================
 * MEASURE (LINE LENGTH) GUIDELINES
 * ============================================================================
 * 
 * Optimal line length for readability based on typographic research.
 * 
 * Research findings:
 * - 45-75 characters per line is optimal for body text
 * - 65 characters is the sweet spot for most content
 * - Lines too long/short both hurt readability and comprehension
 */
export const MEASURE_GUIDELINES = {
  /**
   * OPTIMAL MEASURE (65ch)
   * Best for most body text and articles
   */
  optimal: {
    value: '65ch',
    pixels: '~680px at 14px',
    className: 'max-w-prose',
    use: 'Body text, articles, main content',
    reason: 'Eye tracking research: 45-75 chars optimal for reading',
    charRange: '60-70 characters',
  },
  
  /**
   * NARROW MEASURE (45ch)
   * Best for constrained spaces
   */
  narrow: {
    value: '45ch',
    pixels: '~470px at 14px',
    className: 'max-w-prose-narrow',
    use: 'Modals, side trays, constrained spaces, mobile panels',
    reason: 'Shorter lines work better in narrow containers',
    charRange: '40-50 characters',
  },
  
  /**
   * WIDE MEASURE (80ch)
   * Best for technical content
   */
  wide: {
    value: '80ch',
    pixels: '~840px at 14px',
    className: 'max-w-prose-wide',
    use: 'Technical content, code examples, wide layouts',
    reason: 'Longer lines acceptable for scanning/reference material',
    charRange: '75-85 characters',
  },
  
  /**
   * Tailwind utility classes (add to tailwind.config.js)
   */
  classes: {
    narrow: 'max-w-prose-narrow',  // 45ch
    optimal: 'max-w-prose',         // 65ch
    wide: 'max-w-prose-wide',       // 80ch
  },
  
  /**
   * Pixel-based alternatives (for specific layouts)
   */
  pixelBased: {
    reading: '680px',  // Matches 65ch at 14px body text
    article: '720px',  // Slightly wider for articles with mixed content
  },
} as const

/**
 * Measure Type (for type safety)
 */
export type MeasureType = keyof typeof MEASURE_GUIDELINES.classes

/**
 * ============================================================================
 * MOBILE ADAPTATION RULES
 * ============================================================================
 * 
 * Explicit responsive behavior rules for typography.
 * Documents when and how text scales between mobile and desktop.
 * 
 * Strategy:
 * - Display text: Scale DOWN on mobile (prevent overwhelming)
 * - Navigation text: Scale UP on mobile (larger tap targets)
 * - Body text: Stay SAME (14px is optimal anchor point)
 * - Most text: Stay same or minimal adjustment
 */
export const MOBILE_ADAPTATION = {
  /**
   * Breakpoint (matches hooks/use-mobile.tsx)
   */
  breakpoint: 768, // Mobile: < 768px, Desktop: >= 768px
  
  /**
   * Overall scale strategy by semantic category
   */
  strategy: {
    display: 'Scale DOWN on mobile (-4px)',
    titles: 'Stay SAME size (22px)',
    body: 'Stay SAME size (14px - anchor point)', 
    secondary: 'Mobile LARGER (14px) for tap targets, desktop smaller (12px)',
    caption: 'Mobile LARGER (12px), desktop smaller (10px)',
    note: 'Most text stays same size. Only hero/display and interactive text adjust.',
  },
  
  /**
   * Specific element adjustments with rationale
   */
  adjustments: [
    {
      element: 'Hero name',
      semantic: 'display',
      desktop: 'text-2xl (26px)',
      mobile: 'text-xl (22px)',
      reason: 'Prevent overwhelming small screens, maintain hierarchy',
    },
    {
      element: 'Navigation',
      semantic: 'secondary',
      desktop: 'text-xs (12px)',
      mobile: 'text-sm (14px)',
      reason: 'Larger tap targets on mobile (48px height minimum)',
    },
    {
      element: 'Work card titles',
      semantic: 'pageTitle',
      desktop: 'text-xl (22px)',
      mobile: 'text-xl (22px)',
      reason: 'Visual hierarchy maintained across devices',
    },
    {
      element: 'Body text',
      semantic: 'body',
      desktop: 'text-sm (14px)',
      mobile: 'text-sm (14px)',
      reason: '14px is optimal reading size for both mobile and desktop',
    },
    {
      element: 'Captions/Metadata',
      semantic: 'caption',
      desktop: 'text-2xs (10px)',
      mobile: 'text-xs (12px)',
      reason: 'Minimum legible size, slightly larger on mobile',
    },
  ],
  
  /**
   * Spacing adjustments for mobile/desktop
   */
  spacing: {
    sectionGap: {
      mobile: 'mb-12 (48px)',
      desktop: 'mb-16 (64px)',
      reason: 'Proportional to viewport size - mobile needs less space',
    },
    columnGap: {
      mobile: 'mb-12 (48px) - stack vertically',
      desktop: 'gap-16 (64px) - horizontal grid',
      reason: 'Different layout strategies per device',
    },
    contentPadding: {
      mobile: 'px-8 (32px)',
      desktop: 'px-0 (grid system handles spacing)',
      reason: 'Safe area handling on mobile, grid on desktop',
    },
  },
  
  /**
   * Tap target requirements (mobile only)
   */
  tapTargets: {
    minimum: '48px',  // Apple & Material Design guideline
    recommended: '48px height × full width',
    implementation: 'py-2 (16px) + text-sm (14px) + line-height (21px) = 51px ✓',
    note: 'Add padding to text elements to create larger tap areas',
  },
} as const

/**
 * Mobile Adaptation Type (for type safety)
 */
export type MobileAdaptationElement = typeof MOBILE_ADAPTATION.adjustments[number]['element']

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

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

