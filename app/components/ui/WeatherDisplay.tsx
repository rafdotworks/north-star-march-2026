"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavigationReveal } from "@/components/animations/LoadingAnimations";

interface WeatherDisplayProps {
  weatherState: {
    temperature: number | null;
    condition: string | null;
    isLoading: boolean;
    location: string;
    customLocation: boolean;
  };
  toggleWeatherEffect: (e: React.MouseEvent) => void;
  getTimeDifference: (isMobile: boolean) => string;
  getWeatherIcon: (condition: string | null) => JSX.Element | null;
  mounted: boolean;
  navigationLoaded: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weatherState,
  toggleWeatherEffect,
  getTimeDifference,
  getWeatherIcon,
  mounted,
  navigationLoaded,
}) => {
  return (
    <>
      {/* Desktop Weather Display */}
      {navigationLoaded && (
        <NavigationReveal className="text-sm text-foreground/60 font-light max-w-[320px] text-right hidden md:block">
          <div className="flex items-center justify-end space-x-2">
            <span className="min-h-[1.5rem] flex items-center">
              {mounted ? getTimeDifference(false) : ""}
            </span>
            {weatherState.temperature !== null && (
              <>
                <span className="opacity-30 flex items-center">|</span>
                <div
                  className="cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center"
                  onClick={toggleWeatherEffect}
                  title={`${weatherState.location} weather - click to see effect`}
                >
                  <span className="flex items-center justify-center">
                    {weatherState.temperature}°C{" "}
                    {weatherState.customLocation && `(${weatherState.location})`}
                  </span>
                  {weatherState.condition && (
                    <span className="ml-1 text-xs flex items-center justify-center">
                      {getWeatherIcon(weatherState.condition)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {weatherState.isLoading && (
            <p className="text-[10px] opacity-50 mt-1">
              Loading {weatherState.location} weather...
            </p>
          )}
        </NavigationReveal>
      )}

      {/* Mobile Weather Display */}
      {navigationLoaded && (
        <NavigationReveal
          delay={0.2}
          className="text-sm text-foreground/60 font-light md:hidden flex items-center"
        >
          <motion.div
            className="backdrop-blur-sm bg-background/5 px-3 py-1.5 rounded-full border border-foreground/5 flex items-center space-x-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 2.8,
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            <span className="min-h-[1.25rem] flex items-center">
              {mounted ? getTimeDifference(true) : ""}
            </span>

            {weatherState.temperature !== null && (
              <>
                <span className="opacity-30 flex items-center">•</span>
                <div
                  className="cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center"
                  onClick={toggleWeatherEffect}
                  title={`${weatherState.location} weather - click to see effect`}
                >
                  <span className="flex items-center justify-center">
                    {weatherState.temperature}°C{" "}
                    {weatherState.customLocation && `(${weatherState.location})`}
                  </span>
                  {weatherState.condition && (
                    <span className="ml-1 text-xs flex items-center justify-center">
                      {getWeatherIcon(weatherState.condition)}
                    </span>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </NavigationReveal>
      )}
    </>
  );
};
