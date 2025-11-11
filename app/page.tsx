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
 * CONFIGURATION & UTILITIES:
 * - Constants and project data: @/app/config/portfolioConfig.ts
 * - Helper functions: @/app/utils/portfolioUtils.ts
 *
 * FILE STRUCTURE:
 * 1. IMPORTS (constants, utilities, components, hooks)
 * 2. MAIN COMPONENT (orchestrates all functionality)
 *    - REFS: DOM element references and persistent values
 *    - HOOKS: External state and utilities
 *    - STATE: Component state management
 *    - COMPUTED VALUES: Derived state and memoized values
 *    - EFFECTS: Lifecycle and side effects
 *    - EVENT HANDLERS: User interaction handlers
 *    - RENDER LOGIC: JSX composition
 *
 * NOTE: This component is being incrementally refactored into smaller,
 * well-commented components and hooks for better maintainability.
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
  LoadingProgress,
  ProgressiveLoadingStates,
} from "@/components/animations/LoadingAnimations";
import { useLoadingSequence } from "@/hooks/useLoadingSequence"; // Adaptive loading based on network
import {
  modalOverlayVariants,
  modalContainerVariants,
  modalPanelVariants,
  modalReduced,
  modalTextStagger,
} from "@/components/animations/LoadingAnimations";
import { WorkImageContainer } from "./components/hover"; // Work image with hover effects
import useAnimationLevel from "@/hooks/useAnimationLevel"; // Animation preference detection
import { pageTurnVariants } from "@/components/animations/imageTransitions"; // Blur-to-focus animation variants
import { AboutModalContent } from "./components/AboutModalContent"; // Localized About modal content
import { BlueprintContent } from "./components/BlueprintContent"; // Blueprint content for modal

// Import portfolio configuration and utilities
import {
  NAVIGATION_DEBOUNCE,
  PREVIEW_SPEED,
  PREVIEW_LOOPS,
  PREVIEW_SETTLE_DELAY,
  INITIAL_IMAGE_COUNT,
  PRELOAD_IMAGE_COUNT,
  PRELOAD_LOOKAHEAD,
  IMAGE_LOAD_TIMEOUT,
  IMAGE_RETRY_ATTEMPTS,
  IMAGE_QUALITY,
  MOBILE_CONTACT_LINKS,
  MOBILE_CONTENT_PADDING,
  LOADING_STAGES,
  IMAGE_SOURCES,
  INITIAL_IMAGES,
  PRELOAD_IMAGES,
} from "@/app/config/portfolioConfig";
import {
  getProjectFromSrc,
  getVideoForSrc,
  getCaptionForSrc,
  getProjectCaption,
  getAltText,
  parseCaption,
  renderYearWithRolling,
  generatePlaceholder,
  getTextColors,
} from "@/app/utils/portfolioUtils";

// ============================================================================
// MOBILE IMAGE REVEAL ANIMATION - SIMPLIFIED
// ============================================================================

