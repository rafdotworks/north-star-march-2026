/**
 * ============================================================================
 * MARKDOWN COMPONENTS - app/components/markdown/markdownComponents.tsx
 * ============================================================================
 * 
 * Custom ReactMarkdown components for consistent typography across the app.
 * Overrides default markdown rendering to match the design system.
 * 
 * USAGE:
 * ```tsx
 * import { markdownComponents } from "@/app/components/markdown/markdownComponents"
 * import ReactMarkdown from "react-markdown"
 * 
 * <ReactMarkdown components={markdownComponents}>
 *   {markdownContent}
 * </ReactMarkdown>
 * ```
 * 
 * FEATURES:
 * - Consistent text sizes and spacing
 * - Theme-aware colors (foreground, muted-foreground)
 * - Smooth color transitions
 * - External link detection with icon
 * - Accessible semantic HTML
 */

import type { Components } from "react-markdown"
import { ExternalLink } from "lucide-react"

/**
 * Custom ReactMarkdown components for consistent typography.
 * 
 * TYPOGRAPHY SCALE:
 * - h1: text-base (16px) - Main headings
 * - h2: text-sm (14px) - Section headings
 * - h3: text-xs (12px) - Subsection headings
 * - p, li: text-xs (12px) - Body text
 * - code: text-[10px] (10px) - Inline code
 * 
 * EXTERNAL LINK DETECTION:
 * Automatically detects http:// and https:// links and:
 * - Opens in new tab (target="_blank")
 * - Adds security attributes (rel="noopener noreferrer")
 * - Shows external link icon on hover (desktop only)
 */
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-base font-light text-foreground tracking-wider mb-6 mt-8 transition-colors duration-200">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-normal text-foreground/90 mb-4 mt-7 transition-colors duration-200">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-medium text-foreground/80 mb-3 mt-5 transition-colors duration-200">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-xs text-muted-foreground mb-4 leading-[1.5] transition-colors duration-200">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-xs text-muted-foreground mb-4 ml-4 space-y-2 list-disc list-inside transition-colors duration-200">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-xs text-muted-foreground mb-4 ml-4 space-y-2 list-decimal list-inside transition-colors duration-200">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">{children}</li>
  ),
  a: ({ href, children }) => {
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
          <ExternalLink size={12} className="hidden md:block w-[10px] h-[10px] opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
        )}
      </a>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="text-xs text-muted-foreground border-l-2 border-border pl-3 my-4 italic transition-colors duration-200">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="text-[10px] bg-muted px-1 py-0.5 rounded text-foreground font-mono transition-colors duration-200">
      {children}
    </code>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground transition-colors duration-200">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-border my-6 transition-colors duration-200" />
}

