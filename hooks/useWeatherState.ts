import { useState, useEffect } from "react";

interface WeatherState {
  temperature: number | null;
  condition: string | null;
  isLoading: boolean;
  showWeatherEffect: boolean;
  clickPosition: { x: number; y: number } | null;
  location: string;
  customLocation: boolean;
}

const CITY_COORDINATES: { [key: string]: { lat: number; lon: number } } = {
  Toronto: { lat: 43.65, lon: -79.38 },
  "New York": { lat: 40.71, lon: -74.01 },
  London: { lat: 51.51, lon: -0.13 },
  Paris: { lat: 48.85, lon: 2.35 },
  Tokyo: { lat: 35.68, lon: 139.77 },
  Sydney: { lat: -33.87, lon: 151.21 },
  Berlin: { lat: 52.52, lon: 13.41 },
  "San Francisco": { lat: 37.77, lon: -122.42 },
};

const mapWeatherCode = (code: number): string => {
  if ([0].includes(code)) return "Clear";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if ([3].includes(code)) return "Clouds";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing Rain";
  if ([71, 73, 75].includes(code)) return "Snow";
  if ([77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain";
  if ([85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Clear";
};

export function useWeatherState(initialLocation: string = "Toronto") {
  const [weatherState, setWeatherState] = useState<WeatherState>({
    temperature: null,
    condition: null,
    isLoading: true,
    showWeatherEffect: false,
    clickPosition: null,
    location: initialLocation,
    customLocation: false,
  });

  const fetchWeatherData = async (location: string = "Toronto") => {
    try {
      setWeatherState(prev => ({ ...prev, isLoading: true }));
      
      const coordinates = CITY_COORDINATES[location] || CITY_COORDINATES["Toronto"];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,weather_code&timezone=America%2FNew_York`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Weather data fetch failed");
      }

      const data = await response.json();

      setWeatherState((prev) => ({
        ...prev,
        temperature: Math.round(data.current.temperature_2m),
        condition: mapWeatherCode(data.current.weather_code),
        isLoading: false,
        location: location,
        customLocation: location !== "Toronto",
      }));
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeatherState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const toggleWeatherEffect = (e: React.MouseEvent) => {
    setWeatherState((prev) => ({
      ...prev,
      showWeatherEffect: !prev.showWeatherEffect,
      clickPosition: { x: window.innerWidth / 2, y: 0 },
    }));
  };

  const changeWeatherLocation = (location: string) => {
    fetchWeatherData(location);
    setWeatherState((prev) => ({
      ...prev,
      showWeatherEffect: true,
      clickPosition: { x: window.innerWidth / 2, y: 0 },
    }));
  };

  // Initial weather fetch
  useEffect(() => {
    let weatherTimeout: NodeJS.Timeout | undefined;

    const weatherPromise = fetchWeatherData(initialLocation).catch((error) => {
      console.warn("Weather API failed, continuing without weather data:", error);
    });

    weatherTimeout = setTimeout(() => {
      console.warn("Weather API timeout, continuing without weather data");
    }, 8000);

    return () => {
      if (weatherTimeout) {
        clearTimeout(weatherTimeout);
      }
    };
  }, [initialLocation]);

  return {
    weatherState,
    fetchWeatherData,
    toggleWeatherEffect,
    changeWeatherLocation,
  };
}