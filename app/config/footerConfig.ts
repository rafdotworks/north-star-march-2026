/**
 * ============================================================================
 * FOOTER CONFIGURATION
 * ============================================================================
 *
 * Centralized configuration for footer content displayed on the homepage.
 * Contains bio information and writing principles.
 *
 * This file is imported by:
 * - app/page.tsx (for rendering footer content)
 *
 * STRUCTURE:
 * - bio: Personal and professional information with optional secondary styling
 * - location: Current location details and travel plans
 * - writing: Principles and philosophy displayed in footer
 *
 * TO UPDATE CONTENT:
 * Simply edit the FOOTER_CONFIG constant below. Changes will automatically
 * reflect on the homepage footer.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Bio paragraph with optional secondary styling.
 */
export interface BioParagraph {
  text: string;
  /**
   * If true, adds opacity-80 styling for secondary emphasis.
   * Used for supporting statements after the main experience text.
   */
  isSecondary?: boolean;
  /**
   * Optional custom font size for the paragraph.
   * - 'sm': 14px (default body text)
   * - 'xs': 12px (de-emphasized text)
   * - '2xs': 10px (minimal text)
   */
  fontSize?: 'sm' | 'xs' | '2xs';
}

/**
 * Location information including future plans and origin.
 */
export interface LocationInfo {
  futureMove: string;
  origin: string;
  currentBases: Array<{
    city: string;
    /**
     * If true, renders with line-through and opacity-50 (previous locations).
     * Used to show past locations while highlighting current location.
     */
    isPrevious?: boolean;
  }>;
}

/**
 * Writing principle with roman numeral identifier.
 */
export interface WritingPrinciple {
  /** Roman numeral (I, II, III, etc.) */
  number: string;
  text: string;
}

/**
 * Complete footer configuration structure.
 */
export interface FooterConfig {
  bio?: {
    /** Section header label */
    sectionLabel: string;
    /** Array of bio paragraphs */
    paragraphs: BioParagraph[];
  };
  location?: {
    /** Section header label */
    sectionLabel: string;
    /** Location details */
    info: LocationInfo;
  };
  writing: {
    /** Section header label (clickable - opens SideTray) */
    sectionLabel: string;
    /** Writing principles displayed in footer */
    principles: WritingPrinciple[];
  };
}

// ============================================================================
// FOOTER CONTENT
// ============================================================================

/**
 * Footer configuration - all content for the homepage footer.
 *
 * This constant contains:
 * - Bio section with experience and philosophy
 * - Location section with current/future plans
 * - Writing section with principles
 */
export const FOOTER_CONFIG: FooterConfig = {
  bio: {
    sectionLabel: "About",
    paragraphs: [
      {
        text: "Staff AI UX Designer at Walmart, currently designing AI recommendation systems at marketplace scale.",
        isSecondary: false,
      },
      {
        text: "Previously: AI design for Obvious, founding designer at Theoriq (agent frameworks), senior roles at Voiceflow (AI agents) and Coinbase (developer tools).",
        isSecondary: true,
      },
      {
        text: "Earlier: design systems at Zalando, accessibility platform at CurbCutOS, early-stage SaaS and web3. Started in engineering, moved to design.",
        isSecondary: true,
        fontSize: 'xs',
      },
    ],
  },

  location: {
    sectionLabel: "Location",
    info: {
      futureMove: "Relocating.",
      origin: "Born on the Amalfi Coast, Italy, in the 90s.",
      currentBases: [
        { city: "Lisbon", isPrevious: true },
        { city: "NYC", isPrevious: true },
        { city: "Toronto, Canada", isPrevious: false },
      ],
    },
  },

  writing: {
    sectionLabel: "Writings",
    principles: [
      { number: "I", text: "Progress over movement." },
      { number: "II", text: "How you do anything is how you do everything." },
      { number: "III", text: "Calm joy. Yoga mats. Quiet places." },
    ],
  },
};
