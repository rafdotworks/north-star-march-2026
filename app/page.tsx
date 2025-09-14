"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ConsoleEasterEgg } from "./components/ConsoleEasterEgg";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useIsMobile } from "@/hooks/use-mobile";
import { notes } from "./data/notes";

// Enhanced animation components
import {
  ImageCarouselItem,
  EASING,
  EnhancedStaggeredTextContainer,
  EnhancedStaggeredTextItem,
  WordReveal,
  FadeIn,
  LoadingProgress,
  BreathingSkeleton,
  ProgressiveLoadingStates,
  LoadingTransition,
} from "@/components/animations/LoadingAnimations";
import { useLoadingSequence } from "@/hooks/useLoadingSequence";

export default function Page() {
  // Slideshow timing configuration
  const SLIDESHOW_INTERVAL = 3000; // 3 seconds between images
  const SLIDESHOW_STUCK_THRESHOLD = SLIDESHOW_INTERVAL * 4; // 12 seconds - 4x the normal interval
  const SLIDESHOW_CHECK_INTERVAL = 2000; // Check every 2 seconds if slideshow is stuck

  // Core UI state management
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAllNotesModalOpen, setIsAllNotesModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  // Enhanced loading sequence management
  const loadingSequence = useLoadingSequence();

  // Progressive loading stages
  const [currentLoadingStage, setCurrentLoadingStage] = useState(0);
  const loadingStages = [
    "Initializing...",
    "Loading content...",
    "Preparing images...",
    "Finalizing experience...",
  ];

  // Update loading stages based on loading sequence
  useEffect(() => {
    if (loadingSequence.textLoaded && currentLoadingStage < 1) {
      setCurrentLoadingStage(1);
    }
    if (loadingSequence.imagesLoaded && currentLoadingStage < 2) {
      setCurrentLoadingStage(2);
    }
    if (loadingSequence.navigationLoaded && currentLoadingStage < 3) {
      setCurrentLoadingStage(3);
    }
    if (loadingSequence.allLoaded && currentLoadingStage < 4) {
      setCurrentLoadingStage(4);
    }
  }, [loadingSequence, currentLoadingStage]);

  // Image loading and transition states
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [carouselAnimationComplete, setCarouselAnimationComplete] =
    useState(false);
  const [firstLineComplete, setFirstLineComplete] = useState(false);
  const [finalTextAnimationComplete, setFinalTextAnimationComplete] =
    useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const [blurAmount, setBlurAmount] = useState(15);

  // Scroll and animation states
  const [scrollY, setScrollY] = useState(0);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [criticalContentLoaded, setCriticalContentLoaded] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  /**
   * Viewport height management for responsive design
   * Updates on window resize to ensure proper layout calculations
   */
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  /**
   * Optimized scroll handling with throttling
   * Improves performance by reducing scroll event frequency
   */
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Only update if scroll difference is significant
          if (Math.abs(currentScrollY - lastScrollY) > 5) {
            setScrollY(currentScrollY);
            lastScrollY = currentScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Time-based UI state for dynamic theming
  const [timeState, setTimeState] = useState<{
    hour: number;
    minute: number;
    timeOfDay: "dawn" | "morning" | "afternoon" | "evening" | "night";
    progress: number;
  }>({
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    timeOfDay: (() => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) return "dawn";
      if (hour >= 8 && hour < 12) return "morning";
      if (hour >= 12 && hour < 17) return "afternoon";
      if (hour >= 17 && hour < 21) return "evening";
      return "night";
    })(),
    progress: 0.5,
  });
  const [focusAnimationRun, setFocusAnimationRun] = useState(false);

  // Weather state management for dynamic UI effects
  const [weatherState, setWeatherState] = useState<{
    temperature: number | null;
    condition: string | null;
    isLoading: boolean;
    showWeatherEffect: boolean;
    clickPosition: { x: number; y: number } | null;
    location: string;
    customLocation: boolean;
  }>({
    temperature: null,
    condition: null,
    isLoading: true,
    showWeatherEffect: false,
    clickPosition: null,
    location: "Toronto",
    customLocation: false,
  });

  // Mobile detection with fallback
  const isMobile = useIsMobile();
  const [isMobileReady, setIsMobileReady] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string>("unknown");
  const [imageLoadingStrategy, setImageLoadingStrategy] = useState<
    "aggressive" | "conservative" | "minimal"
  >("conservative");

  // Enhanced connection detection and loading strategy
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobileReady(true);

      // Enhanced connection detection
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType || "unknown";
        const downlink = connection.downlink || 0;
        const saveData = connection.saveData || false;

        setConnectionType(effectiveType);

        // Determine loading strategy based on connection
        if (
          effectiveType === "slow-2g" ||
          effectiveType === "2g" ||
          downlink < 0.5 ||
          saveData
        ) {
          setIsSlowConnection(true);
          setImageLoadingStrategy("minimal");
          console.log(
            "Very slow connection detected, using minimal loading strategy"
          );
        } else if (effectiveType === "3g" || downlink < 1.5) {
          setIsSlowConnection(true);
          setImageLoadingStrategy("conservative");
          console.log(
            "Slow connection detected, using conservative loading strategy"
          );
        } else {
          setImageLoadingStrategy("aggressive");
          console.log(
            "Good connection detected, using aggressive loading strategy"
          );
        }
      } else {
        // Fallback: assume conservative loading on mobile
        if (isMobile) {
          setImageLoadingStrategy("conservative");
          setIsSlowConnection(true);
        } else {
          setImageLoadingStrategy("aggressive");
        }
      }
    }
  }, [isMobile]);

  // Prevent multiple re-renders by batching state updates
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Collection of work project images to be displayed in the gallery
  // Enhanced with multiple quality levels and formats
  const images = [
    "/work/cb-d.png",
    "/work/voiceflow-landing.png",
    "/work/theoriq-prod-hero.png",
    "/work/theoriq.png",
    "/work/atlas-1.png",
    "/work/art-02.png",
    "/work/wai.png",
    "/work/curbcut.png",
    "/work/defi.png",
    "/work/ethos.png",
    "/work/us.png",
    "/work/tela.png",
    "/work/zalando-dodont.png",
    "/work/zalando-spread.png",
  ];

  // Generate low-quality placeholder URLs (base64 encoded 1x1 pixel)
  const generatePlaceholder = (width: number = 400, height: number = 300) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="#9ca3af">Loading...</text>
      </svg>
    `)}`;
  };

  // WebP support detection and format optimization
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check WebP support
      const webpTest = new window.Image();
      webpTest.onload = webpTest.onerror = () => {
        setSupportsWebP(webpTest.height === 2);
      };
      webpTest.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    }
  }, []);

  // Get optimized image source with format support
  const getOptimizedImageSrc = (src: string): string => {
    if (supportsWebP === null) return src; // Return original while detecting

    // For now, return original src since we don't have WebP versions
    // In a real implementation, you would have WebP versions of images
    // and return the appropriate format based on support
    return src;
  };

  // Connection-aware image loading configuration
  const getImageLoadingConfig = () => {
    switch (imageLoadingStrategy) {
      case "minimal":
        return {
          initialCount: 1,
          preloadCount: 2,
          lazyLoadThreshold: 0,
          retryAttempts: 1,
          timeout: 5000,
        };
      case "conservative":
        return {
          initialCount: 2,
          preloadCount: 3,
          lazyLoadThreshold: 100,
          retryAttempts: 2,
          timeout: 8000,
        };
      case "aggressive":
        return {
          initialCount: 4,
          preloadCount: 6,
          lazyLoadThreshold: 200,
          retryAttempts: 3,
          timeout: 10000,
        };
      default:
        return {
          initialCount: 2,
          preloadCount: 3,
          lazyLoadThreshold: 100,
          retryAttempts: 2,
          timeout: 8000,
        };
    }
  };

  const loadingConfig = getImageLoadingConfig();
  const initialImages = images.slice(0, loadingConfig.initialCount);
  const preloadImages = images.slice(
    loadingConfig.initialCount,
    loadingConfig.preloadCount
  );
  const lazyImages = images.slice(loadingConfig.preloadCount);

  // Mapping of work images to their corresponding Vimeo video URLs
  // Each video is configured with specific player parameters for optimal viewing experience
  const workVideos: { [key: string]: string } = {
    // "/work/voiceflow-landing.png":
    //   "https://player.vimeo.com/video/1099175241?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",

    "/work/theoriq-prod-hero.png":
      "https://player.vimeo.com/video/1033459034?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
    "/work/defi.png":
      "https://player.vimeo.com/video/1034767734?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
    "/work/theoriq.png":
      "https://player.vimeo.com/video/1033459080?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
    "/work/atlas-1.png":
      "https://player.vimeo.com/video/1034334194?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
    "/work/curbcut.png":
      "https://player.vimeo.com/video/1033156436?autoplay=1&loop=0&title=0&byline=0&portrait=0&background=0&controls=1&color=ffffff&transparent=1&dnt=1&pip=0&autopause=0&quality=1080p",
  };

  // Optimized: Removed heavy image preloader component
  // Images now load progressively as needed

  /**
   * Generates a placeholder color for images during loading
   * Uses a curated set of subtle, design-friendly colors that match the site's aesthetic
   * @param {number} index - The index of the image in the gallery
   * @returns {string} RGBA color value for the placeholder
   */
  const getImagePlaceholder = (index: number) => {
    const placeholderColors = [
      "rgba(245, 245, 245, 0.8)", // Light gray
      "rgba(240, 240, 245, 0.8)", // Light blue-gray
      "rgba(245, 240, 235, 0.8)", // Light warm gray
      "rgba(235, 240, 245, 0.8)", // Light cool gray
      "rgba(240, 245, 240, 0.8)", // Light mint
    ];

    return placeholderColors[index % placeholderColors.length];
  };

  /**
   * Initial component setup and cleanup
   * Handles weather data fetching, time updates, keyboard events, and critical content loading
   */
  useEffect(() => {
    setMounted(true);

    // Optimized: Only fetch weather on desktop and with longer timeout
    let weatherTimeout: NodeJS.Timeout | undefined;
    if (!isMobile) {
      const weatherPromise = fetchWeatherData().catch((error) => {
        console.warn(
          "Weather API failed, continuing without weather data:",
          error
        );
      });

      // Add timeout for weather API
      weatherTimeout = setTimeout(() => {
        console.warn("Weather API timeout, continuing without weather data");
      }, 8000);
    }

    // Optimized: Less frequent time updates
    const timeInterval = setInterval(updateTimeState, 30000); // Update every 30 seconds instead of every second

    // Set up keyboard event listener
    window.addEventListener("keydown", handleKeyDown);

    /**
     * Checks if critical images (first three) are loaded
     * Used to determine when to start the slideshow
     */
    const checkCriticalContent = () => {
      // Only check if mobile detection is ready
      if (!isMobileReady) return;

      if (isMobile) {
        // On mobile, only gate on the first image
        if (loadedImages[initialImages[0]]) {
          setCriticalContentLoaded(true);
        }
      } else {
        // On desktop, only gate on the first image for faster loading
        if (loadedImages[initialImages[0]]) {
          setCriticalContentLoaded(true);
        }
      }
    };

    // Start the slideshow after a short delay to ensure images are loaded
    const slideshowTimer = setTimeout(() => {
      if (
        !isNotesModalOpen &&
        !isAllNotesModalOpen &&
        !isSlideshowPaused &&
        criticalContentLoaded
      ) {
        setCurrentImageIndex(0);
        setTransitionProgress(0);
      }
    }, 1000);

    // Optimized: Faster animation completion
    const animationTimer = setTimeout(() => {
      setAnimationsComplete(true);
    }, 2000);

    // Optimized: Faster fallback timers
    const fallbackDelay = isSlowConnection ? 2000 : 3000;
    const fallbackTimer = setTimeout(() => {
      if (!criticalContentLoaded) {
        console.log(
          "Fallback: Critical content loading timeout, proceeding anyway"
        );
        setCriticalContentLoaded(true);
      }
    }, fallbackDelay);

    // Add immediate fallback for when mobile detection fails
    const immediateFallbackDelay = isSlowConnection ? 500 : 1000;
    const immediateFallback = setTimeout(() => {
      if (!criticalContentLoaded && isMobileReady) {
        console.log(
          "Immediate fallback: Mobile detection ready but no images loaded"
        );
        setCriticalContentLoaded(true);
      }
    }, immediateFallbackDelay);

    // Don't call checkCriticalContent immediately - it will be called when images load
    // checkCriticalContent();

    return () => {
      clearInterval(timeInterval);
      clearTimeout(slideshowTimer);
      clearTimeout(animationTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(immediateFallback);
      if (weatherTimeout) {
        clearTimeout(weatherTimeout);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update scrollbar color when weather condition changes
  useEffect(() => {
    if (mounted && weatherState.condition) {
      // Removed updateScrollbarColor call
    }
  }, [mounted, weatherState.condition]);

  /**
   * Camera focus animation effect
   * Creates a smooth transition from blurred to focused state
   * Uses cubic easing for natural camera-like movement
   * @returns {() => void} Cleanup function to reset blur state
   */
  const focusAnimation = () => {
    const totalDuration = 1500;
    const startTime = Date.now();
    const initialBlur = 15;

    setBlurAmount(initialBlur);

    const focusInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const newBlur = initialBlur * (1 - easedProgress);
      setBlurAmount(newBlur);

      if (progress >= 1) {
        clearInterval(focusInterval);
        setBlurAmount(0);
      }
    }, 16);

    return () => {
      clearInterval(focusInterval);
      setBlurAmount(0);
    };
  };

  /**
   * Handles focus animation on component mount
   * Ensures animation only runs once and cleans up properly
   */
  useEffect(() => {
    if (mounted && !focusAnimationRun) {
      setFocusAnimationRun(true);
      const cleanup = focusAnimation();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [mounted, focusAnimationRun]);

  /**
   * Updates time state based on EST timezone
   * Handles DST adjustments and calculates time of day periods
   * @returns {void}
   */
  const updateTimeState = () => {
    const now = new Date();
    const estOffset = -5;

    /**
     * Determines if current time is in Daylight Saving Time
     * @returns {boolean} True if currently in DST
     */
    const isDST = () => {
      const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
      const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
      return Math.max(jan, jul) !== now.getTimezoneOffset();
    };

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estTime = new Date(utc + 3600000 * (estOffset + (isDST() ? 1 : 0)));

    const hour = estTime.getHours();
    const minute = estTime.getMinutes();

    let timeOfDay: "dawn" | "morning" | "afternoon" | "evening" | "night";
    if (hour >= 5 && hour < 8) {
      timeOfDay = "dawn";
    } else if (hour >= 8 && hour < 12) {
      timeOfDay = "morning";
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = "evening";
    } else {
      timeOfDay = "night";
    }

    let progress = 0;
    if (timeOfDay === "dawn") {
      progress = ((hour - 5) * 60 + minute) / (3 * 60);
    } else if (timeOfDay === "morning") {
      progress = ((hour - 8) * 60 + minute) / (4 * 60);
    } else if (timeOfDay === "afternoon") {
      progress = ((hour - 12) * 60 + minute) / (5 * 60);
    } else if (timeOfDay === "evening") {
      progress = ((hour - 17) * 60 + minute) / (4 * 60);
    } else {
      if (hour >= 21) {
        progress = ((hour - 21) * 60 + minute) / (8 * 60);
      } else {
        progress = ((hour + 3) * 60 + minute) / (8 * 60);
      }
    }

    progress = Math.max(0, Math.min(1, progress));

    setTimeState({
      hour,
      minute,
      timeOfDay,
      progress,
    });
  };

  /**
   * Fetches weather data for a specified location using OpenMeteo API
   * Updates weather state with temperature and conditions
   * @param {string} location - City name to fetch weather for (defaults to Toronto)
   */
  const fetchWeatherData = async (location: string = "Toronto") => {
    try {
      const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
        Toronto: { lat: 43.65, lon: -79.38 },
        "New York": { lat: 40.71, lon: -74.01 },
        London: { lat: 51.51, lon: -0.13 },
        Paris: { lat: 48.85, lon: 2.35 },
        Tokyo: { lat: 35.68, lon: 139.77 },
        Sydney: { lat: -33.87, lon: 151.21 },
        Berlin: { lat: 52.52, lon: 13.41 },
        "San Francisco": { lat: 37.77, lon: -122.42 },
      };

      const coordinates =
        cityCoordinates[location] || cityCoordinates["Toronto"];

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,weather_code&timezone=America%2FNew_York`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Weather data fetch failed");
      }

      const data = await response.json();

      /**
       * Maps OpenMeteo weather codes to human-readable conditions
       * @param {number} code - Weather code from OpenMeteo API
       * @returns {string} Human-readable weather condition
       */
      const mapWeatherCode = (code: number): string => {
        if ([0].includes(code)) return "Clear";
        if ([1, 2].includes(code)) return "Partly Cloudy";
        if ([3].includes(code)) return "Clouds";
        if ([45, 48].includes(code)) return "Fog";
        if ([51, 53, 55].includes(code)) return "Drizzle";
        if ([56, 57].includes(code)) return "Freezing Drizzle";
        if ([61, 63, 65].includes(code)) return "Rain";
        if ([66, 67].includes(code)) return "Freezing Rain";
        if ([71, 73, 75].includes(code)) return "Snow";
        if ([77].includes(code)) return "Snow";
        if ([80, 81, 82].includes(code)) return "Rain";
        if ([85, 86].includes(code)) return "Snow";
        if ([95, 96, 99].includes(code)) return "Thunderstorm";

        return "Clear";
      };

      setWeatherState((prev) => ({
        ...prev,
        temperature: Math.round(data.current.temperature_2m),
        condition: mapWeatherCode(data.current.weather_code),
        isLoading: false,
        location: location,
        customLocation: location !== "Toronto",
      }));
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeatherState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  /**
   * Handles keyboard navigation and modal interactions
   * - Escape key closes any open modal
   * - Arrow keys navigate through images or notes
   * @param {KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isNotesModalOpen || isAllNotesModalOpen || isVideoModalOpen) {
        // setIsPhotosModalOpen(false);
        setIsNotesModalOpen(false);
        setIsAllNotesModalOpen(false);
        setIsVideoModalOpen(false);
      }
      return;
    }

    if (isNotesModalOpen || isAllNotesModalOpen || isVideoModalOpen) return;

    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      setIsSlideshowPaused(true);

      if (e.key === "ArrowRight") {
        if (!isNotesModalOpen) {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        } else {
          handleNextNote();
        }
      } else {
        if (!isNotesModalOpen) {
          setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );
        } else {
          handlePrevNote();
        }
      }
    }
  };

  /**
   * Sets up keyboard event listener for navigation
   * Cleans up listener on component unmount
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isNotesModalOpen, isAllNotesModalOpen, isVideoModalOpen, images.length]);

  /**
   * Initializes slideshow when component is mounted
   * Starts with first image immediately
   */
  useEffect(() => {
    if (
      mounted &&
      !isNotesModalOpen &&
      !isAllNotesModalOpen &&
      !isVideoModalOpen &&
      !isSlideshowPaused &&
      !initialLoadComplete
    ) {
      // Start immediately without delay
      setCurrentImageIndex(0);
      setTransitionProgress(0);
      setInitialLoadComplete(true);
    }
  }, [
    mounted,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    isSlideshowPaused,
    initialLoadComplete,
  ]);

  // Add a ref for the slideshow container
  const slideshowRef = useRef<HTMLDivElement>(null);

  // Add state to track if slideshow is in viewport
  const [isInViewport, setIsInViewport] = useState(false);

  /**
   * IntersectionObserver setup for slideshow viewport detection
   * Triggers when slideshow enters or leaves viewport
   */
  useEffect(() => {
    if (!mounted) return;

    const slideshowElement = slideshowRef.current;
    if (!slideshowElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(slideshowElement);

    return () => {
      if (slideshowElement) {
        observer.unobserve(slideshowElement);
      }
    };
  }, [mounted]);

  /**
   * Handles slideshow visibility state
   * Resets progress when slideshow becomes visible
   */
  useEffect(() => {
    if (
      isInViewport &&
      !isNotesModalOpen &&
      !isAllNotesModalOpen &&
      !isVideoModalOpen
    ) {
      setTransitionProgress(0);
    }
  }, [isInViewport, isNotesModalOpen, isAllNotesModalOpen, isVideoModalOpen]);

  /**
   * Main slideshow interval effect
   * Advances to next image every SLIDESHOW_INTERVAL seconds when conditions are met
   * Waits for final text animation to complete before starting
   */
  useEffect(() => {
    if (
      !mounted ||
      !criticalContentLoaded ||
      !finalTextAnimationComplete ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen ||
      isSlideshowPaused
    )
      return;

    const slideshowInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, SLIDESHOW_INTERVAL);

    return () => clearInterval(slideshowInterval);
  }, [
    mounted,
    criticalContentLoaded,
    finalTextAnimationComplete,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    isSlideshowPaused,
    images.length,
  ]);

  // Enhanced image loading with retry logic and connection awareness
  const [imageRetryCount, setImageRetryCount] = useState<{
    [key: string]: number;
  }>({});
  const [imageLoadTimeouts, setImageLoadTimeouts] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const [viewportImages, setViewportImages] = useState<Set<string>>(new Set());

  /**
   * Enhanced image preloader with retry logic and connection awareness
   * Implements progressive loading based on connection quality
   */
  const preloadImage = (src: string, retryCount: number = 0): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const timeoutId = setTimeout(() => {
        console.warn(`Image load timeout: ${src}`);
        reject(new Error(`Timeout loading ${src}`));
      }, loadingConfig.timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        handleImageLoad(src);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        console.warn(
          `Failed to load image: ${src} (attempt ${retryCount + 1})`
        );

        if (retryCount < loadingConfig.retryAttempts) {
          // Exponential backoff for retries
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          setTimeout(() => {
            setImageRetryCount((prev) => ({ ...prev, [src]: retryCount + 1 }));
            preloadImage(src, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          // Mark as loaded anyway to prevent blocking
          handleImageLoad(src);
          reject(
            new Error(
              `Failed to load ${src} after ${loadingConfig.retryAttempts} attempts`
            )
          );
        }
      };

      // Add connection-aware loading hints
      if (connectionType === "slow-2g" || connectionType === "2g") {
        // For very slow connections, add loading priority hints
        img.loading = "lazy";
      }

      img.src = getOptimizedImageSrc(src);
    });
  };

  /**
   * Intelligent viewport-based preloading
   * Preloads images that are likely to be viewed soon
   */
  const preloadViewportImages = () => {
    if (imageLoadingStrategy === "minimal") return;

    // Preload next few images in slideshow sequence
    const nextImages = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (currentImageIndex + i) % images.length;
      if (
        !loadedImages[images[nextIndex]] &&
        !viewportImages.has(images[nextIndex])
      ) {
        nextImages.push(images[nextIndex]);
      }
    }

    nextImages.forEach((src) => {
      setViewportImages((prev) => new Set([...prev, src]));
      preloadImage(src).catch(() => {
        // Silently handle preload failures
      });
    });
  };

  /**
   * Connection-aware image preloading strategy
   * Loads images progressively based on connection quality
   */
  useEffect(() => {
    if (mounted && isMobileReady) {
      console.log(
        `Starting image preload with ${imageLoadingStrategy} strategy`
      );

      // Phase 1: Load critical images immediately
      const criticalPromises = initialImages.map((src) => preloadImage(src));

      Promise.allSettled(criticalPromises).then(() => {
        console.log("Critical images loaded");

        // Phase 2: Load preload images after a delay
        setTimeout(
          () => {
            const preloadPromises = preloadImages.map((src) =>
              preloadImage(src)
            );
            Promise.allSettled(preloadPromises).then(() => {
              console.log("Preload images loaded");
            });
          },
          imageLoadingStrategy === "minimal" ? 2000 : 1000
        );
      });
    }
  }, [mounted, isMobileReady, imageLoadingStrategy]);

  /**
   * Preload images when slideshow advances
   */
  useEffect(() => {
    if (mounted && criticalContentLoaded) {
      preloadViewportImages();
    }
  }, [currentImageIndex, criticalContentLoaded, mounted]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      Object.values(imageLoadTimeouts).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [imageLoadTimeouts]);

  /**
   * Handles image loading completion
   * Updates loading state and triggers slideshow when appropriate
   * @param {string} src - Source path of the loaded image
   */
  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => {
      const newState = { ...prev, [src]: true };

      // Prevent multiple critical content triggers
      if (criticalContentLoaded) {
        return newState;
      }

      // Both mobile and desktop: gate on first image only for faster loading
      if (isMobileReady && isMobile !== null) {
        if (src === images[0]) {
          console.log("First image loaded, setting critical content");
          setCriticalContentLoaded(true);
        }
      } else {
        // Fallback: if mobile detection isn't ready, use first image as critical
        if (src === images[0]) {
          console.log("Fallback: First image loaded, setting critical content");
          setCriticalContentLoaded(true);
        }
      }

      // Check if all images are loaded
      const allLoaded = images.every((imgSrc) => newState[imgSrc]);
      if (
        allLoaded &&
        mounted &&
        !isNotesModalOpen &&
        !isAllNotesModalOpen &&
        !isVideoModalOpen
      ) {
        setTransitionProgress(0);
      }

      return newState;
    });
  };

  const fadeInAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  /**
   * Closes the note modal with animation
   * Re-enables scrolling and cleans up modal state
   * @param {React.MouseEvent} e - Mouse event from close action
   */
  const handleCloseNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    document.body.style.overflow = "";

    setTimeout(() => {
      setIsNotesModalOpen(false);
    }, 100);
  };

  /**
   * Cleanup effect for modal state
   * Ensures scrolling is re-enabled when component unmounts
   */
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /**
   * Navigates to the next note in the sequence
   * Wraps around to the beginning when reaching the end
   */
  const handleNextNote = () => {
    setCurrentNoteIndex((prev) => (prev + 1) % notes.length);
  };

  /**
   * Navigates to the previous note in the sequence
   * Wraps around to the end when reaching the beginning
   */
  const handlePrevNote = () => {
    setCurrentNoteIndex((prev) => (prev - 1 + notes.length) % notes.length);
  };

  /**
   * Animation variants for card transitions
   * Provides smooth enter/exit animations with scaling and opacity
   */
  const cardVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      scale: 0.98,
      y: 10,
    }),
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        y: { duration: 0.3 },
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      scale: 0.98,
      y: 10,
      transition: {
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        y: { duration: 0.2 },
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  // State for tracking navigation direction
  const [direction, setDirection] = useState(0);

  /**
   * Updates navigation direction and note index
   * @param {number} newDirection - Direction of navigation (1 for next, -1 for previous)
   * @param {number} newIndex - New note index to navigate to
   */
  const navigateWithDirection = (newDirection: number, newIndex: number) => {
    setDirection(newDirection);
    setCurrentNoteIndex(newIndex);
  };

  /**
   * Navigates to next note with direction tracking
   * Wraps around to beginning when reaching the end
   */
  const handleNextNoteWithDirection = () => {
    navigateWithDirection(1, (currentNoteIndex + 1) % notes.length);
  };

  /**
   * Navigates to previous note with direction tracking
   * Wraps around to end when reaching the beginning
   */
  const handlePrevNoteWithDirection = () => {
    navigateWithDirection(
      -1,
      (currentNoteIndex - 1 + notes.length) % notes.length
    );
  };

  /**
   * Formats current time for display in 12-hour format
   * @returns {string} Formatted time string with AM/PM and timezone
   */
  const formatTime = () => {
    if (!mounted) return "";

    const { hour, minute } = timeState;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;

    return `${displayHour}:${displayMinute} ${period} EST`;
  };

  /**
   * Calculates time difference between user's local time and EST
   * @param {boolean} isMobile - Whether the calculation is for mobile view
   * @returns {string} Human-readable time difference message
   */
  const getTimeDifference = (isMobile = false) => {
    if (!mounted) return "";

    const localDate = new Date();

    const estOptions = {
      timeZone: "America/New_York",
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    };
    const estHour = parseInt(
      new Intl.DateTimeFormat("en-US", estOptions).format(localDate)
    );

    const localOptions = { hour: "numeric" as const, hour12: false };
    const localHour = parseInt(
      new Intl.DateTimeFormat("en-US", localOptions).format(localDate)
    );

    let hourDifference = localHour - estHour;

    if (hourDifference > 12) {
      hourDifference -= 24;
    } else if (hourDifference < -12) {
      hourDifference += 24;
    }

    if (isMobile) {
      // Mobile: always concise, one-line, no wrapping
      if (hourDifference === 0) {
        return (
          <>
            Same timezone as <span className="font-raf">Raf</span>
          </>
        );
      } else if (hourDifference > 0) {
        return (
          <>
            <span className="font-raf">Raf</span> is {hourDifference}h behind
          </>
        );
      } else {
        return (
          <>
            <span className="font-raf">Raf</span> is {Math.abs(hourDifference)}h
            ahead
          </>
        );
      }
    } else {
      // Desktop: use concise format to prevent wrapping
      if (hourDifference === 0) {
        return (
          <>
            Same timezone as <span className="font-raf">Raf</span>
          </>
        );
      } else if (hourDifference > 0) {
        return (
          <>
            <span className="font-raf">Raf</span> is {hourDifference}h behind
          </>
        );
      } else {
        return (
          <>
            <span className="font-raf">Raf</span> is {Math.abs(hourDifference)}h
            ahead
          </>
        );
      }
    }
  };

  /**
   * Toggles weather effect display
   * Centers effect at top of page when enabled
   * @param {React.MouseEvent} e - Mouse event from toggle action
   */
  const toggleWeatherEffect = (e: React.MouseEvent) => {
    setWeatherState((prev) => ({
      ...prev,
      showWeatherEffect: !prev.showWeatherEffect,
      clickPosition: { x: window.innerWidth / 2, y: 0 },
    }));
  };

  /**
   * Returns color value based on current weather condition
   * @returns {string} RGBA color value for weather effect
   */
  const getWeatherColor = () => {
    if (!weatherState.condition) return "rgba(125, 125, 125, 0.2)";

    const conditions: { [key: string]: string } = {
      Clear: "rgba(255, 200, 0, 0.3)",
      "Partly Cloudy": "rgba(230, 230, 230, 0.3)",
      Clouds: "rgba(200, 200, 200, 0.3)",
      Rain: "rgba(0, 125, 255, 0.3)",
      Drizzle: "rgba(100, 150, 255, 0.3)",
      "Freezing Drizzle": "rgba(180, 200, 255, 0.3)",
      "Freezing Rain": "rgba(150, 180, 255, 0.3)",
      Thunderstorm: "rgba(100, 100, 255, 0.4)",
      Snow: "rgba(220, 240, 255, 0.3)",
      Mist: "rgba(200, 200, 220, 0.3)",
      Fog: "rgba(180, 180, 200, 0.3)",
      Haze: "rgba(200, 180, 150, 0.3)",
    };

    return conditions[weatherState.condition] || "rgba(125, 125, 125, 0.2)";
  };

  // Get scrollbar color based on weather condition
  const updateScrollbarColor = () => {
    // Removed entire function
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string | null) => {
    if (!condition) return null;

    const icons: { [key: string]: JSX.Element } = {
      Clear: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ),
      "Partly Cloudy": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path d="M4.5 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          <path d="M17.5 6.5c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 .34.04.67.09 1h-.09c-1.66 0-3 1.34-3 3s1.34 3 3 3h10c1.66 0 3-1.34 3-3s-1.34-3-3-3h-.09c.05-.33.09-.66.09-1z" />
        </svg>
      ),
      Clouds: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Rain: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M12 5.25a6.75 6.75 0 00-6.75 6.75c0 3.296 2.114 6.258 5.25 7.31V22.5a.75.75 0 001.5 0v-3.19c3.136-1.052 5.25-4.014 5.25-7.31A6.75 6.75 0 0012 5.25zM15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Drizzle: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path d="M13.5 6.379V3.75a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 9 10.125a3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.746ZM4.5 16.879V14.25a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 0 20.625 3.75 3.75 0 0 0 3.75 24.375 3.75 3.75 0 0 0 7.5 20.625a3.75 3.75 0 0 0-3-3.746ZM13.5 16.879V14.25a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 9 20.625a3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.75 3.75 3.75 0 0 0-3-3.746Z" />
        </svg>
      ),
      "Freezing Drizzle": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H10a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6.22 6.22a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H16a.75.75 0 010-1.5h7.19l-6.22-6.22a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "Freezing Rain": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H10a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6.22 6.22a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H16a.75.75 0 010-1.5h7.19l-6.22-6.22a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Thunderstorm: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Snow: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M6.75 9a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM6 12.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6.75 16.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Mist: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M3 9a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9zm0 6.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Fog: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M3 9a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9zm0 6.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Haze: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M3 9a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9zm0 6.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    return (
      icons[condition] || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 inline-block align-middle"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clipRule="evenodd"
          />
        </svg>
      )
    );
  };

  const backgroundElements = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 2.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const slideInFromBottom = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 0.6,
      y: 0,
      transition: {
        duration: 1.2,
        delay: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Optimized: Simplified video modal opening
  const handleOpenVideoModal = (imageSrc: string) => {
    const videoUrl = workVideos[imageSrc];
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setIsVideoModalOpen(true);
    }
  };

  // Optimized: Simplified video modal closing
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl(null);
  };

  // Add a state to track the last time the image changed
  const [lastImageChangeTime, setLastImageChangeTime] = useState<number>(
    Date.now()
  );

  // Add a fallback mechanism to restart the slideshow if it gets stuck
  useEffect(() => {
    // Skip only if a modal is open
    if (isNotesModalOpen || isAllNotesModalOpen || isVideoModalOpen || !mounted)
      return;

    // Check if the slideshow is stuck (no image change for more than the threshold)
    const checkInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastChange = currentTime - lastImageChangeTime;

      // If no image change for more than the stuck threshold, restart the slideshow
      if (timeSinceLastChange > SLIDESHOW_STUCK_THRESHOLD) {
        console.log("Slideshow appears stuck, restarting...");
        // Force the next image in sequence
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        // Reset progress
        setTransitionProgress(0);
        setLastImageChangeTime(currentTime);
      }
    }, SLIDESHOW_CHECK_INTERVAL);

    return () => clearInterval(checkInterval);
  }, [
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    lastImageChangeTime,
    mounted,
    images.length,
  ]);

  // Update lastImageChangeTime whenever the image changes
  useEffect(() => {
    setLastImageChangeTime(Date.now());
  }, [currentImageIndex]);

  // Set finalTextAnimationComplete when carousel animation is complete
  useEffect(() => {
    if (carouselAnimationComplete && !finalTextAnimationComplete) {
      const timer = setTimeout(() => {
        setFinalTextAnimationComplete(true);
      }, 2000); // Allow more time for WordReveal animations to complete naturally
      return () => clearTimeout(timer);
    }
  }, [carouselAnimationComplete, finalTextAnimationComplete]);

  // Add an effect to ensure the slideshow starts immediately when the page loads
  useEffect(() => {
    if (mounted) {
      // Start with the first image
      setCurrentImageIndex(0);
      setTransitionProgress(0);
      setLastImageChangeTime(Date.now());

      // Log that the slideshow is starting
      console.log("Slideshow starting with first image");
    }
  }, [mounted]);

  // Add effect to track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Change weather location (simplified to just show Toronto)
  const changeWeatherLocation = () => {
    fetchWeatherData("Toronto");
    // Show the weather effect
    setWeatherState((prev) => ({
      ...prev,
      showWeatherEffect: true,
      clickPosition: { x: window.innerWidth / 2, y: 0 },
    }));
  };

  // Add memoized notes sorting
  const sortedNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, []);

  if (!mounted) {
    // Show nothing until mounted
    return null;
  }

  if (!criticalContentLoaded) {
    // Progressive loading: Show content immediately with skeleton screens
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <div className="px-6 sm:px-10 py-16 pb-32 md:px-28">
            <div className="w-full max-w-screen-xl mx-auto">
              {/* Header - Clean, no Raf */}

              {/* Loading state - Clean, no duplicate text */}

              {/* Enhanced Loading Skeleton Section */}
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
                  <div className="w-full">
                    <div className="space-y-8">
                      {/* Skeleton for slideshow */}
                      <div className="w-full mb-0 overflow-hidden relative">
                        <div className="relative w-full h-full">
                          {/* Mobile skeleton */}
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

                          {/* Desktop skeleton */}
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

                      {/* Enhanced loading progress indicator */}
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

                        {/* Connection quality indicator */}
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

                        {/* Progressive loading states */}
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 }}
                          className="mt-6"
                        >
                          <ProgressiveLoadingStates
                            currentStage={currentLoadingStage}
                            stages={loadingStages}
                            className="text-center"
                          />
                        </motion.div>
                      </motion.div>

                      {/* Skeleton for other sections */}
                      <div className="space-y-4 md:space-y-3">
                        <BreathingSkeleton>
                          <div className="w-full h-[120px] md:h-[100px] bg-foreground/5 rounded" />
                        </BreathingSkeleton>
                        <BreathingSkeleton>
                          <div className="w-full h-[150px] md:h-[120px] bg-foreground/5 rounded" />
                        </BreathingSkeleton>
                      </div>
                    </div>
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
      <div
        style={{
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
          transition: "filter 3s cubic-bezier(0.22, 1, 0.36, 1)", // Restored to original 3s duration
          position: "relative",
        }}
      >
        {/* Natural progressive bottom blur effect - disabled on desktop since page is non-scrollable */}
        <motion.div
          className="fixed left-0 right-0 bottom-0 w-screen overflow-hidden z-50 pointer-events-none hidden"
          style={{
            height: Math.max(40, Math.min(scrollY / 400, 80)),
            transition: "height 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Base gradient layer - creates the foundation */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-full w-full"
            style={{
              background: `linear-gradient(to top, 
                rgba(var(--background-rgb), 0.95) 0%, 
                rgba(var(--background-rgb), 0.7) 20%, 
                rgba(var(--background-rgb), 0.3) 50%, 
                rgba(var(--background-rgb), 0.05) 80%, 
                transparent 100%)`,
              opacity: Math.min(scrollY / 500, 0.95),
              transition: "all 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* Progressive blur layer - responds to scroll with natural easing */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-full w-full"
            style={{
              backdropFilter: `blur(${Math.min(scrollY / 250, 2.5)}px)`,
              opacity: Math.min(scrollY / 800, 0.7),
              transition: "all 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* Subtle edge enhancement - for extra smoothness at the very bottom */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[20px] w-full"
            style={{
              background: `linear-gradient(to top, 
                rgba(var(--background-rgb), 0.98) 0%, 
                rgba(var(--background-rgb), 0.8) 40%, 
                rgba(var(--background-rgb), 0.4) 80%, 
                transparent 100%)`,
              backdropFilter: `blur(${Math.min(scrollY / 150, 4)}px)`,
              opacity: Math.min(scrollY / 300, 0.9),
              transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />

          {/* Ambient glow layer - adds depth and natural feel */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-full w-full"
            style={{
              background: `radial-gradient(ellipse at center bottom, 
                rgba(var(--background-rgb), 0.1) 0%, 
                transparent 70%)`,
              opacity: Math.min(scrollY / 1000, 0.4),
              transition: "all 2s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </motion.div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 2,
            ease: EASING.primary,
          }}
          className="px-6 sm:px-10 py-4 md:py-6 pb-4 md:pb-6 md:px-28 bg-background relative overflow-x-hidden md:h-screen md:overflow-hidden"
          style={{
            minHeight: "100vh",
            willChange: "auto",
          }}
        >
          <div className="w-full max-w-screen-xl mx-auto relative z-10">
            {/* Navigation completely removed - Clean interface */}

            {/* Enhanced Content Section - Only show when fully loaded */}
            {criticalContentLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: criticalContentLoaded ? 1 : 0,
                  y: criticalContentLoaded ? 0 : 20,
                }}
                transition={{
                  duration: 1.2,
                  ease: EASING.primary,
                }}
                className="space-y-3 md:space-y-0 md:flex md:flex-col md:justify-start md:items-center md:py-0 md:h-full md:pt-16"
                style={{
                  transform: animationsComplete ? "none" : undefined,
                  willChange: animationsComplete
                    ? "auto"
                    : "transform, opacity",
                  gap: isMobile ? undefined : "clamp(3vh, 4vh, 5vh)",
                }}
              >
                {/* Desktop Layout - Text First */}
                <motion.div
                  className="w-full hidden md:block md:flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASING.primary }}
                >
                  <div className="text-center mb-4">
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
                          // Main text complete - trigger subtext after a longer pause for natural flow
                          setTimeout(() => {
                            setFirstLineComplete(true);
                          }, 1200);
                        }}
                      >
                        <div className="tracking-tight text-xl md:whitespace-nowrap">
                          <WordReveal
                            text="Raf leads as a Senior Designer and Design Engineer"
                            className="text-foreground/70"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Secondary text for desktop */}
                  <div className="text-center mb-4">
                    <div className="space-y-2">
                      <div className="text-foreground/70 tracking-tight text-base md:text-sm md:whitespace-nowrap min-h-[1.5em]">
                        {loadingSequence.textLoaded && firstLineComplete && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{
                              duration: 1.2,
                              delay: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            Now building in Toronto in person. Past at Coinbase,
                            Voiceflow, Theoriq & more
                          </motion.div>
                        )}
                      </div>
                      <div className="min-h-[1.25em]">
                        <a
                          href="mailto:raf@raf.works"
                          className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-block"
                        >
                          {loadingSequence.textLoaded && firstLineComplete && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 10,
                                filter: "blur(6px)",
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                              }}
                              transition={{
                                duration: 1.0,
                                delay: 1.2,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            >
                              raf@raf.works
                            </motion.div>
                          )}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Mobile Layout - Text First */}
                <motion.div
                  className="w-full block md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASING.primary }}
                >
                  <div className="text-left mb-3">
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
                          // Main text complete - trigger subtext after a longer pause for natural flow
                          setTimeout(() => {
                            setFirstLineComplete(true);
                          }, 1000);
                        }}
                      >
                        <div className="tracking-tight text-lg md:whitespace-nowrap">
                          <WordReveal
                            text="Raf leads as a Senior Designer and Design Engineer."
                            className="text-foreground/70"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Secondary text for mobile */}
                  <div className="text-left mb-4">
                    <div className="space-y-3">
                      <div className="text-foreground/70 tracking-tight text-base md:text-sm md:whitespace-nowrap min-h-[1.5em]">
                        {loadingSequence.textLoaded && firstLineComplete && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{
                              duration: 1.2,
                              delay: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            Now building in Toronto in person. Past at Coinbase,
                            VoiceFlow, Theoriq & more
                          </motion.div>
                        )}
                      </div>
                      <div className="mt-3 min-h-[1.25em]">
                        <a
                          href="mailto:raf@raf.works"
                          className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-block"
                        >
                          {loadingSequence.textLoaded && firstLineComplete && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 10,
                                filter: "blur(6px)",
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                              }}
                              transition={{
                                duration: 1.0,
                                delay: 1.2,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            >
                              raf@raf.works
                            </motion.div>
                          )}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="w-full"
                  initial={{
                    opacity: 0,
                    y: 40,
                    filter: "blur(15px)",
                    scale: 0.98,
                  }}
                  animate={
                    firstLineComplete
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
                    duration: 2.0,
                    delay: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onAnimationComplete={() => {
                    // Carousel complete - trigger final text after longer pause for natural flow
                    setTimeout(() => {
                      setCarouselAnimationComplete(true);
                    }, 2500);
                  }}
                >
                  <div className="space-y-2 md:space-y-0 md:flex md:flex-col md:justify-center md:items-center md:h-full md:max-w-4xl md:mx-auto md:flex-1 md:pt-4">
                    {/* Desktop Slideshow - now used for all screen sizes */}
                    <div
                      ref={slideshowRef}
                      className="w-full mb-0 overflow-hidden relative md:flex-1 md:flex md:items-center md:justify-center"
                      onMouseEnter={() => {
                        setIsSlideshowPaused(true);
                      }}
                      onMouseLeave={() => {
                        setIsSlideshowPaused(false);
                        setTransitionProgress(0);
                      }}
                      onTouchStart={() => setIsSlideshowPaused(true)}
                    >
                      {/* Replace the AnimatePresence with a crossfade effect */}
                      <div className="relative w-full h-full">
                        {/* Enhanced Mobile Feed View */}
                        <div className="block sm:hidden space-y-2">
                          {initialImages.map((src: string, index: number) => (
                            <ImageCarouselItem
                              key={`mobile-${src}`}
                              className="w-full"
                              delay={index * 0.3}
                            >
                              <motion.div
                                className={`relative w-full rounded-lg overflow-hidden ${
                                  workVideos[src] ? "cursor-pointer group" : ""
                                }`}
                                onClick={() => {
                                  if (workVideos[src]) {
                                    handleOpenVideoModal(src);
                                  }
                                }}
                                animate={{
                                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                }}
                                whileHover={{
                                  scale: 1.02,
                                  borderRadius: "8px",
                                  boxShadow:
                                    "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
                                  transition: {
                                    duration: 0.4,
                                    ease: [0.22, 1, 0.36, 1],
                                  },
                                }}
                                style={{
                                  transition:
                                    "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                              >
                                <Image
                                  src={getOptimizedImageSrc(src)}
                                  alt={`Work preview ${index + 1}`}
                                  width={900}
                                  height={700}
                                  className={`w-full object-contain bg-transparent max-w-full transition-all duration-300 ${
                                    workVideos[src] ? "hover:opacity-90" : ""
                                  }`}
                                  priority={index < loadingConfig.initialCount}
                                  loading={
                                    index < loadingConfig.initialCount
                                      ? "eager"
                                      : "lazy"
                                  }
                                  onLoad={() => handleImageLoad(src)}
                                  placeholder="blur"
                                  blurDataURL={generatePlaceholder(900, 700)}
                                  sizes={isMobile ? "100vw" : "50vw"}
                                  quality={
                                    imageLoadingStrategy === "minimal"
                                      ? 60
                                      : imageLoadingStrategy === "conservative"
                                      ? 75
                                      : 85
                                  }
                                />
                                {workVideos[src] && (
                                  <div
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                    onClick={() => handleOpenVideoModal(src)}
                                    style={{
                                      pointerEvents: "auto",
                                      zIndex: 3,
                                    }}
                                  >
                                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2.5 shadow-lg transition-all duration-300 hover:bg-black/60 hover:scale-110">
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="white"
                                        stroke="none"
                                        className="ml-0.5"
                                      >
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            </ImageCarouselItem>
                          ))}

                          {/* Lazy load remaining images */}
                          {lazyImages.length > 0 && (
                            <div className="space-y-2">
                              {lazyImages.map((src: string, index: number) => (
                                <motion.div
                                  key={`mobile-lazy-${src}`}
                                  className="w-full"
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  viewport={{ once: true, margin: "100px" }}
                                  transition={{
                                    duration: 0.6,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                >
                                  <motion.div
                                    className={`relative w-full rounded-lg overflow-hidden ${
                                      workVideos[src]
                                        ? "cursor-pointer group"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (workVideos[src]) {
                                        handleOpenVideoModal(src);
                                      }
                                    }}
                                    animate={{
                                      boxShadow:
                                        "0 4px 20px rgba(0, 0, 0, 0.08)",
                                    }}
                                    whileHover={{
                                      scale: 1.02,
                                      borderRadius: "8px",
                                      boxShadow:
                                        "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
                                      transition: {
                                        duration: 0.4,
                                        ease: [0.22, 1, 0.36, 1],
                                      },
                                    }}
                                    style={{
                                      transition:
                                        "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                                    }}
                                  >
                                    <Image
                                      src={getOptimizedImageSrc(src)}
                                      alt={`Work preview ${
                                        initialImages.length + index + 1
                                      }`}
                                      width={900}
                                      height={700}
                                      className={`w-full object-contain bg-transparent max-w-full transition-all duration-300 ${
                                        workVideos[src]
                                          ? "hover:opacity-90"
                                          : ""
                                      }`}
                                      loading="lazy"
                                      onLoad={() => handleImageLoad(src)}
                                      placeholder="blur"
                                      blurDataURL={generatePlaceholder(
                                        900,
                                        700
                                      )}
                                      sizes={isMobile ? "100vw" : "50vw"}
                                      quality={
                                        imageLoadingStrategy === "minimal"
                                          ? 60
                                          : imageLoadingStrategy ===
                                            "conservative"
                                          ? 75
                                          : 85
                                      }
                                    />
                                    {workVideos[src] && (
                                      <div
                                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                        onClick={() =>
                                          handleOpenVideoModal(src)
                                        }
                                        style={{
                                          pointerEvents: "auto",
                                          zIndex: 3,
                                        }}
                                      >
                                        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2.5 shadow-lg transition-all duration-300 hover:bg-black/60 hover:scale-110">
                                          <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="white"
                                            stroke="none"
                                            className="ml-0.5"
                                          >
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Enhanced Desktop Slideshow View */}
                        <div className="hidden sm:flex relative w-full h-full min-h-[50vh] max-h-[60vh] items-center justify-center">
                          {images.map((src, index) => (
                            <motion.div
                              key={src}
                              className="absolute inset-0 w-full h-full"
                              initial={{
                                opacity: 0,
                                filter: "blur(5px)",
                                y: 10,
                              }}
                              animate={{
                                opacity: index === currentImageIndex ? 1 : 0,
                                filter:
                                  index === currentImageIndex
                                    ? "blur(0px)"
                                    : "blur(8px)",
                                y: index === currentImageIndex ? 0 : 15,
                              }}
                              transition={{
                                duration: 2.2,
                                ease: [0.22, 1, 0.36, 1],
                                delay: 0,
                              }}
                              style={{
                                zIndex: index === currentImageIndex ? 2 : 1,
                              }}
                            >
                              <motion.div
                                className={`relative w-full h-full rounded-xl overflow-hidden ${
                                  workVideos[src] ? "cursor-pointer group" : ""
                                }`}
                                onClick={() => {
                                  if (workVideos[src]) {
                                    handleOpenVideoModal(src);
                                  }
                                }}
                                animate={{
                                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                                }}
                                whileHover={{
                                  scale: 1.01,
                                  borderRadius: "12px",
                                  boxShadow:
                                    "0 12px 48px rgba(0, 0, 0, 0.18), 0 0 30px rgba(255, 255, 255, 0.08)",
                                  transition: {
                                    duration: 0.5,
                                    ease: [0.22, 1, 0.36, 1],
                                  },
                                }}
                                style={{
                                  transition:
                                    "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                              >
                                <Image
                                  src={getOptimizedImageSrc(src)}
                                  alt={`Work preview ${index + 1}`}
                                  width={1400}
                                  height={900}
                                  className={`w-full h-full object-contain bg-transparent max-w-full transition-all duration-300 ${
                                    workVideos[src]
                                      ? "hover:brightness-105"
                                      : ""
                                  }`}
                                  style={{
                                    objectPosition: "center center",
                                    display: "block",
                                    filter: !loadedImages[src]
                                      ? "blur(20px)"
                                      : "none",
                                    opacity: !loadedImages[src] ? 0.5 : 1,
                                    transition:
                                      "filter 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                                  }}
                                  onLoad={() => handleImageLoad(src)}
                                  loading={
                                    index < loadingConfig.initialCount
                                      ? "eager"
                                      : "lazy"
                                  }
                                  priority={index < loadingConfig.initialCount}
                                  placeholder="blur"
                                  blurDataURL={generatePlaceholder(1400, 900)}
                                  sizes="100vw"
                                  quality={
                                    imageLoadingStrategy === "minimal"
                                      ? 60
                                      : imageLoadingStrategy === "conservative"
                                      ? 75
                                      : 85
                                  }
                                />
                                {workVideos[src] &&
                                  index === currentImageIndex && (
                                    <div
                                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                      onClick={() => handleOpenVideoModal(src)}
                                      style={{
                                        pointerEvents: "auto",
                                        zIndex: 3,
                                      }}
                                    >
                                      <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2.5 shadow-lg transition-all duration-300 hover:bg-black/60 hover:scale-110">
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="white"
                                          stroke="none"
                                          className="ml-0.5"
                                        >
                                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                              </motion.div>
                            </motion.div>
                          ))}

                          {/* Placeholder for sizing (to maintain layout) */}
                          <img
                            src={images[0]}
                            alt="Layout placeholder"
                            className="w-full invisible"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Open works button removed */}
                  </div>
                </motion.div>

                {/* 
              {/* About Section 
              <section className="w-full">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <p className="text-foreground/70 tracking-tight text-lg">
                      Raf is a Product Designer. His contributions include{" "}
                      <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                        Theoriq
                      </span>
                      ,{" "}
                      <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                        CurbCutOS
                      </span>
                      , various crypto startups and{" "}
                      <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                        Zalando
                      </span>
                      .<br /> He has also partnered with clients like{" "}
                      <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                        w.ai
                      </span>
                      ,{" "}
                      <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                        US.court
                      </span>
                      ,{" "}
                      <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                        Artscapy
                      </span>
                      , and many more.
                    </p>
                    <p className="tracking-tight text-lg">
                      <span className="text-foreground/70">
                        Originally from{" "}
                        <span className="text-foreground/90 hover:text-foreground transition-colors duration-300">
                          Italy
                        </span>
                        , where he studied software and design, and now{" "}
                        <span className="text-foreground font-medium">
                          based in Toronto
                        </span>
                        ,<br /> Raf enjoys portraitures, yoga, and inspiring
                        workspaces.{" "}
                      </span>
                    </p>
                  </div>
                </div>
              </section> */}

                {/* Experience, Notes, and About sections are currently disabled */}
              </motion.div>
            )}

            {/* Weather effect overlay */}
            <AnimatePresence>
              {weatherState.showWeatherEffect && weatherState.clickPosition && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{
                    opacity: scrollY > 80 ? 0 : 1,
                    y: 0,
                    translateY:
                      scrollY > 10 ? `-${Math.min(scrollY / 2, 50)}%` : 0,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                    opacity: { duration: 0.3 },
                  }}
                  className="fixed inset-x-0 top-0 pointer-events-auto z-50 overflow-hidden"
                  style={{
                    height: "auto",
                  }}
                >
                  {/* Weather banner */}
                  <div
                    className="w-full backdrop-blur-sm relative overflow-hidden"
                    style={{
                      background: `${getWeatherColor()}`,
                      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                      animation: "weatherBannerGlow 3s infinite ease-in-out",
                      transition:
                        "background-color 0.6s ease-in-out, transform 0.6s ease-in-out",
                    }}
                    aria-live="polite"
                    role="status"
                  >
                    <motion.main className="px-6 sm:px-10 md:px-28 relative overflow-x-hidden">
                      <div className="w-full max-w-screen-xl mx-auto relative">
                        <div className="md:grid md:grid-cols-[180px,minmax(0,1fr)] md:gap-20 w-full">
                          <div className="hidden md:block" />
                          <div className="flex items-center justify-between py-3 w-full">
                            <div className="flex items-center space-x-3">
                              {weatherState.condition && (
                                <motion.span
                                  className="mr-2 text-xs flex items-center justify-center"
                                  animate={{
                                    rotate:
                                      weatherState.condition === "Snow"
                                        ? [0, 10, -10, 0]
                                        : 0,
                                    scale:
                                      weatherState.condition === "Thunderstorm"
                                        ? [1, 1.1, 1]
                                        : 1,
                                  }}
                                  transition={{
                                    duration:
                                      weatherState.condition === "Snow"
                                        ? 4
                                        : 0.3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                >
                                  {getWeatherIcon(weatherState.condition)}
                                </motion.span>
                              )}
                              <motion.span
                                className="font-light text-xs flex items-center"
                                animate={{
                                  opacity: [0.8, 1, 0.8],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                <span className="font-raf">Raf</span> is in{" "}
                                {weatherState.location} - where it's{" "}
                                {weatherState.condition?.toLowerCase() ||
                                  "clear"}{" "}
                                and {weatherState.temperature}°C
                              </motion.span>
                            </div>
                            <button
                              onClick={() =>
                                setWeatherState((prev) => ({
                                  ...prev,
                                  showWeatherEffect: false,
                                }))
                              }
                              className="text-foreground/60 hover:text-foreground/80 transition-colors relative z-10"
                              aria-label="Close weather banner"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.main>
                  </div>

                  {/* Background effect */}
                  <div
                    className="absolute w-full h-[300px] blur-[100px] -z-10"
                    style={{
                      background: getWeatherColor(),
                      opacity: 0.6,
                      top: "-150px",
                    }}
                  ></div>

                  {/* Optimized: Reduced weather animation effects */}
                  {(weatherState.condition === "Rain" ||
                    weatherState.condition === "Drizzle") && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-[1px] h-[8px] bg-blue-200/40"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `-8px`,
                            animationDuration: `${0.8 + Math.random() * 0.4}s`,
                            animationDelay: `${Math.random() * 0.3}s`,
                            animationIterationCount: "infinite",
                            animationName: "rainDrop",
                            animationTimingFunction: "ease-in-out",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {weatherState.condition === "Snow" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-white/60"
                          style={{
                            width: `${2 + Math.random() * 2}px`,
                            height: `${2 + Math.random() * 2}px`,
                            left: `${Math.random() * 100}%`,
                            top: `-5px`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationIterationCount: "infinite",
                            animationName: "snowfall",
                            animationTimingFunction: "ease-in-out",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {weatherState.condition === "Thunderstorm" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div
                        className="absolute inset-0 bg-blue-900/10"
                        style={{
                          animationDuration: "4s",
                          animationIterationCount: "infinite",
                          animationName: "lightning",
                          animationTimingFunction: "ease-out",
                        }}
                      ></div>
                      {/* Add rain drops for thunderstorm too */}
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-[1px] h-[15px] bg-blue-200/40"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `-15px`,
                            animationDuration: `${0.3 + Math.random() * 0.5}s`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationIterationCount: "infinite",
                            animationName: "rainDrop",
                            animationTimingFunction: "linear",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {(weatherState.condition === "Fog" ||
                    weatherState.condition === "Mist" ||
                    weatherState.condition === "Haze") && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-[40px] w-full bg-gray-200/15 rounded-full blur-xl"
                          style={{
                            top: `${5 + i * 12}px`,
                            left: `${i % 2 === 0 ? -10 : 10}%`,
                            animationDuration: `${15 + Math.random() * 10}s`,
                            animationDelay: `${i * 1.5}s`,
                            animationIterationCount: "infinite",
                            animationName: "fogMove",
                            animationTimingFunction: "ease-in-out",
                            animationDirection:
                              i % 2 === 0 ? "normal" : "reverse",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {weatherState.condition === "Clear" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            background: "rgba(255, 200, 0, 0.2)",
                            width: `${30 + i * 10}px`,
                            height: `${30 + i * 10}px`,
                            left: `${20 + i * 15}%`,
                            top: `${10 + i * 5}px`,
                            filter: "blur(8px)",
                            opacity: 0.6 - i * 0.1,
                            transform: `scale(${1 + i * 0.1})`,
                            animation: `pulse ${
                              3 + i
                            }s infinite alternate ease-in-out`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {weatherState.condition === "Partly Cloudy" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div
                        className="absolute rounded-full"
                        style={{
                          background: "rgba(255, 200, 0, 0.2)",
                          width: "50px",
                          height: "50px",
                          left: "30%",
                          top: "15px",
                          filter: "blur(8px)",
                          opacity: 0.6,
                          animation: "pulse 4s infinite alternate ease-in-out",
                        }}
                      ></div>
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-gray-200/30"
                          style={{
                            width: `${40 + i * 15}px`,
                            height: `${20 + i * 8}px`,
                            left: `${40 + i * 15}%`,
                            top: `${15 + i * 5}px`,
                            filter: "blur(8px)",
                            opacity: 0.5 - i * 0.1,
                            animation: `fogMove ${
                              10 + i * 5
                            }s infinite alternate ease-in-out`,
                            animationDelay: `${i * 2}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes Modal */}
            <AnimatePresence>
              {isNotesModalOpen && (
                <>
                  {/* Fixed backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                    onClick={handleCloseNote}
                  />

                  {/* Scrollable content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        handleCloseNote(e);
                      }
                    }}
                    // Add tabIndex to prevent focus issues on mobile
                    tabIndex={-1}
                    // Add outline: none to remove focus outline
                    style={{ outline: "none" }}
                  >
                    {/* Card stack container - centered in viewport */}
                    <div className="w-full max-w-3xl mx-auto px-4 relative">
                      {/* Background cards for stack effect - hide on mobile */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, rotate: -0.5 }}
                        animate={{ opacity: 1, y: 0, rotate: -0.5 }}
                        exit={{ opacity: 0, y: -5, rotate: -0.5 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="absolute inset-x-0 top-4 mx-auto w-[98%] h-[calc(100%-16px)] bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg -z-10 hidden sm:block"
                        style={{
                          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.05)",
                        }}
                      ></motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, rotate: 0.5 }}
                        animate={{ opacity: 1, y: 0, rotate: 0.5 }}
                        exit={{ opacity: 0, y: -5, rotate: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="absolute inset-x-0 top-2 mx-auto w-[99%] h-[calc(100%-8px)] bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-lg -z-20 hidden sm:block"
                        style={{
                          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)",
                        }}
                      ></motion.div>

                      {/* Main content card with horizontal transition */}
                      <AnimatePresence
                        initial={false}
                        custom={direction}
                        mode="wait"
                      >
                        <motion.div
                          key={currentNoteIndex}
                          custom={direction}
                          variants={cardVariants}
                          initial={isNotesModalOpen ? "enter" : false}
                          animate="center"
                          exit="exit"
                          className="w-full bg-white/95 dark:bg-zinc-900/95 rounded-xl overflow-hidden relative sm:rounded-xl sm:w-full shadow-lg"
                          style={{
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                          }}
                          id={`note-card-modal-${currentNoteIndex}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Card inner content with padding */}
                          <div className="px-8 md:px-16 py-20 pb-32 overflow-y-auto max-h-[85vh]">
                            {/* Header area with controls */}
                            <div className="absolute top-0 left-0 right-0 h-28 px-8 md:px-16 flex items-center justify-between bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10 border-b border-foreground/[0.03]">
                              {/* Left side - Date and Title */}
                              <div className="flex flex-col">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-sm text-foreground/40 font-light tracking-wide"
                                >
                                  {new Date(
                                    notes[currentNoteIndex].date
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </motion.div>
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-xl font-medium text-foreground mt-1.5 tracking-tight"
                                >
                                  {notes[currentNoteIndex].title}
                                </motion.div>
                              </div>

                              {/* Right side - Close button */}
                              <div className="flex items-center gap-4">
                                {/* Close button - for all devices */}
                                <motion.button
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  onClick={handleCloseNote}
                                  className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-foreground/5 transition-colors"
                                  aria-label="Close note"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="text-foreground/40 hover:text-foreground/60 transition-colors"
                                  >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </motion.button>
                              </div>
                            </div>

                            {/* Content area with enhanced typography */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="prose dark:prose-invert max-w-none mt-16 relative pb-8 sm:pb-0 min-h-[40vh] note-content"
                            >
                              <motion.div
                                key={currentNoteIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{
                                  duration: 0.4,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="text-foreground/70 leading-relaxed tracking-wide"
                              >
                                <ReactMarkdown
                                  components={{
                                    h1: ({ node, ...props }) => null,
                                    p: ({ node, children, ...props }) => (
                                      <p className="leading-relaxed" {...props}>
                                        {children}
                                      </p>
                                    ),
                                    blockquote: ({
                                      node,
                                      children,
                                      ...props
                                    }) => (
                                      <blockquote className="!pl-6" {...props}>
                                        {children}
                                      </blockquote>
                                    ),
                                  }}
                                >
                                  {notes[currentNoteIndex].content}
                                </ReactMarkdown>
                              </motion.div>
                            </motion.div>

                            {/* Navigation controls with enhanced styling */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-8 md:px-16 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-foreground/[0.03]"
                            >
                              {/* Left side - Previous note */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevNoteWithDirection();
                                }}
                                className="flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors group"
                                aria-label="Previous note"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className="transform transition-transform group-hover:-translate-x-0.5"
                                >
                                  <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden sm:inline">
                                  Previous
                                </span>
                              </motion.button>

                              {/* Center - Note selector dots */}
                              <div className="flex items-center gap-2">
                                {notes.map((_, index) => (
                                  <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateWithDirection(
                                        index > currentNoteIndex ? 1 : -1,
                                        index
                                      );
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                      currentNoteIndex === index
                                        ? "bg-foreground w-3"
                                        : "bg-foreground/30"
                                    }`}
                                    aria-label={`Go to note ${index + 1}`}
                                  />
                                ))}
                              </div>

                              {/* Right side - Next note */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextNoteWithDirection();
                                }}
                                className="flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground transition-colors group"
                                aria-label="Next note"
                              >
                                <span className="hidden sm:inline">Next</span>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className="transform transition-transform group-hover:translate-x-0.5"
                                >
                                  <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                              </motion.button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* All Notes Modal */}
            <AnimatePresence>
              {isAllNotesModalOpen && (
                <>
                  {/* Fixed backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                    onClick={() => setIsAllNotesModalOpen(false)}
                  />

                  {/* Scrollable content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setIsAllNotesModalOpen(false);
                      }
                    }}
                  >
                    {/* Content container */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-3xl mx-auto px-6 md:px-12 py-16 pb-24 my-12 bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-xl relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close button - positioned in top right */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="absolute top-6 right-6 rounded-full bg-black/10 backdrop-blur-md p-2.5 hover:bg-black/20 transition-all duration-300 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAllNotesModalOpen(false);
                        }}
                        aria-label="Close all notes"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="transition-transform duration-300 hover:scale-110 text-white/70 hover:text-white"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </motion.button>

                      <div className="flex flex-col divide-y divide-foreground/10 mt-8">
                        {notes
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((note, index) => (
                            <motion.div
                              key={note.id}
                              className="py-6 first:pt-0 cursor-pointer"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              whileHover={{ x: 2 }}
                              onClick={() => {
                                setCurrentNoteIndex(index);
                                setIsAllNotesModalOpen(false);
                                setTimeout(
                                  () => setIsNotesModalOpen(true),
                                  100
                                );
                              }}
                            >
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start">
                                <div className="text-sm text-foreground/50 whitespace-nowrap min-w-[90px]">
                                  {new Date(note.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-lg text-foreground hover:text-foreground/90 transition-colors mb-1">
                                    {note.title}
                                  </p>
                                  <p className="text-base text-foreground/60 line-clamp-2">
                                    {note.excerpt}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.main>

        {/* Optimized: Removed ImagePreloader component */}

        {/* Video Modal */}
        <AnimatePresence>
          {isVideoModalOpen && currentVideoUrl && (
            <>
              {/* Fixed backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 backdrop-blur-md bg-black/85 z-50"
                onClick={handleCloseVideoModal}
              />

              {/* Modal container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                onClick={handleCloseVideoModal}
              >
                {/* Content container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Sticky close button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="absolute top-6 right-6 z-10 rounded-full bg-black/10 backdrop-blur-md p-2.5 hover:bg-black/20 transition-all duration-300 shadow-lg"
                    onClick={handleCloseVideoModal}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform duration-300 hover:scale-110 text-white/70 hover:text-white"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </motion.button>

                  {/* Video embed */}
                  <div
                    className="aspect-video w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] rounded-lg overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <iframe
                      src={currentVideoUrl || ""}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Project Video"
                      onEnded={() => handleCloseVideoModal()}
                      style={{
                        background: "#000000",
                        borderRadius: "8px",
                      }}
                    ></iframe>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
