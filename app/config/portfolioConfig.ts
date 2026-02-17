/**
 * ============================================================================
 * PORTFOLIO CONFIGURATION - app/config/portfolioConfig.ts
 * ============================================================================
 *
 * Centralized configuration for the portfolio homepage.
 * Contains all constants, project data, and UI configuration.
 *
 * This file is imported by:
 * - app/q3-2025/page.tsx (Q3 2025 portfolio page component)
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
    href: "https://x.com/rafdotworks",
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

// ============================================================================
// TYPE DEFINITIONS - Ensures exhaustive checking across all project configs
// ============================================================================

/**
 * All valid project keys used throughout the application.
 * This is the source of truth for project identifiers.
 */
export const PROJECT_KEYS = [
  "currentwork",
  "theo",
  "cb",
  "vf",
  "atlas",
  "defituna",
  "curbcut",
  "zalando",
  "earlyworks",
  "nationalArchives",
] as const;

export type ProjectKey = (typeof PROJECT_KEYS)[number];

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
export const PROJECTS: Record<ProjectKey, { images: string[] }> = {
  // Current/recent work (2024-2026)
  currentwork: {
    images: ["/work/current-ai.webp"], // Current AI work - animated preview
  },
  atlas: {
    images: ["/work/atlas.webp", "/work/atlas-2.png", "/work/videos/atlas-ptv.mov"], // Crypto marketplace, NFT era
  },
  cb: {
    images: [
      "/work/cb-1.webp",
      "/work/cb-dash.png",
      "/work/cb-sql.png",
      "/work/cb.webp"
    ], // Coinbase Developer Platform
  },
  vf: {
    images: ["/work/vf.webp"], // Voiceflow product redesign
  },
  defituna: {
    images: ["/work/defituna-1.png", "/work/videos/defi-tuna.mov"], // DeFi project (fixed: removed duplicate)
  },
  theo: {
    images: [
      "/work/theo-web.png",
      "/work/videos/theoriq-demo.mov",
      "/work/t-hubandbuild.png",
    ], // Theoriq - web first, then demo video, then hub/build
  },
  // Legacy/early works (2017-2022)
  curbcut: { images: ["/work/curbcutos.png"] }, // Accessibility data tools (fixed: removed duplicate)
  zalando: { images: ["/work/zalando-dodont.png"] }, // B2B design system
  earlyworks: { 
    images: [
      "/work/vf.webp",           // Voiceflow
      "/work/atlas.webp",         // Atlas
      "/work/zalando-dodont.png", // Zalando
      "/work/early-works.webp"    // Early works
    ] 
  }, // Early brand work: Voiceflow, Atlas, Zalando, and early works
  nationalArchives: { images: ["/work/us.webp"] }, // Early brand work (fixed: removed duplicate)
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
 * Note: Not all projects in PROJECT_KEYS appear here - some are auxiliary
 * (e.g., defituna, curbcut, nationalArchives are used in other contexts).
 *
 * @example
 * ```ts
 * PROJECT_ORDER[0] // "theo" - most recent
 * PROJECT_ORDER[PROJECT_ORDER.length - 1] // "earlyworks" - oldest
 * ```
 */
export const PROJECT_ORDER: ProjectKey[] = [
  "theo", // Theoriq (2024) — first image shown is theo-web.png
  "currentwork", // Current work (2026)
  // "cb", // Coinbase (2025)
  // "earlyworks", // Early work (2017-2019), now includes Voiceflow, Atlas, Zalando, and more
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
  "/work/current-ai.webp": "Current AI work - animated preview of AI assistant interface",
  "/work/cb-1.webp": "Coinbase Developer Platform interface showing API documentation and developer tools",
  "/work/cb-dash.png": "Coinbase Developer Platform dashboard with navigation and project overview",
  "/work/cb-sql.png": "Coinbase SQL AI Playground interface for querying blockchain data",
  "/work/cbd-sql.png": "Coinbase SQL query interface with results and transaction details",
  "/work/theo-1.png": "Theoriq AI platform dashboard with agent management and workflow visualization",
  "/work/t-studio.png": "Theoriq Infinity Studio workspace for testing and controlling AI agents",
  "/work/t-json.png": "Theoriq agent configuration interface showing JSON schema and parameters",
  "/work/t-hubandbuild.png": "Theoriq Infinity Hub marketplace and build interface for AI agent strategies",
  "/work/theo-web.png": "Theoriq web platform interface showcasing AI agent marketplace and workflow builder",
  "/work/vf.webp": "Voiceflow conversation design interface with flowchart-style dialog editor",
  "/work/atlas-2.png": "Atlas crypto marketplace featuring NFT collections and digital asset trading interface",
  "/work/atlas.webp": "Atlas crypto marketplace featuring NFT collections and digital asset trading interface",
  "/work/defituna-1.png": "DeFi Tuna decentralized finance platform with yield farming and staking features",
  "/work/defi-tuna-swap.png": "DeFi Tuna swap interface showing token exchange functionality with transaction details",
  "/work/curbcutos.png": "CurbCut accessibility data visualization tool showing urban mobility metrics",
  "/work/zalando-dodont.png": "Zalando B2B design system documentation with component guidelines and patterns",
  "/work/early-works.webp": "Early design work portfolio showcasing brand identity and visual design projects",
  "/work/us.png": "National Archives project featuring historical document digitization and archival interface",
  "/work/us.webp": "National Archives project featuring historical document digitization and archival interface",
};

// ============================================================================
// ROLE AND CONTRACT DATA - Project roles and contract types
// ============================================================================

/**
 * PROJECT_ROLES: Maps project keys to role titles.
 * 
 * @remarks
 * Used to display the role in the left column of the experiment page.
 * 
 * @example
 * ```ts
 * PROJECT_ROLES["theo"] // "Founding AI Product Designer"
 * ```
 */
export const PROJECT_ROLES: Record<string, string> = {
  currentwork: "Staff AI Product Designer",
  theo: "Founding AI Product Designer",
  cb: "Senior AI Product Designer",
  vf: "Senior AI Product Designer",
  atlas: "Senior Product AI Designer",
  curbcut: "Product AI Designer",
  zalando: "Senior Design System AI Designer",
  earlyworks: "AI Designer",
};

/**
 * PROJECT_CONTRACT_TYPES: Maps project keys to contract type.
 * 
 * @remarks
 * Used to display the contract type in the left column of the experiment page.
 * Values are either "Full-time" or "Contract".
 * 
 * @example
 * ```ts
 * PROJECT_CONTRACT_TYPES["theo"] // "Full-time"
 * ```
 */
export const PROJECT_CONTRACT_TYPES: Record<string, string> = {
  currentwork: "Ongoing",
  theo: "Full-time",
  cb: "Contract",
  vf: "Contract",
  atlas: "Full-time",
  curbcut: "Full-time",
  zalando: "Full-time",
  earlyworks: "Contract",
};

/**
 * PROJECT_YEARS: Maps project keys to year strings.
 * 
 * @remarks
 * Used to display the year in the left column of the experiment page.
 * Year appears as the first line, followed by role and contract type.
 * 
 * @example
 * ```ts
 * PROJECT_YEARS["theo"] // "2024-25"
 * ```
 */
export const PROJECT_YEARS: Record<string, string> = {
  currentwork: "2026",
  theo: "2024-25",
  cb: "Q3-Q4 2025",
  vf: "Q1-Q2 2025",
  atlas: "2022/23",
  curbcut: "2023/24",
  zalando: "2021/22",
  earlyworks: "From 2016",
};

/**
 * PROJECT_DISPLAY_NAMES: Human-readable titles for each project.
 *
 * @remarks
 * Used to display project titles in the portfolio. Centralizes all
 * project naming in the config file for consistency.
 *
 * @example
 * ```ts
 * PROJECT_DISPLAY_NAMES["theo"] // "Theoriq"
 * ```
 */
export const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  currentwork: "Current Work",
  theo: "Theoriq",
  cb: "Coinbase Developer Platform",
  vf: "Voiceflow",
  atlas: "Crypto Platforms",
  defituna: "DeFi Tuna",
  curbcut: "CurbCut",
  zalando: "Zalando B2B Design System",
  earlyworks: "Early Works",
  nationalArchives: "National Archives",
};

