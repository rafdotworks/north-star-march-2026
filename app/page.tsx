"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { notes, Note, getCategoryColor } from "./data/notes";

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAllNotesModalOpen, setIsAllNotesModalOpen] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [timeState, setTimeState] = useState<{
    hour: number;
    minute: number;
    timeOfDay: "dawn" | "morning" | "afternoon" | "evening" | "night";
    progress: number;
  }>({
    hour: 0,
    minute: 0,
    timeOfDay: "morning",
    progress: 0,
  });

  // Add weather state
  const [weatherState, setWeatherState] = useState<{
    temperature: number | null;
    condition: string | null;
    isLoading: boolean;
    showWeatherEffect: boolean;
    clickPosition: { x: number; y: number } | null;
  }>({
    temperature: null,
    condition: null,
    isLoading: true,
    showWeatherEffect: false,
    clickPosition: null,
  });

  // Create refs for photos
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  const images = [
    "/work/theoriq.png",
    "/work/theoriq-prod-hero.png",
    "/work/atlas-1.png",
    "/work/zalando-spread.png",
    "/work/wombo.png",
    "/work/defi.png",
    "/work/ethos.png",
    "/work/tela.png",
    "/work/art-02.png",
    "/work/zalando-dodont.png",
    "/work/apple.png",
  ];

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

    // Fetch weather data for Toronto
    const fetchWeatherData = async () => {
      try {
        // Use a real weather API to get accurate Toronto weather
        // Using OpenMeteo API which doesn't require an API key
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=43.65&longitude=-79.38&current=temperature_2m,weather_code&timezone=America%2FNew_York"
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
        }));
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setWeatherState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    updateTimeState();
    fetchWeatherData();

    const interval = setInterval(updateTimeState, 60000); // Update every minute
    const weatherInterval = setInterval(fetchWeatherData, 30 * 60000); // Update weather every 30 minutes

    return () => {
      clearInterval(interval);
      clearInterval(weatherInterval);
    };
  }, []);

  // Add keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomed) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      } else if (e.key === "Escape") {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed, images.length]);

  useEffect(() => {
    if (
      isZoomed ||
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen
    )
      return; // Don't run interval if any modal is open

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [
    isZoomed,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    images.length,
  ]);

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => ({ ...prev, [src]: true }));
  };

  const fadeInAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 1.8,
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

  // Custom variants for card transitions
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      zIndex: 0,
      boxShadow: "0px 0px 0px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.75rem",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
      borderRadius: "0.75rem",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        boxShadow: { duration: 0.5 },
        borderRadius: { duration: 0.3 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      zIndex: 0,
      boxShadow: "0px 0px 0px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.75rem",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        boxShadow: { duration: 0.5 },
        borderRadius: { duration: 0.3 },
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

    // Get user's local time
    const localDate = new Date();

    // Get EST time
    const estOffset = -5; // EST offset from UTC in hours
    const isDSTActive = () => {
      // Simple DST check for US Eastern Time
      const jan = new Date(localDate.getFullYear(), 0, 1).getTimezoneOffset();
      const jul = new Date(localDate.getFullYear(), 6, 1).getTimezoneOffset();
      return Math.max(jan, jul) !== localDate.getTimezoneOffset();
    };

    // Calculate the difference in hours
    const localOffset = -localDate.getTimezoneOffset() / 60; // Convert minutes to hours and invert (getTimezoneOffset returns negative for east of UTC)
    const estAdjustedOffset = estOffset + (isDSTActive() ? 1 : 0); // Adjust for DST
    const hourDifference = localOffset - estAdjustedOffset;

    // Format the difference message
    if (isMobile) {
      // Shorter messages for mobile
      if (hourDifference === 0) {
        return "Same timezone";
      } else if (hourDifference > 0) {
        return `${hourDifference}h ahead`;
      } else {
        return `${Math.abs(hourDifference)}h behind`;
      }
    } else {
      // Full messages for desktop
      if (hourDifference === 0) {
        return "You're in the same timezone as Raf";
      } else if (hourDifference > 0) {
        return `You're ${hourDifference} hour${
          hourDifference !== 1 ? "s" : ""
        } ahead of Raf`;
      } else {
        return `You're ${Math.abs(hourDifference)} hour${
          Math.abs(hourDifference) !== 1 ? "s" : ""
        } behind Raf`;
      }
    }
  };

  // Toggle weather effect display
  const toggleWeatherEffect = (e: React.MouseEvent) => {
    // Get click position
    const clickPosition = {
      x: e.clientX,
      y: e.clientY,
    };

    setWeatherState((prev) => ({
      ...prev,
      showWeatherEffect: !prev.showWeatherEffect,
      // Always store the current click position, whether showing or hiding
      clickPosition: clickPosition,
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

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string | null) => {
    if (!condition) return null;

    const icons: { [key: string]: JSX.Element } = {
      Clear: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ),
      "Partly Cloudy": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
        >
          <path d="M13.5 6.379V3.75a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 9 10.125a3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.75 3.75 3.75 0 0 0-3-3.746ZM4.5 16.879V14.25a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 0 20.625 3.75 3.75 0 0 0 3.75 24.375 3.75 3.75 0 0 0 7.5 20.625a3.75 3.75 0 0 0-3-3.746ZM13.5 16.879V14.25a.75.75 0 0 0-1.5 0v2.629A3.75 3.75 0 0 0 9 20.625a3.75 3.75 0 0 0 3.75 3.75 3.75 3.75 0 0 0 3.75-3.75 3.75 3.75 0 0 0-3-3.746Z" />
        </svg>
      ),
      "Freezing Drizzle": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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
          className="w-3 h-3"
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

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 sm:px-10 py-16 md:px-28 bg-background relative overflow-x-hidden"
    >
      {/* Immersive ambient background with animated elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Consistent subtle shadow */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 via-transparent to-transparent dark:from-gray-900/30 opacity-20"></div>

        {/* Main shadow effect */}
        <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vh] rounded-full blur-[150px] opacity-[0.08] bg-gray-400 dark:bg-gray-700 animate-slow-pulse"></div>

        {/* Secondary shadow for depth */}
        <div className="absolute bottom-[5%] right-[15%] w-[40vw] h-[40vh] rounded-full blur-[180px] opacity-[0.06] bg-gray-500 dark:bg-gray-800"></div>

        {/* Time-based design element at the top */}
        {mounted && (
          <>
            {/* Dawn: Soft rising sun effect */}
            {timeState.timeOfDay === "dawn" && (
              <div
                className="absolute top-0 inset-x-0 h-[25vh] bg-gradient-to-b from-amber-100/20 via-pink-100/10 to-transparent dark:from-amber-900/20 dark:via-pink-900/10"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${
                    20 + timeState.progress * 80
                  }%, 0 ${20 + timeState.progress * 80}%)`,
                  opacity: 0.3 + timeState.progress * 0.3,
                }}
              >
                <div
                  className="absolute top-[10%] left-[40%] w-[20vw] h-[20vw] rounded-full blur-[80px] bg-amber-200/30 dark:bg-amber-700/20"
                  style={{
                    transform: `translateY(${timeState.progress * 30}px)`,
                  }}
                ></div>
              </div>
            )}

            {/* Morning: Bright, energetic rays */}
            {timeState.timeOfDay === "morning" && (
              <div className="absolute top-0 inset-x-0 h-[20vh] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[15vh] bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-900/20"></div>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-[-10vh] bg-yellow-100/10 dark:bg-yellow-400/5"
                    style={{
                      left: `${15 + i * 20}%`,
                      height: `${30 + Math.sin(i) * 10}vh`,
                      width: "2px",
                      transform: `rotate(${-5 + i * 2.5}deg) scaleY(${
                        0.7 + timeState.progress * 0.3
                      })`,
                      opacity: 0.2 + timeState.progress * 0.3,
                      boxShadow: "0 0 15px 5px rgba(255, 249, 219, 0.2)",
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Afternoon: Warm, productive glow */}
            {timeState.timeOfDay === "afternoon" && (
              <div className="absolute top-0 inset-x-0 h-[15vh]">
                <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-blue-50/20 via-transparent to-transparent dark:from-blue-900/10"></div>
                <div
                  className="absolute top-[20%] right-[30%] w-[25vw] h-[10vh] rounded-full blur-[100px] bg-amber-100/20 dark:bg-amber-700/10"
                  style={{
                    opacity: 0.2 + (1 - timeState.progress) * 0.3,
                  }}
                ></div>
              </div>
            )}

            {/* Evening: Warm sunset colors */}
            {timeState.timeOfDay === "evening" && (
              <div className="absolute top-0 inset-x-0 h-[20vh] overflow-hidden">
                <div
                  className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-orange-100/30 via-pink-100/20 to-transparent dark:from-orange-900/20 dark:via-pink-900/10"
                  style={{
                    opacity: 0.3 + (1 - timeState.progress) * 0.4,
                  }}
                ></div>
                <div
                  className="absolute top-[10%] right-[20%] w-[30vw] h-[8vh] rounded-full blur-[80px] bg-orange-200/30 dark:bg-orange-700/20"
                  style={{
                    transform: `translateY(${(1 - timeState.progress) * 20}px)`,
                  }}
                ></div>
              </div>
            )}

            {/* Night: Starry, mysterious atmosphere */}
            {timeState.timeOfDay === "night" && (
              <div className="absolute top-0 inset-x-0 h-[30vh] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-indigo-900/30 via-purple-900/20 to-transparent opacity-30 dark:opacity-40"></div>
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white dark:bg-white animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      opacity: Math.random() * 0.5 + 0.3,
                      animationDelay: `${Math.random() * 10}s`,
                      animationDuration: `${Math.random() * 5 + 3}s`,
                    }}
                  ></div>
                ))}
                <div className="absolute top-[20%] left-[70%] w-[10vw] h-[10vw] rounded-full blur-[100px] bg-indigo-200/10 dark:bg-indigo-500/10 animate-slow-pulse"></div>
              </div>
            )}
          </>
        )}

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        >
          {/* Animated noise layer for subtle movement */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "difference",
              opacity: 0.2,
              animation: "noise 8s infinite alternate",
            }}
          ></div>
        </div>

        {/* Subtle animated particle effect */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute top-1/4 left-1/3 w-1 h-1 rounded-full bg-foreground/50 animate-pulse"
            style={{ animationDelay: "0s", animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-foreground/50 animate-pulse"
            style={{ animationDelay: "0.5s", animationDuration: "5s" }}
          />
          <div
            className="absolute top-3/4 left-2/3 w-1 h-1 rounded-full bg-foreground/50 animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "6s" }}
          />
          <div
            className="absolute top-1/3 left-3/4 w-1 h-1 rounded-full bg-foreground/50 animate-pulse"
            style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
          />
          <div
            className="absolute top-2/3 left-1/2 w-1 h-1 rounded-full bg-foreground/50 animate-pulse"
            style={{ animationDelay: "2s", animationDuration: "5.5s" }}
          />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.div
          variants={fadeInAnimation}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-40 relative"
        >
          {/* Subtle glow effect behind the name */}
          <div className="absolute w-12 h-12 rounded-full bg-foreground/5 blur-xl -z-10 left-0 transform -translate-x-1/4"></div>

          <h1 className="text-2xl font-normal text-foreground relative z-10 font-edu-marist">
            Raf
          </h1>

          {/* Display current time in EST with weather */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="absolute right-0 top-0 text-xs text-foreground/40 font-light max-w-[280px] text-right hidden md:block"
            >
              <div className="flex items-center justify-end space-x-2">
                <span>{getTimeDifference(false)}</span>
                {weatherState.temperature !== null && (
                  <>
                    <span className="opacity-30">|</span>
                    <div
                      className="cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center"
                      onClick={toggleWeatherEffect}
                      title="Toronto weather - click to see effect"
                    >
                      <span>{weatherState.temperature}°C</span>
                      {weatherState.condition && (
                        <span className="ml-1 text-sm">
                          {getWeatherIcon(weatherState.condition)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {weatherState.isLoading && (
                <p className="text-[10px] opacity-50 mt-1">
                  Loading Toronto weather...
                </p>
              )}
            </motion.div>
          )}

          {/* Mobile time and weather display */}
          {mounted && (
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
                <span>{getTimeDifference(true)}</span>

                {weatherState.temperature !== null && (
                  <>
                    <span className="opacity-30">•</span>
                    <div
                      className="cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center"
                      onClick={toggleWeatherEffect}
                      title="Toronto weather - click to see effect"
                    >
                      <span>{weatherState.temperature}°C</span>
                      {weatherState.condition && (
                        <span className="ml-1 text-xs">
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
          )}
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
                  ≈ founding designer and design engineer.{" "}
                </span>
                {/* <span className="text-foreground/60">
                  {" "}
                  With 7+ years of experience building products that have driven
                  $100M+ in collective revenue.{" "}
                </span> */}
              </p>

              <p>
                <span className="text-foreground/60">Raf is </span>
                <span className="text-foreground">driven by </span>
                <span className="text-foreground/60">
                  {" "}
                  a deep passion for craft, collaboration, and a relentless
                  pursuit of <span className="text-foreground">excellence</span>
                  . He has designed experiences and systems at companies like
                  Theoriq, CurbCutOS, Atlas, Zalando, Apple{" "}
                  {/* <span className="inline-block text-[12px] align-text-top text-foreground/40 font-light">
                    (internship)
                  </span>{" "} */}
                  and clients such as w.ai, US.court, Tela, Ethos, Lyfe,
                  Artscapy.
                </span>
              </p>

              <p>
                <span className="text-foreground/60">
                  Originally from Italy, and now{" "}
                  <span className="text-foreground">based in Toronto</span>, Raf
                  enjoys portrait photography, yoga, and office spaces.{" "}
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
              <div className="w-full mb-0 overflow-hidden relative">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt="Work preview"
                  className="w-full cursor-pointer bg-transparent max-w-full"
                  style={{
                    objectPosition: "center center",
                    display: "block",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: loadedImages[images[currentImageIndex]] ? 1 : 0,
                  }}
                  transition={{ duration: 0 }}
                  onClick={() => setIsZoomed(true)}
                  onLoad={() => handleImageLoad(images[currentImageIndex])}
                />
                {/* Preload next image */}
                <img
                  src={images[(currentImageIndex + 1) % images.length]}
                  alt="Next work preview"
                  className="hidden"
                  onLoad={() =>
                    handleImageLoad(
                      images[(currentImageIndex + 1) % images.length]
                    )
                  }
                />
              </div>
              <div className="hidden md:block mt-4">
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

            <div className="space-y-8">
              <div className="flex flex-col divide-y divide-foreground/5">
                {/* Sort notes by date (newest first) and show only the 3 most recent */}
                {notes
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .slice(0, 3)
                  .map((note, index) => (
                    <motion.div
                      key={note.id}
                      layoutId={`note-card-${index}`}
                      className="py-7 first:pt-0 cursor-pointer group"
                      initial={fadeInAnimation.initial}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      onClick={(e) => handleOpenNoteWithAnimation(index, e)}
                      whileHover={{ y: -3 }}
                      whileTap={{ y: 0 }}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-10 items-baseline">
                        <div className="text-xs text-foreground/40 whitespace-nowrap min-w-[90px] font-light tracking-tight">
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex-1 relative">
                          {/* Category indicator */}
                          <div
                            className={`absolute -left-3 top-1.5 w-1.5 h-1.5 rounded-full ${
                              getCategoryColor(note.category).split(" ")[1]
                            } opacity-70`}
                          ></div>

                          <div className="flex flex-col gap-1">
                            <p className="text-base text-foreground group-hover:text-foreground/90 transition-colors font-medium">
                              {note.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
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
            <h2 className="text-base font-normal text-foreground mb-10 md:mb-0">
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

            <div className="space-y-8 max-w-2xl">
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

        {/* Fullscreen Modal */}
        <AnimatePresence>
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50 flex items-center justify-center p-6"
              onClick={() => setIsZoomed(false)}
            >
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className="absolute top-6 right-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                onClick={() => setIsZoomed(false)}
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

              <motion.img
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                src={images[currentImageIndex]}
                alt="Work preview"
                className="w-full h-full object-contain"
              />

              {/* Navigation controls at the bottom */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="rounded-full bg-gray-200/10 backdrop-blur-sm p-1.5 hover:bg-gray-200/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    );
                  }}
                  aria-label="Previous image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="rounded-full bg-gray-200/10 backdrop-blur-sm p-1.5 hover:bg-gray-200/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % images.length);
                  }}
                  aria-label="Next image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.button>
              </div>
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
                onClick={() => setIsNotesModalOpen(false)}
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
                    setIsNotesModalOpen(false);
                  }
                }}
              >
                {/* Card stack container */}
                <div className="w-full max-w-3xl mx-auto relative my-12 pt-4">
                  {/* Background cards for stack effect */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotate: -0.5 }}
                    animate={{ opacity: 1, y: 0, rotate: -0.5 }}
                    exit={{ opacity: 0, y: -5, rotate: -0.5 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute inset-x-0 top-4 mx-auto w-[98%] h-[calc(100%-16px)] bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg -z-10"
                    style={{
                      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.05)",
                    }}
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotate: 0.5 }}
                    animate={{ opacity: 1, y: 0, rotate: 0.5 }}
                    exit={{ opacity: 0, y: -5, rotate: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute inset-x-0 top-2 mx-auto w-[99%] h-[calc(100%-8px)] bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-lg -z-20"
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
                      className="w-full bg-white/95 dark:bg-zinc-900/95 rounded-xl overflow-hidden relative"
                      style={{
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                      layoutId={`note-card-${currentNoteIndex}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Card inner content with padding */}
                      <div className="px-6 md:px-12 py-16 pb-24">
                        {/* Header area with controls */}
                        <div className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between">
                          {/* Left side - Date */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="text-xs text-foreground/40 font-light"
                          >
                            {new Date(
                              notes[currentNoteIndex].date
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </motion.div>

                          {/* Right side - Category and Close button */}
                          <div className="flex items-center gap-3">
                            {/* Category badge */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2, duration: 0.4 }}
                              className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(
                                notes[currentNoteIndex].category
                              )}`}
                            >
                              {notes[currentNoteIndex].category}
                            </motion.div>

                            {/* Close button */}
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: 0.2, duration: 0.3 }}
                              className="rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsNotesModalOpen(false);
                              }}
                              aria-label="Close notes"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>

                        {/* Subtle decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300/20 via-gray-400/30 to-gray-300/20 dark:from-gray-700/20 dark:via-gray-600/30 dark:to-gray-700/20"></div>

                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                          <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                          <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                        </div>

                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                          <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                          <div className="absolute top-0 right-0 w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
                          <div className="absolute bottom-0 left-0 w-[1px] h-8 bg-gradient-to-t from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-gradient-to-r from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                        </div>

                        <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                          <div className="absolute bottom-0 right-0 w-[1px] h-8 bg-gradient-to-t from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-[1px] bg-gradient-to-l from-transparent to-gray-200/30 dark:to-gray-700/30"></div>
                        </div>

                        <div className="absolute -left-4 top-20 w-8 h-8 rounded-full bg-gray-200/10 dark:bg-gray-700/10"></div>
                        <div className="absolute -right-4 top-40 w-12 h-12 rounded-full bg-gray-200/10 dark:bg-gray-700/10"></div>

                        {/* Enhanced note content */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                          className="prose dark:prose-invert max-w-none mt-12 relative"
                        >
                          <div className="text-gray-600 dark:text-gray-300 leading-relaxed tracking-wide prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-h1:text-3xl prose-h1:font-medium prose-h1:mb-6 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-2 prose-h2:text-2xl prose-h2:font-medium prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-2 prose-ul:mb-6 prose-ul:text-gray-600 dark:prose-ul:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-strong:font-medium prose-strong:text-gray-800 dark:prose-strong:text-gray-200">
                            <ReactMarkdown>
                              {notes[currentNoteIndex].content}
                            </ReactMarkdown>
                          </div>
                        </motion.div>

                        {/* Subtle navigation controls */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="mt-16 flex justify-center items-center gap-8"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevNoteWithDirection();
                            }}
                            className="text-foreground/40 hover:text-foreground transition-colors p-2"
                            aria-label="Previous note"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                          </motion.button>

                          {/* Note selector dots */}
                          <div className="flex gap-3">
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

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextNoteWithDirection();
                            }}
                            className="text-foreground/40 hover:text-foreground transition-colors p-2"
                            aria-label="Next note"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
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
                              {new Date(note.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
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

        {/* Weather effect overlay */}
        <AnimatePresence>
          {weatherState.showWeatherEffect &&
            weatherState.condition &&
            weatherState.clickPosition && (
              <motion.div
                initial={{
                  opacity: 0,
                  clipPath: `circle(0px at ${weatherState.clickPosition.x}px ${weatherState.clickPosition.y}px)`,
                }}
                animate={{
                  opacity: 0.6,
                  clipPath: `circle(150vw at ${weatherState.clickPosition.x}px ${weatherState.clickPosition.y}px)`,
                }}
                exit={{
                  opacity: 0,
                  clipPath: `circle(0px at ${weatherState.clickPosition.x}px ${weatherState.clickPosition.y}px)`,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                key="weather-effect"
                className="fixed inset-0 pointer-events-none z-[5]"
                style={{ backgroundColor: getWeatherColor() }}
              >
                {weatherState.condition === "Rain" && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-blue-200/30 dark:bg-blue-300/20 rounded-full"
                        style={{
                          top: `${Math.random() * -10}%`,
                          left: `${Math.random() * 100}%`,
                          width: "1px",
                          height: `${Math.random() * 20 + 10}px`,
                          opacity: Math.random() * 0.4 + 0.2,
                          animation: `rainDrop ${
                            Math.random() * 1 + 0.5
                          }s linear ${Math.random() * 2}s infinite`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}

                {(weatherState.condition === "Snow" ||
                  weatherState.condition === "Freezing Rain" ||
                  weatherState.condition === "Freezing Drizzle") && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                          top: `${Math.random() * -10}%`,
                          left: `${Math.random() * 100}%`,
                          width: `${Math.random() * 3 + 1}px`,
                          height: `${Math.random() * 3 + 1}px`,
                          opacity: Math.random() * 0.5 + 0.3,
                          animation: `snowfall ${
                            Math.random() * 5 + 10
                          }s linear ${Math.random() * 5}s infinite`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}

                {weatherState.condition === "Thunderstorm" && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className="absolute bg-yellow-100/30 dark:bg-yellow-100/20"
                      style={{
                        top: "10%",
                        left: "30%",
                        width: "2px",
                        height: "100px",
                        transform: "rotate(15deg)",
                        animation: "lightning 8s ease-in-out infinite",
                      }}
                    ></div>
                    <div
                      className="absolute bg-yellow-100/30 dark:bg-yellow-100/20"
                      style={{
                        top: "20%",
                        right: "40%",
                        width: "3px",
                        height: "150px",
                        transform: "rotate(-10deg)",
                        animation: "lightning 12s ease-in-out 3s infinite",
                      }}
                    ></div>
                  </div>
                )}

                {(weatherState.condition === "Fog" ||
                  weatherState.condition === "Mist" ||
                  weatherState.condition === "Haze") && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-gray-200/20 dark:bg-gray-300/10 rounded-full blur-xl"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${Math.random() * 100}%`,
                          width: `${Math.random() * 200 + 100}px`,
                          height: `${Math.random() * 100 + 50}px`,
                          opacity: Math.random() * 0.3 + 0.1,
                          animation: `fogMove ${
                            Math.random() * 50 + 50
                          }s linear ${Math.random() * 10}s infinite alternate`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
