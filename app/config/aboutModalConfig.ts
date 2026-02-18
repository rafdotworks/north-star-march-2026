/**
 * ============================================================================
 * ABOUT MODAL CONTENT - Localized copy for "About Raf" modal
 * ============================================================================
 *
 * Centralized content for the About modal that appears when clicking "Raf V."
 * Structured for easy localization and future translations.
 */

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
  principles: string[];
}

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
          text: "Hello, I am Raf. I've been shipping code since before the tooling made it easy.",
          isHighlighted: true,
        },
        {
          text: "Grew up on the Amalfi Coast. Based in Toronto.",
        },
        {
          text: "You can find me on {linkedin}, on {x}, and at {email}.",
        },
      ],
    },
    {
      title: "Craft",
      paragraphs: [
        {
          text: "Studied software engineering in Naples, then moved into design where I won some awards. My career began in hospitality, brand and web design. Early on, an internship at Apple as a UX/UI Designer.",
          isHighlighted: true,
        },
        {
          text: "I was most recently Founding designer at Theoriq, leading all the product design, design engineering front-end and marketing efforts. Before that, Obvious, Coinbase, Voiceflow, and more.",
        },
        {
          text: "I care about systems that feel fast, logical, and respectful of attention.",
        },
      ],
    },
    {
      title: "Presence",
      paragraphs: [
        {
          text: "I write, photograph, and spend time on a yoga mat or chasing light through workspaces.",
          isHighlighted: true,
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
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/raffaelevitaledesign",
      ariaLabel: "Raf on LinkedIn",
    },
    x: {
      label: "X",
      href: "https://x.com/rafdotworks",
      ariaLabel: "Raf on X",
    },
    email: {
      label: "raf@raf.works",
      href: "mailto:raf@raf.works",
      ariaLabel: "Email Raf",
    },
    blueprint: {
      label: "Blueprint",
      href: "/blueprint",
      ariaLabel: "Blueprint",
    },
  },
  principles: [
    "Systems that feel fast, logical, and respectful of attention.",
  ],
};