/**
 * MOBILE SIMPLIFICATION: Gentle blur-to-focus (harmonious with text)
 * - Initial blur: 8px (gentle, like text animation)
 * - Duration: 1.8s (harmonious timing)
 * - No complex staging - just smooth fade + blur
 * Note: Desktop animations remain separate (will refine later)
 */

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
  const lastDirectionRef = useRef<1 | -1>(1); // Carousel navigation direction (persistent)
  const hasUserScrolledRef = useRef(false); // Track scroll interaction for footer reveal
  const footerRevealReadyRef = useRef(false); // Ref for footer reveal state to avoid stale closures

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
  const [lastDirection, setLastDirection] = useState<1 | -1>(1); // Carousel direction (1=forward, -1=back)
  const [isNavigating, setIsNavigating] = useState(false); // Navigation debounce flag
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false); // Pause auto-preview

  // Image loading
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({}); // Track loaded images
  const [imageWidth, setImageWidth] = useState<number | null>(null); // Current image width for layout

  // Animation sequence flags
  const [textRevealComplete, setTextRevealComplete] = useState(false); // Text animation complete
  const [carouselAnimationComplete, setCarouselAnimationComplete] =
    useState(false); // Carousel visible
  const [finalTextAnimationComplete, setFinalTextAnimationComplete] =
    useState(false); // All text visible

  // Preview/auto-play
  const [isPreviewComplete, setIsPreviewComplete] = useState(false); // Auto-preview finished
  const [isInViewport, setIsInViewport] = useState(false); // Slideshow in viewport

  // Modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // Video modal visible
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null); // Active video URL
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); // About modal visible
  const [modalView, setModalView] = useState<'about' | 'blueprint'>('about'); // Current view in About modal
  const [previousModalView, setPreviousModalView] = useState<'about' | 'blueprint'>('about'); // Previous view for direction tracking
  const [preFetchedBlueprintContent, setPreFetchedBlueprintContent] = useState<string | null>(null); // Pre-fetched blueprint content

  // Mobile-specific state
  const [activePanelIndex, setActivePanelIndex] = useState(0); // Active mobile scroll panel
  const [blurByIndex, setBlurByIndex] = useState<number[]>([]); // Per-panel blur amounts
  const [_isScrolling, setIsScrolling] = useState(false); // Mobile scroll in progress
  const [_hasUserScrolled, setHasUserScrolled] = useState(false); // Track if user has actively scrolled
  const [footerRevealReady, setFooterRevealReady] = useState(false); // Footer links visibility (reveals after first scroll)

  // Loading stage tracking
  const [currentLoadingStage, setCurrentLoadingStage] = useState(0); // Current loading stage (0-4)

  // Timezone message
  const [_timezoneMessage, setTimezoneMessage] = useState(""); // Timezone difference message

  // Click freeze for final project
  const [isClickFrozen, setIsClickFrozen] = useState(false); // Freeze clicks when final project is active
  const freezeTimerRef = useRef<number | null>(null); // Ref to track freeze timer

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Memoized theme preference check for consistent use across components
   */
  const prefersDark = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  /**
   * Determines if opposite theme should be used based on current view state.
   * Mobile: Panel structure: Header (0) → Images (1-8) → End panel (9)
   *   - Panels 0-2: default background (header + first 2 images)
   *   - Panels 3-8: opposite theme background (images 3-8, project 3 "vf" through last image)
   *   - Panel 9: default background (end panel with links)
   * Desktop: Based on carousel image index
   *   - Images 0-2: default background (projects 1-3: "theo", "cb", "vf")
   *   - Images 3-6: opposite theme background (projects 4-7: "atlas", "defituna", "curbcut", "zalando")
   *   - Image 7: default background (project 8: "earlyworks")
   * Uses CSS variables to match system theme (light/dark)
   */
  const useOppositeTheme = useMemo(() => {
    if (isMobile) {
      // Mobile: Panel logic: default (0-2, 9) vs opposite theme (3-8)
      return activePanelIndex >= 3 && activePanelIndex < 9;
    } else {
      // Desktop: Switch for projects 4-7 (indices 3-6: "atlas", "defituna", "curbcut", "zalando")
      // Only the last project (index 7: "earlyworks") returns to original theme
      return currentImageIndex >= 3 && currentImageIndex <= 6;
    }
  }, [isMobile, activePanelIndex, currentImageIndex]);

  /**
   * Background variant: switches to opposite theme after third project
   * Reuses useOppositeTheme calculation for consistency
   */
  const backgroundStyle = useMemo(() => {
    if (useOppositeTheme) {
      // Use opposite theme colors
      // If system is dark, use light; if system is light, use dark
      return {
        backgroundColor: prefersDark 
          ? 'hsl(var(--neutral-h) 10% 99%)' // Light mode background
          : 'hsl(var(--neutral-h) 14% 8%)', // Dark mode background
      };
    }
    
    // Default theme - use system theme
    return {
      backgroundColor: prefersDark
        ? 'hsl(var(--neutral-h) 14% 8%)' // Dark mode background
        : 'hsl(var(--neutral-h) 10% 99%)', // Light mode background
    };
  }, [useOppositeTheme, prefersDark]);

  const _mobileBackgroundClass = useMemo(() => {
    if (!isMobile) return "bg-background";
    return "bg-background";
  }, [isMobile]);

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

  // Initialize blur array for all panels (header + images + end panel)
  useEffect(() => {
    // Total panels = 1 (header) + IMAGE_SOURCES.length + 1 (end) = IMAGE_SOURCES.length + 2
    const totalPanels = IMAGE_SOURCES.length + 2;
    setBlurByIndex((prev) => {
      if (prev.length === totalPanels) return prev;
      return new Array(totalPanels).fill(0);
    });
  }, []);

  // EFFECT: Pre-fetch blueprint content when About modal opens
  useEffect(() => {
    if (!isAboutModalOpen || preFetchedBlueprintContent) {
      return; // Don't fetch if modal is closed or already fetched
    }

    const fetchBlueprintContent = async () => {
      try {
        const response = await fetch(`/documents/blueprint.md?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) {
          return; // Silently fail - BlueprintContent will handle its own fetch
        }
        const text = await response.text();
        setPreFetchedBlueprintContent(text);
      } catch (err) {
        // Silently fail - BlueprintContent will handle its own fetch
        console.error('Error pre-fetching blueprint:', err);
      }
    };

    fetchBlueprintContent();
  }, [isAboutModalOpen, preFetchedBlueprintContent]);

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

  const navigateToIndex = useCallback(
    (computeNext: (prev: number) => number) => {
      setCurrentImageIndex((prev) => {
        const next = computeNext(prev);
        return next;
      });
    },
    []
  );

  // Apply background directly to body element for both mobile and desktop
  useEffect(() => {
    const bgColor = backgroundStyle.backgroundColor;
    
    document.body.style.setProperty('background-color', bgColor, 'important');
    document.body.style.setProperty('transition', shouldReduceMotion 
      ? 'none' 
      : 'background-color 1500ms cubic-bezier(0.22, 1, 0.36, 1)', 'important');
    
    return () => {
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('transition');
    };
  }, [backgroundStyle, shouldReduceMotion]);

  // Top-level: track active panel and compute distance-based blur during scroll (mobile only)
  useEffect(() => {
    if (!mounted || !isMobile) return;
    
    let cleanupFn: (() => void) | null = null;
    
    // Wait a tick to ensure DOM is fully rendered
    const setupTimeout = window.setTimeout(() => {
      const container = mobileScrollRef.current;
      if (!container) return;

      // Verify sections exist before proceeding
      const sections = container.querySelectorAll<HTMLElement>("section[data-panel]");
      if (sections.length === 0) return;

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

          // Calculate position relative to viewport
          const viewportHeight = window.innerHeight;
          const relativePos = center / viewportHeight;

          // Define blur zones:
          // Top 25% of viewport: Progressive blur for exiting images
          // Middle 50%: Clear focus zone
          // Bottom 25%: Progressive blur for entering images
          const topBlurZone = 0.25;
          const bottomBlurZone = 0.75;
          const maxBlur = 20; // Increased for more dramatic effect

          let blurAmount = 0;

          if (relativePos < topBlurZone) {
            // Top zone: Images exiting viewport
            // Linear interpolation from maxBlur at top edge to 0 at zone boundary
            const zoneProgress = relativePos / topBlurZone;
            blurAmount = maxBlur * (1 - zoneProgress);
          } else if (relativePos > bottomBlurZone) {
            // Bottom zone: Images entering viewport
            // Linear interpolation from 0 at zone boundary to maxBlur at bottom edge
            const zoneProgress =
              (relativePos - bottomBlurZone) / (1 - bottomBlurZone);
            blurAmount = maxBlur * zoneProgress;
          } else {
            // Middle zone: No blur (clear focus)
            blurAmount = 0;
          }

          // Apply easing curve for smoother transitions
          // Use cubic easing for more natural progression
          const easedBlur = blurAmount * Math.pow(blurAmount / maxBlur, 0.5);

          nextBlur[i] = Math.max(0, Math.min(maxBlur, easedBlur));
        });
        
        setActivePanelIndex((prev) => {
          if (prev !== closestIndex) {
            document.body.setAttribute('data-active-panel', String(closestIndex));
          }
          return closestIndex;
        });
        
        // Check footer reveal condition directly after calculating panel index
        // This ensures we catch the moment when user scrolls past header (index 0 -> 1)
        if (closestIndex >= 1 && hasUserScrolledRef.current && !footerRevealReadyRef.current) {
          footerRevealReadyRef.current = true;
          window.setTimeout(() => {
            setFooterRevealReady(true);
          }, 600);
        }
        
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
        // Mark that user has actively scrolled (both state and ref for synchronous access)
        hasUserScrolledRef.current = true;
        setHasUserScrolled(true);
        setIsScrolling(true);
        
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          compute();
          if (scrollEndTimeout !== undefined)
            window.clearTimeout(scrollEndTimeout);
          scrollEndTimeout = window.setTimeout(() => {
            setIsScrolling(false);
            // Don't completely remove blur - recalculate for static depth effect
            compute();
          }, 120);
        });
      };

      // Initial computation
      compute();
      
      container.addEventListener("scroll", onScroll, { passive: true });
      
      cleanupFn = () => {
        container.removeEventListener("scroll", onScroll);
        if (rafId != null) window.cancelAnimationFrame(rafId);
        if (scrollEndTimeout !== undefined) window.clearTimeout(scrollEndTimeout);
      };
    }, 50); // Small delay to ensure DOM is ready
    
    return () => {
      window.clearTimeout(setupTimeout);
      if (cleanupFn) cleanupFn();
    };
  }, [mounted, isMobile]);

  // Keep ref in sync with state for footer reveal check in compute function
  useEffect(() => {
    footerRevealReadyRef.current = footerRevealReady;
  }, [footerRevealReady]);

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

  // Keyboard handling for Escape and Arrow keys
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
  }, [isAboutModalOpen, isVideoModalOpen, navigateBy]);

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

  // ============================================================================
  // KEYBOARD NAVIGATION - Arrow keys for carousel control
  // ============================================================================
  useEffect(() => {
    // Don't intercept keyboard if modal is open or on mobile
    if (isVideoModalOpen || isAboutModalOpen || isMobile || !mounted) {
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle arrow keys when not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          navigateBy(-1);
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          navigateBy(1);
          break;
        case "Escape":
          // Escape key could be used for future features (e.g., pause slideshow)
          if (!isSlideshowPaused) {
            setIsSlideshowPaused(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isVideoModalOpen,
    isAboutModalOpen,
    isMobile,
    mounted,
    navigateBy,
    isSlideshowPaused,
  ]);

  useEffect(() => {
    if (carouselAnimationComplete && !finalTextAnimationComplete) {
      const timer = window.setTimeout(() => {
        setFinalTextAnimationComplete(true);
      }, 300);

      return () => window.clearTimeout(timer);
    }
  }, [carouselAnimationComplete, finalTextAnimationComplete]);

  // EFFECT: Timezone difference calculation
  useEffect(() => {
    const updateTimezoneMessage = () => {
      const now = new Date();

      // Get Toronto time using proper timezone-aware formatting
      const torontoFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Toronto",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
      });
      
      const torontoParts = torontoFormatter.formatToParts(now);
      const torontoHour = parseInt(torontoParts.find(p => p.type === "hour")?.value || "0", 10);
      const torontoMinute = parseInt(torontoParts.find(p => p.type === "minute")?.value || "0", 10);
      const torontoTotalMinutes = torontoHour * 60 + torontoMinute;

      // Get user's local time
      const userTotalMinutes = now.getHours() * 60 + now.getMinutes();

      // Calculate difference in minutes
      let differenceMinutes = torontoTotalMinutes - userTotalMinutes;

      // Handle day boundary crossing (normalize to -12 to +12 hours range)
      if (differenceMinutes > 12 * 60) {
        differenceMinutes -= 24 * 60;
      } else if (differenceMinutes < -12 * 60) {
        differenceMinutes += 24 * 60;
      }

      // Convert to hours (round to nearest hour)
      const differenceHours = Math.round(differenceMinutes / 60);

      // Generate message
      let message = "";
      if (differenceHours === 0) {
        message = "Raf is in your timezone";
      } else if (differenceHours > 0) {
        message = `Raf is ${differenceHours} hour${differenceHours !== 1 ? 's' : ''} ahead of you`;
      } else {
        message = `Raf is ${Math.abs(differenceHours)} hour${Math.abs(differenceHours) !== 1 ? 's' : ''} behind you`;
      }

      setTimezoneMessage(message);
    };

    updateTimezoneMessage();
    // Update every minute (timezone difference won't change more frequently)
    const interval = setInterval(updateTimezoneMessage, 60000);

    return () => clearInterval(interval);
  }, []);

  // EFFECT: Freeze clicks when final project (earlyworks) appears
  useEffect(() => {
    // Final project "earlyworks" is at index 7 (last in IMAGE_SOURCES)
    const FINAL_PROJECT_INDEX = IMAGE_SOURCES.length - 1; // 7
    
    if (currentImageIndex === FINAL_PROJECT_INDEX) {
      // Clear any existing timer
      if (freezeTimerRef.current !== null) {
        window.clearTimeout(freezeTimerRef.current);
      }
      
      // Start freeze
      setIsClickFrozen(true);
      
      // Freeze timer: 4 seconds
      const freezeTimeout = window.setTimeout(() => {
        setIsClickFrozen(false);
        freezeTimerRef.current = null;
      }, 4000);
      
      freezeTimerRef.current = freezeTimeout;
      
      return () => {
        window.clearTimeout(freezeTimeout);
        freezeTimerRef.current = null;
      };
    } else {
      // Reset freeze if we navigate away from final project
      if (freezeTimerRef.current !== null) {
        window.clearTimeout(freezeTimerRef.current);
        freezeTimerRef.current = null;
      }
      setIsClickFrozen(false);
    }
  }, [currentImageIndex]);

  // EFFECT: Apply cursor style when frozen
  useEffect(() => {
    if (isClickFrozen) {
      document.body.style.cursor = "default";
    } else {
      // Explicitly remove body cursor when not frozen to allow child cursors to show
      document.body.style.removeProperty("cursor");
    }
    
    return () => {
      // Cleanup: ensure cursor is removed on unmount
      document.body.style.removeProperty("cursor");
    };
  }, [isClickFrozen]);

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


    let previewSteps = 0;
    const totalSteps = IMAGE_SOURCES.length * PREVIEW_LOOPS;
    let settleTimeout: number | undefined;

    const previewInterval = window.setInterval(() => {
      previewSteps += 1;
      setCurrentImageIndex((prev) => (prev + 1) % IMAGE_SOURCES.length);

      if (previewSteps >= totalSteps) {
        window.clearInterval(previewInterval);
        settleTimeout = window.setTimeout(() => {
          setIsPreviewComplete(true);
        }, PREVIEW_SETTLE_DELAY);
      }
    }, PREVIEW_SPEED);

    return () => {
      window.clearInterval(previewInterval);
      if (settleTimeout !== undefined) {
        window.clearTimeout(settleTimeout);
      }
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
    // Prevent clicks during freeze period (GIF continues playing)
    if (isClickFrozen) return;
    
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
    setModalView('about'); // Reset to about view when closing
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
  const _isFooterReady = footerRevealReady;

  /**
   * Panel variants for mobile scroll transitions
   * SIMPLIFIED MOBILE SCROLL: Subtle fade + gentle blur (harmonious with image reveal)
   * Active panel: Full visibility, sharp focus
   * Inactive panels: Slightly faded with very subtle blur (images stay visible and clean)
   */
  const panelVariants = useMemo(() => {
    if (shouldReduceMotion) {
      // Minimal variant for reduced motion preference
      return {
        active: { opacity: 1 },
        inactive: { opacity: 1 },
      } as const;
    }
    return {
      active: {
        opacity: 1,
        scale: 1,
        // No blur - keep it simple and clean
        transition: {
          duration: 1.2, // Slower, more deliberate transition
          ease: EASING.secondary, // Use smoother easing for scroll
        },
      },
      inactive: {
        opacity: 0.88, // Simple fade effect only
        scale: 0.98, // Subtle scale for depth
        // No blur - simplified animation
        transition: {
          duration: 1.2, // Match active duration for smooth scroll
          ease: EASING.secondary, // Consistent easing
        },
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
      {/* Mobile background layer - MUST be outside blur wrapper to be visible */}
      {isMobile && (
        <div
          id="mobile-background-layer-outside-blur"
          className="fixed inset-0 transition-colors"
          style={{
            zIndex: -5,
            ...(backgroundStyle as { backgroundColor?: string }),
            transition: shouldReduceMotion 
              ? 'none' 
              : 'background-color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
            pointerEvents: 'none',
            minHeight: '100vh',
            minWidth: '100vw',
          }}
        />
      )}
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
          className={`sm:px-10 py-4 md:py-0 pb-4 md:px-28 ${isMobile ? '' : 'bg-background'} relative overflow-x-hidden md:min-h-screen md:flex md:flex-col md:justify-center md:overflow-hidden`}
          style={{
            minHeight: "100vh",
            willChange: "auto",
            scrollMarginTop: "var(--header-offset, 4rem)",
            // Apply dynamic background on desktop to override bg-background class
            ...(isMobile ? {} : backgroundStyle),
            // Add transition for desktop background changes
            ...(isMobile ? {} : {
              transition: shouldReduceMotion 
                ? undefined 
                : 'background-color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
            }),
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
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASING.primary }}
                >
                  <div className="text-center mb-2 md:mb-4">
                    {loadingSequence.textLoaded && (() => {
                      // Check if on final project and desktop
                      const FINAL_PROJECT_INDEX = IMAGE_SOURCES.length - 1;
                      const isFinalProject = !isMobile && currentImageIndex === FINAL_PROJECT_INDEX;
                      
                      // Desktop main text color adjustment based on background theme
                      // Reuses centralized useOppositeTheme calculation
                      const colors = getTextColors(useOppositeTheme, prefersDark);
                      const mainTextColor = colors.mainText;
                      const nameTextColor = colors.nameText;
                      
                      // On final project, show email link instead of normal text
                      if (isFinalProject) {
                        const emailText = "raf@raf.works";
                        return (
                          <div className="tracking-tighter text-lg md:whitespace-nowrap">
                            <a
                              href="mailto:raf@raf.works"
                              className="font-raf cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-sm hover:bg-foreground/5 transition-all duration-200 inline-block"
                              style={{
                                transition: shouldReduceMotion 
                                  ? 'none' 
                                  : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                              }}
                              aria-label="Send email to Raf"
                            >
                              {emailText.split("").map((char, index) => (
                                <motion.span
                                  key={index}
                                  className="inline-block"
                                  style={{
                                    color: nameTextColor,
                                    transition: shouldReduceMotion 
                                      ? 'none' 
                                      : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                                  }}
                                  initial={{ opacity: 0, filter: "blur(12px)" }}
                                  animate={{ opacity: 1, filter: "blur(0px)" }}
                                  transition={{
                                    duration: 1.4,
                                    delay: 0.18 * (index + 1),
                                    ease: EASING.textReveal,
                                  }}
                                >
                                  {char}
                                </motion.span>
                              ))}
                            </a>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="tracking-tighter text-lg md:whitespace-nowrap">
                          {/* Static "Raf V." - no animation */}
                          <span
                            className="font-raf cursor-pointer underline decoration-foreground/20 hover:decoration-foreground/50 underline-offset-2 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-sm hover:bg-foreground/5 transition-all duration-200 inline-block"
                            style={{
                              color: nameTextColor,
                              transition: shouldReduceMotion 
                                ? 'none' 
                                : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                            onClick={() => setIsAboutModalOpen(true)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                setIsAboutModalOpen(true);
                              }
                            }}
                            aria-label="About Raf"
                          >
                            Raf V.
                          </span>
                          {" "}
                          {/* Animated words */}
                          <motion.span 
                            className="inline-block"
                            style={{
                              color: mainTextColor,
                              transition: shouldReduceMotion 
                                ? 'none' 
                                : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                          >
                            {["is", "a", "Senior", "AI", "Product", "Designer", "blending", "design,", "code", "and", "craft."].map((word, index) => (
                              <React.Fragment key={index}>
                                <motion.span
                                  className="inline-block"
                                  style={{
                                    color: mainTextColor,
                                    transition: shouldReduceMotion 
                                      ? 'none' 
                                      : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                                  }}
                                  initial={{ opacity: 0, filter: "blur(12px)" }}
                                  animate={{ opacity: 1, filter: "blur(0px)" }}
                                  transition={{
                                    duration: 1.4,
                                    delay: 0.18 * (index + 1),
                                    ease: EASING.textReveal,
                                  }}
                                  onAnimationComplete={() => {
                                    if (index === 10) {
                                      setTextRevealComplete(true);
                                    }
                                  }}
                                >
                                  {word}
                                </motion.span>
                                {index < 10 && " "}
                              </React.Fragment>
                            ))}
                          </motion.span>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>

                {/* Mobile-only: top hero, center snap panels, bottom contact */}
                <motion.div
                  className="w-full block md:hidden relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASING.primary }}
                >
                  {/* Fixed background layer that stays behind all content - must be outside blur wrapper */}
                  <div
                    id="mobile-background-layer"
                    className="fixed inset-0 transition-colors"
                    style={{
                      zIndex: -5, // Higher than -10 but still behind content
                      ...(backgroundStyle as { backgroundColor?: string }),
                      transition: shouldReduceMotion 
                        ? 'none' 
                        : 'background-color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                      pointerEvents: 'none',
                      minHeight: '100vh',
                      minWidth: '100vw',
                    }}
                  />
                  <div className="relative h-[100svh]">
                    {/* Scroll container */}
                    <main
                      ref={mobileScrollRef as React.RefObject<HTMLElement>}
                      className="h-[100svh] overflow-y-auto overscroll-contain snap-y snap-mandatory"
                    >
                      {/* Header as first panel - vertically centered like images */}
                      <section
                        data-panel
                        className={`snap-center snap-always min-h-[calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex items-center justify-center ${MOBILE_CONTENT_PADDING}`}
                      >
                        {/* Constrain width to match About modal's visual padding */}
                        <div 
                          className="w-full max-w-2xl"
                          style={{
                            paddingTop: "env(safe-area-inset-top, 0px)",
                            paddingBottom: "env(safe-area-inset-bottom, 0px)",
                          }}
                        >
                          <div className="tracking-tighter text-base text-center">
                            <div className="text-foreground/70">
                              {/* Line 1: "Raf is a Senior AI Product Designer" */}
                              <div>
                                {/* Static "Raf V." - visible immediately, bypasses parent opacity */}
                                <span
                                  className="font-raf text-foreground cursor-pointer underline decoration-foreground/20 hover:decoration-foreground/50 underline-offset-2 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-sm hover:bg-foreground/5 hover:border hover:border-foreground/20 transition-all duration-200 pointer-events-auto inline-block"
                                  style={{ opacity: 1 }}
                                  onClick={() => setIsAboutModalOpen(true)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.preventDefault();
                                      setIsAboutModalOpen(true);
                                    }
                                  }}
                                  aria-label="About Raf"
                                >
                                  Raf V.
                                </span>
                                {" "}
                                {["is", "a", "Senior", "AI", "Product", "Designer"].map((word, index) => (
                                  <React.Fragment key={index}>
                                    <motion.span
                                      className="inline-block"
                                      initial={{ opacity: 0, filter: "blur(12px)" }}
                                      animate={{ opacity: 1, filter: "blur(0px)" }}
                                      transition={{
                                        duration: 1.4,
                                        delay: 0.18 * (index + 1),
                                        ease: EASING.textReveal,
                                      }}
                                    >
                                      {word}
                                    </motion.span>
                                    {index < 5 && " "}
                                  </React.Fragment>
                                ))}
                              </div>
                              {/* Line 2: "blending design, code and craft." */}
                              <div>
                                {["blending", "design,", "code", "and", "craft."].map((word, index) => (
                                  <React.Fragment key={index}>
                                    <motion.span
                                      className="inline-block"
                                      initial={{ opacity: 0, filter: "blur(12px)" }}
                                      animate={{ opacity: 1, filter: "blur(0px)" }}
                                      transition={{
                                        duration: 1.4,
                                        delay: 0.18 * 6 + 0.4 + 0.18 * index, // Line 1 completes + brief pause + continue word by word
                                        ease: EASING.textReveal,
                                      }}
                                      onAnimationComplete={() => {
                                        if (index === 4) {
                                          setTextRevealComplete(true);
                                        }
                                      }}
                                    >
                                      {word}
                                    </motion.span>
                                    {index < 4 && " "}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Image panels */}
                      {images.map((src, index) => {
                        // Image panel index = map index + 1 (since header is panel 0)
                        const panelIndex = index + 1;
                        return (
                        <motion.section
                          variants={panelVariants}
                          animate={
                            panelIndex === activePanelIndex ? "active" : "inactive"
                          }
                          key={`panel-${src}`}
                          id={index === 0 ? "panel-0" : undefined}
                          data-panel
                          // PADDING: Changed from px-4 sm:px-3 to unified MOBILE_CONTENT_PADDING (px-4 sm:px-6)
                          // This aligns images with header text and About modal content
                          className={`snap-center snap-always min-h-[calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex items-center justify-center ${MOBILE_CONTENT_PADDING}`}
                        >
                          <figure 
                            className="w-full max-w-screen-sm"
                            style={{
                              paddingTop: "env(safe-area-inset-top, 0px)",
                              paddingBottom: "env(safe-area-inset-bottom, 0px)",
                            }}
                          >
                            <div className="w-full max-h-[78svh] flex flex-col items-center justify-center relative pb-6 gap-3">
                              {/* Scroll blur wrapper - separate from animation layer */}
                              <div
                                className="w-full"
                                style={{
                                  filter: `blur(${blurByIndex[panelIndex] || 0}px)`,
                                  transition:
                                    "filter 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                                  willChange: "filter",
                                }}
                              >
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    y: shouldReduceMotion ? 0 : 40,
                                    scale: shouldReduceMotion ? 1 : 0.95,
                                  }}
                                  animate={
                                    // Only animate after text is complete for first image
                                    (
                                      index === 0
                                        ? loadedImages[src] &&
                                          textRevealComplete
                                        : loadedImages[src]
                                    )
                                      ? {
                                          opacity: 1,
                                          y: 0,
                                          scale: 1,
                                          transition: {
                                            duration: 2.6, // Match desktop image reveal duration
                                            ease: EASING.secondary, // Use same easing as desktop
                                            // First image appears after text completes with reduced delay
                                            delay: index === 0 ? 0.8 : 0,
                                          },
                                        }
                                      : {}
                                  }
                                >
                                  <WorkImageContainer
                                    src={src}
                                    alt={getAltText(src, index)}
                                    width={600}
                                    height={450}
                                    hasVideo={!!getVideoForSrc(src)}
                                    onVideoClick={() =>
                                      handleOpenVideoModal(src)
                                    }
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
                              </div>
                              {(() => {
                                const project = getProjectFromSrc(src);
                                if (!project) return null;
                                const caption = getProjectCaption(project);
                                if (!caption) return null;
                                const parsed = parseCaption(caption);
                                
                                // Determine theme-aware text colors based on panel
                                // Panel 3-8: opposite theme, Panel 0-2,9: default theme
                                const useOppositeTheme = panelIndex >= 3 && panelIndex < 9;
                                const colors = getTextColors(useOppositeTheme, prefersDark);
                                const captionTextColor = colors.captionText;
                                const yearTextColor = colors.yearText;
                                
                                return (
                                  <motion.figcaption
                                    // ALIGNMENT: Center-aligned to be central to the image (as per requirements)
                                    className="w-full text-center text-xs leading-tight"
                                    style={{
                                      color: captionTextColor,
                                      transition: shouldReduceMotion 
                                        ? 'none' 
                                        : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                    initial={{
                                      opacity: 0,
                                      y: 8,
                                      filter: "blur(10px)",
                                    }}
                                    animate={
                                      (() => {
                                        // Initial load animation for first image
                                        if (index === 0 && loadedImages[src] && textRevealComplete) {
                                          return {
                                            opacity: 1,
                                            y: 0,
                                            filter: "blur(0px)",
                                            transition: {
                                              duration: 1.2,
                                              ease: [0.16, 1, 0.3, 1],
                                              delay: 0.5,
                                            },
                                          };
                                        }
                                        
                                        // Only animate if image is loaded
                                        if (!loadedImages[src]) {
                                          return {};
                                        }
                                        
                                        // Scroll-based animation: sync with image blur and panel state
                                        const isActive = activePanelIndex === panelIndex;
                                        const blurAmount = blurByIndex[panelIndex] || 0;
                                        return {
                                          opacity: isActive ? 1 : 0.88,
                                          y: 0,
                                          filter: `blur(${blurAmount}px)`,
                                          transition: {
                                            duration: 0.4, // Match image blur transition
                                            ease: [0.22, 1, 0.36, 1], // Match image blur easing
                                          },
                                        };
                                      })()
                                    }
                                    onAnimationComplete={() => {
                                      // Reveal footer when first project caption completes (backup trigger)
                                      // Only trigger if user has actively scrolled to prevent premature reveal
                                      if (index === 0 && !footerRevealReadyRef.current && hasUserScrolledRef.current) {
                                        // Caption animation complete - smooth reveal after a brief moment
                                        footerRevealReadyRef.current = true;
                                        window.setTimeout(
                                          () => setFooterRevealReady(true),
                                          400
                                        );
                                      }
                                    }}
                                  >
                                    {parsed.year ? (
                                      <>
                                        <span style={{ color: yearTextColor }}>
                                          {renderYearWithRolling(parsed.year)}
                                        </span>
                                        <span>{` ${parsed.description}`}</span>
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
                      );
                      })}

                      {/* End panel with contact links */}
                      <motion.section
                        variants={panelVariants}
                        animate={
                          images.length + 1 === activePanelIndex ? "active" : "inactive"
                        }
                        key="end-panel"
                        data-panel
                        className={`snap-center snap-always min-h-[calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex items-center justify-center ${MOBILE_CONTENT_PADDING}`}
                      >
                        <div 
                          className="w-full max-w-2xl flex flex-col items-center justify-center"
                          style={{
                            paddingTop: "env(safe-area-inset-top, 0px)",
                            paddingBottom: "env(safe-area-inset-bottom, 0px)",
                          }}
                        >
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: shouldReduceMotion ? 0 : 20,
                              filter: shouldReduceMotion ? "none" : "blur(10px)",
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                            }}
                            transition={{
                              duration: shouldReduceMotion ? 0 : 1.2,
                              ease: EASING.secondary,
                              delay: shouldReduceMotion ? 0 : 0.2,
                            }}
                            className="flex items-center justify-center gap-4 text-sm flex-wrap"
                          >
                            {MOBILE_CONTACT_LINKS.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                target={
                                  link.openInNewTab ? "_blank" : undefined
                                }
                                rel={
                                  link.openInNewTab
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                aria-label={link.ariaLabel}
                                className="text-foreground/85 hover:text-foreground font-medium transition-colors"
                              >
                                {link.label}
                              </a>
                            ))}
                          </motion.div>
                        </div>
                      </motion.section>

                    </main>
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
                    textRevealComplete
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
                    duration: 2.2, // Faster reveal for snappier feel
                    delay: 0.8, // Reduced delay - carousel appears sooner after text completes
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onAnimationComplete={() => {
                    setTimeout(() => {
                      setCarouselAnimationComplete(true);
                    }, 400); // Increased from 200ms
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
                                    className={`absolute left-0 top-0 h-full w-[38%] z-[60] ${carouselAnimationComplete && loadedImages[src] && !isClickFrozen ? "cursor-w-resize" : ""}`}
                                    style={{ 
                                      pointerEvents: carouselAnimationComplete && loadedImages[src] && !isClickFrozen ? "auto" : "none",
                                      cursor: carouselAnimationComplete && loadedImages[src] && !isClickFrozen ? "w-resize" : "default"
                                    }}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (isNavigating || !carouselAnimationComplete || !loadedImages[src] || isClickFrozen) return;
                                      setIsNavigating(true);
                                      navigateBy(-1);
                                      window.setTimeout(
                                        () => setIsNavigating(false),
                                        NAVIGATION_DEBOUNCE
                                      );
                                    }}
                                  />
                                  <div
                                    className={`absolute right-0 top-0 h-full w-[38%] z-[60] ${carouselAnimationComplete && loadedImages[src] && !isClickFrozen ? "cursor-e-resize" : ""}`}
                                    style={{ 
                                      pointerEvents: carouselAnimationComplete && loadedImages[src] && !isClickFrozen ? "auto" : "none",
                                      cursor: carouselAnimationComplete && loadedImages[src] && !isClickFrozen ? "e-resize" : "default"
                                    }}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (isNavigating || !carouselAnimationComplete || !loadedImages[src] || isClickFrozen) return;
                                      setIsNavigating(true);
                                      navigateBy(1);
                                      window.setTimeout(
                                        () => setIsNavigating(false),
                                        NAVIGATION_DEBOUNCE
                                      );
                                    }}
                                  />
                                  <div className="absolute left-[38%] top-0 h-full w-[24%] z-[95] pointer-events-none" />
                                </>
                              )}
                              <div className="flex flex-col items-center">
                                <WorkImageContainer
                                  src={src}
                                  alt={getAltText(src, index)}
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
                          filter: "blur(12px) saturate(0.96)",
                        }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px) saturate(1)",
                        }}
                        transition={{
                          duration: 2.2, // Synced with image transition duration
                          ease: [0.16, 1, 0.3, 1],
                          // No delay - starts simultaneously with image for unified feel
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
                              
                              // Desktop caption color adjustment based on background theme
                              // Reuses centralized useOppositeTheme calculation
                              const colors = getTextColors(useOppositeTheme, prefersDark);
                              const yearColor = colors.yearText;
                              const descriptionColor = colors.descriptionText;
                              
                              return (
                                <>
                                  {parsed.year && (
                                    <motion.span
                                      key={`year-${currentProject ?? currentImageIndex}`}
                                      className="text-xs leading-tight"
                                      style={{
                                        color: yearColor,
                                        transition: shouldReduceMotion 
                                          ? 'none' 
                                          : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                                      }}
                                      initial={{
                                        opacity: 0,
                                        filter: "blur(12px) saturate(0.96)",
                                      }}
                                      animate={{
                                        opacity: 1,
                                        filter: "blur(0px) saturate(1)",
                                      }}
                                      transition={{
                                        duration: 2.2, // Synced with image transition duration
                                        ease: [0.16, 1, 0.3, 1],
                                        // No delay - starts simultaneously with image
                                      }}
                                    >
                                      {renderYearWithRolling(parsed.year)}
                                    </motion.span>
                                  )}
                                  <motion.span
                                    key={currentProject ?? "caption"}
                                    initial={{
                                      opacity: 0,
                                      filter: "blur(12px) saturate(0.96)",
                                    }}
                                    animate={{
                                      opacity: 1,
                                      filter: "blur(0px) saturate(1)",
                                    }}
                                    transition={{
                                      duration: 2.2, // Synced with image transition duration
                                      ease: [0.16, 1, 0.3, 1],
                                      // No delay - starts simultaneously with image
                                    }}
                                    className="text-xs leading-tight sm:text-right"
                                    style={{
                                      color: descriptionColor,
                                      transition: shouldReduceMotion 
                                        ? 'none' 
                                        : 'color 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
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
                className="fixed inset-0 z-50 backdrop-blur-[64px] backdrop-saturate-50 bg-white/80 dark:bg-neutral-950/75"
                onClick={handleCloseAboutModal}
              />
              <motion.div
                variants={
                  shouldReduceMotion ? modalReduced : modalContainerVariants
                }
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 flex items-start md:items-center justify-center overflow-y-auto p-4 sm:p-6 pt-[25vh] md:pt-0 pb-20"
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
                  className="relative w-full max-w-7xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h2 id="about-modal-title" className="sr-only">
                    About Raf
                  </h2>
                  {/* Close button - Subtle X icon - Fixed to viewport */}
                  {false && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseAboutModal();
                      }}
                      className="fixed top-5 right-5 md:top-6 md:right-6 z-[60] p-3 md:p-2 group"
                      whileHover={
                        shouldReduceMotion
                          ? {}
                          : { scale: 1.02, rotate: 15 }
                      }
                      whileTap={
                        shouldReduceMotion ? {} : { scale: 0.98 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.4,
                        ease: EASING.tertiary,
                      }}
                      aria-label="Close about modal"
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                        color: "rgb(115, 115, 115)",
                        WebkitTapHighlightColor: "transparent",
                        cursor: "pointer",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* X icon with thin strokes */}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ pointerEvents: "none" }}
                      >
                        <path
                          d="M1 1L11 11M11 1L1 11"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.button>
                  )}
                  {/* Modal content: 4 columns on desktop, stacked on mobile */}
                  <AnimatePresence mode="wait">
                    {modalView === 'about' ? (
                      <motion.div
                        key="about"
                        variants={{
                          hidden: { 
                            x: shouldReduceMotion ? 0 : (previousModalView === 'blueprint' ? "20%" : "-20%"),
                            opacity: 0,
                            filter: shouldReduceMotion ? "none" : "blur(12px)"
                          },
                          visible: { 
                            x: 0,
                            opacity: 1,
                            filter: "blur(0px)",
                            transition: { 
                              duration: shouldReduceMotion ? 0 : 0.65, 
                              ease: EASING.textReveal 
                            }
                          },
                          exit: { 
                            x: shouldReduceMotion ? 0 : "-20%",
                            opacity: 0,
                            filter: shouldReduceMotion ? "none" : "blur(12px)",
                            transition: { 
                              duration: shouldReduceMotion ? 0 : 0.65, 
                              ease: EASING.textReveal 
                            }
                          }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <AboutModalContent 
                          shouldReduceMotion={shouldReduceMotion ?? false}
                          onBlueprintClick={() => {
                            setPreviousModalView('about');
                            setModalView('blueprint');
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="blueprint"
                        variants={{
                          hidden: { 
                            x: shouldReduceMotion ? 0 : "20%",
                            opacity: 0,
                            filter: shouldReduceMotion ? "none" : "blur(12px)"
                          },
                          visible: { 
                            x: 0,
                            opacity: 1,
                            filter: "blur(0px)",
                            transition: { 
                              duration: shouldReduceMotion ? 0 : 0.65, 
                              ease: EASING.textReveal 
                            }
                          },
                          exit: { 
                            x: shouldReduceMotion ? 0 : "20%",
                            opacity: 0,
                            filter: shouldReduceMotion ? "none" : "blur(12px)",
                            transition: { 
                              duration: shouldReduceMotion ? 0 : 0.65, 
                              ease: EASING.textReveal 
                            }
                          }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <BlueprintContent
                          shouldReduceMotion={shouldReduceMotion ?? false}
                          onBack={() => {
                            setPreviousModalView('blueprint');
                            setModalView('about');
                          }}
                          preFetchedContent={preFetchedBlueprintContent}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
