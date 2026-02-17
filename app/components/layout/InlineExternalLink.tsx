"use client"

import React, { memo } from "react"

/**
 * Shared class string for "subtle underline" hover: underline always present,
 * decoration color transparent by default, fades in on hover. Used by Raf V.,
 * Previously… links, and SideTray write/Raf V. for consistent hero/tray link styling.
 */
export const SUBTLE_UNDERLINE_CLASSES =
  "underline underline-offset-2 [text-decoration-color:transparent] hover:[text-decoration-color:color-mix(in_srgb,currentColor_50%,transparent)] transition-[text-decoration-color] duration-300 ease-out"

interface InlineExternalLinkProps {
  href: string
  children: React.ReactNode
  /** When "subtle", uses same underline fade-in/out as Raf V. (hero/tray consistency). */
  underlineStyle?: "default" | "subtle"
}

function InlineExternalLink({ href, children, underlineStyle = "default" }: InlineExternalLinkProps) {
  const isSubtle = underlineStyle === "subtle"
  const linkClassName = isSubtle
    ? `cursor-pointer ${SUBTLE_UNDERLINE_CLASSES}`
    : "cursor-pointer transition-[opacity] duration-200 hover:opacity-100 hover:underline no-underline"

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
