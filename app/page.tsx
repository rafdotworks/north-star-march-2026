"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import ProgressiveImage from "./components/ProgressiveImage";
import AnimatedContent from "./components/AnimatedContent";
import { ConsoleEasterEgg } from "./components/ConsoleEasterEgg";
import { LiquidGlass } from "@/components/LiquidGlass";
import { useIsMobile } from "@/hooks/use-mobile";
import { notes, Note } from "./data/notes";
import { works } from "./data/works";
import { Play } from "lucide-react";

/**
 * Interface representing a work project in the portfolio
 * @property {string} title - The title of the work project
 * @property {string} description - A brief description of the project
 * @property {string} image - Path to the project's main image
 * @property {string} [video] - Optional path to the project's video content
 */
interface Work {
  title: string;
  description: string;
  image: string;
  video?: string;
}

/**
 * Custom image loader for Next.js Image component
 * Optimizes image loading with width and quality parameters
 */
const imageLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function Page() {
  // Core UI state management
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAllNotesModalOpen, setIsAllNotesModalOpen] = useState(false);
  const [isAllExperienceModalOpen, setIsAllExperienceModalOpen] =
    useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Image loading and transition states
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [imageLoadingProgress, setImageLoadingProgress] = useState<{
    [key: string]: number;
  }>({});
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const [blurAmount, setBlurAmount] = useState(25);

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
   * Optimized scroll handling using requestAnimationFrame
   * Improves performance by reducing scroll event frequency
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
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

  // Refs for photo gallery management
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mobile detection
  const isMobile = useIsMobile();

  // Collection of work project images to be displayed in the gallery
  const images = [
    "/work/voiceflow-landing.png",
    "/work/theoriq-prod-hero.png",
    "/work/theoriq.png",
    // "/work/theoriq-mobile-chat.png",
    "/work/atlas-1.png",
    "/work/art-02.png",
    "/work/wai.png",
    "/work/curbcut.png",
    //"/work/wai-2.png",
    "/work/defi.png",
    "/work/ethos.png",

    "/work/us.png",
    "/work/tela.png",
    "/work/zalando-dodont.png",
    "/work/zalando-spread.png",
    // "/work/apple.png",
  ];

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

  /**
   * Image preloading component to ensure smooth gallery transitions
   * Tracks loading progress of all images and updates state accordingly
   */
  const ImagePreloader = () => {
    useEffect(() => {
      const allImagesLoaded = images.every((src) => loadedImages[src]);

      if (allImagesLoaded && mounted) {
        console.log("All images preloaded successfully");
      }
    }, [loadedImages]);

    return (
      <div className="hidden">
        {images.map((src, index) => (
          <img
            key={`preload-${index}`}
            src={src}
            alt="Preloaded image"
            onLoad={() => handleImageLoad(src)}
          />
        ))}
      </div>
    );
  };

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

    // Fetch weather data
    fetchWeatherData();

    // Set up interval to update time
    const timeInterval = setInterval(updateTimeState, 1000);

    // Set up keyboard event listener
    window.addEventListener("keydown", handleKeyDown);

    /**
     * Checks if critical images (first three) are loaded
     * Used to determine when to start the slideshow
     */
    const checkCriticalContent = () => {
      const firstThreeImages = images.slice(0, 3);
      const allCriticalLoaded = firstThreeImages.every(
        (src) => loadedImages[src]
      );
      if (allCriticalLoaded) {
        setCriticalContentLoaded(true);
      }
    };

    // Start the slideshow after a short delay to ensure images are loaded
    const slideshowTimer = setTimeout(() => {
      if (
        !isPhotosModalOpen &&
        !isNotesModalOpen &&
        !isAllNotesModalOpen &&
        !isSlideshowPaused &&
        criticalContentLoaded
      ) {
        setCurrentImageIndex(0);
        setTransitionProgress(0);
      }
    }, 1000);

    // Mark animations as complete after initial load
    const animationTimer = setTimeout(() => {
      setAnimationsComplete(true);
    }, 3500);

    checkCriticalContent();

    return () => {
      clearInterval(timeInterval);
      clearTimeout(slideshowTimer);
      clearTimeout(animationTimer);
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
    const totalDuration = 2500;
    const startTime = Date.now();
    const initialBlur = 25;

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

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,weather_code&timezone=America%2FNew_York`
      );

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
      if (
        isPhotosModalOpen ||
        isNotesModalOpen ||
        isAllNotesModalOpen ||
        isVideoModalOpen
      ) {
        setIsPhotosModalOpen(false);
        setIsNotesModalOpen(false);
        setIsAllNotesModalOpen(false);
        setIsVideoModalOpen(false);
      }
      return;
    }

    if (
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen
    )
      return;

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
  }, [
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    images.length,
  ]);

  /**
   * Initializes slideshow when component is mounted
   * Starts with first image after a short delay
   */
  useEffect(() => {
    if (
      mounted &&
      !isPhotosModalOpen &&
      !isNotesModalOpen &&
      !isAllNotesModalOpen &&
      !isVideoModalOpen &&
      !isSlideshowPaused
    ) {
      const startTimer = setTimeout(() => {
        setCurrentImageIndex(0);
        setTransitionProgress(0);
      }, 800);

      return () => clearTimeout(startTimer);
    }
  }, [
    mounted,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    isSlideshowPaused,
  ]);

  // Add a separate useEffect to start the slideshow immediately when mounted
  useEffect(() => {
    if (
      mounted &&
      !isPhotosModalOpen &&
      !isNotesModalOpen &&
      !isAllNotesModalOpen &&
      !isVideoModalOpen &&
      !isSlideshowPaused
    ) {
      // Force the first image transition after a short delay
      const startTimer = setTimeout(() => {
        // Start with the first image
        setCurrentImageIndex(0);
        // Reset progress
        setTransitionProgress(0);
      }, 800);

      return () => clearTimeout(startTimer);
    }
  }, [
    mounted,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    isSlideshowPaused,
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
      !isPhotosModalOpen &&
      !isNotesModalOpen &&
      !isAllNotesModalOpen &&
      !isVideoModalOpen
    ) {
      setTransitionProgress(0);
    }
  }, [
    isInViewport,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
  ]);

  /**
   * Main slideshow interval effect
   * Advances to next image every 4.5 seconds when conditions are met
   */
  useEffect(() => {
    if (
      !mounted ||
      !criticalContentLoaded ||
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen ||
      isSlideshowPaused
    )
      return;

    const slideshowInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(slideshowInterval);
  }, [
    mounted,
    criticalContentLoaded,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    isSlideshowPaused,
    images.length,
  ]);

  /**
   * Preloads critical images (first 3) on component mount
   * Ensures smooth initial slideshow experience
   */
  useEffect(() => {
    if (mounted) {
      images.slice(0, 3).forEach((src) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => handleImageLoad(src);
      });
    }
  }, [mounted]);

  /**
   * Handles image loading completion
   * Updates loading state and triggers slideshow when appropriate
   * @param {string} src - Source path of the loaded image
   */
  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => {
      const newState = { ...prev, [src]: true };

      const firstThreeImages = images.slice(0, 3);
      const criticalLoaded = firstThreeImages.every(
        (imgSrc) => newState[imgSrc]
      );

      if (criticalLoaded && !criticalContentLoaded) {
        setCriticalContentLoaded(true);
      }

      // Check if all images are loaded
      const allLoaded = images.every((imgSrc) => newState[imgSrc]);

      // If all images are loaded and we're in a state where slideshow should run
      if (
        allLoaded &&
        mounted &&
        !isPhotosModalOpen &&
        !isNotesModalOpen &&
        !isAllNotesModalOpen &&
        !isVideoModalOpen
      ) {
        // Start progress immediately
        setTransitionProgress(0);
      }

      return newState;
    });
  };

  // Track progressive loading of images
  const handleImageProgress = (src: string, event: ProgressEvent) => {
    if (event.lengthComputable) {
      const progress = Math.round((event.loaded / event.total) * 100);
      setImageLoadingProgress((prev) => ({ ...prev, [src]: progress }));
    }
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

  const handleOpenNote = (index: number) => {
    setCurrentNoteIndex(index);
    setIsNotesModalOpen(true);
  };

  // Track the clicked note position for animation
  const [clickedNotePosition, setClickedNotePosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Enhanced note opening with position tracking for animation
  const handleOpenNoteWithAnimation = (index: number, e: React.MouseEvent) => {
    // Get the clicked element's position
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    setClickedNotePosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    setCurrentNoteIndex(index);
    setIsNotesModalOpen(true);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";
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
   * Opens the all notes modal view
   * Disables background scrolling while modal is open
   */
  const handleOpenAllNotes = () => {
    setIsAllNotesModalOpen(true);
    document.body.style.overflow = "hidden";
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
   * Scrolls to selected photo when photo modal opens
   * Uses smooth scrolling with a small delay for modal rendering
   */
  useEffect(() => {
    if (isPhotosModalOpen && photoRefs.current[currentPhotoIndex]) {
      setTimeout(() => {
        photoRefs.current[currentPhotoIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [isPhotosModalOpen, currentPhotoIndex]);

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

    if (hourDifference === 0) {
      return "You are in the same timezone as Raf";
    } else if (hourDifference > 0) {
      return `Raf is ${hourDifference} hour${
        hourDifference === 1 ? "" : "s"
      } behind you`;
    } else {
      return `Raf is ${Math.abs(hourDifference)} hour${
        Math.abs(hourDifference) === 1 ? "" : "s"
      } ahead of you`;
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

  // Add a function to handle opening the video modal
  const handleOpenVideoModal = (imageSrc: string) => {
    const videoUrl = workVideos[imageSrc];
    if (videoUrl) {
      setCurrentVideoUrl(videoUrl);
      setIsVideoModalOpen(true);

      // Reset slideshow progress when opening modal
      setTransitionProgress(0);
    }
  };

  // Add a function to handle closing the video modal
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl(null);

    // Reset slideshow progress when closing modal
    setTransitionProgress(0);
    setLastImageChangeTime(Date.now());
  };

  // Add a state to track the last time the image changed
  const [lastImageChangeTime, setLastImageChangeTime] = useState<number>(
    Date.now()
  );

  // Add a fallback mechanism to restart the slideshow if it gets stuck
  useEffect(() => {
    // Skip only if a modal is open
    if (
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen ||
      !mounted
    )
      return;

    // Check if the slideshow is stuck (no image change for more than 7 seconds)
    const checkInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastChange = currentTime - lastImageChangeTime;

      // If no image change for more than 7 seconds (twice the normal interval), restart the slideshow
      if (timeSinceLastChange > 7000) {
        console.log("Slideshow appears stuck, restarting...");
        // Force the next image in sequence
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        // Reset progress
        setTransitionProgress(0);
        setLastImageChangeTime(currentTime);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkInterval);
  }, [
    isPhotosModalOpen,
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVideoVisible(true);
            if (videoRef.current) {
              // Add a small delay for mobile devices
              setTimeout(() => {
                videoRef.current?.play().catch((error) => {
                  console.log("Video autoplay failed:", error);
                  setVideoError(true);
                });
              }, 100);
            }
          } else {
            setIsVideoVisible(false);
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        threshold: 0.1, // Reduced threshold for better mobile detection
        rootMargin: "50px", // Added margin to start loading earlier
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const [isGlassEnabled, setIsGlassEnabled] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const toggleGlass = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Store click position relative to viewport
    setClickPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setIsGlassEnabled((prev) => !prev);
  };

  // Add a function to handle closing the photo modal
  const handleClosePhotoModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Re-enable scrolling
    document.body.style.overflow = "";

    // Add a small delay before closing to allow for animation
    setTimeout(() => {
      setIsPhotosModalOpen(false);
    }, 100);
  };

  /**
   * Collection of personal photos for the gallery
   * Each photo includes a source path and display name
   */
  const photos = [
    { src: "/photos/marianne.jpeg", name: "Marianne" },
    { src: "/photos/daybreak-3.JPG", name: "Daybreak" },
    { src: "/photos/josh.JPG", name: "Josh" },
    { src: "/photos/vin-2.JPG", name: "Vin" },
    { src: "/photos/omar.JPG", name: "Omar" },
    { src: "/photos/adrien.JPG", name: "Adrien" },
    { src: "/photos/jordi.JPG", name: "Jordi" },
    { src: "/photos/daybreak.JPG", name: "Daybreak" },
    { src: "/photos/flo.JPG", name: "Flo" },
    { src: "/photos/kelindi.JPG", name: "Kelindi" },
    { src: "/photos/vin.JPG", name: "Vin" },
    { src: "/photos/anna.JPG", name: "Anna" },
  ];

  if (!mounted || !criticalContentLoaded) {
    // Return a minimal loading state with proper layout to prevent shifts
    return (
      <div className="min-h-screen bg-background">
        <div className="px-6 sm:px-10 py-16 md:px-28">
          <div className="w-full max-w-screen-xl mx-auto">
            {/* Placeholder for header */}
            <div className="flex items-center mb-40 opacity-0">
              <h1 className="text-2xl font-normal">Raf</h1>
            </div>
            {/* Placeholder for content */}
            <div className="space-y-36 opacity-0">
              <div className="w-full h-[600px] bg-foreground/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
          transition: "filter 3s cubic-bezier(0.22, 1, 0.36, 1)", // Restored to original 3s duration
          position: "relative",
        }}
      >
        {/* Natural progressive bottom blur effect */}
        <motion.div
          className="fixed left-0 right-0 bottom-0 w-screen overflow-hidden z-50 pointer-events-none"
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
            duration: 2, // Restored to original 2s duration
            ease: [0.22, 1, 0.36, 1],
          }}
          className="px-6 sm:px-10 py-16 md:px-28 bg-background relative overflow-x-hidden"
          style={{
            minHeight: "100vh",
            willChange: "auto",
          }}
        >
          <div className="w-full max-w-screen-xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1.5, // Restored to original 1.5s duration
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center mb-40 relative"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="flex items-center justify-between w-full relative">
                <h1 className="text-2xl font-normal text-foreground relative z-10 font-edu-marist">
                  Raf
                </h1>

                {/* Display current time in EST with weather */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: mounted ? 0.6 : 0 }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="text-xs text-foreground/40 font-light max-w-[280px] text-right hidden md:block"
                >
                  <div className="flex items-center justify-end space-x-2">
                    <span className="min-h-[1.5rem] flex items-center">
                      {mounted ? getTimeDifference(false) : ""}
                    </span>
                    {weatherState.temperature !== null && (
                      <>
                        <span className="opacity-30 flex items-center">|</span>
                        <div
                          className="cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center"
                          onClick={toggleWeatherEffect}
                          title={`${weatherState.location} weather - click to see effect`}
                        >
                          <span className="flex items-center justify-center">
                            {weatherState.temperature}°C{" "}
                            {weatherState.customLocation &&
                              `(${weatherState.location})`}
                          </span>
                          {weatherState.condition && (
                            <span className="ml-1 text-xs flex items-center justify-center">
                              {getWeatherIcon(weatherState.condition)}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {weatherState.isLoading && (
                    <p className="text-[10px] opacity-50 mt-1">
                      Loading {weatherState.location} weather...
                    </p>
                  )}
                </motion.div>

                {/* Mobile time and weather display */}
                <motion.div
                  variants={slideInFromBottom}
                  initial="hidden"
                  animate="visible"
                  className="text-xs text-foreground/40 font-light md:hidden flex items-center"
                >
                  <motion.div
                    className="backdrop-blur-sm bg-background/5 px-3 py-1.5 rounded-full border border-foreground/5 flex items-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.4,
                      duration: 0.4,
                      type: "tween",
                    }}
                    style={{
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <span className="min-h-[1.25rem] flex items-center">
                      {mounted ? getTimeDifference(true) : ""}
                    </span>

                    {weatherState.temperature !== null && (
                      <>
                        <span className="opacity-30 flex items-center">•</span>
                        <div
                          className="cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center"
                          onClick={toggleWeatherEffect}
                          title={`${weatherState.location} weather - click to see effect`}
                        >
                          <span className="flex items-center justify-center">
                            {weatherState.temperature}°C{" "}
                            {weatherState.customLocation &&
                              `(${weatherState.location})`}
                          </span>
                          {weatherState.condition && (
                            <span className="ml-1 text-xs flex items-center justify-center">
                              {getWeatherIcon(weatherState.condition)}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Text Animation Section - Independent of criticalContentLoaded */}
            <div className="w-full mb-36">
              <div className="space-y-8">
                {/* Line 1 Section */}
                <section className="w-full">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      {/* 1. Identity line — bold, intentional */}
                      <motion.p
                        className="tracking-tight text-lg"
                        initial={{
                          opacity: 0,
                          filter: "blur(10px)",
                          y: 10,
                        }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{
                          duration: 3.2,
                          ease: [0.12, 1, 0.28, 1],
                          delay: 0.4,
                        }}
                      >
                        <motion.span
                          className="text-foreground font-medium"
                          initial={{
                            opacity: 0,
                            filter: "blur(10px)",
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                          }}
                          transition={{
                            duration: 3.2,
                            ease: [0.12, 1, 0.28, 1],
                            delay: 0.5,
                          }}
                        >
                          Senior Designer
                        </motion.span>
                        <motion.span
                          className="text-foreground/70"
                          initial={{
                            opacity: 0,
                            filter: "blur(10px)",
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                          }}
                          transition={{
                            duration: 3.2,
                            ease: [0.12, 1, 0.28, 1],
                            delay: 0.55,
                          }}
                        >
                          {" "}
                          and{" "}
                        </motion.span>
                        <motion.span
                          className="text-foreground font-medium"
                          initial={{
                            opacity: 0,
                            filter: "blur(10px)",
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                          }}
                          transition={{
                            duration: 3.2,
                            ease: [0.12, 1, 0.28, 1],
                            delay: 0.6,
                          }}
                        >
                          Senior Design Engineer
                        </motion.span>
                        <motion.span
                          className="text-foreground/70"
                          initial={{
                            opacity: 0,
                            filter: "blur(10px)",
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                          }}
                          transition={{
                            duration: 3.2,
                            ease: [0.12, 1, 0.28, 1],
                            delay: 0.65,
                          }}
                        >
                          ; fast with purpose, calm with care, grounded in
                          trust.
                        </motion.span>
                      </motion.p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Content Section - Controlled by criticalContentLoaded */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: criticalContentLoaded ? 1 : 0,
                y: criticalContentLoaded ? 0 : 20,
              }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="space-y-36"
              style={{
                transform: animationsComplete ? "none" : undefined,
                willChange: animationsComplete ? "auto" : "transform, opacity",
                minHeight: viewportHeight,
              }}
            >
              <div className="w-full">
                <div className="space-y-8">
                  {/* Desktop Slideshow - now used for all screen sizes */}
                  <div
                    ref={slideshowRef}
                    className="w-full mb-0 overflow-hidden relative"
                    onMouseEnter={() => {
                      // Don't pause on hover anymore
                      // setIsSlideshowPaused(true);
                    }}
                    onMouseLeave={() => {
                      // Don't need to unpause since we're not pausing on hover
                      // setIsSlideshowPaused(false);
                      // setTransitionProgress(0);
                    }}
                    onTouchStart={() => setIsSlideshowPaused(true)}
                  >
                    {/* Replace the AnimatePresence with a crossfade effect */}
                    <div className="relative w-full h-full">
                      {/* Mobile Feed View */}
                      <div className="block sm:hidden space-y-6">
                        {images.map((src: string, index: number) => (
                          <motion.div
                            key={`mobile-${src}`}
                            className="w-full"
                            initial={{ opacity: 0, filter: "blur(20px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{
                              duration: 1.2,
                              delay: 2.2 + index * 0.15,
                              ease: [0.12, 1, 0.28, 1],
                            }}
                          >
                            <motion.div
                              className={`relative w-full ${
                                workVideos[src] ? "cursor-pointer group" : ""
                              }`}
                              onClick={() => {
                                if (workVideos[src]) {
                                  handleOpenVideoModal(src);
                                }
                              }}
                            >
                              <Image
                                src={src}
                                alt={`Work preview ${index + 1}`}
                                width={1200}
                                height={800}
                                loader={imageLoader}
                                className={`w-full bg-transparent max-w-full ${
                                  workVideos[src]
                                    ? "transition-opacity duration-300 hover:opacity-90"
                                    : ""
                                }`}
                                priority={index < 2}
                                loading={index < 2 ? "eager" : "lazy"}
                                onLoad={() => handleImageLoad(src)}
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
                          </motion.div>
                        ))}
                      </div>

                      {/* Desktop Slideshow View */}
                      <div className="hidden sm:block relative w-full h-full">
                        {images.map((src, index) => (
                          <motion.div
                            key={src}
                            className="absolute inset-0 w-full h-full"
                            initial={{
                              opacity: 0,
                              filter: "blur(10px)",
                              y: 20,
                            }}
                            animate={{
                              opacity: index === currentImageIndex ? 1 : 0,
                              filter:
                                index === currentImageIndex
                                  ? "blur(0px)"
                                  : "blur(10px)",
                              y: index === currentImageIndex ? 0 : 20,
                            }}
                            transition={{
                              duration: 2.4,
                              ease: [0.12, 1, 0.28, 1],
                              delay: 1.6,
                            }}
                            style={{
                              zIndex: index === currentImageIndex ? 2 : 1,
                            }}
                          >
                            <motion.div
                              className={`relative w-full h-full ${
                                workVideos[src] ? "cursor-pointer group" : ""
                              }`}
                              onClick={() => {
                                if (workVideos[src]) {
                                  handleOpenVideoModal(src);
                                }
                              }}
                            >
                              <Image
                                src={src}
                                alt={`Work preview ${index + 1}`}
                                width={1200}
                                height={800}
                                loader={imageLoader}
                                className={`w-full bg-transparent max-w-full ${
                                  workVideos[src]
                                    ? "transition-all duration-300 hover:brightness-105"
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
                                loading={index < 3 ? "eager" : "lazy"}
                                priority={index < 3}
                                quality={index < 3 ? 90 : 75}
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

                  {/* Hide "View all works" CTA on mobile */}
                  {/* <div className="mt-4 hidden sm:block">
                    <a
                      href="https://deck.raf.works"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
                    >
                      View all works{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-3.5 h-3.5 ml-1 relative -top-[0.5px]"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </a>
                  </div> */}
                </div>
              </div>
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

              {/* About Section */}
              <section className="w-full mt-20">
                <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-6 select-none">
                  Experience
                </h2>
                <div className="space-y-8">
                  {(() => {
                    const experience = [
                      {
                        year: "2025",
                        role: "Senior Product Designer",
                        company: "Voiceflow",
                        url: "https://voiceflow.com",
                        note: "Product Activation with Braden (CEO)",
                      },
                      {
                        year: "2024",
                        role: "Design Lead",
                        company: "Never Before Seen",
                        url: "https://neverbeforeseen.co",
                        note: "Design Lead in a zero to one product design studio focused on Web 3.0",
                      },
                      {
                        year: "2023–2024",
                        role: "Founding Product Designer",
                        company: "Theoriq",
                        url: "https://theoriq.ai",
                        note: "Zero to one. Responsible for Product Design, Marketing and Brand. 140k users in 6 months.",
                      },
                      {
                        year: "2023",
                        role: "Product Design Lead",
                        company: "CurbCutOS",
                        url: "https://curbcutos.com",
                        note: "Shaped accessibility SaaS as an IC and Lead.",
                      },
                      {
                        year: "2022–2023",
                        role: "Product Design Lead",
                        company: "Atlas (Stealth)",
                      },
                      {
                        year: "2021–2022",
                        role: "Senior Product Designer, Design System",
                        company: "Zalando",
                        url: "https://zalando.com",
                        note: "Designed and scaled the B2B Design System used across Zalando's product surfaces. Big focus on documentation.",
                      },
                      {
                        year: "2020–2021",
                        role: "Freelance Designer & Developer",
                        company: "Independent",
                        note: "Directed brand and product design for startups like Artscapy (£10M+), TravelNest (£2.5M ARR 2020)",
                      },
                      {
                        year: "2019",
                        role: "Design Intern",
                        company: "Apple (Developer Academy)",
                        url: "https://developer.apple.com/academies/",
                        note: "Design Intern contributing to a challenge based learning program. WatchOS 6.0.",
                      },
                      {
                        year: "2018–2020",
                        role: "Graphic & Brand Design, cum laude",
                        company: "Napoli",
                        url: "https://win.ilas.com/portfolio/20711100/raffaele-vitale",
                      },
                    ];

                    const recentExperience = experience.slice(0, 3);

                    return (
                      <div className="w-full">
                        <div className="flex flex-col divide-y divide-foreground/[0.03]">
                          {recentExperience.map((exp, idx) => (
                            <div
                              key={exp.year + exp.role}
                              className={`flex items-baseline py-4 first:pt-0 last:pb-0 group transition-colors duration-200 hover:bg-foreground/5 rounded-lg ${
                                exp.url ? "cursor-pointer" : ""
                              }`}
                              onClick={
                                exp.url
                                  ? () => window.open(exp.url, "_blank")
                                  : undefined
                              }
                            >
                              {/* Year */}
                              <div className="w-28 min-w-[7rem] text-xs text-foreground/40 font-light tracking-tight">
                                {exp.year}
                              </div>
                              {/* Main content */}
                              <div className="flex-1">
                                <div className="text-base font-medium text-foreground group-hover:text-foreground/90 transition-colors">
                                  {exp.role}
                                </div>
                                <div className="text-sm text-foreground/60 mt-1">
                                  {exp.company}
                                </div>
                              </div>
                              {/* Note on the far right (desktop: hover, mobile: always) */}
                              {exp.note && (
                                <div
                                  className="hidden sm:block ml-4 text-xs font-medium italic text-foreground/60 text-right whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                  style={{ minWidth: 120 }}
                                >
                                  {exp.note}
                                </div>
                              )}
                              {exp.note && (
                                <div className="block sm:hidden mt-2 text-xs font-medium italic text-foreground/60">
                                  {exp.note}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* View all timeline button */}
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          onClick={() => setIsAllExperienceModalOpen(true)}
                          className="text-sm text-foreground/50 hover:text-foreground transition-colors mt-8"
                        >
                          Open Timeline
                        </motion.button>
                      </div>
                    );
                  })()}
                </div>
              </section>

              {/* Notes Section */}
              <section className="w-full mt-20">
                <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-6 select-none">
                  Notes
                </h2>
                <div className="space-y-8">
                  <div className="flex flex-col divide-y divide-foreground/[0.03]">
                    {sortedNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        id={`note-card-${index}`}
                        className="py-4 first:pt-0 last:pb-0 cursor-pointer group relative note-card hover:bg-foreground/5 rounded-lg transition-colors duration-200"
                        initial={fadeInAnimation.initial}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                        }}
                        onClick={(e) => {
                          // Find the correct index in the original notes array
                          const originalIndex = notes.findIndex(
                            (n) => n.id === note.id
                          );
                          handleOpenNoteWithAnimation(originalIndex, e);
                        }}
                      >
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-10 items-baseline relative">
                          <div className="text-xs text-foreground/40 whitespace-nowrap min-w-[90px] font-light tracking-tight group-hover:text-foreground/50 transition-colors note-date">
                            {new Date(note.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex-1 relative">
                            <div className="flex flex-col gap-1.5">
                              <p className="text-base text-foreground group-hover:text-foreground transition-colors font-medium">
                                {note.title}
                              </p>
                              <p className="text-sm text-foreground/60 dark:text-foreground/50 line-clamp-2 leading-relaxed group-hover:text-foreground/70 transition-colors">
                                {note.excerpt ||
                                  note.content
                                    .replace(/^#.*$/m, "")
                                    .trim()
                                    .split("\n")[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* View all notes button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onClick={handleOpenAllNotes}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors mt-8"
                  >
                    Open Notes
                  </motion.button>
                </div>
              </section>

              <section className="w-full mt-20">
                <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-6 select-none">
                  Photos
                </h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-3">
                    {photos.slice(0, 3).map((photo, index) => (
                      <motion.div
                        key={index}
                        className="aspect-[3/4] md:aspect-[2/3] cursor-pointer relative"
                        initial={fadeInAnimation.initial}
                        animate={{ opacity: loadedImages[photo.src] ? 1 : 0 }}
                        transition={fadeInAnimation.transition}
                        onClick={() => {
                          setCurrentPhotoIndex(index);
                          setIsPhotosModalOpen(true);
                        }}
                      >
                        <img
                          src={photo.src}
                          alt={`Photo of ${photo.name}`}
                          className="w-full h-full object-cover"
                          onLoad={() => handleImageLoad(photo.src)}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPhotoIndex(0);
                      setIsPhotosModalOpen(true);
                    }}
                    className="text-sm text-foreground/50 hover:text-foreground transition-colors mt-8"
                  >
                    Open Photos
                  </motion.button>
                </div>
              </section>

              {/* Deep Interest Section - RESTORED */}
              <section className="w-full mt-20">
                <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-widest mb-6 select-none">
                  About
                </h2>
                <div className="space-y-8">
                  <motion.p
                    className="text-foreground/80 tracking-tight text-lg"
                    initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                    whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                      whileInView={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                      }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Raised on the Amalfi Coast, refined in Lisbon, based in
                      Toronto.
                    </motion.span>
                  </motion.p>
                  {/* 3. Location + personal depth */}
                  <motion.p
                    className="tracking-tight text-lg text-foreground/70"
                    initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                    whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                      whileInView={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                      }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Outside of design: yoga, portraiture, and thoughtfully
                      lived spaces
                    </motion.span>
                    {/* <br /> */}
                    <motion.span
                      className="text-foreground/60"
                      initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                      whileInView={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                      }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                        delay: 0.2,
                      }}
                    >
                      {/* Raf blends structure and intuition. Outside of design:
                      portraiture, yoga, and inspiring workspaces */}
                    </motion.span>
                  </motion.p>
                </div>
              </section>
            </motion.div>

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
                                Raf is in {weatherState.location} - where it's{" "}
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

                  {/* Weather animation effects based on condition */}
                  {(weatherState.condition === "Rain" ||
                    weatherState.condition === "Drizzle") && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-[1px] h-[10px] bg-blue-200/50"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10px`,
                            animationDuration: `${0.5 + Math.random() * 0.7}s`,
                            animationDelay: `${Math.random() * 0.5}s`,
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
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-white/80"
                          style={{
                            width: `${2 + Math.random() * 3}px`,
                            height: `${2 + Math.random() * 3}px`,
                            left: `${Math.random() * 100}%`,
                            top: `-5px`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                            animationDelay: `${Math.random() * 1}s`,
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

            {/* Photos Modal */}
            <AnimatePresence>
              {isPhotosModalOpen && (
                <>
                  {/* Fixed backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                    onClick={handleClosePhotoModal}
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
                        handleClosePhotoModal(e);
                      }
                    }}
                  >
                    {/* Sticky close button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="sticky top-6 float-right mr-6 flex items-center justify-center w-6 h-6 rounded-full hover:bg-foreground/5 transition-colors"
                      onClick={handleClosePhotoModal}
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

                    {/* Content container */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-3xl mx-auto px-6 md:px-8 py-20 space-y-32"
                    >
                      {/* Photos grid */}
                      <div className="grid grid-cols-1 gap-16 md:gap-24">
                        {photos.map((photo, index) => (
                          <motion.div
                            key={index}
                            ref={(el) => {
                              photoRefs.current[index] = el;
                            }}
                            className="aspect-[3/4] cursor-pointer relative max-w-2xl mx-auto w-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: loadedImages[photo.src] ? 1 : 0,
                              y: loadedImages[photo.src] ? 0 : 10,
                            }}
                            transition={{
                              duration: 0.5,
                              delay: index * 0.05,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img
                              src={photo.src}
                              alt={`Photo of ${photo.name}`}
                              className="w-full h-full object-cover"
                              onLoad={() => handleImageLoad(photo.src)}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex justify-center items-center">
                              <span className="text-white text-sm font-light">
                                {photo.name}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </>
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

            {/* All Timeline Modal */}
            <AnimatePresence>
              {isAllExperienceModalOpen && (
                <>
                  {/* Fixed backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                    onClick={() => setIsAllExperienceModalOpen(false)}
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
                        setIsAllExperienceModalOpen(false);
                      }
                    }}
                  >
                    {/* Content container */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-4xl mx-auto px-6 md:px-12 py-16 pb-24 my-12 bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-xl relative"
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
                          setIsAllExperienceModalOpen(false);
                        }}
                        aria-label="Close all timeline"
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
                        {[
                          {
                            year: "2025",
                            role: "Senior Product Designer",
                            company: "Voiceflow",
                            url: "https://voiceflow.com",
                            note: "Product Activation with Braden (CEO)",
                          },
                          {
                            year: "2024",
                            role: "Design Lead",
                            company: "Never Before Seen",
                            url: "https://neverbeforeseen.co",
                            note: "Design Lead in a zero to one product design studio focused on Web 3.0",
                          },
                          {
                            year: "2023–2024",
                            role: "Founding Product Designer",
                            company: "Theoriq",
                            url: "https://theoriq.ai",
                            note: "Zero to one. Responsible for Product Design, Marketing and Brand. 140k users in 6 months.",
                          },
                          {
                            year: "2023",
                            role: "Product Design Lead",
                            company: "CurbCutOS",
                            url: "https://curbcutos.com",
                            note: "Shaped accessibility SaaS as an IC and Lead.",
                          },
                          {
                            year: "2022–2023",
                            role: "Product Design Lead",
                            company: "Atlas (Stealth)",
                          },
                          {
                            year: "2021–2022",
                            role: "Senior Product Designer, Design System",
                            company: "Zalando",
                            url: "https://zalando.com",
                            note: "Designed and scaled the B2B Design System used across Zalando's product surfaces. Big focus on documentation.",
                          },
                          {
                            year: "2020–2021",
                            role: "Freelance Designer & Developer",
                            company: "Independent",
                            note: "Directed brand and product design for startups like Artscapy (£10M+), TravelNest (£2.5M ARR 2020)",
                          },
                          {
                            year: "2019",
                            role: "Design Intern",
                            company: "Apple (Developer Academy)",
                            url: "https://developer.apple.com/academies/",
                            note: "Design Intern contributing to a challenge based learning program. WatchOS 6.0.",
                          },
                          {
                            year: "2018–2020",
                            role: "Graphic & Brand Design, cum laude",
                            company: "Napoli",
                            url: "https://win.ilas.com/portfolio/20711100/raffaele-vitale",
                          },
                        ].map((exp, index) => (
                          <motion.div
                            key={exp.year + exp.role}
                            className={`py-6 first:pt-0 group transition-colors duration-200 hover:bg-foreground/5 rounded-lg ${
                              exp.url ? "cursor-pointer" : ""
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                            }}
                            onClick={
                              exp.url
                                ? () => window.open(exp.url, "_blank")
                                : undefined
                            }
                          >
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start w-full">
                              <div className="text-sm text-foreground/50 whitespace-nowrap min-w-[90px]">
                                {exp.year}
                              </div>
                              <div className="flex-1">
                                <p className="text-lg text-foreground group-hover:text-foreground/90 transition-colors mb-1">
                                  {exp.role}
                                </p>
                                <div className="text-sm text-foreground/60 mt-1">
                                  {exp.url ? (
                                    <a
                                      href={exp.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline hover:text-foreground/80 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {exp.company}
                                    </a>
                                  ) : (
                                    exp.company
                                  )}
                                </div>
                              </div>
                              {/* Note on the far right (desktop: hover, mobile: always) */}
                              {exp.note && (
                                <div
                                  className="hidden sm:block ml-4 text-xs font-medium italic text-foreground/60 text-right whitespace-pre-line break-words max-w-xs transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                  style={{ minWidth: 120 }}
                                >
                                  {exp.note}
                                </div>
                              )}
                              {exp.note && (
                                <div className="block sm:hidden mt-2 text-xs font-medium italic text-foreground/60 whitespace-pre-line break-words">
                                  {exp.note}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        {/* Divider line */}
                        <div className="w-full h-px bg-foreground/10 my-12"></div>

                        {/* Additional experience entries */}
                        {[
                          {
                            year: "2018",
                            role: "Software Engineer (withdrawn)",
                            company: "Salerno University",
                          },
                          {
                            year: "2018",
                            role: "Airbnb SuperHost Plus",
                            company: "Naples",
                          },
                        ].map((exp, index) => (
                          <motion.div
                            key={exp.year + exp.role}
                            className="py-6 first:pt-0 group transition-colors duration-200 hover:bg-foreground/5 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: (index + 9) * 0.05, // Continue the delay sequence
                            }}
                          >
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start">
                              <div className="text-sm text-foreground/50 whitespace-nowrap min-w-[90px]">
                                {exp.year}
                              </div>
                              <div className="flex-1">
                                <p className="text-lg text-foreground group-hover:text-foreground/90 transition-colors mb-1">
                                  {exp.role}
                                </p>
                                <div className="text-base text-foreground/60 group-hover:text-foreground/70 transition-colors">
                                  {exp.company}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* View full CV button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6, // Delay after the additional entries
                          }}
                          className="pt-8 mt-4"
                        >
                          <a
                            href="https://drive.google.com/file/d/1LSOrihlPoozbIi8TZERfVnG-zdYCqk0Y/view"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors group"
                          >
                            View full CV{" "}
                          </a>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.main>

        <ImagePreloader />

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

      {/* Footer with video background - harmonious reveal */}
      <motion.footer
        className="relative w-full bg-black overflow-hidden min-h-[500px]"
        initial={{
          y: 60,
          opacity: 0,
        }}
        whileInView={{
          y: 0,
          opacity: 1,
        }}
        viewport={{
          once: true,
          amount: 0.3,
        }}
        transition={{
          duration: 2.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          marginTop: "144px", // 36 * 4 = 144px
          boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Video background with gentle fade */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 3,
            ease: "easeOut",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "brightness(0.7)",
            }}
          >
            <source src="/video/footer-video.mp4" type="video/mp4" />
          </video>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>

        {/* Footer content with blur focus animation */}
        <div className="relative z-10 px-6 sm:px-10 md:px-28 py-36">
          <div className="w-full max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2,
                  }}
                >
                  <p className="text-sm text-white/60 mb-1">Email</p>
                  <a
                    href="mailto:raf@raf.works"
                    className="text-base text-white hover:text-white/90 transition-colors"
                  >
                    raf@raf.works
                  </a>
                </motion.div>
                {/* LinkedIn */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.4,
                  }}
                >
                  <p className="text-sm text-white/60 mb-1">LinkedIn</p>
                  <a
                    href="https://linkedin.com/in/lfgraf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-white hover:text-white/90 transition-colors"
                  >
                    lfgraf
                  </a>
                </motion.div>
                {/* Twitter/X */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.6,
                  }}
                >
                  <p className="text-sm text-white/60 mb-1">Twitter/X</p>
                  <a
                    href="https://twitter.com/lfgraf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-white hover:text-white/90 transition-colors"
                  >
                    lfgraf
                  </a>
                </motion.div>

                {/* Philosophy quote - shown at bottom of links on mobile */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.8,
                  }}
                  className="md:hidden"
                >
                  <motion.button
                    onClick={toggleGlass}
                    className="text-xs text-white font-light tracking-wide italic backdrop-blur-sm bg-black/10 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-500 hover:bg-white/10 hover:backdrop-blur-md group"
                    whileHover={{
                      scale: 1.02,
                      filter: "brightness(1.4)",
                      color: "#fff",
                    }}
                    whileTap={{
                      scale: 0.97,
                      filter: "brightness(0.9)",
                    }}
                    animate={{
                      scale: isGlassEnabled ? 1.05 : 1,
                      filter: isGlassEnabled
                        ? "brightness(1.5)"
                        : "brightness(1)",
                      boxShadow: isGlassEnabled
                        ? "0 0 20px rgba(255, 255, 255, 0.3)"
                        : "0 0 0px rgba(255, 255, 255, 0)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                    aria-label="Toggle liquid glass effect"
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    Always happy, never satisfied
                  </motion.button>
                </motion.div>
              </div>

              {/* Right column - Philosophy (desktop only) */}
              <div className="hidden md:flex items-end justify-end">
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 1.0,
                  }}
                  className="text-right"
                >
                  <motion.button
                    onClick={toggleGlass}
                    className="text-xs text-white font-light tracking-wide italic backdrop-blur-sm bg-black/10 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-500 hover:bg-white/10 hover:backdrop-blur-md group"
                    whileHover={{
                      scale: 1.02,
                      filter: "brightness(1.4)",
                      color: "#fff",
                    }}
                    whileTap={{
                      scale: 0.97,
                      filter: "brightness(0.9)",
                    }}
                    animate={{
                      scale: isGlassEnabled ? 1.05 : 1,
                      filter: isGlassEnabled
                        ? "brightness(1.5)"
                        : "brightness(1)",
                      boxShadow: isGlassEnabled
                        ? "0 0 20px rgba(255, 255, 255, 0.3)"
                        : "0 0 0px rgba(255, 255, 255, 0)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                    aria-label="Toggle liquid glass effect"
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    Always happy, never satisfied
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Add the LiquidGlass component with enhanced animation */}
      <AnimatePresence>
        {isGlassEnabled && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.3,
              x: clickPosition.x - window.innerWidth / 2,
              y: clickPosition.y - window.innerHeight / 2,
              filter: "blur(30px) brightness(0.8)",
              rotate: -8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              filter: "blur(0px) brightness(1)",
              rotate: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.4,
              x: clickPosition.x - window.innerWidth / 2,
              y: clickPosition.y - window.innerHeight / 2,
              filter: "blur(25px) brightness(0.7)",
              rotate: 8,
            }}
            transition={{
              duration: 1.2,
              ease: [0.12, 1, 0.28, 1],
              filter: { duration: 0.8 },
              rotate: { duration: 1.2 },
              scale: { duration: 1.2 },
            }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              transformOrigin: "center center",
              zIndex: 9999,
            }}
          >
            <LiquidGlass />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
