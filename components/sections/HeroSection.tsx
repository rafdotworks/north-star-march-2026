"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavigationReveal } from "@/components/animations/LoadingAnimations";
import { getWeatherIcon } from "@/utils/weatherUtils";

interface WeatherState {
  temperature: number | null;
  condition: string | null;
  isLoading: boolean;
  location: string;
  customLocation: boolean;
}

interface HeroSectionProps {
  mounted: boolean;
  weatherState: WeatherState;
  formatTime: () => string;
  getTimeDifference: (isMobile?: boolean) => string;
  toggleWeatherEffect: (e: React.MouseEvent) => void;
  navigationLoaded: boolean;
}

export function HeroSection({
  mounted,
  weatherState,
  formatTime,
  getTimeDifference,
  toggleWeatherEffect,
  navigationLoaded,
}: HeroSectionProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center mb-40 relative">
        <div className="flex items-center justify-between w-full relative">
          <h1 className="text-2xl font-normal text-foreground relative z-10 font-edu-marist">
            Raf
          </h1>

          {/* Enhanced Desktop Navigation with Weather */}
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
                        {weatherState.customLocation &&
                          `(${weatherState.location})`}
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

          {/* Enhanced Mobile Navigation */}
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
                        {weatherState.customLocation &&
                          `(${weatherState.location})`}
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
        </div>
      </div>

      {/* Mobile Text Animation Section */}
      <div className="w-full mb-36 block sm:hidden">
        <div className="space-y-8">
          <section className="w-full">
            <div className="space-y-8">
              <div className="space-y-6">
                <motion.p
                  className="tracking-tight text-lg"
                  initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.12, 1, 0.28, 1],
                  }}
                >
                  <motion.span
                    className="text-foreground/70"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    Raf leads as a{" "}
                  </motion.span>
                  <motion.span
                    className="text-foreground font-medium"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    Senior Designer
                  </motion.span>
                  <motion.span
                    className="text-foreground/70"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    {" "}
                    and{" "}
                  </motion.span>
                  <motion.span
                    className="text-foreground font-medium"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    Design Engineer
                  </motion.span>
                  <motion.span
                    className="text-foreground/70"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    .
                  </motion.span>
                  <div className="h-4"></div>
                  <motion.span
                    className="text-foreground/70"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    Now building in stealth in Toronto
                  </motion.span>
                  <br />
                  <motion.span
                    className="text-foreground/70"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    Past at Coinbase, VoiceFlow, Theoriq & more
                  </motion.span>
                  <div className="h-4"></div>
                  <motion.span
                    className="text-foreground/70"
                    initial={{
                      opacity: 0,
                      filter: "blur(20px)",
                      y: 20,
                    }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    <a
                      href="https://www.linkedin.com/in/raffaelevitaledesign"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      Text anytime
                    </a>
                  </motion.span>
                </motion.p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
