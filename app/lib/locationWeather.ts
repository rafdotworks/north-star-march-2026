interface BaseLocationWeatherMessage {
  city: string
  temperature: string
  description: string
}

interface RafTimezoneMessage extends BaseLocationWeatherMessage {
  timezoneDiff: string
}

function formatWeatherSummary({
  temperature,
  description,
}: Pick<BaseLocationWeatherMessage, "temperature" | "description">) {
  return temperature
    ? ` where it's ${temperature}${description ? ` and ${description}` : ""}`
    : ""
}

export function formatLocationWeatherMessage({
  city,
  temperature,
  description,
}: BaseLocationWeatherMessage) {
  return `Currently in ${city}${formatWeatherSummary({ temperature, description })}`
}

export function formatRafTimezoneMessage({
  city,
  timezoneDiff,
  temperature,
  description,
}: RafTimezoneMessage) {
  return `Raf is currently in ${city} (${timezoneDiff})${formatWeatherSummary({ temperature, description })}`
}

export function getLocationWeatherTokens({
  temperature,
  description,
}: Pick<BaseLocationWeatherMessage, "temperature" | "description">) {
  return [temperature, description].filter(Boolean)
}
