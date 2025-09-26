"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  EASING,
  EnhancedStaggeredTextContainer,
  EnhancedStaggeredTextItem,
} from "@/components/animations/LoadingAnimations";

export default function RafPage() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

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
        className="px-6 sm:px-10 md:px-28 pt-24 md:pt-28 pb-24"
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
          <EnhancedStaggeredTextContainer className="prose max-w-none space-y-7 md:space-y-8">
            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                I grew up on the Amalfi Coast in Italy and dropped out of
                university as a software engineer to begin my career designing —
                brands, websites, products. I wanted to try it all.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                My first step into tech was an internship at Apple, after
                graduating cum laude in design, where I worked on watchOS 6. It
                was a challenge-based program that taught me rigor and detail at
                a global scale.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                After that came more than ten startups. I shaped brands, built
                websites and decks, and designed experiences end to end. That
                work gave me breadth. It showed me that design doesn’t just live
                in pixels, it lives in how people discover, trust, and use a
                product.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                The real turning point was Zalando in 2021. I built and scaled
                their B2B design system, and that’s when I realized something
                important: users never see a Figma file. They only feel what
                ships in the browser. That realization pulled me across the gap
                between design and engineering, into what I now call my craft —
                design engineering.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                From there, I focused on clarity and craft in equal measure. At
                Theoriq, I led design as we grew to 140,000 active users in six
                months, spanning product, brand, and marketing. At Voiceflow, I
                redesigned activation flows and the web presence, driving
                stronger onboarding and adoption. At Coinbase, I built
                interactive tools like the SQL Playground and Embedded Wallets,
                making the Developer Platform the best experience for
                developers, and contributed to initiatives like Pay with USDC
                and unified log-ins.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                Now at Frequency, I’m helping brands scale their presence
                through systems and interactive storytelling.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg">
                Through all of this, my focus has stayed the same: building
                experiences that turn complexity into clarity. Design systems
                that scale. Landing pages that convert. Microsites and
                animations that tell a story.
              </p>
            </EnhancedStaggeredTextItem>

            <EnhancedStaggeredTextItem>
              <p className="text-foreground/90 leading-[1.85] text-lg font-medium">
                I see the web as a storytelling medium. Every detail — from
                performance to accessibility to interaction — shapes how people
                experience a brand. My work is about making those moments not
                just usable, but memorable.
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
