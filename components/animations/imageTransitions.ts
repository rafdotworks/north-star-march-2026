/**
 * ============================================================================
 * IMAGE TRANSITIONS - Simple Carousel Fade Effects
 * ============================================================================
 *
 * Simple fade animation variants for carousel navigation.
 * Fast, responsive transitions for immediate click feedback.
 *
 * ANIMATION LEVELS:
 * - 0: Minimal (simple fade, ~0.3s)
 * - 1-3: Fast fade without blur (0.4-0.5s, no delay)
 */

import { Variants } from "framer-motion";

export type Direction = 1 | -1; // 1: next (forward), -1: previous (back)
export type AnimationLevel = 0 | 1 | 2 | 3;

/**
 * Duration for fade transition
 * Fast, responsive timing for carousel clicks (0.4-0.5s)
 */
const TRANSITION_DURATION = 0.45;

/** Smooth easing curve for natural motion */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Simple fade variants - fast and responsive
 * Opacity-only transition with no blur or delay
 */
export function pageTurnVariants(
  level: AnimationLevel,
  _direction: Direction
): Variants {
  if (level === 0) {
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.3, ease: EASE },
      },
      exit: { opacity: 0, transition: { duration: 0.3, ease: EASE } },
    } as Variants;
  }

  // Simple fade: opacity 0 → 1, no blur, no delay
  return {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: { duration: TRANSITION_DURATION, ease: EASE },
    },
    exit: {
      opacity: 0,
      transition: { duration: TRANSITION_DURATION, ease: EASE },
    },
  } as Variants;
}
