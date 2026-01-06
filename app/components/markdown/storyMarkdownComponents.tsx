"use client"

import type { Components } from "react-markdown"
import { StoryImage } from "@/app/components/story/StoryImage"
import { VimeoEmbed } from "@/app/components/story/VimeoEmbed"
import { StorySectionDivider } from "@/app/components/story/StorySectionDivider"
import {
  BaseLinkComponent,
  baseTextClasses,
  baseSpacingClasses,
  baseOpacityClasses
} from "./markdownBaseStyles"

/**
 * ============================================================================
 * STORY MARKDOWN COMPONENTS - app/components/markdown/storyMarkdownComponents.tsx
 * ============================================================================
 *
 * Story-specific markdown components with rich media support.
 * Extends base markdown styling (from markdownBaseStyles) with:
 * - Image support with blur-on-load and captions (StoryImage)
 * - Vimeo video embeds (VimeoEmbed)
 * - Beautiful section dividers (StorySectionDivider)
 * - Paragraph detection for proper image wrapping
 *
 * STYLING:
 * Uses unified base styles (spacing, opacity, typography) for consistency
 * with regular articles, while adding story-specific features.
 *
 * Used by:
 * - app/components/page-specific/SideTray.tsx (when API path includes /story)
 */

/**
 * Detects if a URL is a Vimeo URL
 */
function isVimeoUrl(url: string): boolean {
  return url.includes("vimeo.com")
}
export const storyMarkdownComponents: Components = {
  // Headings - section titles for story
  h1: ({ children }) => (
    <h1 className="font-edu-marist text-sm font-normal text-foreground tracking-wide mb-4 mt-10 first:mt-0 transition-colors duration-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-edu-marist text-xs font-normal text-foreground/90 mb-3 mt-8 transition-colors duration-200">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-edu-marist text-xs font-medium text-foreground/80 mb-2 mt-6 transition-colors duration-200">
      {children}
    </h3>
  ),

  // Body text
  p: ({ children, node }) => {
    // Check if paragraph contains only an image
    const hasOnlyImage =
      node?.children?.length === 1 &&
      node?.children[0]?.type === "element" &&
      (node?.children[0] as { tagName?: string })?.tagName === "img"

    if (hasOnlyImage) {
      return <>{children}</>
    }

    return (
      <p className="text-xs text-muted-foreground mb-4 leading-[1.9] transition-colors duration-200">
        {children}
      </p>
    )
  },

  // Lists - unified spacing with base styles
  ul: ({ children }) => (
    <ul className={`${baseTextClasses.body} ${baseSpacingClasses.list} list-disc list-outside`}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={`${baseTextClasses.body} ${baseSpacingClasses.list} list-decimal list-outside`}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className={`${baseTextClasses.body} ${baseSpacingClasses.listItem}`}>
      {children}
    </li>
  ),

  // Links - unified component from base styles
  a: BaseLinkComponent,

  // Images - with blur-on-load and optional caption
  img: ({ src, alt, title }) => {
    // Check if this is a Vimeo embed
    if (alt === "vimeo" && src && isVimeoUrl(src)) {
      return <VimeoEmbed url={src} />
    }

    return (
      <StoryImage
        src={src || ""}
        alt={alt || ""}
        caption={title} // Use title attribute for caption: ![alt](src "caption")
      />
    )
  },

  // Section dividers
  hr: () => <StorySectionDivider />,

  // Blockquotes - unified with opacity hierarchy
  blockquote: ({ children }) => (
    <blockquote className={`${baseTextClasses.body} border-l border-border/40 pl-4 ${baseSpacingClasses.blockquote} ${baseOpacityClasses.secondary} italic`}>
      {children}
    </blockquote>
  ),

  // Code - unified with opacity hierarchy
  code: ({ children }) => (
    <code className={`${baseTextClasses.code} bg-muted/80 px-1.5 py-0.5 rounded ${baseOpacityClasses.code}`}>
      {children}
    </code>
  ),

  // Strong/emphasis
  strong: ({ children }) => (
    <strong className="font-medium text-foreground/90 transition-colors duration-200">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
}
