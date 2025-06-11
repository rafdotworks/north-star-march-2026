export async function fetchWeatherData(location: string = "Lisbon") {
  const cityCoordinates = {
    Lisbon: { lat: 38.72, lon: -9.14 },
    Naples: { lat: 40.85, lon: 14.27 },
    Toronto: { lat: 43.65, lon: -79.38 },
    "San Francisco": { lat: 37.77, lon: -122.42 },
    "New York": { lat: 40.71, lon: -74.01 },
    London: { lat: 51.51, lon: -0.13 },
    Paris: { lat: 48.85, lon: 2.35 },
    Tokyo: { lat: 35.68, lon: 139.77 },
    Sydney: { lat: -33.87, lon: 151.21 },
    Berlin: { lat: 52.52, lon: 13.41 },
  };

  const coordinates =
    cityCoordinates[location as keyof typeof cityCoordinates] ||
    cityCoordinates.Lisbon;

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
}
