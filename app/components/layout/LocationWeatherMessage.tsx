import {
  formatLocationWeatherMessage,
  getLocationWeatherTokens,
} from "@/app/lib/locationWeather"

interface LocationWeatherMessageProps {
  city: string
  temperature: string
  description: string
  variant?: "sentence" | "tokens"
  tokenLayout?: "responsive" | "inline"
  className?: string
}

export default function LocationWeatherMessage({
  city,
  temperature,
  description,
  variant = "sentence",
  tokenLayout = "responsive",
  className,
}: LocationWeatherMessageProps) {
  if (variant === "tokens") {
    const weatherTokens = getLocationWeatherTokens({ temperature, description })
    const isInlineLayout = tokenLayout === "inline"

    return (
      <p
        className={`min-h-5 text-xs leading-[1.55] text-[var(--fg-muted)] md:text-sm${className ? ` ${className}` : ""}`}
        aria-label={formatLocationWeatherMessage({ city, temperature, description })}
      >
        <span
          className={
            isInlineLayout
              ? "inline-flex max-w-full items-center gap-x-1.5 whitespace-nowrap tabular-nums"
              : "flex flex-col gap-y-0.5 tabular-nums md:inline-flex md:flex-row md:flex-wrap md:items-center md:gap-x-1.5"
          }
        >
          <span className="whitespace-nowrap">{city}</span>
          {weatherTokens.length > 0 ? (
              <span
                className={
                  isInlineLayout
                    ? "inline-flex min-w-0 items-center gap-x-1.5 whitespace-nowrap"
                    : "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5"
                }
              >
              <span aria-hidden="true" className={isInlineLayout ? "inline" : "hidden md:inline"}>
                ·
              </span>
              {weatherTokens.map((token, index) => (
                <span
                  key={`${token}-${index}`}
                  className={
                    isInlineLayout
                      ? "inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap"
                      : "inline-flex items-center gap-1.5 whitespace-nowrap"
                  }
                >
                  {index > 0 ? (
                    <span aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <span className={isInlineLayout ? "min-w-0 truncate" : undefined}>{token}</span>
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </p>
    )
  }

  return (
    <p
      className={`min-h-5 text-[11px] font-[family-name:var(--font-mono)] leading-[1.45] text-[var(--fg)] opacity-[0.44] md:text-xs${className ? ` ${className}` : ""}`}
    >
      {formatLocationWeatherMessage({ city, temperature, description })}
    </p>
  )
}
