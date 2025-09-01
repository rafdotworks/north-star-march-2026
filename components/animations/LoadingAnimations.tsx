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
  // Ultra-smooth easing for text reveals
  textReveal: [0.25, 0.46, 0.45, 0.94],
  // Staggered text easing
  staggeredText: [0.19, 1, 0.22, 1],
} as const;

// Enhanced text reveal animation with sophisticated blur-to-focus effect
export const textRevealAnimation = {
  initial: {
    opacity: 0,
    filter: "blur(25px)",
    y: 30,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    scale: 1,
  },
  transition: {
    duration: 1.8,
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
        staggerChildren: 0.12,
        delayChildren: 0.08,
        duration: 0.6,
        ease: EASING.staggeredText,
      },
    },
  },
  item: {
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
        staggerChildren: 0.08,
        delayChildren: 0.15,
        duration: 0.6,
        ease: EASING.staggeredText,
      },
    },
  },
  word: {
    hidden: {
      opacity: 0,
      filter: "blur(20px)",
      y: 20,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 1.4,
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

// Enhanced Text Reveal Components

// Character-by-Character Text Reveal
export function CharacterReveal({
  text,
  className = "",
  delay = 0,
  ...props
}: {
  text: string;
  className?: string;
  delay?: number;
  [key: string]: any;
}) {
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
export function WordReveal({
  text,
  className = "",
  delay = 0,
  ...props
}: {
  text: string;
  className?: string;
  delay?: number;
  [key: string]: any;
}) {
  const words = text.split(" ");

  return (
    <motion.div
      variants={wordRevealAnimation.container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordRevealAnimation.word}
          className={`inline-block mr-1 ${word === "Raf" ? "font-raf" : ""}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Phrase-by-Phrase Text Reveal
export function PhraseReveal({
  phrases,
  className = "",
  delay = 0,
  ...props
}: {
  phrases: string[];
  className?: string;
  delay?: number;
  [key: string]: any;
}) {
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
export function EnhancedStaggeredTextContainer({
  children,
  className = "",
  staggerDelay = 0.12,
  ...props
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  [key: string]: any;
}) {
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
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
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

// Navigation Reveal Component
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

// Loading Skeleton Component
export function LoadingSkeleton({
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
