"use client";

import { useEffect } from "react";
import { initConsoleEasterEgg } from "../../utils/consoleEasterEgg";

export const ConsoleEasterEgg = () => {
  useEffect(() => {
    let hasTriggered = false;

    // Function to detect if dev tools are opened
    const detectDevTools = () => {
      if (hasTriggered) return;

      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        hasTriggered = true;
        initConsoleEasterEgg();
      }
    };

    // Check on mount and resize with debouncing
    detectDevTools();
    const debouncedDetect = debounce(detectDevTools, 100);
    window.addEventListener("resize", debouncedDetect);

    return () => {
      window.removeEventListener("resize", debouncedDetect);
    };
  }, []);

  // Simple debounce function
  const debounce = <T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  return null;
};
