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
          text: "I spent the first 20 years of my life in the Amalfi Coast, Italy.",
          isHighlighted: true,
        },
        {
            text: "I started in design from software engineer + hospitality excellence through curiosity and obligation.",
          },
        {
          text: "I care about clarity, systems, and the stories products tell.",
        },
       
        // {
        //   text: "What makes things feel right?",
        //   isEmphasized: true,
        // },
        {
          text: "You can find me on {linkedin}, on {x}, and always via email at {email}.",

        },
      ],
    },
    {
      title: "Craft",
      paragraphs: [
        {
          text: "Eight years designing and engineering products that connect logic with feeling.",
          isHighlighted: true,
        },
        {
          text: "Built systems, shaped languages, scaled products.",
        },
        {
          text: "I most recently built at Coinbase, Voiceflow, Theoriq, Zalando and many more startups.",
        },
        {
          text: "2025 has been a year of exploration working as a designer and engineer across new surfaces and technologies.",
        },
        
      ],
    },
    {
      title: "Presence",
      paragraphs: [
        {
          text: "I’m based in Toronto, Canada and frequently in Lisbon and NYC.",
          isHighlighted: true,
        },
        {
          text: "I enjoy thoughtful workspaces. How they influence focus, energy, and flow.",
        },
        {
          text: "I'm usually on a yoga mat. I've been vegetarian for as long as I can remember.",
        },
        {
          text: "Personality-wise, I'm an ENTJ, a Red–Yellow on the Color Code, and an Enneagram 8.",
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
      href: "https://x.com/lfgraf",
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
    "Work hard, be kind, spread joy.",
    "How you do anything is how you do everything.",
    "What feels right > what charts well.",
    "Always happy, never satisfied.",
  ],
};

