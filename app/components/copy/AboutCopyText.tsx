"use client"

import React from "react"

import InlineExternalLink from "@/app/components/layout/InlineExternalLink"
import {
  ABOUT_COPY_COMPANY_LINKS,
  ABOUT_COPY_TOKEN_REGEX,
  ABOUT_COPY_TOKEN_TEXT,
  type AboutActionToken,
  type AboutCopyToken,
  isAboutActionToken,
} from "@/app/lib/aboutCopyTokens"

interface RenderAboutCopyTextOptions {
  renderActionToken?: (token: AboutActionToken) => React.ReactNode
}

export function renderAboutCopyText(
  text: string,
  { renderActionToken }: RenderAboutCopyTextOptions = {},
): React.ReactNode {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let tokenIndex = 0
  let match: RegExpExecArray | null

  while ((match = ABOUT_COPY_TOKEN_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const token = match[1] as AboutCopyToken

    if (isAboutActionToken(token)) {
      parts.push(
        <React.Fragment key={`about-copy-token-${tokenIndex++}`}>
          {renderActionToken ? renderActionToken(token) : ABOUT_COPY_TOKEN_TEXT[token]}
        </React.Fragment>,
      )
    } else {
      const companyLink = ABOUT_COPY_COMPANY_LINKS[token]
      parts.push(
        <InlineExternalLink
          key={`about-copy-token-${tokenIndex++}`}
          href={companyLink.href}
          underlineStyle={companyLink.underlineStyle}
        >
          {companyLink.label}
        </InlineExternalLink>,
      )
    }

    lastIndex = ABOUT_COPY_TOKEN_REGEX.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
