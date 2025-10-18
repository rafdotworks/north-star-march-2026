/**
 * ============================================================================
 * IMAGE TRANSITIONS - Desktop Carousel Page-Turn Effects
 * ============================================================================
 *
 * Page-turn animation variants for desktop carousel navigation.
 * Uses smooth blur-to-focus reveal with 3D transforms for depth.
 *
 * ANIMATION LEVELS:
 * - 0: Minimal (simple fade)
 * - 1: Light (subtle page turn)
 * - 2: Medium (noticeable page turn)
 * - 3: Full (dramatic page turn with depth)
 */

import { Variants } from "framer-motion";

export type Direction = 1 | -1; // 1: next (forward), -1: previous (back)
export type AnimationLevel = 0 | 1 | 2 | 3;

/**
 * Duration mapping by animation level
 * Increased from original values for smoother, more harmonious transitions
 */
const DURATIONS: Record<AnimationLevel, number> = {
  0: 0.45,
  1: 0.9,  // Increased from 0.7 for smoother reveal
  2: 1.2,  // Increased from 0.95 for smoother reveal
  3: 1.5,  // Increased from 1.15 for smoother reveal
};

/** Calmer easing curve for smooth motion */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function pageTurnVariants(
  level: AnimationLevel,
  direction: Direction
): Variants {
  if (level === 0) {
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: DURATIONS[0], ease: EASE },
      },
      exit: { opacity: 0, transition: { duration: DURATIONS[0], ease: EASE } },
    } as Variants;
  }

  const isNext = direction === 1;

  // 3D rotation values for page-turn effect
  const rotateExit =
    level === 3
      ? isNext
        ? -16
        : 16
      : level === 2
      ? isNext
        ? -12
        : 12
      : isNext
      ? -8
      : 8;
  const rotateEnter =
    level === 3
      ? isNext
        ? 10
        : -10
      : level === 2
      ? isNext
        ? 8
        : -8
      : isNext
      ? 6
      : -6;

  // BLUR VALUES: Increased for smoother, more dramatic reveal (matches mobile staging)
  // Initial blur starts higher for better blur-to-focus effect
  const blurMax = level >= 2 ? 18 : 14; // Increased from 8/6
  const yOffset = level >= 2 ? 12 : 8;
  const xOffset = isNext ? 42 : -42;
  const skewExit =
    level === 3
      ? isNext
        ? -2.5
        : 2.5
      : level === 2
      ? isNext
        ? -2
        : 2
      : isNext
      ? -1.5
      : 1.5;
  const scaleMin = level >= 2 ? 0.988 : 0.992;

  return {
    initial: {
      opacity: 0,
      filter: `blur(${blurMax}px) saturate(0.9)`,
      y: yOffset,
      x: -xOffset / 2,
      rotateY: rotateEnter,
      skewX: -skewExit,
      scale: scaleMin,
      transformOrigin: isNext ? "left center" : "right center",
    },
    animate: {
      opacity: 1,
      filter: "blur(0px) saturate(1)",
      y: 0,
      x: 0,
      rotateY: 0,
      skewX: 0,
      scale: 1,
      transition: { duration: DURATIONS[level], ease: EASE },
    },
    exit: {
      opacity: 0,
      // EXIT BLUR: Increased for smoother exit transition
      filter: `blur(${blurMax + 8}px) saturate(0.96)`, // Increased from +4 to +8
      y: 10,
      x: isNext ? -xOffset : -xOffset,
      rotateY: rotateExit,
      skewX: skewExit,
      scale: scaleMin,
      transformOrigin: isNext ? "left center" : "right center",
      transition: { duration: DURATIONS[level], ease: EASE },
    },
  } as Variants;
}
