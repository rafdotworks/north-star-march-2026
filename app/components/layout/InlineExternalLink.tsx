"use client"

import React, { memo } from "react"

interface InlineExternalLinkProps {
  href: string
  children: React.ReactNode
}

function InlineExternalLink({ href, children }: InlineExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer transition-all duration-200 hover:opacity-100 hover:underline no-underline"
      style={{
        WebkitTapHighlightColor: 'transparent',
        color: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit'
      }}
    >
      {children}
    </a>
  )
}

export default memo(InlineExternalLink)
