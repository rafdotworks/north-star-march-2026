/**
 * ============================================================================
 * IMAGE TRANSITIONS - Desktop Carousel Blur-to-Focus Effects
 * ============================================================================
 *
 * Simple blur-to-focus animation variants for desktop carousel navigation.
 * Gentle, harmonious transitions inspired by the initial loading text animation.
 *
 * ANIMATION LEVELS:
 * - 0: Minimal (simple fade)
 * - 1-3: Blur-to-focus with gentle timing (no 3D transforms)
 */

import { Variants } from "framer-motion";

export type Direction = 1 | -1; // 1: next (forward), -1: previous (back)
export type AnimationLevel = 0 | 1 | 2 | 3;

/**
 * Duration for blur-to-focus transition
 * Slower, smoother timing for carousel clicks (~2.2s)
 */
const TRANSITION_DURATION = 2.2;

/** Calmer easing curve for smooth motion */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Blur-to-focus variants - simple and gentle
 * Blur: ~18px → 0px, minimal/no transforms
 */
export function pageTurnVariants(
  level: AnimationLevel,
  direction: Direction
): Variants {
  if (level === 0) {
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.45, ease: EASE },
      },
      exit: { opacity: 0, transition: { duration: 0.45, ease: EASE } },
    } as Variants;
  }

  // Simple blur-to-focus: blur ~18px → 0px, minimal transforms
  const blurMax = 18;

  return {
    initial: {
      opacity: 0,
      filter: `blur(${blurMax}px)`,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: TRANSITION_DURATION, ease: EASE },
    },
    exit: {
      opacity: 0,
      filter: `blur(${blurMax}px)`,
      transition: { duration: TRANSITION_DURATION, ease: EASE },
    },
  } as Variants;
}
