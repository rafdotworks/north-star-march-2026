"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Enhanced easing curves for delightful micro-interactions
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
} as const;

// Text reveal animation with blur-to-focus effect
export const textRevealAnimation = {
  initial: {
    opacity: 0,
    filter: "blur(20px)",
    y: 20,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
  },
  transition: {
    duration: 1.2,
    ease: EASING.primary,
  },
};

// Staggered text reveal for multiple text elements
export const staggeredTextReveal = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(20px)",
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 1.2,
        ease: EASING.primary,
      },
    },
  },
};

// Image carousel loading animation
export const imageCarouselAnimation = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
    scale: 0.98,
    y: 30,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    y: 0,
  },
  transition: {
    duration: 1.8,
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

// Loading sequence timing constants
export const LOADING_SEQUENCE = {
  IMAGES_DELAY: 0.2, // Images start first (work carousel priority)
  TEXT_DELAY: 1.0, // Text starts after images
  NAV_DELAY: 2.5, // Navigation appears last
  STAGGER_DELAY: 0.15, // Stagger between elements
} as const;

// Text Reveal Component
export function TextReveal({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
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
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
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
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
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

// Image Carousel Item
export function ImageCarouselItem({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
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

// Navigation Reveal
export function NavigationReveal({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
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

// Loading Skeleton
export function LoadingSkeleton({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      initial={skeletonAnimation.initial}
      animate={skeletonAnimation.animate}
      transition={{
        ...skeletonAnimation.transition,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Micro Interaction Wrapper
export function MicroInteraction({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
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
export function FadeIn({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
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
export function SlideUp({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  [key: string]: any;
}) {
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
