"use client";

/**
 * ============================================================================
 * MAIN HOMEPAGE COMPONENT - app/page.tsx
 * ============================================================================
 *
 * Primary portfolio page with adaptive layout and sophisticated animations.
 *
 * FEATURES:
 * - Desktop: Animated image carousel with page-turn effects
 * - Mobile: Vertical scroll with snap-to-panel behavior
 * - Adaptive loading sequence based on network speed
 * - Video modal system for project showcases
 * - About modal with bio information
 * - Accessibility-first with keyboard navigation & focus management
 *
 * FILE STRUCTURE:
 * 1. CONSTANTS & CONFIGURATION (lines 60-100)
 * 2. PROJECT DATA & MAPPINGS (lines 102-250)
 * 3. HELPER FUNCTIONS (lines 252-290)
 * 4. MAIN COMPONENT (lines 292+)
 * 5. STATE MANAGEMENT (lines 300-340)
 * 6. EFFECTS & LIFECYCLE (lines 350-720)
 * 7. EVENT HANDLERS (lines 722-900)
 * 8. RENDER LOGIC (lines 920+)
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useIsMobile } from "@/hooks/use-mobile"; // Mobile breakpoint detection (768px)
import {
  BreathingSkeleton,
  EASING,
  ImageCarouselItem,
  LoadingProgress,
  ProgressiveLoadingStates,
  WordReveal,
} from "@/components/animations/LoadingAnimations";
import { useLoadingSequence } from "@/hooks/useLoadingSequence"; // Adaptive loading based on network
import {
  modalOverlayVariants,
  modalContainerVariants,
  modalPanelVariants,
  modalTextStagger,
  modalReduced,
} from "@/components/animations/LoadingAnimations";
import { WorkImageContainer } from "./components/hover"; // Work image with hover effects
import useAnimationLevel from "@/hooks/useAnimationLevel"; // Animation preference detection
import { pageTurnVariants } from "@/components/animations/imageTransitions"; // Page-turn animation variants

// ============================================================================
// TIMING & INTERACTION CONSTANTS
// ============================================================================

/** Debounce time for carousel navigation clicks to prevent rapid clicking (ms) */
const NAVIGATION_DEBOUNCE = 300;
/** Speed of auto-preview animation - time per image transition (ms) */
const PREVIEW_SPEED = 120;
/** Number of complete loops through all images in the preview sequence */
const PREVIEW_LOOPS = 1;
/** Delay before settling after preview animation completes (ms) */
const PREVIEW_SETTLE_DELAY = 200;

// ============================================================================
// IMAGE LOADING STRATEGY CONSTANTS
// ============================================================================

/** Number of images to load immediately on initial page load (critical content) */
const INITIAL_IMAGE_COUNT = 2;
/** Total number of images to preload eagerly after initial load */
const PRELOAD_IMAGE_COUNT = 4;
/** How many images ahead to preload during carousel navigation (adaptive lookahead) */
const PRELOAD_LOOKAHEAD = 3;
/** Maximum time to wait for individual image loads before timeout (ms) */
const IMAGE_LOAD_TIMEOUT = 8000;
/** Number of retry attempts for failed image loads with exponential backoff */
const IMAGE_RETRY_ATTEMPTS = 2;
/** Image quality for Next.js Image optimization (1-100, higher = better quality) */
const IMAGE_QUALITY = 85;

// ============================================================================
// CONTACT & UI CONSTANTS
// ============================================================================

/** Primary email contact link */
const EMAIL_CONTACT_LINK = "mailto:raf@raf.works";

/** Mobile footer contact links (visible at bottom of mobile view) */
const MOBILE_CONTACT_LINKS = [
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
] as const;

/** iOS safe area padding for mobile hero section (accounts for notch/home indicator) */
const MOBILE_HERO_BOTTOM_PADDING =
  "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))";
/** iOS safe area padding for mobile contact footer */
const MOBILE_CONTACT_BOTTOM_PADDING =
  "calc(env(safe-area-inset-bottom, 0px) + 20px)";

/** Loading stage messages shown during initial page load */
const LOADING_STAGES: string[] = [
  "Initializing...",
  "Loading content...",
  "Preparing images...",
  "Finalizing experience...",
];

// ============================================================================
// PROJECT DATA - Image paths grouped by project
// ============================================================================

/**
 * PROJECTS: Maps project keys to their image paths
 * Each project has one representative image for the carousel
 * All images are stored in /public/work/
 */
const PROJECTS: Record<string, { images: string[] }> = {
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
  artscapy: { images: ["/work/artscapy.png"] }, // Early brand work
  nationalArchives: { images: ["/work/us.png"] }, // Early brand work
};

// ============================================================================
// VIDEO MAPPINGS - Vimeo URLs for project case studies
// ============================================================================

/**
 * PROJECT_VIDEOS: Maps project keys to Vimeo embed URLs
 * Videos open in modal overlay when user clicks play button on image
 * Only projects with videos appear in this map
 */
const PROJECT_VIDEOS: Record<string, string> = {
  atlas:
    "https://player.vimeo.com/video/1034334194?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
  theo: "https://player.vimeo.com/video/1033459034?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
  defi: "https://player.vimeo.com/video/1034767734?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
  curbcut:
    "https://player.vimeo.com/video/1033156436?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
};

/**
 * PROJECT_ALIAS: Maps new project identifiers to legacy video keys
 * Used when project naming differs between PROJECTS and PROJECT_VIDEOS
 */
const PROJECT_ALIAS: Record<string, string> = {
  defituna: "defi", // defituna project uses 'defi' video key
};

// ============================================================================
// CAROUSEL CONFIGURATION
// ============================================================================

/**
 * PROJECT_ORDER: Defines the sequence of projects in the carousel
 * Order: Recent work → Legacy work (chronological reverse)
 * This determines both desktop carousel and mobile scroll panel order
 */
const PROJECT_ORDER: string[] = [
  "cb",        // Coinbase (2025)
  "vf",        // Voiceflow (2025)
  "theo",      // Theoriq (2024)
  "atlas",     // Atlas (2020)
  "defituna",  // DeFi Tuna (2021)
  "curbcut",   // CurbCut (2021)
  "zalando",   // Zalando (2022)
  "artscapy",  // Early work (2017-2019)
];

/** Flattened array of all image sources in display order */
const IMAGE_SOURCES: string[] = PROJECT_ORDER.flatMap(
  (key) => PROJECTS[key]?.images ?? []
);

// ============================================================================
// HELPER FUNCTIONS - Project identification and data retrieval
// ============================================================================

