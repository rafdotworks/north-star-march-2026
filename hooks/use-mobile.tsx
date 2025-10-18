/**
 * ============================================================================
 * MOBILE DETECTION HOOK - hooks/use-mobile.tsx
 * ============================================================================
 *
 * Detects mobile viewport based on screen width breakpoint.
 *
 * BREAKPOINT: 768px
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

/** Mobile breakpoint in pixels (Tailwind 'md' breakpoint) */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if viewport is mobile-sized
 * @returns boolean - true if viewport < 768px, false otherwise
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    // Create media query listener for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(newIsMobile);
      if (!isReady) {
        setIsReady(true);
      }
    };

    // Set initial value
    onChange();

    // Listen for viewport changes
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [isReady]);

  return isMobile;
}
