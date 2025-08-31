"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ConsoleEasterEgg } from "./components/ConsoleEasterEgg";

// Custom hooks
import { useSlideshow } from "@/hooks/useSlideshow";
import { useWeatherState } from "@/hooks/useWeatherState";
import { useTimeState } from "@/hooks/useTimeState";
import { useModalState } from "@/hooks/useModalState";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useLoadingSequence,
  useElementLoading,
  useStaggeredLoading,
} from "@/hooks/useLoadingSequence";

// Components
import { HeroSection } from "@/components/sections/HeroSection";
import { SlideshowSection } from "@/components/sections/SlideshowSection";
import { LoadingSkeleton } from "@/components/sections/LoadingSkeleton";

// Animation components
import {
  TextReveal,
  StaggeredTextContainer,
  StaggeredTextItem,
  ImageCarouselItem,
  NavigationReveal,
  MicroInteraction,
  FadeIn,
  SlideUp,
  LOADING_SEQUENCE,
  EASING,
} from "@/components/animations/LoadingAnimations";

// Data
import { notes, Note } from "./data/notes";
import { works } from "./data/works";

// Utils
import { getWeatherColor } from "@/utils/weatherUtils";

export default function Page() {
  // Core state
  const [mounted, setMounted] = useState(false);
  const [criticalContentLoaded, setCriticalContentLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [blurAmount, setBlurAmount] = useState(15);
  const [focusAnimationRun, setFocusAnimationRun] = useState(false);

  // Mobile detection
  const isMobile = useIsMobile();
  const [isMobileReady, setIsMobileReady] = useState(false);

  // Collection of work project images
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

  // Video mappings
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

  // Custom hooks
  const { weatherState, toggleWeatherEffect } = useWeatherState("Toronto");
  const { formatTime, getTimeDifference } = useTimeState();
  const { modalState, openVideoModal, closeVideoModal, isAnyModalOpen } = useModalState();
  const loadingSequence = useLoadingSequence();

  // Focus animation effect
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

  // Viewport height management
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  // Optimized scroll handling
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
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

  // Mobile detection setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobileReady(true);
    }
  }, []);

  // Focus animation on mount
  useEffect(() => {
    if (mounted && !focusAnimationRun) {
      setFocusAnimationRun(true);
      const cleanup = focusAnimation();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [mounted, focusAnimationRun]);

  // Component mount
  useEffect(() => {
    setMounted(true);
    setCriticalContentLoaded(true); // Simplified for this example
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalState.isVideoModalOpen) {
          closeVideoModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [modalState.isVideoModalOpen, closeVideoModal]);

  if (!mounted || !criticalContentLoaded) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <div className="px-6 sm:px-10 py-16 md:px-28">
            <div className="w-full max-w-screen-xl mx-auto">
              <HeroSection
                mounted={mounted}
                weatherState={weatherState}
                formatTime={formatTime}
                getTimeDifference={getTimeDifference}
                toggleWeatherEffect={toggleWeatherEffect}
                navigationLoaded={loadingSequence.navigationLoaded}
              />
              <LoadingSkeleton imagesLoaded={loadingSequence.imagesLoaded} />
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
          transition: "filter 3s cubic-bezier(0.22, 1, 0.36, 1)",
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
        </motion.div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 2,
            ease: EASING.primary,
          }}
          className="px-6 sm:px-10 py-16 md:px-28 bg-background relative overflow-x-hidden"
          style={{
            minHeight: "100vh",
            willChange: "auto",
          }}
        >
          <div className="w-full max-w-screen-xl mx-auto relative z-10">
            <HeroSection
              mounted={mounted}
              weatherState={weatherState}
              formatTime={formatTime}
              getTimeDifference={getTimeDifference}
              toggleWeatherEffect={toggleWeatherEffect}
              navigationLoaded={loadingSequence.navigationLoaded}
            />

            {/* Main slideshow section */}
            <SlideshowSection
              images={images}
              workVideos={workVideos}
              onOpenVideoModal={openVideoModal}
              isAnyModalOpen={isAnyModalOpen}
            />

            {/* Video Modal */}
            {modalState.isVideoModalOpen && modalState.currentVideoUrl && (
              <motion.div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeVideoModal}
              >
                <motion.div
                  className="w-full h-full max-w-6xl max-h-[80vh] relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <iframe
                    src={modalState.currentVideoUrl}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={closeVideoModal}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Rest of the content would go here - notes, experience sections, etc. */}
            {/* This is simplified for demonstration */}

            <ConsoleEasterEgg />
          </div>
        </motion.main>
      </div>
    </ErrorBoundary>
  );
}