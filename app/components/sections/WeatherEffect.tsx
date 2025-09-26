"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherEffectProps {
  showWeatherEffect: boolean;
  weatherState: {
    temperature: number | null;
    condition: string | null;
    location: string;
  };
  scrollY: number;
  getWeatherColor: () => string;
  getWeatherIcon: (condition: string | null) => JSX.Element | null;
  onClose: () => void;
}

export const WeatherEffect: React.FC<WeatherEffectProps> = ({
  showWeatherEffect,
  weatherState,
  scrollY,
  getWeatherColor,
  getWeatherIcon,
  onClose,
}) => {
  if (!showWeatherEffect) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: scrollY > 80 ? 0 : 1,
          y: 0,
          translateY: scrollY > 10 ? `-${Math.min(scrollY / 2, 50)}%` : 0,
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          opacity: { duration: 0.3 },
        }}
        className="fixed inset-x-0 top-0 pointer-events-auto z-50 overflow-hidden"
        style={{
          height: "auto",
        }}
      >
        {/* Weather banner */}
        <div
          className="w-full backdrop-blur-sm relative overflow-hidden"
          style={{
            background: `${getWeatherColor()}`,
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            animation: "weatherBannerGlow 3s infinite ease-in-out",
            transition:
              "background-color 0.6s ease-in-out, transform 0.6s ease-in-out",
          }}
          aria-live="polite"
          role="status"
        >
          <motion.main className="px-6 sm:px-10 md:px-28 relative overflow-x-hidden">
            <div className="w-full max-w-screen-xl mx-auto relative">
              <div className="md:grid md:grid-cols-[180px,minmax(0,1fr)] md:gap-20 w-full">
                <div className="hidden md:block" />
                <div className="flex items-center justify-between py-3 w-full">
                  <div className="flex items-center space-x-3">
                    {weatherState.condition && (
                      <motion.span
                        className="mr-2 text-xs flex items-center justify-center"
                        animate={{
                          rotate:
                            weatherState.condition === "Snow"
                              ? [0, 10, -10, 0]
                              : 0,
                          scale:
                            weatherState.condition === "Thunderstorm"
                              ? [1, 1.1, 1]
                              : 1,
                        }}
                        transition={{
                          duration:
                            weatherState.condition === "Snow" ? 4 : 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {getWeatherIcon(weatherState.condition)}
                      </motion.span>
                    )}
                    <motion.span
                      className="font-light text-xs flex items-center"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Raf is in {weatherState.location} - where it&apos;s{" "}
                      {weatherState.condition?.toLowerCase() || "clear"} and{" "}
                      {weatherState.temperature}°C
                    </motion.span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-foreground/60 hover:text-foreground/80 transition-colors relative z-10"
                    aria-label="Close weather banner"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.main>
        </div>

        {/* Background effect */}
        <div
          className="absolute w-full h-[300px] blur-[100px] -z-10"
          style={{
            background: getWeatherColor(),
            opacity: 0.6,
            top: "-150px",
          }}
        ></div>

        {/* Weather animations */}
        {(weatherState.condition === "Rain" ||
          weatherState.condition === "Drizzle") && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] h-[8px] bg-blue-200/40"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-8px`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`,
                  animationDelay: `${Math.random() * 0.3}s`,
                  animationIterationCount: "infinite",
                  animationName: "rainDrop",
                  animationTimingFunction: "ease-in-out",
                }}
              ></div>
            ))}
          </div>
        )}

        {weatherState.condition === "Snow" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/60"
                style={{
                  width: `${2 + Math.random() * 2}px`,
                  height: `${2 + Math.random() * 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-5px`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationIterationCount: "infinite",
                  animationName: "snowfall",
                  animationTimingFunction: "ease-in-out",
                }}
              ></div>
            ))}
          </div>
        )}

        {weatherState.condition === "Thunderstorm" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 bg-blue-900/10"
              style={{
                animationDuration: "4s",
                animationIterationCount: "infinite",
                animationName: "lightning",
                animationTimingFunction: "ease-out",
              }}
            ></div>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] h-[15px] bg-blue-200/40"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-15px`,
                  animationDuration: `${0.3 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationIterationCount: "infinite",
                  animationName: "rainDrop",
                  animationTimingFunction: "linear",
                }}
              ></div>
            ))}
          </div>
        )}

        {(weatherState.condition === "Fog" ||
          weatherState.condition === "Mist" ||
          weatherState.condition === "Haze") && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute h-[40px] w-full bg-gray-200/15 rounded-full blur-xl"
                style={{
                  top: `${5 + i * 12}px`,
                  left: `${i % 2 === 0 ? -10 : 10}%`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                  animationDelay: `${i * 1.5}s`,
                  animationIterationCount: "infinite",
                  animationName: "fogMove",
                  animationTimingFunction: "ease-in-out",
                  animationDirection: i % 2 === 0 ? "normal" : "reverse",
                }}
              ></div>
            ))}
          </div>
        )}

        {weatherState.condition === "Clear" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  background: "rgba(255, 200, 0, 0.2)",
                  width: `${30 + i * 10}px`,
                  height: `${30 + i * 10}px`,
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 5}px`,
                  filter: "blur(8px)",
                  opacity: 0.6 - i * 0.1,
                  transform: `scale(${1 + i * 0.1})`,
                  animation: `pulse ${3 + i}s infinite alternate ease-in-out`,
                }}
              ></div>
            ))}
          </div>
        )}

        {weatherState.condition === "Partly Cloudy" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute rounded-full"
              style={{
                background: "rgba(255, 200, 0, 0.2)",
                width: "50px",
                height: "50px",
                left: "30%",
                top: "15px",
                filter: "blur(8px)",
                opacity: 0.6,
                animation: "pulse 4s infinite alternate ease-in-out",
              }}
            ></div>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gray-200/30"
                style={{
                  width: `${40 + i * 15}px`,
                  height: `${20 + i * 8}px`,
                  left: `${40 + i * 15}%`,
                  top: `${15 + i * 5}px`,
                  filter: "blur(8px)",
                  opacity: 0.5 - i * 0.1,
                  animation: `fogMove ${10 + i * 5}s infinite alternate ease-in-out`,
                  animationDelay: `${i * 2}s`,
                }}
              ></div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
