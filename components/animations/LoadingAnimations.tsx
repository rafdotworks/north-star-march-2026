"use client";

/**
 * ============================================================================
 * LOADING ANIMATIONS - components/animations/LoadingAnimations.tsx
 * ============================================================================
 *
 * Central animation system for the portfolio site.
 * Provides reusable animation components, easing curves, and motion variants.
 *
 * EXPORTS:
 * - EASING: Bezier curve presets for consistent motion
 * - Text animations: TextReveal, WordReveal, ProgressiveLoadingStates
 * - Image animations: ImageCarouselItem, WorkImageHover
 * - UI animations: NavigationReveal, BreathingSkeleton, LoadingProgress
 * - Modal animations: modalOverlayVariants, modalContainerVariants, etc.
 *
 * Used extensively by:
 * - app/page.tsx (main homepage)
 * - app/components/hover (work image interactions)
 */

import { motion, AnimatePresence } from "framer-motion";
import { ComponentProps, ReactNode, KeyboardEvent, useId } from "react";

type MotionDivProps = ComponentProps<typeof motion.div>;

type MotionDivWithChildren = MotionDivProps & { children: ReactNode };

// ============================================================================
// EASING CURVES - Cubic bezier presets for motion design
// ============================================================================

/**
 * EASING: Predefined cubic bezier curves for consistent motion
 * Format: [x1, y1, x2, y2] for cubic-bezier()
 *
 * Usage: transition={{ ease: EASING.primary }}
 */
export const EASING = {
  // Primary easing for main content reveals
  primary: [0.12, 1, 0.28, 1],
  // Secondary easing for supporting elements
  secondary: [0.16, 1, 0.3, 1],
  // Tertiary easing for subtle animations
  tertiary: [0.22, 1, 0.36, 1],
  // Bounce easing for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
  // Smooth easing for continuous animations
  smooth: [0.4, 0, 0.2, 1],
  // Ultra-smooth easing for text reveals
  textReveal: [0.25, 0.46, 0.45, 0.94],
  // Staggered text easing
  staggeredText: [0.19, 1, 0.22, 1],
} as const;

// Enhanced text reveal animation with sophisticated blur-to-focus effect
export const textRevealAnimation = {
  initial: {
    opacity: 0,
    filter: "blur(35px)",
    y: 40,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    scale: 1,
  },
  transition: {
    duration: 2.8,
    ease: EASING.textReveal,
  },
};

// Enhanced staggered text reveal with more sophisticated timing
export const staggeredTextReveal = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.12,
        duration: 0.8,
        ease: EASING.staggeredText,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(30px)",
      y: 35,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 2.2,
        ease: EASING.textReveal,
      },
    },
  },
};

// Character-by-character text reveal for ultra-smooth effects
export const characterRevealAnimation = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
        duration: 0.8,
        ease: EASING.staggeredText,
      },
    },
  },
  character: {
    hidden: {
      opacity: 0,
      filter: "blur(15px)",
      y: 15,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: EASING.textReveal,
      },
    },
  },
};

// Word-by-word reveal for natural reading flow
export const wordRevealAnimation = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.2,
        duration: 0.8,
        ease: EASING.staggeredText,
      },
    },
  },
  word: {
    hidden: {
      opacity: 0,
      filter: "blur(25px)",
      y: 25,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 1.5,
        ease: EASING.textReveal,
      },
    },
  },
};

// Phrase reveal for larger text blocks
export const phraseRevealAnimation = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.8,
        ease: EASING.staggeredText,
      },
    },
  },
  phrase: {
    hidden: {
      opacity: 0,
      filter: "blur(22px)",
      y: 22,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 1.7,
        ease: EASING.textReveal,
      },
    },
  },
};

// Modal animation variants (reusable)
export const modalOverlayVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.8, ease: EASING.primary }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.8, ease: EASING.primary, delay: 0.1 }
  },
};

export const modalContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.8, ease: EASING.primary }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.8, ease: EASING.primary, delay: 0.1 }
  },
};

export const modalPanelVariants = {
  initial: { opacity: 0, scale: 0.97, y: 20, filter: "blur(12px)" },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: EASING.textReveal,
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    filter: "blur(10px)",
    transition: {
      duration: 0.7,
      ease: EASING.textReveal
    }
  },
};

export const modalTextStagger = {
  container: {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
    exit: {
      opacity: 1,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: EASING.textReveal }
    },
    exit: {
      opacity: 0,
      y: -8,
      filter: "blur(8px)",
      transition: { duration: 0.4, ease: EASING.textReveal }
    },
  },
};

export const modalReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Image carousel loading animation
export const imageCarouselAnimation = {
  initial: {
    opacity: 0,
    filter: "blur(20px)",
    scale: 0.95,
    y: 40,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    y: 0,
  },
  transition: {
    duration: 2.6,
    ease: EASING.secondary,
  },
};

// Navigation reveal animation
export const navigationRevealAnimation = {
  initial: {
    opacity: 0,
    y: -20,
    filter: "blur(5px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  transition: {
    duration: 1.0,
    ease: EASING.tertiary,
  },
};

