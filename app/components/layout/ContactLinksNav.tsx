"use client"

import FooterLink from "@/app/components/layout/FooterLink"
import { CONTACT_LINK_ITEMS } from "@/app/config/contactLinks"

interface ContactLinksNavProps {
  ariaLabel: string
  className: string
  linkClassName?: string
}

export default function ContactLinksNav({
  ariaLabel,
  className,
  linkClassName,
}: ContactLinksNavProps) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      {CONTACT_LINK_ITEMS.map((link) => (
        <FooterLink
          key={link.id}
          href={link.href}
          label={link.navLabel}
          ariaLabel={link.ariaLabel}
          external={link.external}
          fontFamily="body"
          className={linkClassName}
        />
      ))}
    </nav>
  )
}
