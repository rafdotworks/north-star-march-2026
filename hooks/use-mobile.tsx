/**
 * ============================================================================
 * MOBILE DETECTION HOOK - hooks/use-mobile.tsx
 * ============================================================================
 *
 * Detects mobile viewport based on screen width breakpoint.
 *
 * BREAKPOINT: TYPOGRAPHY_BREAKPOINT (768px, Tailwind 'md')
 * - < 768px: Mobile (true)
 * - >= 768px: Desktop (false)
 *
 * Features:
 * - SSR-safe (returns false on server)
 * - Listens to window resize events
 * - Uses matchMedia for efficient detection
 *
 * Used throughout app for responsive behavior:
 * - app/page.tsx: Mobile scroll vs desktop carousel
 * - Layout components: Conditional rendering
 */

import * as React from "react";
import { TYPOGRAPHY_BREAKPOINT } from "@/app/config/typographyConfig";

/** Mobile breakpoint in pixels — single source of truth from typographyConfig */
const MOBILE_BREAKPOINT = TYPOGRAPHY_BREAKPOINT;

/**
 * Hook to detect if viewport is mobile-sized
 * @returns boolean - true if viewport < 768px, false otherwise
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    // Create media query listener for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial value
    onChange();

    // Listen for viewport changes
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array - only runs once on mount

  return isMobile;
}