// ============================================================================
// CAPTION DATA - Project descriptions shown below images
// ============================================================================

/**
 * PROJECT_CAPTIONS: Text descriptions for each project.
 * 
 * @remarks
 * Contains only the description text (no year prefix).
 * Year is displayed separately in the left column via PROJECT_YEARS.
 * Used on both desktop and mobile views.
 * 
 * @see {@link app/experiment/page.tsx#parseCaption} for parsing logic
 * 
 * @example
 * ```ts
 * PROJECT_CAPTIONS["cb"] // "Shipped SQL AI Playground..."
 * ```
 */
export const PROJECT_CAPTIONS: Record<string, string> = {
  currentwork: "Designing agents as scoped coworkers, not smart features. Making trust on recommendations an architectural property at scale.",
  cb: "Coinbase was rolling out onchain infrastructure across its developer platform. The tech worked. But early interactions felt slow and hard to reason about.\n\nDevelopers couldn't tell if something was processing, broken, or just taking time. That ambiguity kills trust.\n\nI led SQL Playground, Embedded Wallets and contributed to Developer Platform redesign, Pay with USDC, and more applying the same principle: clarity first. Clear loading states. Predictable feedback. Early prototypes. No guessing.\n\nDesigned SQL-based query interfaces informed by developer interviews, optimizing for discoverability and error prevention. Collaborated with engineering to design within technical realities rather than idealized flows.\n\nResult: Shipped different surfaces in three months. Developers could finally tell what was happening and trust it.",
  vf: "Voiceflow had 200,000+ users across 4,000+ teams, but new signups weren't converting. The problem wasn't the product: it was the gap between \"I signed up\" and \"I built something that works.\"\n\nI reframed onboarding around time-to-first-value. Not features. Not tutorials. Just: how fast can someone go from zero to a working AI agent?\n\nRedesigned early activation to collapse that timeline. Clearer entry points. Smarter defaults. Less guessing. Designed interaction patterns that made LLM behavior predictable and trustworthy, helping users understand when agents would succeed or fail.\n\nResult: New user activation improved. More teams got to their first agent faster. The product already worked—now it worked sooner.",
  theo: "AI agents were emerging, but trust mechanisms for operating with real assets didn't exist. How do you confidently let an agent move real crypto?\n\nI joined as founding designer and owned end-to-end UX from zero. Designed Infinity Studio (the workspace where developers could test, inspect, and control agents) and Infinity Hub (the marketplace where agents can be shared). Partnered with CEO and founding team to translate experimental AI infrastructure into product vision. Also shaped brand and go-to-market.\n\nResult: Scaled from 0 to 140K users in 6 months. 40% created their first strategy after Studio launch. The patterns we built are still the foundation.",
  atlas:
    "Atlas was an early NFT marketplace with few established UX patterns.\nI led product design by shaping transaction and analytics flows that made decentralized trading, borrowing, and lending legible and safe.\n\nThe result was a Web3 experience users could reason about before committing value.",
  curbcut:
    "Accessibility data was available, but hard to interpret.\nI designed calm, legible data tools that made accessibility insights understandable and usable for everyone.",
  zalando:
    "Zalando's B2B products were scaling, but patterns fragmented across teams.\nI established the company's first unified B2B design system, creating a shared language that improved usability and cross-team alignment at enterprise scale.",
  earlyworks:
    "A mix of freelance work with startups and agencies across emerging and fast-moving domains. I built brands, interfaces, and websites for early-stage products where clarity mattered more than polish. Selected clients: Voiceflow (AI Agents), Atlas (NFT Marketplace), Zalando (B2B Design System), JazzX AI (Microsoft), CurbCutOS, Artscapy.",
};

