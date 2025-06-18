"use client";

import { useEffect } from "react";
import { initConsoleEasterEgg } from "../utils/consoleEasterEgg";

export const ConsoleEasterEgg = () => {
  useEffect(() => {
    // Function to detect if dev tools are opened
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        initConsoleEasterEgg();
      }
    };

    // Check on mount and resize
    detectDevTools();
    window.addEventListener("resize", detectDevTools);

    return () => {
      window.removeEventListener("resize", detectDevTools);
    };
  }, []);

  return null;
};
