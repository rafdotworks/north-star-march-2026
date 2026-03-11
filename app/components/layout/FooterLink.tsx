/**
 * ============================================================================
 * FOOTER LINK - app/components/layout/FooterLink.tsx
 * ============================================================================
 *
 * Muted caption-style link with optional external icon (desktop). Used in footer
 * and hero contact row for LinkedIn, Email, X.
 *
 * EXPORTS: default FooterLink (memoized)
 * FEATURES: optional className, external target/rel, aria-label from label
 * USAGE: app/page.tsx (hero nav, footer nav)
 */

"use client"

import React, { memo } from "react"
import { ExternalLinkIcon } from "@/app/components/icons/ExternalLinkIcon"

interface FooterLinkProps {
  href: string
  label: string
  ariaLabel?: string
  external?: boolean
  fontFamily?: "accent" | "body"
  /** Optional: e.g. "block w-full flex justify-end" for right-aligned text in hero/footer */
  className?: string
}

const baseClasses =
  "type-caption group/link inline-flex items-center gap-1 w-fit text-muted-foreground/40 md:group-hover/nav:text-muted-foreground/15 hover:!text-muted-foreground visited:text-muted-foreground/40 md:group-hover/nav:visited:text-muted-foreground/15 active:text-muted-foreground focus-visible:text-muted-foreground/40 transition-colors duration-150 focus:outline-none"

const fontFamilyClasses = {
  accent: "font-edu-marist",
  body: "font-sans",
} as const

function FooterLink({ href, label, ariaLabel, external = false, fontFamily = "accent", className }: FooterLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${baseClasses} ${fontFamilyClasses[fontFamily]}${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel || label}
    >
      {label}
      <ExternalLinkIcon
        size={10}
        className="hidden md:block w-[8px] h-[8px] opacity-0 -ml-0.5 group-hover/link:opacity-100 group-hover/link:ml-0 group-hover/link:animate-pulse-subtle transition-[margin,opacity] duration-300"
      />
    </a>
  )
}

export default memo(FooterLink)
