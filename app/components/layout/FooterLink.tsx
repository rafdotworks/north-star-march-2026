"use client"

import React, { memo } from "react"
import { ExternalLinkIcon } from "@/app/components/icons/ExternalLinkIcon"

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
      className="type-caption font-edu-marist group/link inline-flex items-center gap-1 w-fit text-muted-foreground/40 md:group-hover/nav:text-muted-foreground/15 hover:!text-muted-foreground visited:text-muted-foreground/40 md:group-hover/nav:visited:text-muted-foreground/15 active:text-muted-foreground focus-visible:text-muted-foreground/40 transition-colors duration-150 focus:outline-none"
      aria-label={ariaLabel || label}
    >
      {label}
      <ExternalLinkIcon
        size={10}
        className="hidden md:block w-[8px] h-[8px] opacity-0 -ml-0.5 group-hover/link:opacity-100 group-hover/link:ml-0 group-hover/link:animate-pulse-subtle transition-[margin] duration-300"
      />
    </a>
  )
}

export default memo(FooterLink)
