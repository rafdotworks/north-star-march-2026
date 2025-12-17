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
 * // Returns: "Raf is currently in Toronto (3 hours ahead) where it's 22°C and sunny" (Toronto uses Celsius)
 * // Or: "Raf is currently in New York (3 hours ahead) where it's 72°F and sunny" (New York uses Fahrenheit)
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
 * Structured location weather data for component consumption.
 */
export interface LocationWeatherData {
  city: string
  temperature: string         // Formatted with unit: "10°C" or "72°F"
  temperatureValue: number    // Raw number for flexibility
  description: string         // Weather description: "partly cloudy"
  timezoneDiff: string        // "3 hours ahead" or "in your timezone"
  isLoading: boolean          // True until initial data loads
}

/**
 * Determines if Raf's current location uses Fahrenheit.
 * 
 * Uses the temperature scale configured for Raf's current city.
 * This ensures the temperature scale matches the local convention of the city being displayed.
 * 
 * @param {string} temperatureScale - Temperature scale from location config ("C" or "F")
 * @returns {boolean} True if location uses Fahrenheit, false for Celsius
 */
function usesFahrenheit(temperatureScale: "C" | "F"): boolean {
  return temperatureScale === "F"
}

/**
 * Custom hook that calculates and displays relative timezone difference from Raf's location,
 * along with weather information.
 * 
 * HOW IT WORKS:
 * 1. Gets current location from config (city, timezone, coordinates, temperatureScale)
 * 2. Gets current local time (user's timezone)
 * 3. Uses Intl.DateTimeFormat with formatToParts to get target timezone values
 * 4. Calculates difference in minutes (more accurate than just hours)
 * 5. Handles day boundary crossing (normalize to -12 to +12 hours range)
 * 6. Rounds to nearest hour for display
 * 7. Fetches weather data from API (with graceful fallback)
 * 8. Uses location's temperatureScale to determine which temperature to display
 * 9. Generates user-friendly message with location, timezone diff, and weather
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
 * "Raf is currently in Toronto (3 hours ahead) where it's 22°C and sunny" (Toronto uses Celsius)
 * "Raf is currently in New York (3 hours ahead) where it's 72°F and sunny" (New York uses Fahrenheit)
 * "Raf is currently in Toronto (3 hours ahead)" // if weather unavailable
 * "Raf is currently in Toronto (in your timezone)"
 */
export function useTimezoneMessage(): string {
  // Get current location from config (outside effect to avoid re-fetching)
  const location = getCurrentLocation()
  const { city, timezone: targetTimezone, coordinates, temperatureScale } = location

  // SSR guard - return consistent initial value to prevent hydration mismatch
  const [timezoneMessage, setTimezoneMessage] = useState(`Raf is currently in ${city}.`)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [timezoneDiff, setTimezoneDiff] = useState("")

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

  // Effect 2: Fetch weather data with AbortController for cleanup
  useEffect(() => {
    const abortController = new AbortController()

    /**
     * Fetches weather data from API.
     * Silently fails if API is unavailable (per option 4b).
     * Uses AbortController to prevent memory leaks on unmount.
     */
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`,
          { signal: abortController.signal }
        )

        if (!response.ok) {
          // Silently fail - weather is optional
          return
        }

        const data: WeatherData = await response.json()
        setWeatherData(data)
      } catch (error) {
        // Ignore abort errors, silently fail others
        if (error instanceof Error && error.name === 'AbortError') return
        // Silently fail - weather is optional
        // The timezone message will display without weather data
      }
    }

    // Fetch immediately on mount
    fetchWeather()

    // Re-fetch periodically (cache handles rate limiting)
    const interval = setInterval(fetchWeather, TIMEZONE_UPDATE_INTERVAL)

    return () => {
      abortController.abort()
      clearInterval(interval)
    }
  }, [coordinates.lat, coordinates.lon]) // Re-run if coordinates change

  // Effect 3: Update message when timezone or weather changes
  useEffect(() => {
    if (!timezoneDiff) return // Wait for initial timezone calculation

    // Build base message with location and timezone
    let message = `Raf is currently in ${city} (${timezoneDiff})`
    
    // Append weather if available
    if (weatherData) {
      const useFahrenheit = usesFahrenheit(temperatureScale)
      const temperature = useFahrenheit 
        ? `${weatherData.tempF}°F`
        : `${weatherData.tempC}°C`
      message += ` where it's ${temperature} and ${weatherData.description}`
    }
    
    setTimezoneMessage(message)
  }, [timezoneDiff, weatherData, city, temperatureScale])

  return timezoneMessage
}

/**
 * Hook that returns structured location and weather data for component consumption.
 *
 * @returns {LocationWeatherData} Structured weather and location data
 *
 * @example
 * const { city, temperature, description, timezoneDiff, isLoading } = useLocationWeather()
 * // city: "London"
 * // temperature: "10°C"
 * // description: "partly cloudy"
 * // timezoneDiff: "in your timezone" or "3 hours ahead"
 */
export function useLocationWeather(): LocationWeatherData {
  const location = getCurrentLocation()
  const { city, timezone: targetTimezone, coordinates, temperatureScale } = location

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [timezoneDiff, setTimezoneDiff] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const calculateTimezoneDifference = (): string => {
    const now = new Date()

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

    const userTotalMinutes = now.getHours() * 60 + now.getMinutes()

    let differenceMinutes = targetTotalMinutes - userTotalMinutes

    if (differenceMinutes > 12 * 60) {
      differenceMinutes -= 24 * 60
    } else if (differenceMinutes < -12 * 60) {
      differenceMinutes += 24 * 60
    }

    const differenceHours = Math.round(differenceMinutes / 60)

    if (differenceHours === 0) {
      return "in your timezone"
    } else if (differenceHours > 0) {
      return `${differenceHours} hour${differenceHours !== 1 ? 's' : ''} ahead`
    } else {
      return `${Math.abs(differenceHours)} hour${Math.abs(differenceHours) !== 1 ? 's' : ''} behind`
    }
  }

  // Effect 1: Update timezone difference
  useEffect(() => {
    const updateTimezone = () => {
      setTimezoneDiff(calculateTimezoneDifference())
    }

    updateTimezone()
    const interval = setInterval(updateTimezone, TIMEZONE_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [targetTimezone])

  // Effect 2: Fetch weather data
  useEffect(() => {
    const abortController = new AbortController()

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`,
          { signal: abortController.signal }
        )

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data: WeatherData = await response.json()
        setWeatherData(data)
        setIsLoading(false)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setIsLoading(false)
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, TIMEZONE_UPDATE_INTERVAL)

    return () => {
      abortController.abort()
      clearInterval(interval)
    }
  }, [coordinates.lat, coordinates.lon])

  // Format temperature with unit
  const useFahrenheit = usesFahrenheit(temperatureScale)
  const temperatureValue = weatherData
    ? (useFahrenheit ? weatherData.tempF : weatherData.tempC)
    : 0
  const temperature = weatherData
    ? `${temperatureValue}°${useFahrenheit ? 'F' : 'C'}`
    : ''

  return {
    city,
    temperature,
    temperatureValue,
    description: weatherData?.description || '',
    timezoneDiff,
    isLoading: isLoading && !timezoneDiff,
  }
}