/**
 * Derives project key from image source path
 * @param src - Image source path (e.g., "/work/cb-1.png")
 * @returns Project key (e.g., "cb") or null if not found
 */
function getProjectFromSrc(src: string): string | null {
  if (src.includes("/work/")) {
    const filename = src.split("/").pop() || "";
    const hasHyphen = filename.includes("-");
    if (hasHyphen) {
      const prefix = filename.split("-")[0];
      if (prefix) return prefix;
    }
  }
  if (src.includes("curbcut")) return "curbcut";
  if (src.includes("zalando")) return "zalando";
  if (src.includes("artscapy")) return "artscapy";
  if (src.endsWith("/us.png") || src.includes("/us.png"))
    return "nationalArchives";
  return null;
}

/**
 * Gets Vimeo video URL for a given image source
 * @param src - Image source path
 * @returns Vimeo embed URL or null if no video exists
 *
 * Special rules:
 * - Atlas video only shows on atlas-2.png (not atlas-1.png)
 */
function getVideoForSrc(src: string): string | null {
  const project = getProjectFromSrc(src);
  if (!project) return null;
  // Special rule: atlas video only on second image
  if (project === "atlas" && !src.endsWith("atlas-2.png")) {
    return null;
  }
  const key = PROJECT_ALIAS[project] ?? project;
  return PROJECT_VIDEOS[key] ?? null;
}

// ============================================================================
// CAPTION DATA - Project descriptions shown below images
// ============================================================================

/**
 * PROJECT_CAPTIONS: Text descriptions for each project
 * Format: "YEAR — Description"
 * Used on both desktop and mobile views
 */
const PROJECT_CAPTIONS: Record<string, string> = {
  cb: "2025 — Led the SQL Playground and Embedded Wallets launch for Coinbase Developer Platform.",
  vf: "2025 — Redesigned product activation, landing page and onboarding at Voiceflow to drive clarity and conversion from first interaction.",
  theo: "2024 — Founding designer at Theoriq, scaling from PDF to 140k users in six months.",
  atlas:
    "2020 — Led design for an early crypto marketplace during the first wave of NFTs.",
  defituna:
    "2021 — Designed and built for a decentralized finance project, allowing traders to borrow, lend and more.",
  curbcut:
    "2021 — Designed calm, legible data tools that made accessibility insights usable for everyone.",
  zalando:
    "2022 — Helped establish the first unified B2B design system at Zalando, connecting multiple teams under one shared language.",
  artscapy:
    "From 2017 — Built brands, interfaces, and launch sites that taught the value of clarity and restraint.",
  nationalArchives:
    "From 2017 — Built brands, interfaces, and launch sites that taught the value of clarity and restraint.",
};

/**
 * Gets project-level caption for an image source
 * @param src - Image source path
 * @returns Caption string or null
 */
function getCaptionForSrc(src: string): string | null {
  const project = getProjectFromSrc(src);
  if (!project) return null;
  return PROJECT_CAPTIONS[project] ?? null;
}

/**
 * WORK_CAPTIONS: Legacy per-image captions (deprecated in favor of PROJECT_CAPTIONS)
 * Kept for backwards compatibility
 */
const WORK_CAPTIONS: Record<string, string> = {
  "/work/cb-1.png":
    "2025 — Designed SQL Playground and Embedded Wallets — making developer tools feel effortless",
  "/work/vf-01.png":
    "2025 — Refined activation and onboarding, aligning product flow with clarity and conversion.",
  "/work/voiceflow-landing.png":
    "2025 — Refined activation and onboarding, aligning product flow with clarity and conversion.",
  "/work/brand 01.png":
    "2024 — Built brand, system, and product from 0 → 140k users in six months.",
  "/work/studio 01.png":
    "2024 — Built brand, system, and product from 0 → 140k users in six months.",
  "/work/hub and build 01.png":
    "2024 — Built brand, system, and product from 0 → 140k users in six months.",
  "/work/atlas.png":
    "2020 — Led design for an early crypto marketplace at the start of the NFT era.",
  "/work/atlas-1.png":
    "2020 — Led design for an early crypto marketplace at the start of the NFT era.",
  "/work/defi.png":
    "2020 — Led design and engineering for an experimental DeFi protocol.",
  "/work/curbcutos.png":
    "2021 — Designed and led accessibility data tools at CurbCutOS — calm, legible, and human.",
  "/work/zalando-dodont.png":
    "2022 — Unified SE (B2B) division at Zalando under one shared design system.",
  "/work/zalando-spread.png":
    "2022 — Unified SE (B2B) division at Zalando under one shared design system.",
  "/work/artscapy.png":
    "2017–2019 — Built brands, launch sites, and interfaces that taught restraint and speed.",
  "/work/us.png":
    "2017–2019 — Built brands, launch sites, and interfaces that taught restraint and speed.",
};

/**
 * Gets caption for mobile view (prefers specific over project-level)
 * @param src - Image source path
 * @returns Caption string or null
 */
function getMobileCaptionForSrc(src: string): string | null {
  return WORK_CAPTIONS[src] ?? getCaptionForSrc(src);
}

/**
 * Gets caption for a specific project key
 * @param project - Project key (e.g., "cb", "vf")
 * @returns Caption string or null
 */
function getProjectCaption(project: string): string | null {
  return PROJECT_CAPTIONS[project] ?? null;
}

/**
 * Determines if a caption should be rendered for grouped mobile panels
 * Only shows caption on the last image of each project group
 * @param images - Array of all image sources
 * @param index - Current image index
 * @returns true if caption should be shown
 */
function shouldRenderGroupCaption(images: string[], index: number): boolean {
  const current = getProjectFromSrc(images[index]);
  const next =
    index + 1 < images.length ? getProjectFromSrc(images[index + 1]) : null;
  return current !== null && current !== next;
}

// ============================================================================
// IMAGE LOADING BUCKETS - Prioritized loading strategy
// ============================================================================

/** First 2 images - loaded immediately (critical) */
const INITIAL_IMAGES = IMAGE_SOURCES.slice(0, INITIAL_IMAGE_COUNT);
/** Next 2 images - preloaded after initial (eager) */
const PRELOAD_IMAGES = IMAGE_SOURCES.slice(
  INITIAL_IMAGE_COUNT,
  PRELOAD_IMAGE_COUNT
);
/** Remaining images - loaded on demand (lazy) */
const LAZY_IMAGES = IMAGE_SOURCES.slice(PRELOAD_IMAGE_COUNT);

