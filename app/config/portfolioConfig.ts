/**
 * ============================================================================
 * PORTFOLIO CONFIGURATION - app/config/portfolioConfig.ts
 * ============================================================================
 *
 * Centralized configuration for the portfolio homepage.
 * Contains all constants, project data, and UI configuration.
 *
 * This file is imported by:
 * - app/page.tsx (main page component)
 * - app/utils/portfolioUtils.ts (helper functions)
 * - Future extracted components and hooks
 */

// ============================================================================
// TIMING & INTERACTION CONSTANTS
// ============================================================================

/**
 * Debounce time for carousel navigation clicks to prevent rapid clicking.
 * 
 * @remarks
 * Prevents users from accidentally triggering multiple navigation events
 * when clicking quickly. Applied to both left/right click zones.
 * 
 * @default 300ms
 */
export const NAVIGATION_DEBOUNCE = 300;

/**
 * Speed of auto-preview animation - time per image transition.
 * 
 * @remarks
 * Controls how fast the carousel cycles through images during the initial
 * preview sequence. Lower values = faster preview.
 * 
 * @default 120ms per image
 */
export const PREVIEW_SPEED = 120;

/**
 * Number of complete loops through all images in the preview sequence.
 * 
 * @remarks
 * The preview animation cycles through all images this many times before
 * settling on the first image. Set to 1 for a single pass.
 * 
 * @default 1 loop
 */
export const PREVIEW_LOOPS = 1;

/**
 * Delay before settling after preview animation completes.
 * 
 * @remarks
 * Brief pause after preview finishes before marking preview as complete.
 * Allows animation to settle visually.
 * 
 * @default 200ms
 */
export const PREVIEW_SETTLE_DELAY = 200;

// ============================================================================
// IMAGE LOADING STRATEGY CONSTANTS
// ============================================================================

/**
 * Number of images to load immediately on initial page load (critical content).
 * 
 * @remarks
 * These are the first images shown to users. Loaded with priority="true"
 * and loading="eager" for fastest initial render.
 * 
 * @default 4 images
 */
export const INITIAL_IMAGE_COUNT = 4;

/**
 * Total number of images to preload eagerly after initial load.
 * 
 * @remarks
 * Images loaded after INITIAL_IMAGE_COUNT, but still eagerly (not lazy).
 * Helps ensure smooth carousel navigation without waiting.
 * 
 * @default 4 images (total of 8 images loaded eagerly)
 */
export const PRELOAD_IMAGE_COUNT = 4;

/**
 * How many images ahead to preload during carousel navigation (adaptive lookahead).
 * 
 * @remarks
 * When user navigates, we preload this many images in the direction of travel.
 * Higher values = smoother navigation but more bandwidth usage.
 * 
 * @default 3 images ahead
 */
export const PRELOAD_LOOKAHEAD = 3;

/**
 * Maximum time to wait for individual image loads before timeout.
 * 
 * @remarks
 * If an image doesn't load within this time, it's considered failed and
 * retry logic kicks in. Prevents infinite waiting on slow connections.
 * 
 * @default 8000ms (8 seconds)
 */
export const IMAGE_LOAD_TIMEOUT = 8000;

/**
 * Number of retry attempts for failed image loads with exponential backoff.
 * 
 * @remarks
 * Failed images will retry this many times with increasing delays:
 * 1st retry: 1s delay, 2nd retry: 2s delay, etc.
 * 
 * @default 2 retries
 */
export const IMAGE_RETRY_ATTEMPTS = 2;

/**
 * Image quality for Next.js Image optimization (1-100, higher = better quality).
 * 
 * @remarks
 * Controls the quality of optimized images. Higher values = better quality
 * but larger file sizes. Balance between quality and performance.
 * 
 * @default 85 (good quality-to-size ratio)
 */
export const IMAGE_QUALITY = 85;

// ============================================================================
// CONTACT & UI CONSTANTS
// ============================================================================

/**
 * Primary email contact link.
 * 
 * @remarks
 * Used in mobile footer contact links and potentially other places.
 */
export const EMAIL_CONTACT_LINK = "mailto:raf@raf.works";

/**
 * Mobile footer contact links (visible at bottom of mobile view).
 * 
 * @remarks
 * Array of contact links shown in the mobile end panel. Each link includes:
 * - href: URL to navigate to
 * - label: Display text
 * - ariaLabel: Accessible label for screen readers
 * - openInNewTab: Whether to open in new tab (for external links)
 * 
 * @example
 * ```tsx
 * {MOBILE_CONTACT_LINKS.map(link => (
 *   <a href={link.href} aria-label={link.ariaLabel}>
 *     {link.label}
 *   </a>
 * ))}
 * ```
 */
export const MOBILE_CONTACT_LINKS = [
  {
    href: EMAIL_CONTACT_LINK,
    label: "raf@raf.works",
    ariaLabel: "Email Raf",
    openInNewTab: false,
  },
  {
    href: "https://www.linkedin.com/in/raffaelevitaledesign/",
    label: "LinkedIn",
    ariaLabel: "Raf on LinkedIn",
    openInNewTab: true,
  },
  {
    href: "https://x.com/lfgraf",
    label: "X",
    ariaLabel: "Raf on X",
    openInNewTab: true,
  },
  {
    href: "/documents/CV.pdf",
    label: "CV",
    ariaLabel: "View Raf's CV",
    openInNewTab: true,
  },
] as const;

