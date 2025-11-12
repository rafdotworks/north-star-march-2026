/**
 * ============================================================================
 * SYSTEM THEME DETECTION HOOK - hooks/use-system-theme.tsx
 * ============================================================================
 *
 * Detects and listens to system theme preference changes (light/dark mode).
 *
 * Features:
 * - SSR-safe (returns false on server)
 * - Listens to system preference changes reactively
 * - Uses matchMedia for efficient detection
 * - Returns ready state to prevent hydration mismatches
 *
 * Used for theme-aware components that need to match system preferences.
 */

import { useEffect, useState } from "react"

/**
 * Hook to detect if system prefers dark mode
 * @returns Object with prefersDark boolean and isReady boolean for SSR safety
 */
export function useSystemTheme() {
  const [prefersDark, setPrefersDark] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return

    // Create media query listener for dark mode preference
    const mql = window.matchMedia("(prefers-color-scheme: dark)")

    // Set initial value
    setPrefersDark(mql.matches)
    setIsReady(true)

    // Handler to update state when preference changes
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }

    // Listen for changes
    mql.addEventListener("change", onChange)

    // Cleanup
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return { prefersDark, isReady }
}

