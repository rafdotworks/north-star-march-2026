/**
 * ============================================================================
 * LANDING PAGE VERSIONS CONFIG - app/config/landingPages.ts
 * ============================================================================
 * 
 * Centralized configuration for managing multiple landing page versions.
 * 
 * This config provides a simple way to track and reference different
 * versions of the landing page. When a new version is created, add it here
 * with a descriptive key and route path.
 * 
 * USAGE:
 * - Import this config to reference landing page routes programmatically
 * - Use for navigation, redirects, or version switching logic
 * - Extend as needed when new versions are added
 * 
 * STRUCTURE:
 * - Keys: Descriptive identifiers for each version
 * - Values: Route paths where each version is accessible
 * 
 * @example
 * ```typescript
 * import { LANDING_PAGE_VERSIONS } from '@/app/config/landingPages'
 * 
 * // Navigate to Q3 2025 version
 * router.push(LANDING_PAGE_VERSIONS.q3_2025)
 * ```
 */

/**
 * Route mappings for all landing page versions.
 * 
 * Each entry maps a version identifier to its route path.
 * 
 * - current: The active/main landing page (root route)
 * - q3_2025: Previous version preserved for reference
 */
export const LANDING_PAGE_VERSIONS = {
  current: '/',
  q3_2025: '/q3-2025',
} as const;

/**
 * Type for landing page version keys.
 * 
 * Provides type safety when referencing version identifiers.
 * 
 * @example
 * ```typescript
 * const version: LandingPageVersion = 'q3_2025'
 * ```
 */
export type LandingPageVersion = keyof typeof LANDING_PAGE_VERSIONS;

