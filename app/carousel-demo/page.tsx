"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WorkCarousel, demoItems } from "../components/ui/Carousel";

export default function CarouselDemoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <div className="px-6 sm:px-10 py-12 md:px-28">
        <div className="w-full max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            className="flex items-center justify-between mb-12"
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={() => (window.location.href = "/")}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors"
            >
              Back
            </motion.button>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl font-normal text-foreground font-edu-marist"
            >
              Carousel Demo
            </motion.h1>

            {/* Spacer for centering */}
            <div className="w-16"></div>
          </motion.div>

          {/* Carousel Component */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.4,
            }}
          >
            <WorkCarousel items={demoItems} />
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.6,
            }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-foreground/60 max-w-2xl mx-auto">
              This gallery carousel component has been optimized for shorter
              containers. It features horizontal scrolling with snap behavior,
              subtle parallax effects, and a compact layout that works well as a
              gallery section.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
