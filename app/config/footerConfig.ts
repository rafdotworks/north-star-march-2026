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
        text: "Senior AI Product Designer at Walmart Seller",
        isSecondary: false,
      },
      {
        text: ", currently designing AI recommendation systems at marketplace scale.",
        isSecondary: true,
      },
      // {
      //   text: "I design AI interfaces that handle uncertainty, building trust in high-stakes systems where models can be wrong.",
      //   isSecondary: true,
      // },
      // {
      //   text: "9+ years designing high-leverage systems across startups and public companies.",
      //   isSecondary: true,
      // },
    ],
  },

  location: {
    sectionLabel: "Location",
    info: {
      futureMove: "Relocating to London, UK.",
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