/**
 * Generates SVG placeholder for images during loading
 * @param width - Placeholder width in pixels
 * @param height - Placeholder height in pixels
 * @returns Base64-encoded SVG data URL
 */
const generatePlaceholder = (width = 400, height = 300) =>
  `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="#9ca3af">Loading...</text>
      </svg>
    `)}`;

/**
 * Parses caption string into year and description parts
 * @param caption - Full caption string (e.g., "2025 — Description text")
 * @returns Object with year and description properties
 */
const parseCaption = (caption: string) => {
  // Split on the first occurrence of " — " only, preserving additional dashes in description
  const parts = caption.split(" — ", 2);
  if (parts.length === 2) {
    return { year: parts[0], description: parts[1] };
  }
  return { year: "", description: caption };
};

/**
 * Renders year text (placeholder for potential rolling animation)
 * @param year - Year string to render
 * @returns Year string or null
 */
function renderYearWithRolling(year: string | undefined | null) {
  if (!year) return null;
  // Keep it simple: return raw text for both single years and ranges
  return year;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Page() {
  // ============================================================================
  // REFS - DOM element references and persistent values
  // ============================================================================

  const mainContentRef = useRef<HTMLElement | null>(null); // Main content for skip link focus
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null); // Focus restoration for modals
  const videoModalRef = useRef<HTMLDivElement | null>(null); // Video modal for focus trap
  const imageMeasureRef = useRef<HTMLDivElement | null>(null); // Measures image width for caption alignment
  const slideshowRef = useRef<HTMLDivElement | null>(null); // Slideshow container for intersection observer
  const mobileScrollRef = useRef<HTMLElement | null>(null); // Mobile scroll container
  const scrollRafIdRef = useRef<number | null>(null); // RAF ID for scroll performance
  const headerRef = useRef<HTMLElement | null>(null); // Mobile header for height measurement
  const footerRef = useRef<HTMLElement | null>(null); // Mobile footer for height measurement
  const lastDirectionRef = useRef<1 | -1>(1); // Carousel navigation direction (persistent)
  const hasAutoScrolledRef = useRef(false); // Prevents multiple auto-scrolls

  // ============================================================================
  // HOOKS - External state and utilities
  // ============================================================================

  const shouldReduceMotion = useReducedMotion(); // Respects prefers-reduced-motion
  const isMobile = useIsMobile(); // Mobile breakpoint (< 768px)
  const animationLevel = useAnimationLevel(); // Animation preference level
  const loadingSequence = useLoadingSequence(); // Adaptive loading state manager

  // ============================================================================
  // STATE - Component state management
  // ============================================================================

  // Core lifecycle
  const [mounted, setMounted] = useState(false); // Client-side mount status
  const [criticalContentLoaded, setCriticalContentLoaded] = useState(false); // First image loaded
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Initial setup complete

  // Focus/blur animation (entrance effect)
  const [blurAmount, setBlurAmount] = useState(15); // Initial blur amount (15px)
  const [focusAnimationRun, setFocusAnimationRun] = useState(false); // Focus animation started

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Active carousel image
  const [previousImageIndex, setPreviousImageIndex] = useState(0); // Previous image for transitions
  const [lastDirection, setLastDirection] = useState<1 | -1>(1); // Carousel direction (1=forward, -1=back)
  const [isNavigating, setIsNavigating] = useState(false); // Navigation debounce flag
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false); // Pause auto-preview

  // Image loading
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({}); // Track loaded images
  const [imageWidth, setImageWidth] = useState<number | null>(null); // Current image width for layout

  // Animation sequence flags
  const [firstLineComplete, setFirstLineComplete] = useState(false); // First text line animated
  const [secondLineComplete, setSecondLineComplete] = useState(false); // Second text line animated
  const [carouselAnimationComplete, setCarouselAnimationComplete] = useState(false); // Carousel visible
  const [finalTextAnimationComplete, setFinalTextAnimationComplete] = useState(false); // All text visible

  // Preview/auto-play
  const [isPreviewRunning, setIsPreviewRunning] = useState(false); // Auto-preview in progress
  const [isPreviewComplete, setIsPreviewComplete] = useState(false); // Auto-preview finished
  const [isInViewport, setIsInViewport] = useState(false); // Slideshow in viewport

  // Modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // Video modal visible
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null); // Active video URL
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); // About modal visible

  // Mobile-specific state
  const [activePanelIndex, setActivePanelIndex] = useState(0); // Active mobile scroll panel
  const [headerH, setHeaderH] = useState<number>(0); // Mobile header height
  const [footerH, setFooterH] = useState<number>(0); // Mobile footer height
  const [blurByIndex, setBlurByIndex] = useState<number[]>([]); // Per-panel blur amounts
  const [isScrolling, setIsScrolling] = useState(false); // Mobile scroll in progress
  const [footerRevealReady, setFooterRevealReady] = useState(false); // Mobile footer ready to show

  // Loading stage tracking
  const [currentLoadingStage, setCurrentLoadingStage] = useState(0); // Current loading stage (0-4)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /** Minimum panel height accounting for fixed mobile header/footer */
  const panelMinH = useMemo(
    () => `calc(100svh - ${headerH + footerH}px)`,
    [headerH, footerH]
  );

  // ============================================================================
  // EFFECTS - Lifecycle and side effects
  // ============================================================================

  // EFFECT: Client-side mount detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // EFFECT: Mobile scroll position reset (mobile-only)
  useEffect(() => {
    if (!isMobile) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [isMobile]);

  // EFFECT: Loading stage progression tracking
  useEffect(() => {
    let stage = 0;
    if (loadingSequence.textLoaded) stage = 1;
    if (loadingSequence.imagesLoaded) stage = 2;
    if (loadingSequence.navigationLoaded) stage = 3;
    if (loadingSequence.allLoaded) stage = 4;
    setCurrentLoadingStage(stage);
  }, [
    loadingSequence.allLoaded,
    loadingSequence.imagesLoaded,
    loadingSequence.navigationLoaded,
    loadingSequence.textLoaded,
  ]);

  // EFFECT: Skip second line animation if reduced motion enabled
  useEffect(() => {
    if (shouldReduceMotion && firstLineComplete) {
      setSecondLineComplete(true);
    }
  }, [shouldReduceMotion, firstLineComplete]);

  // EFFECT: Initial page blur-to-focus animation (entrance effect)
  // Animates from 15px blur to 0px over 1.5s with cubic easing
  useEffect(() => {
    if (!mounted || focusAnimationRun) {
      return;
    }

    setFocusAnimationRun(true);

    const totalDuration = 1500;
    const startTime = Date.now();
    const initialBlur = 15;
    setBlurAmount(initialBlur);

    const focusInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const newBlur = initialBlur * (1 - easedProgress);
      setBlurAmount(newBlur);

      if (progress >= 1) {
        window.clearInterval(focusInterval);
        setBlurAmount(0);
      }
    }, 16);

    return () => {
      window.clearInterval(focusInterval);
      setBlurAmount(0);
    };
  }, [focusAnimationRun, mounted]);

  useEffect(() => {
    if (!mounted || criticalContentLoaded) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setCriticalContentLoaded(true);
    }, 3000);

    return () => {
      window.clearTimeout(fallback);
    };
  }, [criticalContentLoaded, mounted]);

  // Measure header/footer heights for fixed layout padding (mobile)
  useEffect(() => {
    if (!isMobile) return;
    const h = headerRef.current;
    const f = footerRef.current;
    const ro = new ResizeObserver(() => {
      setHeaderH(h?.offsetHeight ?? 0);
      setFooterH(f?.offsetHeight ?? 0);
    });
    if (h) ro.observe(h as Element);
    if (f) ro.observe(f as Element);
    const onResize = () => {
      setHeaderH(h?.offsetHeight ?? 0);
      setFooterH(f?.offsetHeight ?? 0);
    };
    window.addEventListener("resize", onResize);
    // Initialize once
    setHeaderH(h?.offsetHeight ?? 0);
    setFooterH(f?.offsetHeight ?? 0);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [isMobile]);

  // Initialize blur array when images list changes
  useEffect(() => {
    setBlurByIndex((prev) => {
      if (prev.length === IMAGE_SOURCES.length) return prev;
      return new Array(IMAGE_SOURCES.length).fill(0);
    });
  }, []);

  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages((prev) => {
      if (prev[src]) {
        return prev;
      }
      return { ...prev, [src]: true };
    });

    if (src === IMAGE_SOURCES[0]) {
      setCriticalContentLoaded(true);
    }
  }, []);

  const preloadImage = useCallback(
    (src: string, retryCount = 0): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        const timeoutId = window.setTimeout(() => {
          reject(new Error(`Timeout loading ${src}`));
        }, IMAGE_LOAD_TIMEOUT);

        img.onload = () => {
          window.clearTimeout(timeoutId);
          handleImageLoad(src);
          resolve();
        };

        img.onerror = () => {
          window.clearTimeout(timeoutId);

          if (retryCount < IMAGE_RETRY_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 4000);
            window.setTimeout(() => {
              preloadImage(src, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, delay);
          } else {
            reject(new Error(`Failed to load ${src}`));
          }
        };

        img.src = src;
      });
    },
    [handleImageLoad]
  );

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    const timers = new Set<number>();

    const load = async () => {
      await Promise.allSettled(INITIAL_IMAGES.map((src) => preloadImage(src)));
      if (cancelled) return;

      const timer = window.setTimeout(() => {
        PRELOAD_IMAGES.forEach((src) => {
          preloadImage(src).catch(() => {});
        });
      }, 600);

      timers.add(timer);
    };

    load();

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [mounted, preloadImage]);

  useEffect(() => {
    if (!criticalContentLoaded) return;

    const nextImages: string[] = [];
    for (let i = 1; i <= PRELOAD_LOOKAHEAD; i++) {
      const nextIndex = (currentImageIndex + i) % IMAGE_SOURCES.length;
      const nextSrc = IMAGE_SOURCES[nextIndex];
      if (!loadedImages[nextSrc]) {
        nextImages.push(nextSrc);
      }
    }

    nextImages.forEach((src) => {
      preloadImage(src).catch(() => {});
    });
  }, [criticalContentLoaded, currentImageIndex, loadedImages, preloadImage]);

  useEffect(() => {
    const el = imageMeasureRef.current;
    if (!el) return;

    const update = () => setImageWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [currentImageIndex]);

  useEffect(() => {
    if (!mounted) return;

    const element = slideshowRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isVideoModalOpen) {
          setIsVideoModalOpen(false);
        } else if (isAboutModalOpen) {
          setIsAboutModalOpen(false);
        }
        return;
      }

      if (isVideoModalOpen) return;

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        setIsSlideshowPaused(true);
        if (event.key === "ArrowRight") {
          navigateBy(1);
        } else {
          navigateBy(-1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isAboutModalOpen, isVideoModalOpen]);

  const navigateToIndex = useCallback(
    (computeNext: (prev: number) => number) => {
      setCurrentImageIndex((prev) => {
        const next = computeNext(prev);
        setPreviousImageIndex(prev);
        return next;
      });
    },
    []
  );

  // Top-level: track active panel and compute distance-based blur during scroll (mobile only)
  useEffect(() => {
    if (!mounted || !isMobile) return;
    const container = mobileScrollRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let scrollEndTimeout: number | undefined;

    const compute = () => {
      const sections = Array.from(
        container.querySelectorAll<HTMLElement>("section[data-panel]")
      );
      if (sections.length === 0) return;
      const viewportMid = window.innerHeight / 2;
      let closestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      const nextBlur: number[] = new Array(sections.length).fill(0);
      sections.forEach((sec, i) => {
        const rect = sec.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - viewportMid);
        if (dist < bestDistance) {
          bestDistance = dist;
          closestIndex = i;
        }
        const normalized = Math.min(1, dist / (window.innerHeight * 0.5));
        nextBlur[i] = isScrolling ? normalized * 8 : 0;
      });
      setActivePanelIndex(closestIndex);
      setBlurByIndex((prev) => {
        // Avoid excessive state churn
        if (
          prev.length === nextBlur.length &&
          prev.every((v, i) => v === nextBlur[i])
        ) {
          return prev;
        }
        return nextBlur;
      });
    };

    const onScroll = () => {
      if (rafId != null) return;
      setIsScrolling(true);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        compute();
        if (scrollEndTimeout !== undefined)
          window.clearTimeout(scrollEndTimeout);
        scrollEndTimeout = window.setTimeout(() => {
          setIsScrolling(false);
          setBlurByIndex((arr) =>
            arr.length ? new Array(arr.length).fill(0) : arr
          );
        }, 120);
      });
    };

    compute();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
      if (scrollEndTimeout !== undefined) window.clearTimeout(scrollEndTimeout);
    };
  }, [mounted, isMobile, isScrolling]);

  // Reveal footer links after the first user scroll on mobile
  useEffect(() => {
    if (!mounted || !isMobile || footerRevealReady) return;
    const container = mobileScrollRef.current;
    if (!container) return;

    const onFirstScroll = () => {
      if (container.scrollTop > 6) {
        setFooterRevealReady(true);
        container.removeEventListener("scroll", onFirstScroll);
      }
    };
    container.addEventListener("scroll", onFirstScroll, { passive: true });
    return () => container.removeEventListener("scroll", onFirstScroll);
  }, [mounted, isMobile, footerRevealReady]);

  // Fallback: if scroll event is not captured, reveal after a short delay
  useEffect(() => {
    if (!mounted || !isMobile || footerRevealReady) return;
    const timer = window.setTimeout(() => {
      setFooterRevealReady(true);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [mounted, isMobile, footerRevealReady]);

  const navigateBy = useCallback(
    (delta: number) => {
      const dir: 1 | -1 = delta >= 0 ? 1 : -1;
      lastDirectionRef.current = dir;
      setLastDirection(dir);
      navigateToIndex((prev) => {
        const length = IMAGE_SOURCES.length;
        return (prev + delta + length) % length;
      });
    },
    [navigateToIndex]
  );

  useEffect(() => {
    if (isVideoModalOpen) {
      previouslyFocusedElementRef.current =
        (document.activeElement as HTMLElement) ?? null;
      return;
    }

    if (isAboutModalOpen) {
      previouslyFocusedElementRef.current =
        (document.activeElement as HTMLElement) ?? null;
      return;
    }

    previouslyFocusedElementRef.current?.focus?.();
  }, [isAboutModalOpen, isVideoModalOpen]);

  useEffect(() => {
    if (carouselAnimationComplete && !finalTextAnimationComplete) {
      const timer = window.setTimeout(() => {
        setFinalTextAnimationComplete(true);
      }, 300);

      return () => window.clearTimeout(timer);
    }
  }, [carouselAnimationComplete, finalTextAnimationComplete]);

  const previewPrerequisitesMet = useMemo(
    () =>
      !shouldReduceMotion &&
      !isPreviewComplete &&
      mounted &&
      criticalContentLoaded &&
      finalTextAnimationComplete &&
      initialLoadComplete &&
      isInViewport &&
      !isVideoModalOpen &&
      !isSlideshowPaused,
    [
      criticalContentLoaded,
      finalTextAnimationComplete,
      initialLoadComplete,
      isInViewport,
      isPreviewComplete,
      isSlideshowPaused,
      isVideoModalOpen,
      mounted,
      shouldReduceMotion,
    ]
  );

  useEffect(() => {
    if (!previewPrerequisitesMet) return;

    setIsPreviewRunning(true);

    let previewSteps = 0;
    const totalSteps = IMAGE_SOURCES.length * PREVIEW_LOOPS;
    let settleTimeout: number | undefined;

    const previewInterval = window.setInterval(() => {
      previewSteps += 1;
      setCurrentImageIndex((prev) => (prev + 1) % IMAGE_SOURCES.length);

      if (previewSteps >= totalSteps) {
        window.clearInterval(previewInterval);
        settleTimeout = window.setTimeout(() => {
          setIsPreviewRunning(false);
          setIsPreviewComplete(true);
        }, PREVIEW_SETTLE_DELAY);
      }
    }, PREVIEW_SPEED);

    return () => {
      window.clearInterval(previewInterval);
      if (settleTimeout !== undefined) {
        window.clearTimeout(settleTimeout);
      }
      setIsPreviewRunning(false);
    };
  }, [previewPrerequisitesMet]);

  useEffect(() => {
    if (
      !mounted ||
      !criticalContentLoaded ||
      !isInViewport ||
      isVideoModalOpen ||
      isSlideshowPaused ||
      initialLoadComplete
    ) {
      return;
    }

    setCurrentImageIndex(0);
    setInitialLoadComplete(true);
  }, [
    criticalContentLoaded,
    initialLoadComplete,
    isInViewport,
    isSlideshowPaused,
    isVideoModalOpen,
    mounted,
  ]);

  const handleOpenVideoModal = (imageSrc: string) => {
    const videoUrl = getVideoForSrc(imageSrc);
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setIsVideoModalOpen(true);
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl(null);
  };

  const handleCloseAboutModal = () => {
    setIsAboutModalOpen(false);
  };

  const handleFocusTrapKeyDown = (
    event: React.KeyboardEvent,
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (event.key !== "Tab") {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), textarea, input, select, [tabindex]:not([tabindex="-1"]), [role="button"]:not([tabindex="-1"])'
      )
    ).filter(
      (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  };

  const images = IMAGE_SOURCES;
  const initialImages = INITIAL_IMAGES;
  const lazyImages = LAZY_IMAGES;
  const isEmailReady = loadingSequence.textLoaded && secondLineComplete;
  const isFooterReady = footerRevealReady;

  const panelVariants = useMemo(() => {
    if (shouldReduceMotion) {
      // Provide a minimal variant to satisfy typing; animate prop will still use keys
      return {
        active: { opacity: 1 },
        inactive: { opacity: 1 },
      } as const;
    }
    return {
      active: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: EASING.tertiary },
      },
      inactive: {
        opacity: 0.98,
        scale: 0.992,
        transition: { duration: 0.4, ease: EASING.tertiary },
      },
    } as const;
  }, [shouldReduceMotion]);

  if (!mounted) {
    return null;
  }

  if (!criticalContentLoaded) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <div className="sm:px-10 py-16 pb-32 md:px-28">
            <div className="w-full max-w-screen-xl mx-auto">
              {!loadingSequence.imagesLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 2.8,
                    delay: 1.0,
                    ease: EASING.secondary,
                  }}
                  className="space-y-20 md:space-y-12"
                >
                  <div className="space-y-8">
                    <div className="w-full mb-0 overflow-hidden relative">
                      <div className="relative w-full h-full">
                        <div className="block sm:hidden space-y-4">
                          {[1, 2, 3].map((i) => (
                            <BreathingSkeleton key={i} className="w-full">
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 1.8,
                                  delay: 1.5 + i * 0.3,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                <div className="w-full h-[350px] md:h-[300px] bg-foreground/5 rounded-lg" />
                              </motion.div>
                            </BreathingSkeleton>
                          ))}
                        </div>

                        <div className="hidden sm:block relative w-full h-full">
                          <BreathingSkeleton>
                            <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 2.4,
                                delay: 1.8,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="w-full h-[600px] md:h-[400px] bg-foreground/5 rounded-lg"
                            />
                          </BreathingSkeleton>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 1.2,
                      delay: 1.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-col items-center justify-center mt-12 space-y-4"
                  >
                    <LoadingProgress
                      progress={loadingSequence.loadingProgress}
                      isAdaptive={loadingSequence.isAdaptive}
                      estimatedTimeRemaining={
                        loadingSequence.estimatedTimeRemaining
                      }
                      className="w-32"
                    />

                    {loadingSequence.isAdaptive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-xs text-foreground/30"
                      >
                        Optimizing for your connection
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="mt-6"
                    >
                      <ProgressiveLoadingStates
                        currentStage={currentLoadingStage}
                        stages={LOADING_STAGES}
                        className="text-center"
                      />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-4 md:space-y-3">
                    <BreathingSkeleton>
                      <div className="w-full h-[120px] md:h-[100px] bg-foreground/5 rounded" />
                    </BreathingSkeleton>
                    <BreathingSkeleton>
                      <div className="w-full h-[150px] md:h-[120px] bg-foreground/5 rounded" />
                    </BreathingSkeleton>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md focus:shadow-lg"
        onClick={(event) => {
          event.preventDefault();
          mainContentRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <div
        style={{
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
          transition: "filter 3s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative",
        }}
      >
        <motion.main
          id="main-content"
          ref={mainContentRef}
          tabIndex={-1}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 2,
                  ease: EASING.primary,
                }
          }
          className="sm:px-10 py-4 md:py-0 pb-4 md:px-28 bg-background relative overflow-x-hidden md:min-h-screen md:flex md:flex-col md:justify-center md:overflow-hidden"
          style={{
            minHeight: "100vh",
            willChange: "auto",
            scrollMarginTop: "var(--header-offset, 4rem)",
          }}
        >
          <div className="w-full max-w-screen-xl mx-auto relative z-10 md:flex md:flex-col md:justify-center md:h-full">
            {criticalContentLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.2,
                  ease: EASING.primary,
                }}
                className="space-y-3 md:space-y-0 md:flex md:flex-col md:items-center md:justify-center md:py-0 md:h-full md:flex-1 md:gap-6"
                style={{
                  willChange: "transform, opacity",
                  gap: isMobile ? undefined : "clamp(1vh, 1.5vh, 2vh)",
                }}
              >
                <motion.div
                  className="w-full hidden md:block md:flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASING.primary }}
                >
                  <div className="text-center mb-2 md:mb-4">
                    {loadingSequence.textLoaded && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          duration: 1.5,
                          delay: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onAnimationComplete={() => {
                          setTimeout(() => {
                            setFirstLineComplete(true);
                            setTimeout(() => {
                              setSecondLineComplete(true);
                            }, 500);
                          }, 1000);
                        }}
                      >
                        <div className="tracking-tight text-xl md:whitespace-nowrap">
                          <WordReveal
                            text="Raf leads design, crafts narratives and ships code."
                            className="text-foreground/70"
                            interactiveWord={{
                              word: "Raf",
                              onActivate: () => setIsAboutModalOpen(true),
                              ariaLabel: "About Raf",
                            }}
                            interactiveHintVisible={true}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Mobile-only: top hero, center snap panels, bottom contact */}
                <motion.div
                  className="w-full block md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASING.primary }}
                >
                  <div className="relative h-[100svh]">
                    {/* Fixed top header */}
                    <header
                      ref={headerRef as React.RefObject<HTMLElement>}
                      className="fixed top-0 left-0 right-0 z-20 pb-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                      style={{
                        paddingTop:
                          "calc(env(safe-area-inset-top, 0px) + 20px)",
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          duration: 1.0,
                          delay: 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onAnimationComplete={() => {
                          setTimeout(() => {
                            setFirstLineComplete(true);
                            setTimeout(() => setSecondLineComplete(true), 400);
                          }, 600);
                        }}
                      >
                        <div className="tracking-tight text-lg">
                          <WordReveal
                            text="Raf leads design, crafts narratives and ships code."
                            className="text-foreground/70"
                            interactiveWord={{
                              word: "Raf",
                              onActivate: () => setIsAboutModalOpen(true),
                              ariaLabel: "About Raf",
                            }}
                            interactiveHintVisible={isFooterReady}
                          />
                        </div>
                      </motion.div>
                    </header>

                    {/* Scroll container with padding to account for fixed header/footer */}
                    <main
                      ref={mobileScrollRef as React.RefObject<HTMLElement>}
                      className="h-[100svh] overflow-y-auto overscroll-contain snap-y snap-mandatory"
                      style={{}}
                    >
                      {images.map((src, index) => (
                        <motion.section
                          variants={panelVariants}
                          animate={
                            index === activePanelIndex ? "active" : "inactive"
                          }
                          key={`panel-${src}`}
                          id={index === 0 ? "panel-0" : undefined}
                          data-panel
                          className="snap-center snap-always flex items-center justify-center px-4 sm:px-3"
                          style={{
                            minHeight: panelMinH,
                            filter:
                              blurByIndex[index] && !shouldReduceMotion
                                ? `blur(${blurByIndex[index]}px)`
                                : undefined,
                          }}
                        >
                          <figure className="w-full max-w-screen-sm">
                            <div className="w-full max-h-[78svh] flex flex-col items-center justify-center relative pb-6 gap-3">
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y: shouldReduceMotion ? 0 : 14,
                                  filter: shouldReduceMotion
                                    ? undefined
                                    : "blur(12px)",
                                  scale: shouldReduceMotion ? 1 : 0.98,
                                }}
                                animate={
                                  loadingSequence.textLoaded &&
                                  !!loadedImages[src] &&
                                  secondLineComplete
                                    ? {
                                        opacity: 1,
                                        y: 0,
                                        filter: "blur(0px)",
                                        scale: 1,
                                        transition: {
                                          duration: 1.1,
                                          ease: EASING.primary,
                                          // Image follows header by a modest delay
                                          delay: 0.55,
                                        },
                                      }
                                    : {}
                                }
                                style={{
                                  filter:
                                    blurByIndex[index] && !shouldReduceMotion
                                      ? `blur(${blurByIndex[index]}px)`
                                      : undefined,
                                }}
                              >
                                <WorkImageContainer
                                  src={src}
                                  alt={`Work preview ${index + 1}`}
                                  width={600}
                                  height={450}
                                  hasVideo={!!getVideoForSrc(src)}
                                  onVideoClick={() => handleOpenVideoModal(src)}
                                  onMouseEnter={() =>
                                    setIsSlideshowPaused(true)
                                  }
                                  onMouseLeave={() =>
                                    setIsSlideshowPaused(false)
                                  }
                                  onLoad={() => handleImageLoad(src)}
                                  variant="mobile"
                                  className="w-full"
                                  priority={index < INITIAL_IMAGE_COUNT}
                                  loading={
                                    index < INITIAL_IMAGE_COUNT
                                      ? "eager"
                                      : "lazy"
                                  }
                                  placeholder="blur"
                                  blurDataURL={generatePlaceholder(900, 700)}
                                  sizes="100vw"
                                  quality={IMAGE_QUALITY}
                                  isLoaded={!!loadedImages[src]}
                                />
                              </motion.div>
                              {(() => {
                                const project = getProjectFromSrc(src);
                                if (!project) return null;
                                const caption = getProjectCaption(project);
                                if (!caption) return null;
                                const parsed = parseCaption(caption);
                                return (
                                  <motion.figcaption
                                    className="text-center text-sm leading-snug text-foreground/70 dark:text-foreground/80"
                                    initial={{
                                      opacity: 0,
                                      y: 8,
                                      filter: "blur(6px)",
                                    }}
                                    animate={
                                      loadedImages[src] && secondLineComplete
                                        ? {
                                            opacity: 1,
                                            y: 0,
                                            filter: "blur(0px)",
                                          }
                                        : {}
                                    }
                                    transition={{
                                      duration: 0.6,
                                      ease: EASING.tertiary,
                                      // Caption follows image
                                      delay: 0.85,
                                    }}
                                    onAnimationComplete={() => {
                                      if (index === 0) {
                                        // First caption signals footer can reveal next, with a subtle offset
                                        window.setTimeout(
                                          () => setFooterRevealReady(true),
                                          220
                                        );
                                      }
                                    }}
                                  >
                                    {parsed.year ? (
                                      <>
                                        <span className="text-foreground/50">
                                          {renderYearWithRolling(parsed.year)}
                                        </span>
                                        <span className="text-foreground/80">{` ${parsed.description}`}</span>
                                      </>
                                    ) : (
                                      parsed.description
                                    )}
                                  </motion.figcaption>
                                );
                              })()}
                            </div>
                          </figure>
                        </motion.section>
                      ))}
                    </main>

                    {/* Fixed bottom footer */}
                    <footer
                      ref={footerRef as React.RefObject<HTMLElement>}
                      className="fixed bottom-0 left-0 right-0 z-30 pt-4 bg-gradient-to-t from-background/85 to-transparent backdrop-blur"
                      style={{ paddingBottom: MOBILE_CONTACT_BOTTOM_PADDING }}
                      aria-label="Mobile contact links"
                    >
                      <div className="mobile-gutter">
                        <motion.div
                          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                          animate={
                            isFooterReady
                              ? { opacity: 1, y: 0, filter: "blur(0px)" }
                              : { opacity: 0, y: 8, filter: "blur(6px)" }
                          }
                          transition={{
                            duration: 0.55,
                            ease: EASING.tertiary,
                            delay: 0.1,
                          }}
                          className="flex items-center justify-center gap-4 text-sm"
                        >
                          {MOBILE_CONTACT_LINKS.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target={link.openInNewTab ? "_blank" : undefined}
                              rel={
                                link.openInNewTab
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              aria-label={link.ariaLabel}
                              className="text-foreground/75 hover:text-foreground transition-colors"
                            >
                              {link.label}
                            </a>
                          ))}
                        </motion.div>
                      </div>
                    </footer>
                  </div>
                </motion.div>

                <motion.div
                  className="w-full mt-0 md:mt-0"
                  initial={{
                    opacity: 0,
                    y: 40,
                    filter: "blur(15px)",
                    scale: 0.98,
                  }}
                  animate={
                    secondLineComplete
                      ? {
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                          scale: 1,
                        }
                      : {
                          opacity: 0,
                          y: 40,
                          filter: "blur(15px)",
                          scale: 0.98,
                        }
                  }
                  transition={{
                    duration: 2,
                    delay: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onAnimationComplete={() => {
                    setTimeout(() => {
                      setCarouselAnimationComplete(true);
                    }, 200);
                  }}
                >
                  <div className="space-y-2 md:space-y-0 md:flex md:flex-col md:justify-center md:items-center md:h-full md:max-w-4xl md:mx-auto md:flex-1 md:py-2">
                    <div
                      ref={slideshowRef}
                      className="w-full mb-0 overflow-hidden relative md:flex-1 md:flex md:items-center md:justify-center md:max-h-[90vh]"
                      onMouseEnter={() => setIsSlideshowPaused(true)}
                      onMouseLeave={() => setIsSlideshowPaused(false)}
                      onTouchStart={() => setIsSlideshowPaused(true)}
                      onTouchEnd={() => {
                        window.setTimeout(() => {
                          setIsSlideshowPaused(false);
                        }, 1000);
                      }}
                    >
                      <div className="relative w-full h-full">
                        <div
                          className="hidden sm:flex relative w-full min-h-[45vh] md:max-h-[85vh] lg:max-h-[90vh] items-center justify-center"
                          style={{ perspective: "1200px" }}
                        >
                          {images.map((src, index) => (
                            <motion.div
                              key={src}
                              className="absolute top-0 left-0 right-0 w-full min-h-full"
                              variants={pageTurnVariants(
                                animationLevel,
                                lastDirection
                              )}
                              initial="initial"
                              animate={
                                index === currentImageIndex ? "animate" : "exit"
                              }
                              exit="exit"
                              style={{
                                zIndex: index === currentImageIndex ? 2 : 1,
                                pointerEvents:
                                  index === currentImageIndex ? "auto" : "none",
                              }}
                            >
                              {index === currentImageIndex && (
                                <>
                                  <div
                                    className="absolute left-0 top-0 h-full w-[28%] z-[60] cursor-w-resize"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (isNavigating) return;
                                      setIsNavigating(true);
                                      navigateBy(-1);
                                      window.setTimeout(
                                        () => setIsNavigating(false),
                                        NAVIGATION_DEBOUNCE
                                      );
                                    }}
                                  />
                                  <div
                                    className="absolute right-0 top-0 h-full w-[28%] z-[60] cursor-e-resize"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (isNavigating) return;
                                      setIsNavigating(true);
                                      navigateBy(1);
                                      window.setTimeout(
                                        () => setIsNavigating(false),
                                        NAVIGATION_DEBOUNCE
                                      );
                                    }}
                                  />
                                  <div className="absolute left-[28%] top-0 h-full w-[44%] z-[95] pointer-events-none" />
                                </>
                              )}
                              <div className="flex flex-col items-center">
                                <WorkImageContainer
                                  src={src}
                                  alt={`Work preview ${index + 1}`}
                                  width={800}
                                  height={600}
                                  hasVideo={!!getVideoForSrc(src)}
                                  onVideoClick={() => handleOpenVideoModal(src)}
                                  onMouseEnter={() =>
                                    setIsSlideshowPaused(true)
                                  }
                                  onMouseLeave={() =>
                                    setIsSlideshowPaused(false)
                                  }
                                  onLoad={() => handleImageLoad(src)}
                                  priority={index < INITIAL_IMAGE_COUNT}
                                  loading={
                                    index < INITIAL_IMAGE_COUNT
                                      ? "eager"
                                      : "lazy"
                                  }
                                  placeholder="blur"
                                  blurDataURL={generatePlaceholder(1200, 900)}
                                  sizes="(min-width: 1280px) 60vw, 100vw"
                                  quality={IMAGE_QUALITY}
                                  isLoaded={!!loadedImages[src]}
                                />
                                {index === currentImageIndex && (
                                  <div
                                    ref={imageMeasureRef}
                                    className="w-full max-w-[800px] hidden"
                                  />
                                )}
                              </div>
                            </motion.div>
                          ))}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={images[0]}
                            alt="Layout placeholder"
                            className="w-full h-full invisible object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="min-h-[1.5rem] hidden sm:block"
                      style={{ marginTop: "clamp(2rem, 3.2vh, 3rem)" }}
                    >
                      <motion.div
                        key={
                          getProjectFromSrc(images[currentImageIndex]) ??
                          currentImageIndex
                        }
                        initial={{
                          opacity: 0,
                          filter: "blur(10px) saturate(0.96)",
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px) saturate(1)",
                        }}
                        transition={{
                          duration: 0.6,
                          ease: [0.16, 1, 0.3, 1],
                          delay: 0.08,
                        }}
                      >
                        <div
                          className="mx-auto w-full"
                          style={{
                            maxWidth: imageWidth
                              ? `${imageWidth}px`
                              : "min(92vw, 1200px)",
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                            {(() => {
                              const currentSrc = images[currentImageIndex];
                              const caption = getCaptionForSrc(currentSrc);
                              if (!caption) return null;
                              const parsed = parseCaption(caption);
                              const currentProject =
                                getProjectFromSrc(currentSrc);
                              return (
                                <>
                                  {parsed.year && (
                                    <span className="text-foreground/50 text-sm font-medium">
                                      {renderYearWithRolling(parsed.year)}
                                    </span>
                                  )}
                                  <motion.span
                                    key={currentProject ?? "caption"}
                                    initial={{
                                      opacity: 0,
                                      filter: "blur(10px) saturate(0.96)",
                                    }}
                                    animate={{
                                      opacity: 1,
                                      filter: "blur(0px) saturate(1)",
                                    }}
                                    transition={{
                                      duration: 0.55,
                                      ease: [0.16, 1, 0.3, 1],
                                      delay: 0.02,
                                    }}
                                    className="text-foreground/80 text-sm font-medium sm:text-right"
                                  >
                                    {parsed.description}
                                  </motion.span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.main>

        <AnimatePresence>
          {isVideoModalOpen && (
            <>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
                onClick={handleCloseVideoModal}
              />
              <motion.div
                initial={
                  shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
                className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
                onClick={handleCloseVideoModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="video-modal-title"
                tabIndex={-1}
                ref={videoModalRef}
                onKeyDown={(event) =>
                  handleFocusTrapKeyDown(event, videoModalRef)
                }
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="relative w-full max-w-5xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h2 id="video-modal-title" className="sr-only">
                    Project video
                  </h2>
                  <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                    <iframe
                      src={currentVideoUrl ?? ""}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Project Video"
                      style={{ background: "#000000" }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAboutModalOpen && (
            <>
              <motion.div
                variants={
                  shouldReduceMotion ? modalReduced : modalOverlayVariants
                }
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 backdrop-blur-[48px] backdrop-saturate-0 bg-white/95 dark:bg-neutral-950/85"
                onClick={handleCloseAboutModal}
              />
              <motion.div
                variants={
                  shouldReduceMotion ? modalReduced : modalContainerVariants
                }
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 sm:p-6"
                onClick={handleCloseAboutModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="about-modal-title"
                tabIndex={-1}
              >
                <motion.div
                  variants={
                    shouldReduceMotion ? modalReduced : modalPanelVariants
                  }
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative w-full max-w-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h2 id="about-modal-title" className="sr-only">
                    About Raf
                  </h2>
                  <motion.div
                    variants={modalTextStagger.container}
                    initial="hidden"
                    animate="visible"
                    className="text-left space-y-3 text-foreground"
                  >
                    <motion.p
                      variants={modalTextStagger.item}
                      className="leading-[1.45] text-[0.95rem] text-foreground/90"
                    >
                      From the Amalfi Coast to Toronto, often in Lisbon.
                    </motion.p>
                    <motion.p
                      variants={modalTextStagger.item}
                      className="leading-[1.45] text-[0.95rem] text-foreground/90"
                    >
                      Over the past eight years, I’ve designed and engineered
                      products across industries: from AI platforms and
                      marketplaces to B2B tools in fintech, from crypto to
                      consumer brands.
                    </motion.p>
                    <motion.p
                      variants={modalTextStagger.item}
                      className="leading-[1.45] text-[0.95rem] text-foreground/90"
                    >
                      I believe good design and storytelling travel across
                      industries. Clarity, and kindness guide my work.
                    </motion.p>
                    <motion.p
                      variants={modalTextStagger.item}
                      className="leading-[1.45] text-[0.95rem] text-foreground/90"
                    >
                      Usually found on a yoga mat or chasing light through
                      beautiful spaces.
                    </motion.p>
                    <div
                      className="space-y-1.5"
                      style={{ marginTop: "2.5rem" }}
                    >
                      <a
                        href="mailto:raf@raf.works"
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium block"
                      >
                        raf@raf.works
                      </a>
                      <a
                        href="https://www.linkedin.com/in/raffaelevitaledesign"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium block"
                      >
                        LinkedIn
                      </a>
                      <a
                        href="https://x.com/lfgraf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium block"
                      >
                        X
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
