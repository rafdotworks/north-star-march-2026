"use client"

import React, { memo } from "react"
import { ExternalLink } from "lucide-react"

interface FooterLinkProps {
  href: string
  label: string
  ariaLabel?: string
  external?: boolean
}

function FooterLink({ href, label, ariaLabel, external = false }: FooterLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="type-link group/link inline-flex items-center gap-1 md:group-hover/nav:text-muted-foreground/30 md:hover:!text-muted-foreground/60 visited:text-muted-foreground/40 active:text-muted-foreground/60 focus:text-muted-foreground/40 focus:outline-none"
      aria-label={ariaLabel || label}
      style={{
        WebkitTapHighlightColor: 'transparent',
        transition: 'color var(--theme-transition-duration, 2s) var(--theme-transition-easing, ease)'
      }}
    >
      {label}
      <ExternalLink
        size={10}
        className="hidden md:block w-[8px] h-[8px] opacity-0 -ml-0.5 group-hover/link:opacity-50 group-hover/link:ml-0 transition-all duration-300"
      />
    </a>
  )
}

export default memo(FooterLink)
