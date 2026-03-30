"use client"

import React, { memo } from "react"

/**
 * Hero/tray identity underline: quiet by default and slightly clearer on hover.
 * Never shifts link color; hover feedback is underline/opacity only.
 */
export const HERO_UNDERLINE_CLASSES =
  "text-inherit visited:text-inherit hover:text-inherit focus:text-inherit focus-visible:text-inherit active:text-inherit underline underline-offset-2 [text-decoration-color:color-mix(in_srgb,currentColor_22%,transparent)] hover:[text-decoration-color:color-mix(in_srgb,currentColor_38%,transparent)] focus:[text-decoration-color:color-mix(in_srgb,currentColor_38%,transparent)] focus-visible:[text-decoration-color:color-mix(in_srgb,currentColor_38%,transparent)] transition-[text-decoration-color,opacity] duration-150 hover:opacity-[0.92] focus:opacity-[0.92] focus-visible:opacity-[0.92] focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:[box-shadow:none] focus-visible:[box-shadow:none]"

/**
 * Shared class string for quiet inline links that should feel close to the
 * surrounding body copy. Used by company links in hero/tray/modal content.
 */
export const MINIMAL_TEXT_LINK_CLASSES =
  "cursor-pointer text-inherit visited:text-inherit hover:text-inherit focus-visible:text-inherit active:text-inherit underline underline-offset-2 [text-decoration-color:color-mix(in_srgb,currentColor_14%,transparent)] hover:[text-decoration-color:color-mix(in_srgb,currentColor_32%,transparent)] focus-visible:[text-decoration-color:color-mix(in_srgb,currentColor_32%,transparent)] transition-[text-decoration-color,opacity] duration-150 focus-visible:outline-none"

interface InlineExternalLinkProps {
  href: string
  children: React.ReactNode
  /** When "subtle", keeps the link visually close to surrounding body copy. */
  underlineStyle?: "default" | "subtle"
}

function InlineExternalLink({ href, children, underlineStyle = "default" }: InlineExternalLinkProps) {
  const linkClassName =
    underlineStyle === "subtle"
      ? MINIMAL_TEXT_LINK_CLASSES
      : MINIMAL_TEXT_LINK_CLASSES

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClassName}
      style={{
        WebkitTapHighlightColor: "transparent",
        color: "inherit",
        fontSize: "inherit",
        fontWeight: "inherit",
        lineHeight: "inherit",
      }}
    >
      {children}
    </a>
  )
}

export default memo(InlineExternalLink)
