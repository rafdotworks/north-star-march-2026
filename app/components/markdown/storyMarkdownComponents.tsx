"use client"

import type { Components } from "react-markdown"
import { ExternalLinkIcon } from "@/app/components/icons/ExternalLinkIcon"
import { StoryImage } from "@/app/components/story/StoryImage"
import { VimeoEmbed } from "@/app/components/story/VimeoEmbed"
import { StorySectionDivider } from "@/app/components/story/StorySectionDivider"

/**
 * Detects if a URL is a Vimeo URL
 */
function isVimeoUrl(url: string): boolean {
  return url.includes("vimeo.com")
}

/**
 * Story-specific markdown components
 *
 * Extends base markdown components with:
 * - Image support with blur-on-load and captions
 * - Vimeo video embeds
 * - Beautiful section dividers
 */
export const storyMarkdownComponents: Components = {
  // Headings - section titles for story
  h1: ({ children }) => (
    <h1 className="text-sm font-normal text-foreground tracking-wide mb-4 mt-10 first:mt-0 transition-colors duration-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xs font-normal text-foreground/90 mb-3 mt-8 transition-colors duration-200">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-medium text-foreground/80 mb-2 mt-6 transition-colors duration-200">
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
      <p className="text-xs text-muted-foreground mb-4 leading-[1.6] transition-colors duration-200">
        {children}
      </p>
    )
  },

  // Lists
  ul: ({ children }) => (
    <ul className="text-xs text-muted-foreground mb-4 ml-4 space-y-1.5 list-disc list-outside transition-colors duration-200">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-xs text-muted-foreground mb-4 ml-4 space-y-1.5 list-decimal list-outside transition-colors duration-200">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-xs text-muted-foreground leading-[1.6] transition-colors duration-200 pl-1">
      {children}
    </li>
  ),

  // Links
  a: ({ href, children }) => {
    const isExternal =
      href?.startsWith("http://") || href?.startsWith("https://")
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="group/link inline-flex items-center gap-1 text-xs text-muted-foreground md:hover:!text-foreground transition-colors duration-200"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {children}
        {isExternal && (
          <ExternalLinkIcon
            size={10}
            className="hidden md:block opacity-0 md:group-hover/link:opacity-70 transition-opacity duration-200"
          />
        )}
      </a>
    )
  },

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

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="text-xs text-muted-foreground border-l border-border/50 pl-4 my-6 italic transition-colors duration-200">
      {children}
    </blockquote>
  ),

  // Code
  code: ({ children }) => (
    <code className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-foreground font-mono transition-colors duration-200">
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
