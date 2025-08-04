"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WorksPage() {
  const [mounted, setMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Show fallback after 3 seconds if iframe hasn't loaded
    const timeout = setTimeout(() => {
      if (!iframeLoaded && !iframeError) {
        setShowFallback(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [iframeLoaded, iframeError]);

  // Scroll handling - matching main page
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div
        style={{
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
          transition: "filter 3s cubic-bezier(0.22, 1, 0.36, 1)",
          position: "relative",
        }}
      >
        {/* Natural progressive bottom blur effect - matching main page */}
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
            duration: 2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="px-6 sm:px-10 py-16 md:px-28 bg-background relative overflow-x-hidden"
          style={{
            minHeight: "100vh",
            willChange: "auto",
          }}
        >
          <div className="w-full max-w-screen-xl mx-auto relative z-10">
            {/* Header - matching main page structure */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center mb-20 sm:mb-40 relative"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="flex items-center justify-between w-full relative">
                {/* Back button - matching main page action buttons */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  onClick={() => (window.location.href = "/")}
                  className="text-sm text-foreground/50 hover:text-foreground transition-colors"
                >
                  Back
                </motion.button>

                {/* Title - matching main page typography */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-xl sm:text-2xl font-normal text-foreground font-edu-marist"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  Works
                </motion.h1>

                {/* Spacer for centering */}
                <div className="w-16"></div>
              </div>
            </motion.div>

            {/* Figma presentation iframe - full screen */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
              className="w-full h-[calc(100vh-200px)] relative"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <iframe
                src="https://embed.figma.com/deck/znlnwRl1dOkz9PvC6NSMdg/Raf-slides?node-id=2-1174&viewport=-28%2C-102%2C0.58&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&embed-host=share"
                className="w-full h-full border-0 rounded-lg"
                title="Raf's Works Presentation"
                allowFullScreen
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              />

              {/* Fallback for production/localhost issues - matching main page styling */}
              {(!iframeLoaded || iframeError || showFallback) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-12 h-12 border-2 border-foreground/20 border-t-foreground/60 rounded-full mx-auto"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.main>
      </div>
    </>
  );
}
