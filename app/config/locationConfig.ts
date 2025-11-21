/**
 * ============================================================================
 * LOCATION CONFIGURATION - app/config/locationConfig.ts
 * ============================================================================
 * 
 * Centralized configuration for Raf's current location.
 * Easy to update when traveling to different cities.
 * 
 * USAGE:
 * Import and use getCurrentLocation() to get the current city configuration.
 * 
 * CITIES SUPPORTED:
 * - Toronto (default)
 * - New York
 * - London, UK
 * - Lisbon, Portugal
 * 
 * TO UPDATE LOCATION:
 * Simply change the CURRENT_CITY constant to one of the supported city keys.
 * 
 * @example
 * ```ts
 * const location = getCurrentLocation()
 * // Returns: { city: "Toronto", timezone: "America/Toronto", coordinates: {...} }
 * ```
 */

// ============================================================================
// LOCATION DATA
// ============================================================================

/**
 * Location data for supported cities.
 * 
 * Each city includes:
 * - city: Display name
 * - timezone: IANA timezone identifier (e.g., "America/Toronto")
 * - coordinates: Latitude and longitude for weather API
 */
const LOCATIONS: Record<string, {
  city: string;
  timezone: string;
  coordinates: { lat: number; lon: number };
}> = {
  toronto: {
    city: "Toronto",
    timezone: "America/Toronto",
    coordinates: { lat: 43.6532, lon: -79.3832 },
  },
  newyork: {
    city: "New York",
    timezone: "America/New_York",
    coordinates: { lat: 40.7128, lon: -74.0060 },
  },
  london: {
    city: "London",
    timezone: "Europe/London",
    coordinates: { lat: 51.5074, lon: -0.1278 },
  },
  lisbon: {
    city: "Lisbon",
    timezone: "Europe/Lisbon",
    coordinates: { lat: 38.7223, lon: -9.1393 },
  },
} as const;

/**
 * Current city key.
 * 
 * Change this value to switch between cities.
 * Valid values: "toronto", "newyork", "london", "lisbon"
 */
const CURRENT_CITY: keyof typeof LOCATIONS = "toronto";

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Gets the current location configuration.
 * 
 * @returns {Object} Current location with city, timezone, and coordinates
 * 
 * @example
 * ```ts
 * const location = getCurrentLocation()
 * // { city: "Toronto", timezone: "America/Toronto", coordinates: {...} }
 * ```
 */
export function getCurrentLocation() {
  return LOCATIONS[CURRENT_CITY];
}

/**
 * Gets location data for a specific city.
 * 
 * @param {string} cityKey - City key (e.g., "toronto", "newyork")
 * @returns {Object | null} Location data or null if city not found
 */
export function getLocationByKey(cityKey: string) {
  return LOCATIONS[cityKey] || null;
}

