"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { notes, Note, getCategoryColor } from "./data/notes";

// Add image optimization configuration
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
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAllNotesModalOpen, setIsAllNotesModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  // Track loading progress for images
  const [imageLoadingProgress, setImageLoadingProgress] = useState<{
    [key: string]: number;
  }>({});
  // Add progress indicator state
  const [transitionProgress, setTransitionProgress] = useState(0);
  // Add state to track if slideshow is paused
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  // Camera focus effect state
  const [blurAmount, setBlurAmount] = useState(25); // Increased from 12 to 25 for stronger initial blur
  // Add state to track scroll position
  const [scrollY, setScrollY] = useState(0);
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
    progress: 0.5, // Default to middle of the time period for a balanced look
  });
  const [focusAnimationRun, setFocusAnimationRun] = useState(false);

  // Add weather state
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

  // Create refs for photos
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  const images = [
    "/work/theoriq.png",
    "/work/theoriq-prod-hero.png",
    "/work/wai.png",
    //"/work/wai-2.png",
    "/work/defi.png",
    "/work/ethos.png",
    "/work/theoriq-mobile-chat.png",
    "/work/curbcut.png",
    "/work/art-02.png",
    "/work/atlas-1.png",
    "/work/us.png",
    "/work/tela.png",
    "/work/zalando-dodont.png",
    "/work/zalando-spread.png",
    "/work/apple.png",
  ];

  // Map work images to their corresponding Vimeo video URLs
  const workVideos: { [key: string]: string } = {
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

  // Preload component to ensure all images are loaded
  const ImagePreloader = () => {
    // Track when all images are loaded
    useEffect(() => {
      // Check if all images are loaded
      const allImagesLoaded = images.every((src) => loadedImages[src]);

      // If all images are loaded, make sure the slideshow is ready to run
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

  // Generate a dominant color placeholder for images
  const getImagePlaceholder = (index: number) => {
    // A set of subtle, design-friendly placeholder colors that match your aesthetic
    const placeholderColors = [
      "rgba(245, 245, 245, 0.8)", // Light gray
      "rgba(240, 240, 245, 0.8)", // Light blue-gray
      "rgba(245, 240, 235, 0.8)", // Light warm gray
      "rgba(235, 240, 245, 0.8)", // Light cool gray
      "rgba(240, 245, 240, 0.8)", // Light mint
    ];

    // Use the image index to select a color, cycling through the options
    return placeholderColors[index % placeholderColors.length];
  };

  const photos = [
    { src: "/photos/marianne.jpeg", name: "Marianne" },
    { src: "/photos/josh.JPG", name: "Josh" },
    { src: "/photos/omar.JPG", name: "Omar" },
    { src: "/photos/adrien.JPG", name: "Adrien" },
    { src: "/photos/jordi.JPG", name: "Jordi" },
    { src: "/photos/flo.JPG", name: "Flo" },
    { src: "/photos/kelindi.JPG", name: "Kelindi" },
    { src: "/photos/vin.JPG", name: "Vin" },
    { src: "/photos/anna.JPG", name: "Anna" },
  ];
  useEffect(() => {
    setMounted(true);

    // Fetch weather data
    fetchWeatherData();

    // Set up interval to update time
    const timeInterval = setInterval(updateTimeState, 1000);

    // Set up keyboard event listener
    window.addEventListener("keydown", handleKeyDown);

    // Start the slideshow after a short delay to ensure images are loaded
    const slideshowTimer = setTimeout(() => {
      if (
        !isPhotosModalOpen &&
        !isNotesModalOpen &&
        !isAllNotesModalOpen &&
        !isSlideshowPaused
      ) {
        // Set to the first image and start progress
        setCurrentImageIndex(0);
        setTransitionProgress(0);
      }
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      clearTimeout(slideshowTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update scrollbar color when weather condition changes
  useEffect(() => {
    if (mounted && weatherState.condition) {
      updateScrollbarColor();
    }
  }, [mounted, weatherState.condition]);

  // Camera focus animation effect
  const focusAnimation = () => {
    // Start with a blur and gradually reduce it using a more camera-like easing
    const totalDuration = 2500; // 2.5 seconds total
    const startTime = Date.now();
    const initialBlur = 25; // Increased from 15 to 25 for stronger initial blur

    // Set initial blur
    setBlurAmount(initialBlur);

    const focusInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Use a cubic easing function for more natural camera focus feel
      // Starts slow, accelerates in the middle, then slows down at the end
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const newBlur = initialBlur * (1 - easedProgress);

      setBlurAmount(newBlur);

      if (progress >= 1) {
        clearInterval(focusInterval);
        // Ensure blur is completely removed
        setBlurAmount(0);
      }
    }, 16); // ~60fps for smooth animation

    return () => {
      clearInterval(focusInterval);
      // Ensure blur is completely removed when cleaning up
      setBlurAmount(0);
    };
  };

  // Add a useEffect to handle the focus animation with proper cleanup
  useEffect(() => {
    // Only run the focus animation once when the component mounts
    if (mounted && !focusAnimationRun) {
      setFocusAnimationRun(true);
      const cleanup = focusAnimation();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [mounted, focusAnimationRun]);

  // Update time state
  const updateTimeState = () => {
    // Get current time in EST
    const now = new Date();
    // Convert to EST (UTC-5 or UTC-4 during daylight saving)
    const estOffset = -5; // EST offset from UTC in hours
    const isDST = () => {
      // Simple DST check for US Eastern Time
      const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
      const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
      return Math.max(jan, jul) !== now.getTimezoneOffset();
    };

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estTime = new Date(utc + 3600000 * (estOffset + (isDST() ? 1 : 0)));

    const hour = estTime.getHours();
    const minute = estTime.getMinutes();

    // Calculate time of day
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

    // Calculate progress through current time period (0-1)
    let progress = 0;
    if (timeOfDay === "dawn") {
      progress = ((hour - 5) * 60 + minute) / (3 * 60); // 3 hours
    } else if (timeOfDay === "morning") {
      progress = ((hour - 8) * 60 + minute) / (4 * 60); // 4 hours
    } else if (timeOfDay === "afternoon") {
      progress = ((hour - 12) * 60 + minute) / (5 * 60); // 5 hours
    } else if (timeOfDay === "evening") {
      progress = ((hour - 17) * 60 + minute) / (4 * 60); // 4 hours
    } else {
      // Night spans from 21 to 5, wrapping around midnight
      if (hour >= 21) {
        progress = ((hour - 21) * 60 + minute) / (8 * 60); // 8 hours total
      } else {
        progress = ((hour + 3) * 60 + minute) / (8 * 60); // 8 hours total
      }
    }

    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    setTimeState({
      hour,
      minute,
      timeOfDay,
      progress,
    });
  };

  // Fetch weather data for the specified location
  const fetchWeatherData = async (location: string = "Toronto") => {
    try {
      // Define coordinates for supported cities
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

      // Get coordinates for the requested location or default to Toronto
      const coordinates =
        cityCoordinates[location] || cityCoordinates["Toronto"];

      // Use a real weather API to get accurate weather data
      // Using OpenMeteo API which doesn't require an API key
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,weather_code&timezone=America%2FNew_York`
      );

      if (!response.ok) {
        throw new Error("Weather data fetch failed");
      }

      const data = await response.json();

      // Map OpenMeteo weather codes to our condition names
      // https://open-meteo.com/en/docs
      const mapWeatherCode = (code: number): string => {
        // Clear
        if ([0].includes(code)) return "Clear";
        // Mainly clear, partly cloudy
        if ([1, 2].includes(code)) return "Partly Cloudy";
        // Overcast
        if ([3].includes(code)) return "Clouds";
        // Fog, depositing rime fog
        if ([45, 48].includes(code)) return "Fog";
        // Drizzle: light, moderate, dense intensity
        if ([51, 53, 55].includes(code)) return "Drizzle";
        // Freezing Drizzle: light and dense intensity
        if ([56, 57].includes(code)) return "Freezing Drizzle";
        // Rain: slight, moderate, heavy intensity
        if ([61, 63, 65].includes(code)) return "Rain";
        // Freezing Rain: light and heavy intensity
        if ([66, 67].includes(code)) return "Freezing Rain";
        // Snow fall: slight, moderate, heavy intensity
        if ([71, 73, 75].includes(code)) return "Snow";
        // Snow grains
        if ([77].includes(code)) return "Snow";
        // Rain showers: slight, moderate, violent
        if ([80, 81, 82].includes(code)) return "Rain";
        // Snow showers slight and heavy
        if ([85, 86].includes(code)) return "Snow";
        // Thunderstorm: slight or moderate, with/without hail
        if ([95, 96, 99].includes(code)) return "Thunderstorm";

        return "Clear"; // Default
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

  // Add keyboard navigation for modal
  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle escape key for modals
    if (e.key === "Escape") {
      if (
        isPhotosModalOpen ||
        isNotesModalOpen ||
        isAllNotesModalOpen ||
        isVideoModalOpen
      ) {
        // Close any open modal
        setIsPhotosModalOpen(false);
        setIsNotesModalOpen(false);
        setIsAllNotesModalOpen(false);
        setIsVideoModalOpen(false);
      }
      return;
    }

    // Skip other keys if any modal is open
    if (
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen
    )
      return;

    // Handle arrow keys for navigation
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      // Pause slideshow on user interaction
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
    // Remove isZoomed from dependency array
    images.length,
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

  // Use IntersectionObserver to detect when slideshow is visible
  useEffect(() => {
    if (!mounted) return;

    const slideshowElement = slideshowRef.current;
    if (!slideshowElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when at least 10% of the element is visible
    );

    observer.observe(slideshowElement);

    return () => {
      if (slideshowElement) {
        observer.unobserve(slideshowElement);
      }
    };
  }, [mounted]);

  // Force the slideshow to start when it becomes visible
  useEffect(() => {
    if (
      isInViewport &&
      !isPhotosModalOpen &&
      !isNotesModalOpen &&
      !isAllNotesModalOpen &&
      !isVideoModalOpen
    ) {
      // Reset progress to start the slideshow
      setTransitionProgress(0);
      console.log("Slideshow visible in viewport, ensuring it is running");
    }
  }, [
    isInViewport,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
  ]);

  // Main slideshow interval effect - simplified to use a reliable interval
  useEffect(() => {
    if (
      !mounted ||
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen ||
      isSlideshowPaused
    )
      return;

    const slideshowInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(slideshowInterval);
  }, [
    mounted,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    isSlideshowPaused,
    images.length,
  ]);

  // Progress bar animation
  useEffect(() => {
    // Only run if no modal is open
    if (
      !mounted ||
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen ||
      isVideoModalOpen
    )
      return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();
    let progress = transitionProgress;

    const updateProgress = (timestamp: number) => {
      const elapsed = timestamp - lastTimestamp;

      // Update progress approximately every 40ms (25fps)
      if (elapsed > 40) {
        // For a 3500ms total duration
        progress += elapsed / 35;

        // Cap at 100%
        if (progress > 100) progress = 100;

        setTransitionProgress(progress);
        lastTimestamp = timestamp;
      }

      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    mounted,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    isVideoModalOpen,
    transitionProgress,
  ]);

  // Add preloading for critical images
  useEffect(() => {
    if (mounted) {
      // Preload first 3 images
      images.slice(0, 3).forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, [mounted]);

  // Update the image loading handler
  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => {
      const newState = { ...prev, [src]: true };

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

    // Prevent background scrolling on mobile
    if (window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    }
  };

  // Remove the ref and useEffect for scrolling
  const handleCloseNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Re-enable scrolling
    document.body.style.overflow = "";

    // Simply close the modal without any additional animations or timeouts
    setIsNotesModalOpen(false);
  };

  const handleOpenAllNotes = () => {
    setIsAllNotesModalOpen(true);
  };

  const handleNextNote = () => {
    setCurrentNoteIndex((prev) => (prev + 1) % notes.length);
  };

  const handlePrevNote = () => {
    setCurrentNoteIndex((prev) => (prev - 1 + notes.length) % notes.length);
  };

  // Custom variants for card transitions - simplified for elegance
  const cardVariants = {
    enter: (direction: number) => ({
      opacity: 0,
    }),
    center: {
      opacity: 1,
      transition: {
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      transition: {
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Track the direction of navigation
  const [direction, setDirection] = useState(0);

  // Update direction when navigating
  const navigateWithDirection = (newDirection: number, newIndex: number) => {
    setDirection(newDirection);
    setCurrentNoteIndex(newIndex);
  };

  // Modified navigation handlers
  const handleNextNoteWithDirection = () => {
    navigateWithDirection(1, (currentNoteIndex + 1) % notes.length);
  };

  const handlePrevNoteWithDirection = () => {
    navigateWithDirection(
      -1,
      (currentNoteIndex - 1 + notes.length) % notes.length
    );
  };

  // Effect to scroll to the selected photo when modal opens
  useEffect(() => {
    if (isPhotosModalOpen && photoRefs.current[currentPhotoIndex]) {
      setTimeout(() => {
        photoRefs.current[currentPhotoIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // Small delay to ensure modal is fully rendered
    }
  }, [isPhotosModalOpen, currentPhotoIndex]);

  // Format time for display (12-hour format with AM/PM)
  const formatTime = () => {
    if (!mounted) return "";

    const { hour, minute } = timeState;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    const displayMinute = minute < 10 ? `0${minute}` : minute;

    return `${displayHour}:${displayMinute} ${period} EST`;
  };

  // Calculate time difference between user's local time and EST
  const getTimeDifference = (isMobile = false) => {
    if (!mounted) return "";

    // Get current time in user's local timezone
    const localDate = new Date();

    // Get current time in EST/EDT (US Eastern Time)
    const estOptions = {
      timeZone: "America/New_York",
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    };
    const estHour = parseInt(
      new Intl.DateTimeFormat("en-US", estOptions).format(localDate)
    );

    // Get local hour using the same format for consistency
    const localOptions = { hour: "numeric" as const, hour12: false };
    const localHour = parseInt(
      new Intl.DateTimeFormat("en-US", localOptions).format(localDate)
    );

    // Calculate hour difference
    let hourDifference = localHour - estHour;

    // Adjust for day boundary crossings
    if (hourDifference > 12) {
      hourDifference -= 24;
    } else if (hourDifference < -12) {
      hourDifference += 24;
    }

    // Generate the appropriate message based on the time difference
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

  // Toggle weather effect display
  const toggleWeatherEffect = (e: React.MouseEvent) => {
    // Instead of using click position, we'll display the effect at the top of the page
    setWeatherState((prev) => ({
      ...prev,
      showWeatherEffect: !prev.showWeatherEffect,
      // Set a fixed position at the top of the page
      clickPosition: { x: window.innerWidth / 2, y: 0 },
    }));
  };

  // Get weather condition color based on condition
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
    if (!weatherState.condition) return;

    // Define scrollbar colors based on weather conditions
    const scrollbarColors: {
      [key: string]: { color: string; hoverColor: string };
    } = {
      Clear: {
        color: "rgba(255, 200, 0, 0.2)",
        hoverColor: "rgba(255, 200, 0, 0.3)",
      },
      "Partly Cloudy": {
        color: "rgba(180, 180, 180, 0.2)",
        hoverColor: "rgba(180, 180, 180, 0.3)",
      },
      Clouds: {
        color: "rgba(150, 150, 150, 0.2)",
        hoverColor: "rgba(150, 150, 150, 0.3)",
      },
      Rain: {
        color: "rgba(0, 125, 255, 0.2)",
        hoverColor: "rgba(0, 125, 255, 0.3)",
      },
      Drizzle: {
        color: "rgba(100, 150, 255, 0.2)",
        hoverColor: "rgba(100, 150, 255, 0.3)",
      },
      "Freezing Drizzle": {
        color: "rgba(180, 200, 255, 0.2)",
        hoverColor: "rgba(180, 200, 255, 0.3)",
      },
      "Freezing Rain": {
        color: "rgba(150, 180, 255, 0.2)",
        hoverColor: "rgba(150, 180, 255, 0.3)",
      },
      Thunderstorm: {
        color: "rgba(100, 100, 255, 0.25)",
        hoverColor: "rgba(100, 100, 255, 0.35)",
      },
      Snow: {
        color: "rgba(220, 240, 255, 0.2)",
        hoverColor: "rgba(220, 240, 255, 0.3)",
      },
      Mist: {
        color: "rgba(200, 200, 220, 0.2)",
        hoverColor: "rgba(200, 200, 220, 0.3)",
      },
      Fog: {
        color: "rgba(180, 180, 200, 0.2)",
        hoverColor: "rgba(180, 180, 200, 0.3)",
      },
      Haze: {
        color: "rgba(200, 180, 150, 0.2)",
        hoverColor: "rgba(200, 180, 150, 0.3)",
      },
    };

    const defaultColor = {
      color: "rgba(125, 125, 125, 0.15)",
      hoverColor: "rgba(125, 125, 125, 0.25)",
    };

    const colors = scrollbarColors[weatherState.condition] || defaultColor;

    // Update CSS variables
    document.documentElement.style.setProperty(
      "--scrollbar-color",
      colors.color
    );
    document.documentElement.style.setProperty(
      "--scrollbar-hover-color",
      colors.hoverColor
    );
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
          <path d="M13.5 6.379V3.75a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 9 10.125a3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.75 3.75 3.75 0 0 0-3-3.746ZM4.5 16.879V14.25a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 0 20.625 3.75 3.75 0 0 0 3.75 24.375 3.75 3.75 0 0 0 7.5 20.625a3.75 3.75 0 0 0-3-3.746ZM13.5 16.879V14.25a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 9 20.625a3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.75 3.75 3.75 0 0 0-3-3.746Z" />
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

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
        transition: "filter 3s cubic-bezier(0.22, 1, 0.36, 1)",
        position: "relative",
      }}
    >
      {/* Bottom gradient for main content - fixed to viewport */}
      <div className="fixed left-0 right-0 bottom-0 h-[15px] w-screen overflow-hidden z-50 pointer-events-none">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-full w-full bg-gradient-to-t from-background/60 to-transparent"
          style={{
            backdropFilter: `blur(${Math.min(scrollY / 150, 2)}px)`,
            opacity: Math.min(scrollY / 300, 1),
            transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 sm:px-10 py-16 md:px-28 bg-background relative overflow-x-hidden"
      >
        <div className="w-full max-w-screen-xl mx-auto relative z-10">
          <motion.div
            variants={fadeInAnimation}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-4 mb-40 relative"
          >
            <h1 className="text-2xl font-normal text-foreground relative z-10 font-edu-marist">
              Raf
            </h1>

            {/* Display current time in EST with weather */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: mounted ? 0.6 : 0 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="absolute right-0 top-0 text-xs text-foreground/40 font-light max-w-[280px] text-right hidden md:block"
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
              className="absolute right-0 top-0 text-xs text-foreground/40 font-light md:hidden"
            >
              <motion.div
                className="backdrop-blur-sm bg-background/5 px-3 py-1.5 rounded-full border border-foreground/5 flex items-center space-x-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.8 }}
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

              {weatherState.isLoading && (
                <motion.p
                  className="text-[9px] opacity-50 mt-1 text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 2.2, duration: 0.8 }}
                >
                  Loading weather...
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 2,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="space-y-36"
          >
            <section className="md:grid md:grid-cols-[180px,minmax(0,1fr)] md:gap-20 w-full">
              <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
                About
              </h2>

              <div className="space-y-6 text-base leading-relaxed">
                <p className="text-foreground">
                  Raf is a Product Designer{" "}
                  <span className="text-foreground/60">
                    ≈ founding designer and design engineer,{" "}
                  </span>
                  driven by{" "}
                  <span className="text-foreground/60">
                    a deep passion for craft, collaboration, and a relentless
                    pursuit of{" "}
                  </span>
                  <span className="text-foreground">excellence</span>
                  <span className="text-foreground/60">.</span>
                </p>

                <p className="text-foreground/60">
                  He has designed and built for companies like Theoriq,
                  CurbCutOS, various crypto startups and Zalando. He has also
                  worked with clients like w.ai, US.court, Artscapy, and more.
                </p>

                <p>
                  <span className="text-foreground/60">
                    Originally from Italy, and now{" "}
                    <span className="text-foreground">based in Toronto</span>,
                    Raf enjoys portraits, yoga, and office spaces.{" "}
                  </span>
                </p>
              </div>
            </section>

            <div className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
              <div className="mb-10 md:mb-0">
                <h2 className="text-base font-normal text-foreground">
                  Selected works
                </h2>
              </div>

              <div className="space-y-8">
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
                    {images.map((src, index) => (
                      <motion.div
                        key={src}
                        className="relative"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: index === currentImageIndex ? 1 : 0,
                          zIndex: index === currentImageIndex ? 2 : 1,
                          transition:
                            "opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
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
                              filter: !loadedImages[src] ? "blur(8px)" : "none",
                              transition:
                                "filter 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                            onLoad={() => handleImageLoad(src)}
                            loading={index < 3 ? "eager" : "lazy"}
                            priority={index < 3}
                            quality={index < 3 ? 90 : 75}
                          />
                          {workVideos[src] && index === currentImageIndex && (
                            <div className="absolute inset-0 flex items-center justify-center">
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

                  {/* Loading indicator */}
                  {!loadedImages[images[currentImageIndex]] && (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/10">
                      <div className="w-6 h-6 border-2 border-foreground/10 border-t-foreground/30 rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Progress line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20 overflow-hidden">
                    <div
                      className={`h-full ${
                        [
                          "/work/theoriq-prod-hero.png",
                          "/work/defi.png",
                          "/work/art-02.png",
                          "/work/ethos.png",
                          "/work/atlas-1.png",
                          "/work/us.png",
                          "/work/apple.png",
                        ].includes(images[currentImageIndex])
                          ? "bg-white/40"
                          : "bg-foreground/40"
                      }`}
                      style={{
                        width: `${
                          (currentImageIndex / (images.length - 1)) * 100
                        }%`,
                        transition: "all 0.3s ease-out",
                      }}
                    />
                  </div>

                  {isSlideshowPaused && (
                    <div className="absolute top-4 right-4 bg-background/70 backdrop-blur-sm rounded-full p-1.5 opacity-70">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-foreground/70"
                      >
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <a
                    href="https://rafvitale.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
                  >
                    View all works ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <section className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
              <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
                Notes
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col divide-y divide-foreground/[0.03]">
                  {sortedNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      id={`note-card-${index}`}
                      className="py-5 first:pt-0 last:pb-0 cursor-pointer group relative note-card"
                      initial={fadeInAnimation.initial}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      onClick={(e) => handleOpenNoteWithAnimation(index, e)}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-foreground/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-10 items-baseline relative">
                        <div className="text-xs text-foreground/40 whitespace-nowrap min-w-[90px] font-light tracking-tight group-hover:text-foreground/50 transition-colors note-date">
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex-1 relative">
                          <motion.div
                            className={`absolute -left-3 top-1.5 w-1.5 h-1.5 rounded-full ${
                              getCategoryColor(note.category).split(" ")[1]
                            } opacity-70 group-hover:scale-125 group-hover:opacity-100`}
                            transition={{ duration: 0.2 }}
                          />
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
                  className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                >
                  View all notes
                </motion.button>
              </div>
            </section>

            <section className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
              <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
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
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPhotoIndex(0);
                    setIsPhotosModalOpen(true);
                  }}
                  className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
                >
                  View all photos
                </Link>
              </div>
            </section>

            <section className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
              <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
                Contact
              </h2>

              <div className="space-y-8 max-w-2xl relative z-20">
                <div>
                  <p className="text-sm text-foreground/50 mb-1">Email</p>
                  <a
                    href="mailto:raf@raf.works"
                    className="text-base text-foreground/80 hover:text-foreground transition-colors"
                  >
                    raf@raf.works
                  </a>
                </div>

                <div>
                  <p className="text-sm text-foreground/50 mb-1">LinkedIn</p>
                  <a
                    href="https://www.linkedin.com/in/raffaelevitaledesign"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-foreground/80 hover:text-foreground transition-colors"
                  >
                    raffaelevitaledesign
                  </a>
                </div>

                <div>
                  <p className="text-sm text-foreground/50 mb-1">Twitter/X</p>
                  <a
                    href="https://twitter.com/lfgraf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-foreground/80 hover:text-foreground transition-colors"
                  >
                    lfgraf
                  </a>
                </div>
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
                  <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-10 md:px-28">
                    <div className="flex items-center justify-between py-3">
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
                                weatherState.condition === "Snow" ? 4 : 0.3,
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
                          {weatherState.condition?.toLowerCase() || "clear"} and{" "}
                          {weatherState.temperature}°C
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
                  onClick={() => setIsPhotosModalOpen(false)}
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
                      setIsPhotosModalOpen(false);
                    }
                  }}
                >
                  {/* Sticky close button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="sticky top-6 float-right mr-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPhotosModalOpen(false);
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
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

                            {/* Right side - Category and Close button */}
                            <div className="flex items-center gap-4">
                              {/* Category badge */}
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className={`text-sm px-4 py-1.5 rounded-full font-light tracking-wide ${getCategoryColor(
                                  notes[currentNoteIndex].category
                                )}`}
                              >
                                {notes[currentNoteIndex].category}
                              </motion.div>

                              {/* Close button - for all devices */}
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-full bg-gray-200/20 backdrop-blur-sm p-2.5 hover:bg-gray-200/30 transition-colors"
                                onClick={handleCloseNote}
                                aria-label="Close note"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
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
                            transition={{ duration: 0.2 }}
                            className="prose dark:prose-invert max-w-none mt-20 relative pb-20 sm:pb-0"
                          >
                            <div className="text-foreground/70 leading-relaxed tracking-wide">
                              <ReactMarkdown
                                components={{
                                  // Override h1 to prevent duplicate titles
                                  h1: ({ node, ...props }) => null,
                                }}
                              >
                                {notes[currentNoteIndex].content}
                              </ReactMarkdown>
                            </div>
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
                              <span className="hidden sm:inline">Previous</span>
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
                      className="absolute top-6 right-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
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
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </motion.button>

                    <motion.h2
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-3xl font-medium mb-8 text-foreground"
                    >
                      All Notes
                    </motion.h2>

                    <div className="flex flex-col divide-y divide-foreground/10">
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
                              setTimeout(() => setIsNotesModalOpen(true), 100);
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

            {/* Scrollable content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCloseVideoModal();
                }
              }}
            >
              {/* Sticky close button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="absolute top-6 right-6 z-10 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseVideoModal();
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Content container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent clicks on content from closing modal
              >
                {/* Video embed */}
                <div className="aspect-video w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] rounded-lg overflow-hidden shadow-2xl">
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
  );
}
