export type ContactLinkId = "linkedin" | "email" | "x"

export interface ContactLink {
  id: ContactLinkId
  label: string
  navLabel: string
  href: string
  ariaLabel: string
  external?: boolean
}

export const CONTACT_LINKS: Record<ContactLinkId, ContactLink> = {
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    navLabel: "LinkedIn",
    href: "https://www.linkedin.com/in/raffaelevitaledesign",
    ariaLabel: "Raf on LinkedIn",
    external: true,
  },
  email: {
    id: "email",
    label: "raf@raf.works",
    navLabel: "Email",
    href: "mailto:raf@raf.works",
    ariaLabel: "Email Raf",
  },
  x: {
    id: "x",
    label: "X",
    navLabel: "X",
    href: "https://x.com/rafdotworks",
    ariaLabel: "Raf on X",
    external: true,
  },
}

export const CONTACT_LINK_ITEMS = [
  CONTACT_LINKS.linkedin,
  CONTACT_LINKS.email,
  CONTACT_LINKS.x,
] as const