/**
 * Unified horizontal padding for mobile content (matches About modal: px-4).
 * 
 * @remarks
 * Consistent padding class used across mobile views to align content
 * with the About modal styling.
 */
export const MOBILE_CONTENT_PADDING = "px-4";

/**
 * Loading stage messages shown during initial page load.
 * 
 * @remarks
 * Progressive messages shown to users during the loading sequence.
 * Each stage corresponds to a different phase of initialization.
 * 
 * Stages:
 * 1. "Initializing..." - Initial setup
 * 2. "Loading content..." - Content loading
 * 3. "Preparing images..." - Image preloading
 * 4. "Finalizing experience..." - Final touches
 */
export const LOADING_STAGES: string[] = [
  "Initializing...",
  "Loading content...",
  "Preparing images...",
  "Finalizing experience...",
];

// ============================================================================
// PROJECT DATA - Image paths grouped by project
// ============================================================================

/**
 * PROJECTS: Maps project keys to their image paths.
 * 
 * @remarks
 * Each project has one representative image for the carousel.
 * All images are stored in /public/work/
 * 
 * Project keys are used throughout the codebase to identify projects.
 * 
 * @example
 * ```ts
 * const project = PROJECTS["cb"]; // Returns { images: ["/work/cb-1.png"] }
 * ```
 */
export const PROJECTS: Record<string, { images: string[] }> = {
  // Current/recent work (2024-2025)
  atlas: {
    images: ["/work/atlas-2.png"], // Crypto marketplace, NFT era
  },
  cb: {
    images: ["/work/cb-1.png"], // Coinbase Developer Platform
  },
  vf: {
    images: ["/work/vf-0.png"], // Voiceflow product redesign
  },
  defituna: {
    images: ["/work/defituna-1.png"], // DeFi project
  },
  theo: {
    images: ["/work/theo-1.png"], // Theoriq - AI platform, founding designer
  },
  // Legacy/early works (2017-2022)
  curbcut: { images: ["/work/curbcutos.png"] }, // Accessibility data tools
  zalando: { images: ["/work/zalando-dodont.png"] }, // B2B design system
  earlyworks: { images: ["/work/early-works.webp"] }, // Early brand work
  nationalArchives: { images: ["/work/us.png"] }, // Early brand work
};

// ============================================================================
// VIDEO MAPPINGS - Vimeo URLs for project case studies
// ============================================================================

/**
 * PROJECT_VIDEOS: Maps project keys to Vimeo embed URLs.
 * 
 * @remarks
 * Videos open in modal overlay when user clicks play button on image.
 * Only projects with videos appear in this map.
 * 
 * Special rules:
 * - Atlas video only shows on atlas-2.png (not atlas-1.png)
 * - This is handled in getVideoForSrc() utility function
 * 
 * @see {@link app/utils/portfolioUtils.ts#getVideoForSrc} for video retrieval logic
 */
export const PROJECT_VIDEOS: Record<string, string> = {
  atlas:
    "https://player.vimeo.com/video/1034334194?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=0&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p&badge=0&sidedock=0",
  theo: "https://player.vimeo.com/video/1033459034?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=0&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p&badge=0&sidedock=0",
  defi: "https://player.vimeo.com/video/1034767734?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=0&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p&badge=0&sidedock=0",
  curbcut:
    "https://player.vimeo.com/video/1033156436?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=0&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p&badge=0&sidedock=0",
};

/**
 * PROJECT_ALIAS: Maps new project identifiers to legacy video keys.
 * 
 * @remarks
 * Used when project naming differs between PROJECTS and PROJECT_VIDEOS.
 * 
 * Example: "defituna" project uses "defi" video key in PROJECT_VIDEOS.
 * 
 * @example
 * ```ts
 * const alias = PROJECT_ALIAS["defituna"]; // Returns "defi"
 * const videoUrl = PROJECT_VIDEOS[alias]; // Gets video URL
 * ```
 */
export const PROJECT_ALIAS: Record<string, string> = {
  defituna: "defi", // defituna project uses 'defi' video key
};

// ============================================================================
// CAROUSEL CONFIGURATION
// ============================================================================

/**
 * PROJECT_ORDER: Defines the sequence of projects in the carousel.
 * 
 * @remarks
 * Order: Recent work → Legacy work (chronological reverse)
 * This determines both desktop carousel and mobile scroll panel order.
 * 
 * The order is intentionally reversed (newest first) to showcase
 * recent work prominently.
 * 
 * @example
 * ```ts
 * PROJECT_ORDER[0] // "theo" - most recent
 * PROJECT_ORDER[PROJECT_ORDER.length - 1] // "earlyworks" - oldest
 * ```
 */
