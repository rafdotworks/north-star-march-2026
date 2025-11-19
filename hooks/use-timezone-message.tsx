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
 * 2. Converts to Toronto timezone using toLocaleString
 * 3. Calculates hour difference
 * 4. Handles day boundary crossing (e.g., if difference is 15 hours,
 *    it's actually -9 hours, meaning Toronto is behind)
 * 5. Generates user-friendly message
 * 
 * EDGE CASES HANDLED:
 * - Day boundary crossing (difference > 12 or < -12)
 * - Same timezone (difference === 0)
 * - Singular vs plural hour(s)
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

      // Get user's local time (current timezone)
      const userHour = now.getHours()

      // Get Toronto time by converting to Toronto timezone
      // Note: toLocaleString with timeZone option converts the time
      const torontoTime = new Date(now.toLocaleString("en-US", {
        timeZone: TARGET_TIMEZONE
      }))
      const torontoHour = torontoTime.getHours()

      // Calculate hour difference
      let difference = torontoHour - userHour

      // Handle day boundary crossing
      // If difference is > 12, we've crossed midnight forward (subtract 24)
      // If difference is < -12, we've crossed midnight backward (add 24)
      // Example: If Toronto is 15 hours ahead, it's actually 9 hours behind
      if (difference > 12) difference -= 24
      if (difference < -12) difference += 24

      // Generate user-friendly message
      let message = ""
      if (difference === 0) {
        message = "Raf is in your timezone"
      } else if (difference > 0) {
        message = `Raf is ${difference} hour${difference !== 1 ? 's' : ''} ahead of you`
      } else {
        message = `Raf is ${Math.abs(difference)} hour${Math.abs(difference) !== 1 ? 's' : ''} behind you`
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