// ============================================================================
// INTERLEAVED CAPTIONS - Text chunks to display between images
// ============================================================================

/**
 * InterleavedCaption type definition for projects with text-image interleaving.
 * 
 * @remarks
 * This structure allows text to be displayed between images instead of
 * all at once before/after the image stack.
 * 
 * Flow: intro → image 1 → chunks[0] → image 2 → chunks[1] → ... → conclusion
 */
export interface InterleavedCaption {
  intro: string       // First text block (shown before first image)
  chunks: string[]    // Text chunks to show after each subsequent image
  conclusion: string  // Final text block (shown after all images, or empty string)
}

/**
 * Display mode for project images.
 * - 'stack': Vertical stack of images (default)
 * - 'carousel': Horizontal drag carousel (desktop only, reverts to stack on mobile)
 */
export type ProjectDisplayMode = 'stack' | 'carousel'

/**
 * PROJECT_DISPLAY_MODES: Display mode configuration for projects.
 *
 * @remarks
 * Controls whether a project's images render as a vertical stack or horizontal carousel.
 * Projects not in this map default to 'stack' mode.
 * Carousel mode only applies on desktop (≥768px) - mobile always uses stack.
 */
export const PROJECT_DISPLAY_MODES: Record<string, ProjectDisplayMode> = {
  earlyworks: 'carousel',
}

