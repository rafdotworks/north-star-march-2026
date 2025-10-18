/**
 * Typography system for slides
 * Based on Ronzino aesthetic from app/new
 */

export const slideTypography = {
  // Font sizes for slides (larger for presentation)
  sizes: {
    display: "text-4xl md:text-6xl", // Cover/main titles
    title: "text-2xl md:text-4xl", // Section titles
    heading: "text-xl md:text-2xl", // Slide headings
    subheading: "text-base md:text-lg",
    body: "text-sm md:text-base",
    small: "text-xs md:text-sm",
    tiny: "text-[10px] md:text-xs",
  },

  // Line heights
  leading: {
    tight: "leading-tight",
    snug: "leading-snug",
    relaxed: "leading-relaxed",
    loose: "leading-loose",
  },

  // Letter spacing
  tracking: {
    tight: "tracking-tight",
    normal: "tracking-[-0.01em]",
    wide: "tracking-wide",
  },

  // Font weights
  weights: {
    normal: "font-normal",
    medium: "font-medium",
  },

  // Font families
  families: {
    heading: "font-ronzino", // Matches site
    body: "",
  },
} as const;

export const slideOpacity = {
  primary: "text-foreground",
  secondary: "text-foreground/70",
  tertiary: "text-foreground/50",
  subtle: "text-foreground/30",
} as const;

export const slideSpacing = {
  slide: {
    padding: "px-8 py-12 md:px-16 md:py-16",
    minHeight: "min-h-[70vh] md:min-h-[80vh]",
  },
  sections: {
    small: "space-y-4",
    medium: "space-y-6",
    large: "space-y-8",
  },
} as const;
