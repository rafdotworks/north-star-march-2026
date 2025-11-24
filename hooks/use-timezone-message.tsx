/**
 * ============================================================================
 * TIMEZONE MESSAGE HOOK - hooks/use-timezone-message.tsx
 * ============================================================================
 * 
 * Custom hook that calculates and returns a timezone message showing the
 * relative difference between the user's timezone and Raf's current location,
 * along with weather information.
 * 
 * USAGE:
 * ```tsx
 * const timezoneMessage = useTimezoneMessage()
 * // Returns: "Raf is currently in Toronto (3 hours ahead) where it is 22°C/72°F and sunny"
 * // Or: "Raf is currently in Toronto (3 hours ahead)" if weather unavailable
 * ```
 * 
 * FEATURES:
 * - Automatically updates every minute
 * - Handles day boundary crossing
 * - Handles same timezone case
 * - Proper singular/plural handling
 * - Fetches weather data from API
 * - Graceful fallback to timezone-only message if weather unavailable
 * - Shows timezone message immediately, updates when weather loads
 * 
 * @returns {string} User-friendly timezone and weather message
 */

import { useEffect, useState } from "react"
import { getCurrentLocation } from "@/app/config/locationConfig"

/**
 * Update interval for timezone message (in milliseconds).
 * 
 * Updates every 60 seconds. This is sufficient since timezone differences
 * only change when DST transitions occur, which happen at most twice per year.
 */
const TIMEZONE_UPDATE_INTERVAL = 60000

/**
 * Weather data structure from API.
 */
interface WeatherData {
  tempC: number;
  tempF: number;
  description: string;
}

/**
 * Custom hook that calculates and displays relative timezone difference from Raf's location,
 * along with weather information.
 * 
 * HOW IT WORKS:
 * 1. Gets current location from config (city, timezone, coordinates)
 * 2. Gets current local time (user's timezone)
 * 3. Uses Intl.DateTimeFormat with formatToParts to get target timezone values
 * 4. Calculates difference in minutes (more accurate than just hours)
 * 5. Handles day boundary crossing (normalize to -12 to +12 hours range)
 * 6. Rounds to nearest hour for display
 * 7. Fetches weather data from API (with graceful fallback)
 * 8. Generates user-friendly message with location, timezone diff, and weather
 * 
 * EDGE CASES HANDLED:
 * - Day boundary crossing (difference > 12 hours or < -12 hours)
 * - Same timezone (difference === 0)
 * - Singular vs plural hour(s)
 * - DST transitions (updates every minute)
 * - Weather API failures (falls back to timezone-only message)
 * - Weather API slowness (shows timezone immediately, updates when weather loads)
 * 
 * @returns {string} User-friendly timezone and weather message
 * 
 * @example
 * "Raf is currently in Toronto (3 hours ahead) where it is 22°C/72°F and sunny"
 * "Raf is currently in Toronto (3 hours ahead)" // if weather unavailable
 * "Raf is currently in Toronto (in your timezone)"
 */
export function useTimezoneMessage(): string {
  const [timezoneMessage, setTimezoneMessage] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [timezoneDiff, setTimezoneDiff] = useState("")

  // Get current location from config (outside effect to avoid re-fetching)
  const location = getCurrentLocation()
  const { city, timezone: targetTimezone, coordinates } = location

  /**
   * Calculates timezone difference and generates timezone portion of message.
   * 
   * @returns {string} Timezone difference message (e.g., "3 hours ahead", "in your timezone")
   */
  const calculateTimezoneDifference = (): string => {
    const now = new Date()

    // Get target location time using proper timezone-aware formatting
    const targetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimezone,
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
    })
    
    const targetParts = targetFormatter.formatToParts(now)
    const targetHour = parseInt(targetParts.find(p => p.type === "hour")?.value || "0", 10)
    const targetMinute = parseInt(targetParts.find(p => p.type === "minute")?.value || "0", 10)
    const targetTotalMinutes = targetHour * 60 + targetMinute

    // Get user's local time
    const userTotalMinutes = now.getHours() * 60 + now.getMinutes()

    // Calculate difference in minutes
    let differenceMinutes = targetTotalMinutes - userTotalMinutes

    // Handle day boundary crossing (normalize to -12 to +12 hours range)
    if (differenceMinutes > 12 * 60) {
      differenceMinutes -= 24 * 60
    } else if (differenceMinutes < -12 * 60) {
      differenceMinutes += 24 * 60
    }

    // Convert to hours (round to nearest hour)
    const differenceHours = Math.round(differenceMinutes / 60)

    // Generate timezone difference message
    if (differenceHours === 0) {
      return "in your timezone"
    } else if (differenceHours > 0) {
      return `${differenceHours} hour${differenceHours !== 1 ? 's' : ''} ahead`
    } else {
      return `${Math.abs(differenceHours)} hour${Math.abs(differenceHours) !== 1 ? 's' : ''} behind`
    }
  }

  // Effect 1: Update timezone difference every minute
  useEffect(() => {
    const updateTimezone = () => {
      setTimezoneDiff(calculateTimezoneDifference())
    }

    // Calculate immediately on mount
    updateTimezone()
    
    // Update every minute
    const interval = setInterval(updateTimezone, TIMEZONE_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [targetTimezone]) // Re-run if timezone changes

  // Effect 2: Fetch weather data
  useEffect(() => {
    /**
     * Fetches weather data from API.
     * Silently fails if API is unavailable (per option 4b).
     * Logs errors in development mode for debugging.
     */
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`
        )
        
        if (!response.ok) {
          // Log error in development for debugging (check if we're in dev mode)
          const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          if (isDev) {
            const errorData = await response.json().catch(() => ({}))
            const errorMsg = errorData.message || errorData.error || 'Unknown error'
            console.warn('Weather API error:', response.status, errorMsg)
            if (response.status === 503) {
              console.info('💡 Tip: Add OPENWEATHERMAP_API_KEY to your .env.local file')
            } else if (response.status === 401) {
              console.error('💡 Invalid API key. Please verify your OPENWEATHERMAP_API_KEY in .env.local and ensure it\'s activated at https://openweathermap.org/api')
            }
          }
          // Silently fail - don't set weather data
          return
        }
        
        const data: WeatherData = await response.json()
        setWeatherData(data)
      } catch (error) {
        // Log error in development for debugging
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        if (isDev) {
          console.error('Failed to fetch weather:', error)
        }
        // Silently fail - don't set weather data
      }
    }

    // Fetch immediately on mount
    fetchWeather()
    
    // Re-fetch periodically (cache handles rate limiting)
    const interval = setInterval(fetchWeather, TIMEZONE_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [coordinates.lat, coordinates.lon]) // Re-run if coordinates change

  // Effect 3: Update message when timezone or weather changes
  useEffect(() => {
    if (!timezoneDiff) return // Wait for initial timezone calculation

    // Build base message with location and timezone
    let message = `Raf is currently in ${city} (${timezoneDiff})`
    
    // Append weather if available
    if (weatherData) {
      message += ` where it is ${weatherData.tempC}°C/${weatherData.tempF}°F and ${weatherData.description}`
    }
    
    setTimezoneMessage(message)
  }, [timezoneDiff, weatherData, city])

  return timezoneMessage
}