/**
 * PROJECT_INTERLEAVED_CAPTIONS: Chunked descriptions for text-image interleaving.
 * 
 * @remarks
 * Only contains projects with long descriptions that benefit from breaking up
 * text across multiple images. Projects not in this map use the default
 * intro/conclusion split from PROJECT_CAPTIONS.
 * 
 * Each project's structure is tailored to its number of images:
 * - cb: 5 images, 5 text blocks (intro + 3 chunks + conclusion)
 * - vf: 1 image, 4 text blocks (intro + 2 chunks + conclusion)
 * - theo: 6 images, 3 text blocks (intro + 1 chunk + conclusion)
 * 
 * @see {@link InterleavedCaption} for structure definition
 * @see {@link WorkCard} component for rendering logic
 */
export const PROJECT_INTERLEAVED_CAPTIONS: Record<string, InterleavedCaption> = {
  cb: {
    intro: "Coinbase was rolling out onchain infrastructure across its developer platform. The tech worked. But early interactions felt slow and hard to reason about.",
    chunks: [
      "Developers couldn't tell if something was processing, broken, or just taking time. That ambiguity kills trust.",
      "I led SQL Playground, Embedded Wallets and contributed to Developer Platform redesign, Pay with USDC, and more applying the same principle: clarity first. Clear loading states. Predictable feedback. Early prototypes. No guessing.",
      "Designed SQL-based query interfaces informed by developer interviews, optimizing for discoverability and error prevention. Collaborated with engineering to design within technical realities rather than idealized flows.",
    ],
    conclusion: "Result: Shipped different surfaces within Developer Platform. Developers could finally tell what was happening and trust it.",
  },
  vf: {
    intro: "Voiceflow had 200,000+ users across 4,000+ teams, but new signups weren't converting. The problem wasn't the product: it was the gap between \"I signed up\" and \"I built something that works.\"",
    chunks: [
      "I reframed onboarding around time-to-first-value. Not features. Not tutorials. Just: how fast can someone go from zero to a working AI agent?",
      "Redesigned early activation to collapse that timeline. Clearer entry points. Smarter defaults. Less guessing. Designed interaction patterns that made LLM behavior predictable and trustworthy, helping users understand when agents would succeed or fail.",
    ],
    conclusion: "Result: New user activation improved. More teams got to their first agent faster. The product already worked—now it worked sooner.",
  },
  theo: {
    intro: "AI agents were emerging, but trust mechanisms for operating with real assets didn't exist. How do you confidently let an agent move real crypto?",
    chunks: [
      "I joined as founding designer and owned end-to-end UX from zero. Designed Infinity Studio (the workspace where developers could test, inspect, and control agents) and Infinity Hub (the marketplace where agents can be shared). Partnered with CEO and founding team to translate experimental AI infrastructure into product vision. Also shaped brand and go-to-market.",
    ],
    conclusion: "Result: Scaled from 0 to 140K users in 6 months. 40% created their first strategy after Studio launch. The patterns we built are still the foundation.",
  },
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

// ============================================================================
// WORK TIMELINE MAPPING
// ============================================================================

/**
 * Maps project keys to work experience identifiers.
 * 
 * Used to highlight the correct work entry in the timeline when a project
 * is displayed in the carousel (WorksPanel component).
 * 
 * FORMAT:
 * { projectKey: { section: 'fulltime' | 'contract' | 'studio', identifier: string } }
 * 
 * - section: Which section of the timeline (Full-Time, Contract, or Studio)
 * - identifier: The time period identifier (e.g., "2024–2025", "2025")
 * 
 * HOW IT WORKS:
 * When user navigates to a project image, we:
 * 1. Get the project key from the image source
 * 2. Look up the work entry in this map
 * 3. Highlight that entry in the timeline
 * 
 * SPECIAL CASES:
 * - Multiple projects can map to the same work entry (e.g., "atlas" and "defituna" both map to "2022–2023")
 * - Some projects have specific identifiers (e.g., "vf" and "cb" both use "2025" but are differentiated by project key)
 * 
 * @see app/new/components/WorksPanel.tsx for usage (component location unchanged)
 */
export const PROJECT_TO_WORK_MAP: Record<string, { section: 'fulltime' | 'contract' | 'studio', identifier: string }> = {
  'currentwork': { section: 'fulltime', identifier: '2024–2025' }, // Maps to most recent work entry
  'theo': { section: 'fulltime', identifier: '2024–2025' },
  'cb': { section: 'contract', identifier: '2025' }, // Coinbase
  'vf': { section: 'contract', identifier: '2025' }, // Voiceflow (first 2025 entry)
  'atlas': { section: 'fulltime', identifier: '2022–2023' }, // Crypto Stealth Startup
  'defituna': { section: 'fulltime', identifier: '2022–2023' }, // Crypto Stealth Startup
  'curbcut': { section: 'fulltime', identifier: '2023–2024' },
  'zalando': { section: 'contract', identifier: '2021–2022' },
  'earlyworks': { section: 'studio', identifier: '2016–present' },
  'nationalArchives': { section: 'studio', identifier: '2016–present' },
}

/**
 * Gets the work experience identifier for the current project.
 * 
 * Used to determine which timeline entry should be highlighted.
 * 
 * @param {string | null} projectKey - The project key from the current image
 * @returns {Object | null} The work entry mapping (section and identifier) or null if not found
 * 
 * @example
 * getHighlightedWorkEntry("theo") // Returns { section: 'fulltime', identifier: '2024–2025' }
 * 
 * @see app/new/components/WorksPanel.tsx for usage (component location unchanged)
 */
export function getHighlightedWorkEntry(projectKey: string | null): { section: string, identifier: string } | null {
  if (!projectKey) return null
  return PROJECT_TO_WORK_MAP[projectKey] || null
}

// ============================================================================
// PROJECT STORIES - Full case study availability
// ============================================================================

/**
 * PROJECT_HAS_STORY: Tracks which projects have full story content.
 *
 * @remarks
 * When true, a "Read the full story" button appears after the project description.
 * Story content is loaded from `/stories/[projectKey].md` via the `/api/story/[id]` endpoint.
 *
 * @example
 * ```ts
 * PROJECT_HAS_STORY["theo"] // true - has full story
 * PROJECT_HAS_STORY["zalando"] // undefined/false - no story
 * ```
 */
export const PROJECT_HAS_STORY: Record<string, boolean> = {
  theo: false,
  cb: false,
}

