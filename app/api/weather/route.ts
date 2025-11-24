/**
 * ============================================================================
 * WEATHER API ROUTE - app/api/weather/route.ts
 * ============================================================================
 * 
 * Server-side API route that fetches weather data from OpenWeatherMap.
 * Implements caching to reduce API calls (15-minute cache).
 * 
 * ENDPOINT: GET /api/weather?lat={lat}&lon={lon}
 * 
 * RESPONSE FORMAT:
 * {
 *   tempC: number,
 *   tempF: number,
 *   description: string
 * }
 * 
 * CACHING:
 * - Cache duration: 15 minutes
 * - Cache key: coordinates (lat,lon)
 * - In-memory cache (resets on server restart)
 * 
 * ERROR HANDLING:
 * - Returns 503 if API key not configured
 * - Returns 500 if weather API fails
 * - Returns 400 if coordinates missing
 */

import { NextResponse } from "next/server"

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * OpenWeatherMap API base URL
 */
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

/**
 * Cache duration in milliseconds (15 minutes)
 */
const CACHE_DURATION = 15 * 60 * 1000

/**
 * Weather condition mapping to short descriptions.
 * 
 * Maps OpenWeatherMap condition codes to user-friendly short descriptions.
 * Based on OpenWeatherMap weather condition IDs.
 */
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  // Clear
  800: "sunny",
  
  // Clouds
  801: "partly cloudy",
  802: "partly cloudy",
  803: "cloudy",
  804: "cloudy",
  
  // Rain
  500: "rainy",
  501: "rainy",
  502: "rainy",
  503: "rainy",
  504: "rainy",
  520: "rainy",
  521: "rainy",
  522: "rainy",
  531: "rainy",
  
  // Drizzle
  300: "rainy",
  301: "rainy",
  302: "rainy",
  310: "rainy",
  311: "rainy",
  312: "rainy",
  313: "rainy",
  314: "rainy",
  321: "rainy",
  
  // Thunderstorm
  200: "stormy",
  201: "stormy",
  202: "stormy",
  210: "stormy",
  211: "stormy",
  212: "stormy",
  221: "stormy",
  230: "stormy",
  231: "stormy",
  232: "stormy",
  
  // Snow
  600: "snowy",
  601: "snowy",
  602: "snowy",
  611: "snowy",
  612: "snowy",
  613: "snowy",
  615: "snowy",
  616: "snowy",
  620: "snowy",
  621: "snowy",
  622: "snowy",
  
  // Atmosphere (fog, mist, etc.)
  701: "foggy",
  711: "foggy",
  721: "foggy",
  731: "foggy",
  741: "foggy",
  751: "foggy",
  761: "foggy",
  762: "foggy",
  771: "windy",
  781: "windy",
}

/**
 * Default weather description if condition code not found
 */
const DEFAULT_WEATHER_DESCRIPTION = "sunny"

// ============================================================================
// CACHING
// ============================================================================

/**
 * In-memory cache for weather data.
 * 
 * Structure: Map<"lat,lon", { data: WeatherData, expiresAt: number }>
 */
const weatherCache = new Map<string, {
  data: {
    tempC: number;
    tempF: number;
    description: string;
  };
  expiresAt: number;
}>()

/**
 * Periodic cleanup to prevent memory leaks.
 * Runs every 5 minutes to remove expired cache entries.
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of weatherCache.entries()) {
      if (now > entry.expiresAt) {
        weatherCache.delete(key)
      }
    }
  }, 5 * 60 * 1000) // Clean up every 5 minutes
}

/**
 * Gets cached weather data if available and not expired.
 * 
 * @param {string} cacheKey - Cache key (coordinates as "lat,lon")
 * @returns {Object | null} Cached weather data or null if not found/expired
 */
function getCachedWeather(cacheKey: string) {
  const cached = weatherCache.get(cacheKey)
  if (!cached) return null
  
  const now = Date.now()
  if (now > cached.expiresAt) {
    weatherCache.delete(cacheKey)
    return null
  }
  
  return cached.data
}

/**
 * Stores weather data in cache.
 * 
 * @param {string} cacheKey - Cache key (coordinates as "lat,lon")
 * @param {Object} data - Weather data to cache
 */
function setCachedWeather(
  cacheKey: string,
  data: { tempC: number; tempF: number; description: string }
) {
  const expiresAt = Date.now() + CACHE_DURATION
  weatherCache.set(cacheKey, { data, expiresAt })
}

// ============================================================================
// WEATHER API FUNCTIONS
// ============================================================================

/**
 * Converts temperature from Kelvin to Celsius.
 * 
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Celsius
 */
function kelvinToCelsius(kelvin: number): number {
  return Math.round(kelvin - 273.15)
}

/**
 * Converts temperature from Kelvin to Fahrenheit.
 * 
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Fahrenheit
 */
function kelvinToFahrenheit(kelvin: number): number {
  return Math.round((kelvin - 273.15) * 9/5 + 32)
}

/**
 * Maps OpenWeatherMap condition ID to short description.
 * 
 * @param {number} conditionId - Weather condition ID from API
 * @returns {string} Short weather description
 */
function getWeatherDescription(conditionId: number): string {
  return WEATHER_DESCRIPTIONS[conditionId] || DEFAULT_WEATHER_DESCRIPTION
}

/**
 * Fetches weather data from OpenWeatherMap API.
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data with tempC, tempF, and description
 */
async function fetchWeatherData(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY is not configured')
  }
  
  const url = `${OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}`
  
  const response = await fetch(url, {
    next: { revalidate: 0 }, // Don't use Next.js cache, we handle our own
  })
  
  if (!response.ok) {
    // Try to parse error message from OpenWeatherMap
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || response.statusText
    
    // Provide helpful message for common errors
    if (response.status === 401) {
      throw new Error(`Invalid API key: ${errorMessage}. Please verify your OPENWEATHERMAP_API_KEY in .env.local`)
    }
    
    throw new Error(`Weather API error: ${response.status} ${errorMessage}`)
  }
  
  const data = await response.json()
  
  // Extract temperature (in Kelvin) and weather condition
  const tempKelvin = data.main?.temp
  const conditionId = data.weather?.[0]?.id
  
  if (!tempKelvin || !conditionId) {
    throw new Error('Invalid weather data format')
  }
  
  return {
    tempC: kelvinToCelsius(tempKelvin),
    tempF: kelvinToFahrenheit(tempKelvin),
    description: getWeatherDescription(conditionId),
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * GET handler for weather API.
 * 
 * Query parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 * 
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Weather data or error response
 */
export async function GET(request: Request) {
  try {
    // Validate API key
    if (!process.env.OPENWEATHERMAP_API_KEY) {
      return NextResponse.json(
        { error: 'Weather service is not configured' },
        { status: 503 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    // Validate coordinates
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lon' },
        { status: 400 }
      )
    }
    
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      return NextResponse.json(
        { error: 'Invalid coordinates: lat and lon must be numbers' },
        { status: 400 }
      )
    }
    
    // Check cache
    const cacheKey = `${latNum},${lonNum}`
    const cached = getCachedWeather(cacheKey)
    
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
        },
      })
    }
    
    // Fetch from API
    const weatherData = await fetchWeatherData(latNum, lonNum)
    
    // Store in cache
    setCachedWeather(cacheKey, weatherData)
    
    return NextResponse.json(weatherData, {
      headers: {
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Weather API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

