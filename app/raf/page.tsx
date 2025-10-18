"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  EASING,
  EnhancedStaggeredTextContainer,
  EnhancedStaggeredTextItem,
} from "@/components/animations/LoadingAnimations";

// Deprecated: About content is shown via modal on the home page.
// This route is intentionally removed to avoid duplication.
export default function RafPage() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: EASING.primary,
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: EASING.primary,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: EASING.secondary,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md focus:shadow-lg"
      >
        Skip to content
      </a>

      <motion.main
        id="main"
        className="sm:px-10 md:px-28 pt-24 md:pt-28 pb-24"
        variants={containerVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.8, ease: EASING.primary }
        }
      >
        <div className="w-full max-w-[72ch] md:max-w-2xl">
          {/* Header */}
          <motion.div className="mb-12 md:mb-16" variants={itemVariants}>
            <h1 className="font-edu-marist text-3xl md:text-4xl font-normal tracking-tight text-foreground">
              About Raf
            </h1>
          </motion.div>

          {/* Content */}
          <EnhancedStaggeredTextContainer className="max-w-none space-y-7 md:space-y-8">
            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                I grew up on the Amalfi Coast and now live in Toronto, often
                spending time in Lisbon.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                For the past eight years, I’ve designed and engineered products
                across industries — from AI platforms and marketplaces to B2B
                tools and activation.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                I’m industry-agnostic at heart; I believe good principles of
                design and storytelling work everywhere.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                My work is about making complexity feel human and building
                systems people can trust. I value clarity, restraint, and
                kindness — doing things with care and doing them well.
              </p>
            </EnhancedStaggeredTextItem>
          </EnhancedStaggeredTextContainer>

          {/* Footer */}
          <motion.div
            className="mt-16 md:mt-20 pt-8 border-t border-foreground/[0.06]"
            variants={itemVariants}
          >
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              variants={textVariants}
            >
              <a
                href="https://www.linkedin.com/in/raffaelevitaledesign"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                aria-label="Raf on LinkedIn"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com/lfgraf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                aria-label="Raf on X"
              >
                X
              </a>
              <a
                href="mailto:raf@raf.works"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                raf@raf.works
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
