/**
 * ============================================================================
 * MARKDOWN COMPONENTS - app/components/markdown/markdownComponents.tsx
 * ============================================================================
 *
 * Custom ReactMarkdown components for consistent typography across the app.
 * Overrides default markdown rendering to match the design system.
 *
 * TYPOGRAPHY HIERARCHY: PRIMARY (for full articles, long-form content)
 * - h1: text-xl (22px) - Main article title
 * - h2: text-lg (20px) - Section headings
 * - h3: text-base (16px) - Subsection headings
 * - h4: text-sm (14px) - Minor headings
 * - p, li: text-sm (14px) - Body text
 *
 * VERTICAL RHYTHM: Uses rhythm-paragraph and rhythm-heading patterns
 * - Paragraph spacing: 24px (space-y-6) - 1.5× line-height
 * - Heading spacing: Progressive (h1: 48px above, 24px below)
 * - List spacing: 16px (space-y-4)
 *
 * MEASURE: Wrap markdown content with prose-article for optimal readability
 * - Optimal: 65ch (~680px) for comfortable reading
 * - See TYPOGRAPHY.md for complete measure documentation
 *
 * See TYPOGRAPHY.md for complete typography system documentation.
 *
 * USAGE:
 * ```tsx
 * import { markdownComponents } from "@/app/components/markdown/markdownComponents"
 * import ReactMarkdown from "react-markdown"
 *
 * // Recommended: Wrap with prose-article for optimal measure + rhythm
 * <article className="prose-article mx-auto px-8">
 *   <ReactMarkdown components={markdownComponents}>
 *     {markdownContent}
 *   </ReactMarkdown>
 * </article>
 * ```
 *
 * FEATURES:
 * - Primary heading hierarchy (PRIMARY from HEADING_HIERARCHIES)
 * - Consistent text sizes and spacing (matches VERTICAL_RHYTHM)
 * - Footer-inspired opacity hierarchy for visual depth
 * - Generous spacing (follows 4px grid system)
 * - list-outside for better optical alignment
 * - Theme-aware colors (foreground, muted-foreground)
 * - Smooth color transitions
 * - External link detection with icon
 * - Accessible semantic HTML
 *
 * STYLING:
 * Imports shared base styles from markdownBaseStyles.tsx for consistency
 * across all markdown rendering.
 */

import type { Components } from "react-markdown"
import {
  BaseLinkComponent,
  baseTextClasses,
  baseSpacingClasses,
  baseOpacityClasses
} from "./markdownBaseStyles"

/**
 * Custom ReactMarkdown components for consistent typography.
 *
 * PRIMARY HIERARCHY (Golden Ratio scale, 14px anchor):
 * - h1: text-xl (22px) - Main article title
 * - h2: text-lg (20px) - Section headings
 * - h3: text-base (16px) - Subsection headings
 * - h4: text-sm (14px) - Minor headings
 * - p, li: text-sm (14px) - Body text
 * - code: text-2xs (10px) - Inline code
 *
 * EXTERNAL LINK DETECTION:
 * Automatically detects http:// and https:// links and:
 * - Opens in new tab (target="_blank")
 * - Adds security attributes (rel="noopener noreferrer")
 * - Shows external link icon on hover (desktop only)
 */
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-edu-marist text-xl font-light text-foreground tracking-wider mb-6 mt-8 transition-colors duration-200">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-edu-marist text-lg font-normal text-foreground/80 mb-4 mt-7 transition-colors duration-200">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-edu-marist text-base font-medium text-foreground/80 mb-3 mt-5 transition-colors duration-200">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-muted-foreground mb-4 leading-[1.65] transition-colors duration-200">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className={`${baseTextClasses.body} ${baseSpacingClasses.list} list-disc list-outside`}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className={`${baseTextClasses.body} ${baseSpacingClasses.list} list-decimal list-outside`}>{children}</ol>
  ),
  li: ({ children }) => (
    <li className={`${baseTextClasses.body} ${baseSpacingClasses.listItem}`}>{children}</li>
  ),
  a: BaseLinkComponent,
  blockquote: ({ children }) => (
    <blockquote className={`${baseTextClasses.body} border-l border-border/40 pl-4 ${baseSpacingClasses.blockquote} ${baseOpacityClasses.secondary} italic`}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className={`${baseTextClasses.code} bg-muted/80 px-1.5 py-0.5 rounded ${baseOpacityClasses.code}`}>
      {children}
    </code>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground transition-colors duration-200">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-border my-6 transition-colors duration-200" />
}
