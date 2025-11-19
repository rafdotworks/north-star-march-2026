/**
 * ============================================================================
 * ANIMATION CONSTANTS - components/animations/constants.ts
 * ============================================================================
 * 
 * Shared animation constants used across multiple components.
 * Provides consistent easing curves and animation timing throughout the app.
 * 
 * USAGE:
 * Import easing curves in components that use Framer Motion animations:
 * ```ts
 * import { EASING } from "@/components/animations/constants"
 * ```
 * 
 * EASING CURVES:
 * Each easing curve is a cubic-bezier array [x1, y1, x2, y2] that defines
 * the acceleration curve for animations.
 */

/**
 * Custom easing curves for beautiful, natural animations.
 * 
 * - smooth: Standard material design easing (smooth acceleration/deceleration)
 *   Use for: General transitions, backdrop fades
 * 
 * - spring: Spring-like bounce effect (subtle overshoot)
 *   Use for: 3D transforms, scale animations
 * 
 * - gentle: Gentle, organic motion (slight ease-in-out)
 *   Use for: Content fades, filter transitions
 * 
 * - elastic: Elastic bounce effect (more pronounced overshoot)
 *   Use for: Scale animations, entrance effects
 * 
 * - stagger: Used for staggered list animations (smooth entrance)
 *   Use for: List item animations, sequential reveals
 */
export const EASING = {
  smooth: [0.4, 0.0, 0.2, 1] as const,
  spring: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1.0] as const,
  elastic: [0.12, 1, 0.28, 1] as const,
  stagger: [0.19, 1, 0.22, 1] as const,
} as const

