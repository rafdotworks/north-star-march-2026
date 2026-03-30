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
  "type-caption inline-flex w-fit text-inherit visited:text-inherit hover:text-inherit focus-visible:text-inherit active:text-inherit no-underline opacity-80 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"

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
      style={{
        color: "inherit",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </a>
  )
}

export default memo(FooterLink)
