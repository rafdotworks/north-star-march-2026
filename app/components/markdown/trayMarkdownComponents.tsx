/**
 * ============================================================================
 * TRAY MARKDOWN COMPONENTS - app/components/markdown/trayMarkdownComponents.tsx
 * ============================================================================
 *
 * Compact markdown components for article content inside the SideTray.
 * Uses COMPACT hierarchy (from markdownBaseStyles) so tray articles match
 * the About tray typography and spacing.
 *
 * TYPOGRAPHY HIERARCHY: COMPACT (modal/side panel)
 * - h1: text-base (16px) - Article title
 * - h2: text-sm (14px) - Section headings
 * - h3: text-xs (12px) - Subsection headings
 * - p, li: text-xs (12px) - Body text
 *
 * Used by: app/components/page-specific/SideTray.tsx when apiBasePath === "/api/article"
 */

import type { Components } from "react-markdown"
import {
  BaseLinkComponent,
  baseTextClasses,
  baseSpacingClasses,
  baseOpacityClasses
} from "./markdownBaseStyles"

export const trayMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className={`${baseTextClasses.h1} ${baseSpacingClasses.h1Margin}`}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className={`${baseTextClasses.h2} ${baseSpacingClasses.h2Margin}`}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className={`${baseTextClasses.h3} ${baseSpacingClasses.h3Margin}`}>{children}</h3>
  ),
  p: ({ children }) => (
    <p className={`${baseTextClasses.body} ${baseSpacingClasses.paragraph}`}>{children}</p>
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
  hr: () => <hr className={`border-border ${baseSpacingClasses.hr} transition-colors duration-200`} />
}
