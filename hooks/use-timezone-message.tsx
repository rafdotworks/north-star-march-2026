/**
 * ============================================================================
 * TIMEZONE MESSAGE HOOK - hooks/use-timezone-message.tsx
 * ============================================================================
 * 
 * Custom hook that calculates and returns a timezone message showing the
 * relative difference between the user's timezone and Toronto timezone.
 * 
 * USAGE:
 * ```tsx
 * const timezoneMessage = useTimezoneMessage()
 * // Returns: "Raf is 3 hours ahead of you" or "Raf is in your timezone"
 * ```
 * 
 * FEATURES:
 * - Automatically updates every minute
 * - Handles day boundary crossing
 * - Handles same timezone case
 * - Proper singular/plural handling
 * 
 * @returns {string} User-friendly timezone difference message
 */

import { useEffect, useState } from "react"

/**
 * Update interval for timezone message (in milliseconds).
 * 
 * Updates every 60 seconds. This is sufficient since timezone differences
 * only change when DST transitions occur, which happen at most twice per year.
 */
const TIMEZONE_UPDATE_INTERVAL = 60000

/**
 * Target timezone for comparison (Toronto, Canada).
 */
const TARGET_TIMEZONE = "America/Toronto"

/**
 * Custom hook that calculates and displays relative timezone difference from Toronto.
 * 
 * HOW IT WORKS:
 * 1. Gets current local time (user's timezone)
 * 2. Uses Intl.DateTimeFormat with formatToParts to get Toronto timezone values
 * 3. Calculates difference in minutes (more accurate than just hours)
 * 4. Handles day boundary crossing (normalize to -12 to +12 hours range)
 * 5. Rounds to nearest hour for display
 * 6. Generates user-friendly message
 * 
 * EDGE CASES HANDLED:
 * - Day boundary crossing (difference > 12 hours or < -12 hours)
 * - Same timezone (difference === 0)
 * - Singular vs plural hour(s)
 * - DST transitions (updates every minute)
 * 
 * @returns {string} User-friendly timezone difference message
 * 
 * @example
 * "Raf is 3 hours ahead of you"
 * "Raf is in your timezone"
 * "Raf is 2 hours behind you"
 */
export function useTimezoneMessage(): string {
  const [timezoneMessage, setTimezoneMessage] = useState("")

  useEffect(() => {
    const updateTimezoneMessage = () => {
      const now = new Date()

      // Get Toronto time using proper timezone-aware formatting
      const torontoFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: TARGET_TIMEZONE,
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
      })
      
      const torontoParts = torontoFormatter.formatToParts(now)
      const torontoHour = parseInt(torontoParts.find(p => p.type === "hour")?.value || "0", 10)
      const torontoMinute = parseInt(torontoParts.find(p => p.type === "minute")?.value || "0", 10)
      const torontoTotalMinutes = torontoHour * 60 + torontoMinute

      // Get user's local time
      const userTotalMinutes = now.getHours() * 60 + now.getMinutes()

      // Calculate difference in minutes
      let differenceMinutes = torontoTotalMinutes - userTotalMinutes

      // Handle day boundary crossing (normalize to -12 to +12 hours range)
      if (differenceMinutes > 12 * 60) {
        differenceMinutes -= 24 * 60
      } else if (differenceMinutes < -12 * 60) {
        differenceMinutes += 24 * 60
      }

      // Convert to hours (round to nearest hour)
      const differenceHours = Math.round(differenceMinutes / 60)

      // Generate user-friendly message
      let message = ""
      if (differenceHours === 0) {
        message = "Raf is in your timezone"
      } else if (differenceHours > 0) {
        message = `Raf is ${differenceHours} hour${differenceHours !== 1 ? 's' : ''} ahead of you`
      } else {
        message = `Raf is ${Math.abs(differenceHours)} hour${Math.abs(differenceHours) !== 1 ? 's' : ''} behind you`
      }

      setTimezoneMessage(message)
    }

    // Calculate immediately on mount
    updateTimezoneMessage()
    
    // Update every minute
    const interval = setInterval(updateTimezoneMessage, TIMEZONE_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return timezoneMessage
}

