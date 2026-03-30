/**
 * ============================================================================
 * ABOUT MODAL CONTENT - Localized copy for "About Raf" modal
 * ============================================================================
 *
 * Centralized content for the About modal that appears when clicking "Raf V."
 * Structured for easy localization and future translations.
 */

import { COMPANY_LINKS } from "@/app/config/companyLinks";
import { CONTACT_LINKS } from "@/app/config/contactLinks";

export interface AboutModalSection {
  title: string;
  paragraphs: Array<{
    text: string;
    isHighlighted?: boolean; // For paragraphs with font-medium styling
    isEmphasized?: boolean; // For italicized text
  }>;
}

export interface AboutModalLink {
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface AboutModalContent {
  sections: AboutModalSection[];
  contactLinks: {
    linkedin: AboutModalLink;
    x: AboutModalLink;
    email: AboutModalLink;
    blueprint: AboutModalLink;
  };
  companyLinks: {
    walmart: AboutModalLink;
    theoriq: AboutModalLink;
    coinbase: AboutModalLink;
    voiceflow: AboutModalLink;
    zalando: AboutModalLink;
  };
  principles: string[];
}

/**
 * ABOUT_BIO_COPY: Canonical sentence-level copy shared across the About tray,
 * mobile hero summary, modal content, and /api/me bio.
 */
export const ABOUT_BIO_COPY = {
  lead: "Hello, call me Raf. I am grateful to call myself a builder and a designer.",
  path:
    "I grew up between computers and the Amalfi Coast, Italy, studied engineering in Naples, then found my way to design through hospitality, brand, and the web.",
  currentRole:
    "Today I design AI product systems at {walmart}, helping sellers understand recommendations, make decisions, and act with confidence at scale. I have other smaller AI initiatives I contribute to.",
  previousRole:
    "Before that: Founding Designer at {theoriq}. Developer tools at {coinbase}. Growth at {voiceflow}. Design systems at {zalando}. A decade of independent work across crypto, fintech, and developer tools.",
  location: "I am based in Toronto, Canada and frequently in Lisbon, Portugal and Brooklyn, New York. I don't work from coffee shops. I deeply believe in the power of working in person.",
  outsideWork:
    "Outside work, I {write}, {photograph}, and chase light everywhere I go. I am inspired by office spaces, architecture, and teaching vinyasa yoga.",
  mobileCurrentRole: "Designing AI product systems at {walmart}.",
  mobilePreviousRole:
    "Previously {theoriq}, {coinbase}, {voiceflow}, {zalando}, and independent work across crypto, developer tools and more.",
} as const;

/**
 * ABOUT_MODAL_CONTENT: All copy for the About Raf modal
 * Structure: 4 sections (Origins, Craft, Presence, Principles)
 */
export const ABOUT_MODAL_CONTENT: AboutModalContent = {
  sections: [
    {
      title: "Origins",
      paragraphs: [
        {
          text: ABOUT_BIO_COPY.lead,
          isHighlighted: true,
        },
        {
          text: ABOUT_BIO_COPY.path,
        },
      ],
    },
    {
      title: "Craft",
      paragraphs: [
        {
          text: ABOUT_BIO_COPY.currentRole,
          isHighlighted: true,
        },
        {
          text: ABOUT_BIO_COPY.previousRole,
        },
      ],
    },
    {
      title: "Presence",
      paragraphs: [
        {
          text: ABOUT_BIO_COPY.location,
          isHighlighted: true,
        },
        {
          text: ABOUT_BIO_COPY.outsideWork,
        },
      ],
    },
    {
      title: "Principles",
      paragraphs: [],
    },
  ],
  contactLinks: {
    linkedin: {
      label: CONTACT_LINKS.linkedin.label,
      href: CONTACT_LINKS.linkedin.href,
      ariaLabel: CONTACT_LINKS.linkedin.ariaLabel,
    },
    x: {
      label: CONTACT_LINKS.x.label,
      href: CONTACT_LINKS.x.href,
      ariaLabel: CONTACT_LINKS.x.ariaLabel,
    },
    email: {
      label: CONTACT_LINKS.email.label,
      href: CONTACT_LINKS.email.href,
      ariaLabel: CONTACT_LINKS.email.ariaLabel,
    },
    blueprint: {
      label: "Blueprint",
      href: "/blueprint",
      ariaLabel: "Blueprint",
    },
  },
  companyLinks: {
    walmart: {
      label: "Walmart",
      href: COMPANY_LINKS.walmart,
      ariaLabel: "Walmart",
    },
    theoriq: {
      label: "Theoriq",
      href: COMPANY_LINKS.theoriq,
      ariaLabel: "Theoriq",
    },
    coinbase: {
      label: "Coinbase",
      href: COMPANY_LINKS.coinbase,
      ariaLabel: "Coinbase",
    },
    voiceflow: {
      label: "Voiceflow",
      href: COMPANY_LINKS.voiceflow,
      ariaLabel: "Voiceflow",
    },
    zalando: {
      label: "Zalando",
      href: COMPANY_LINKS.zalando,
      ariaLabel: "Zalando",
    },
  },
  principles: [],
};

/**
 * MOBILE_HERO_COPY: Inline hero text for mobile only (no About tray trigger).
 * Mix of current hero role + About modal (Origins, Craft, Presence).
 * Used by: app/page.tsx for mobile hero content.
 */
export const MOBILE_HERO_COPY = {
  name: "Raf V.",
  summaryPrimary: ABOUT_BIO_COPY.mobileCurrentRole,
  summarySecondary: ABOUT_BIO_COPY.mobilePreviousRole,
  location: ABOUT_BIO_COPY.location,
  outsideWork: ABOUT_BIO_COPY.outsideWork,
} as const;