export const PROJECT_ORDER: string[] = [
  "theo", // Theoriq (2024)
  "cb", // Coinbase (2025)
  "vf", // Voiceflow (2025)
  "atlas", // Atlas (2020)
  "defituna", // DeFi Tuna (2021)
  "curbcut", // CurbCut (2021)
  "zalando", // Zalando (2022)
  "earlyworks", // Early work (2017-2019)
];

/**
 * Flattened array of all image sources in display order.
 * 
 * @remarks
 * Derived from PROJECT_ORDER and PROJECTS. Used throughout the app
 * for rendering images in the correct sequence.
 * 
 * This is the single source of truth for image order.
 * 
 * @example
 * ```ts
 * IMAGE_SOURCES[0] // "/work/theo-1.png" (first image in carousel)
 * ```
 */
export const IMAGE_SOURCES: string[] = PROJECT_ORDER.flatMap(
  (key) => PROJECTS[key]?.images ?? []
);

/**
 * IMAGE_ALT_TEXT: Descriptive alt text for each carousel image.
 * 
 * @remarks
 * Provides meaningful descriptions for screen readers and accessibility.
 * Each image path maps to its descriptive alt text.
 * 
 * Used by getAltText() utility function to provide fallback text
 * when alt text isn't found in this map.
 * 
 * @see {@link app/utils/portfolioUtils.ts#getAltText} for usage
 */
export const IMAGE_ALT_TEXT: Record<string, string> = {
  "/work/cb-1.png": "Coinbase Developer Platform interface showing API documentation and developer tools",
  "/work/theo-1.png": "Theoriq AI platform dashboard with agent management and workflow visualization",
  "/work/vf-0.png": "Voiceflow conversation design interface with flowchart-style dialog editor",
  "/work/atlas-2.png": "Atlas crypto marketplace featuring NFT collections and digital asset trading interface",
  "/work/defituna-1.png": "DeFi Tuna decentralized finance platform with yield farming and staking features",
  "/work/curbcutos.png": "CurbCut accessibility data visualization tool showing urban mobility metrics",
  "/work/zalando-dodont.png": "Zalando B2B design system documentation with component guidelines and patterns",
  "/work/early-works.webp": "Early design work portfolio showcasing brand identity and visual design projects",
  "/work/us.png": "National Archives project featuring historical document digitization and archival interface",
};

// ============================================================================
// CAPTION DATA - Project descriptions shown below images
// ============================================================================

/**
 * PROJECT_CAPTIONS: Text descriptions for each project.
 * 
 * @remarks
 * Format: "YEAR — Description"
 * Used on both desktop and mobile views.
 * 
 * The " — " separator is used to split year from description.
 * This allows for separate styling and animation of year vs description.
 * 
 * @see {@link app/utils/portfolioUtils.ts#parseCaption} for parsing logic
 * 
 * @example
 * ```ts
 * PROJECT_CAPTIONS["cb"] // "Q3 2025 — Shipped SQL AI Playground..."
 * ```
 */
export const PROJECT_CAPTIONS: Record<string, string> = {
  cb: "Q3 2025 — Shipped SQL AI Playground and Embedded Wallets launch for the Coinbase Developer Platform.",
  vf: "Q2 2025 — Redesigned product activation, landing page and onboarding at Voiceflow to drive clarity and conversion.",
  theo: "2024 — Founding designer at Theoriq, scaled from PDF to 140k active users in six months across product, brand and marketing.",
  atlas:
    "2020 — Led product design for an early NFT marketplace, shaping transaction and analytics patterns new to Web3 products.",
  defituna:
    "2021 — Designed and built for a decentralized finance project, enabling traders to borrow, lend and trade securely.",
  curbcut:
    "2021 — Designed calm, legible data tools that made accessibility insights usable for everyone.",
  zalando:
    "2022 — Established Zalando's first unified B2B design system, unifying multiple teams under one shared language.",
  earlyworks:
    "From 2017 — Built brands, interfaces, and launch sites for 10+ backed startups and award-winning agencies.",
};

// ============================================================================
// IMAGE LOADING BUCKETS - Prioritized loading strategy
// ============================================================================

/**
 * First set of images - loaded immediately (critical).
 * 
 * @remarks
 * These are the first INITIAL_IMAGE_COUNT images from IMAGE_SOURCES.
 * Loaded with priority="true" and loading="eager" for fastest initial render.
 * 
 * @see {@link INITIAL_IMAGE_COUNT} for count
 */
export const INITIAL_IMAGES = IMAGE_SOURCES.slice(0, INITIAL_IMAGE_COUNT);

/**
 * Next set of images - preloaded after initial (eager).
 * 
 * @remarks
 * Images loaded after INITIAL_IMAGES, but still eagerly (not lazy).
 * Helps ensure smooth carousel navigation without waiting.
 * 
 * @see {@link PRELOAD_IMAGE_COUNT} for count
 */
export const PRELOAD_IMAGES = IMAGE_SOURCES.slice(
  INITIAL_IMAGE_COUNT,
  INITIAL_IMAGE_COUNT + PRELOAD_IMAGE_COUNT
);