// Loading skeleton animation
export const skeletonAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 1.5,
    ease: EASING.smooth,
  },
};

// Micro-interaction hover effects
export const microInteractionHover = {
  whileHover: {
    scale: 1.02,
    filter: "brightness(1.05)",
    transition: { duration: 0.2, ease: EASING.smooth },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: EASING.smooth },
  },
};

// Smooth fade in animation
export const fadeInAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.8,
    ease: EASING.smooth,
  },
};

// Slide up animation
export const slideUpAnimation = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 1.0,
    ease: EASING.primary,
  },
};

// Loading sequence timing constants - enhanced for slower, more natural loading
export const LOADING_SEQUENCE = {
  IMAGES_DELAY: 1.8, // Images start after text (mobile priority: text first)
  TEXT_DELAY: 0.4, // Text starts first on mobile
  NAV_DELAY: 3.6, // Navigation appears last
  STAGGER_DELAY: 0.16, // Stagger between elements
} as const;

// Text Reveal Component
interface TextRevealProps extends MotionDivWithChildren {
  delay?: number;
}

export function TextReveal({
  children,
  delay = 0,
  className = "",
  ...props
}: TextRevealProps) {
  return (
    <motion.div
      initial={textRevealAnimation.initial}
      animate={textRevealAnimation.animate}
      transition={{
        ...textRevealAnimation.transition,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered Text Container
export function StaggeredTextContainer({
  children,
  className = "",
  ...props
}: MotionDivWithChildren) {
  return (
    <motion.div
      variants={staggeredTextReveal.container}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered Text Item
export function StaggeredTextItem({
  children,
  className = "",
  ...props
}: MotionDivWithChildren) {
  return (
    <motion.div
      variants={staggeredTextReveal.item}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Text Reveal Components

// Character-by-Character Text Reveal
interface CharacterRevealProps extends MotionDivProps {
  text: string;
  delay?: number;
}

export function CharacterReveal({
  text,
  className = "",
  delay = 0,
  ...props
}: CharacterRevealProps) {
  return (
    <motion.div
      variants={characterRevealAnimation.container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={characterRevealAnimation.character}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Word-by-Word Text Reveal
interface WordRevealInteractiveWord {
  word: string;
  onActivate: () => void;
  ariaLabel?: string;
}

interface WordRevealProps extends MotionDivProps {
  text: string;
  delay?: number;
  interactiveWord?: WordRevealInteractiveWord;
  interactiveHintVisible?: boolean;
}

export function WordReveal({
  text,
  className = "",
  delay = 0,
  interactiveWord,
  interactiveHintVisible = false,
  ...props
}: WordRevealProps) {
  const words = text.split(" ");
  const patternIdBase = useId();

  return (
    <motion.div
      variants={wordRevealAnimation.container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {words.map((word, index) => {
        const isInteractive = interactiveWord && word === interactiveWord.word;

        const interactiveProps = isInteractive
          ? {
              role: "link" as const,
              tabIndex: 0,
              onClick: () => interactiveWord.onActivate(),
              onKeyDown: (event: KeyboardEvent<HTMLSpanElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  interactiveWord.onActivate();
                }
              },
              "aria-label":
                interactiveWord.ariaLabel ?? `${word} navigation link`,
            }
          : {};

        return (
          <motion.span
            key={index}
            variants={wordRevealAnimation.word}
            className={`inline-block mr-1 relative ${
              word === "Raf" ? "font-raf " : ""
            }${
              isInteractive
                ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:rounded-sm"
                : ""
            }`}
            whileTap={
              isInteractive
                ? {
                    scale: 0.98,
                    y: 1,
                    filter: "brightness(0.98)",
                    transition: { duration: 0.12, ease: [0.12, 1, 0.25, 1] },
                  }
                : undefined
            }
            whileHover={
              isInteractive
                ? {
                    scale: 1.02,
                    filter: "brightness(1.05) saturate(1.02)",
                    transition: { duration: 0.2, ease: EASING.smooth },
                  }
                : undefined
            }
            {...interactiveProps}
          >
            {word}
            {isInteractive && (
              <motion.div
                className="absolute left-0 right-0 pointer-events-none h-px rounded-full"
                style={{ bottom: 0, background: "currentColor", originX: 0 }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: interactiveHintVisible ? 1 : 0,
                  opacity: interactiveHintVisible ? 0.18 : 0,
                }}
                transition={{ duration: 0.25, ease: EASING.smooth }}
              />
            )}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

// Phrase-by-Phrase Text Reveal
interface PhraseRevealProps extends MotionDivProps {
  phrases: string[];
  delay?: number;
}

export function PhraseReveal({
  phrases,
  className = "",
  delay = 0,
  ...props
}: PhraseRevealProps) {
  return (
    <motion.div
      variants={phraseRevealAnimation.container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {phrases.map((phrase, index) => (
        <motion.div
          key={index}
          variants={phraseRevealAnimation.phrase}
          className="mb-2"
        >
          {phrase}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Enhanced Staggered Text Container with better timing
interface EnhancedStaggeredTextContainerProps extends MotionDivWithChildren {
  staggerDelay?: number;
}

export function EnhancedStaggeredTextContainer({
  children,
  className = "",
  staggerDelay = 0.12,
  ...props
}: EnhancedStaggeredTextContainerProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.08,
            duration: 0.6,
            ease: EASING.staggeredText,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Staggered Text Item with scale and blur effects
export function EnhancedStaggeredTextItem({
  children,
  className = "",
  ...props
}: MotionDivWithChildren) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          filter: "blur(25px)",
          y: 25,
          scale: 0.98,
        },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          scale: 1,
          transition: {
            duration: 1.6,
            ease: EASING.textReveal,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Image Carousel Item
interface ImageCarouselItemProps extends MotionDivWithChildren {
  delay?: number;
}

export function ImageCarouselItem({
  children,
  delay = 0,
  className = "",
  ...props
}: ImageCarouselItemProps) {
  return (
    <motion.div
      initial={imageCarouselAnimation.initial}
      animate={imageCarouselAnimation.animate}
      transition={{
        ...imageCarouselAnimation.transition,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Navigation Reveal Component
interface NavigationRevealProps extends MotionDivWithChildren {
  delay?: number;
}

export function NavigationReveal({
  children,
  delay = 0,
  className = "",
  ...props
}: NavigationRevealProps) {
  return (
    <motion.div
      initial={navigationRevealAnimation.initial}
      animate={navigationRevealAnimation.animate}
      transition={{
        ...navigationRevealAnimation.transition,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Loading Skeleton Component
export function LoadingSkeleton({
  children,
  className = "",
  ...props
}: MotionDivWithChildren) {
  return (
    <motion.div
      initial={skeletonAnimation.initial}
      animate={skeletonAnimation.animate}
      transition={skeletonAnimation.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Micro Interaction Component
export function MicroInteraction({
  children,
  className = "",
  ...props
}: MotionDivWithChildren) {
  return (
    <motion.div
      whileHover={microInteractionHover.whileHover}
      whileTap={microInteractionHover.whileTap}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade In Component
interface FadeInProps extends MotionDivWithChildren {
  delay?: number;
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={fadeInAnimation.initial}
      animate={fadeInAnimation.animate}
      transition={{
        ...fadeInAnimation.transition,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide Up Component
interface SlideUpProps extends MotionDivWithChildren {
  delay?: number;
}

export function SlideUp({
  children,
  delay = 0,
  className = "",
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={slideUpAnimation.initial}
      animate={slideUpAnimation.animate}
      transition={{
        ...slideUpAnimation.transition,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Loading Progress Component
interface LoadingProgressProps extends MotionDivProps {
  progress: number;
  isAdaptive: boolean;
  estimatedTimeRemaining: number;
}

export function LoadingProgress({
  progress,
  isAdaptive,
  estimatedTimeRemaining,
  className = "",
  ...props
}: LoadingProgressProps) {
  const accessibleTimeRemaining = Math.max(
    0,
    Math.round(estimatedTimeRemaining)
  );

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASING.smooth }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuetext={`Approximately ${accessibleTimeRemaining} seconds remaining`}
      {...props}
    >
      {/* Progress bar container */}
      <div className="w-full h-0.5 bg-foreground/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-foreground/20 via-foreground/40 to-foreground/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{
            duration: 0.3,
            ease: EASING.smooth,
            delay: 0.2,
          }}
        />
      </div>

      {/* Adaptive indicator */}
      {isAdaptive && (
        <motion.div
          className="absolute -top-6 right-0 text-xs text-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Adaptive
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced Loading Skeleton with breathing animation
interface BreathingSkeletonProps extends MotionDivWithChildren {
  className?: string;
}

export function BreathingSkeleton({
  children,
  className = "",
  ...props
}: BreathingSkeletonProps) {
  return (
    <motion.div
      className={className}
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: [0.98, 1.01, 0.98],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Progressive Loading States Component
interface ProgressiveLoadingStatesProps extends MotionDivProps {
  currentStage: number;
  stages: string[];
  className?: string;
}

export function ProgressiveLoadingStates({
  currentStage,
  stages,
  className = "",
  ...props
}: ProgressiveLoadingStatesProps) {
  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASING.smooth }}
      {...props}
    >
      {stages.map((stage, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: index <= currentStage ? 1 : 0.3,
            x: 0,
          }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: EASING.smooth,
          }}
        >
          <motion.div
            className={`w-2 h-2 rounded-full ${
              index < currentStage
                ? "bg-foreground/60"
                : index === currentStage
                ? "bg-foreground/40"
                : "bg-foreground/20"
            }`}
            animate={{
              scale: index === currentStage ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: index === currentStage ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          <span
            className={`text-xs ${
              index <= currentStage
                ? "text-foreground/60"
                : "text-foreground/30"
            }`}
          >
            {stage}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Enhanced Loading Transition Component
interface LoadingTransitionProps extends MotionDivWithChildren {
  isLoading: boolean;
  fallback: ReactNode;
  className?: string;
}

export function LoadingTransition({
  isLoading,
  children,
  fallback,
  className = "",
  ...props
}: LoadingTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: EASING.smooth }}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: EASING.smooth }}
          >
            {fallback}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: EASING.smooth }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
