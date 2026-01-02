/**
 * ============================================================================
 * LOADING SEQUENCE HOOK - hooks/useLoadingSequence.ts
 * ============================================================================
 *
 * Adaptive loading system that adjusts animation timing based on:
 * - Network connection speed (fast/medium/slow)
 * - Actual resource load times
 * - Progressive content reveal strategy
 *
 * LOADING STAGES:
 * 1. Text (0.3-1.0s): Hero text and typography
 * 2. Images (1.5-3.0s): Critical images load
 * 3. Navigation (3.2s+): Full UI ready
 * 4. All loaded: Complete experience
 *
 * Used by: app/page.tsx for orchestrating page reveal sequence
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { LOADING_SEQUENCE } from "@/components/animations/LoadingAnimations";

/** Return type for useLoadingSequence hook */
export interface LoadingSequenceState {
  textLoaded: boolean; // Stage 1: Text content ready
  imagesLoaded: boolean; // Stage 2: Images ready
  navigationLoaded: boolean; // Stage 3: Navigation ready
  allLoaded: boolean; // Stage 4: Complete
  loadingProgress: number; // 0-1 progress value
  estimatedTimeRemaining: number; // Milliseconds remaining
  isAdaptive: boolean; // True if using adaptive timing
}

/** Internal metrics for adaptive timing calculations */
export interface LoadingMetrics {
  startTime: number; // Sequence start timestamp
  textStartTime: number; // Text stage start
  imagesStartTime: number; // Images stage start
  navigationStartTime: number; // Navigation stage start
  actualLoadTimes: {
    text: number | null; // Actual text load duration (ms)
    images: number | null; // Actual images load duration (ms)
    navigation: number | null; // Actual navigation load duration (ms)
  };
  connectionQuality: "fast" | "medium" | "slow"; // Detected connection speed
}

/**
 * Main loading sequence hook with adaptive timing
 * Detects connection speed and adjusts load delays accordingly
 */
export function useLoadingSequence() {
  const [loadingState, setLoadingState] = useState<LoadingSequenceState>({
    textLoaded: false,
    imagesLoaded: false,
    navigationLoaded: false,
    allLoaded: false,
    loadingProgress: 0,
    estimatedTimeRemaining: 0,
    isAdaptive: false,
  });

  const metricsRef = useRef<LoadingMetrics>({
    startTime: Date.now(),
    textStartTime: 0,
    imagesStartTime: 0,
    navigationStartTime: 0,
    actualLoadTimes: {
      text: null,
      images: null,
      navigation: null,
    },
    connectionQuality: "medium",
  });

  // Detect connection quality
  const detectConnectionQuality = useCallback(() => {
    if (typeof window !== "undefined" && "connection" in navigator) {
      // Network Information API is non-standard (Chrome/Edge only) and not in TypeScript types
      // Using 'as any' because proper TypeScript interface isn't available in lib.dom.d.ts
      // Falls back gracefully when API isn't supported
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType || "unknown";
      const downlink = connection.downlink || 0;

      if (
        effectiveType === "slow-2g" ||
        effectiveType === "2g" ||
        downlink < 0.5
      ) {
        return "slow";
      } else if (effectiveType === "3g" || downlink < 1.5) {
        return "medium";
      } else {
        return "fast";
      }
    }
    return "medium";
  }, []);

  // Calculate adaptive timing based on connection and actual load times
  const calculateAdaptiveTiming = useCallback(() => {
    const metrics = metricsRef.current;
    const baseTiming = {
      text: 0.3,
      images: 1.5,
      navigation: 3.2,
    };

    // Adjust based on connection quality
    const connectionMultiplier = {
      fast: 0.8,
      medium: 1.0,
      slow: 1.4,
    }[metrics.connectionQuality];

    // If we have actual load times, use them to predict future timing
    if (metrics.actualLoadTimes.text) {
      const textLoadTime = metrics.actualLoadTimes.text;
      const adjustedTextDelay = Math.max(
        0.2,
        Math.min(1.0, textLoadTime / 1000)
      );
      baseTiming.text = adjustedTextDelay;
    }

    if (metrics.actualLoadTimes.images) {
      const imagesLoadTime = metrics.actualLoadTimes.images;
      const adjustedImagesDelay = Math.max(
        1.0,
        Math.min(3.0, imagesLoadTime / 1000)
      );
      baseTiming.images = adjustedImagesDelay;
    }

    return {
      text: baseTiming.text * connectionMultiplier,
      images: baseTiming.images * connectionMultiplier,
      navigation: baseTiming.navigation * connectionMultiplier,
    };
  }, []);

  // Update loading progress
  const updateLoadingProgress = useCallback(() => {
    const metrics = metricsRef.current;
    const elapsed = Date.now() - metrics.startTime;
    const totalEstimated = 4000; // Base estimate of 4 seconds
    const progress = Math.min(0.95, elapsed / totalEstimated);

    setLoadingState((prev) => ({
      ...prev,
      loadingProgress: progress,
      estimatedTimeRemaining: Math.max(0, totalEstimated - elapsed),
    }));
  }, []);

  useEffect(() => {
    metricsRef.current.connectionQuality = detectConnectionQuality();
    metricsRef.current.startTime = Date.now();

    // Start progress updates (250ms is sufficient for visual smoothness)
    const progressInterval = setInterval(updateLoadingProgress, 250);

    // Calculate adaptive timing
    const adaptiveTiming = calculateAdaptiveTiming();

    // Text loads first with adaptive timing
    metricsRef.current.textStartTime = Date.now();
    const textTimer = setTimeout(() => {
      metricsRef.current.actualLoadTimes.text =
        Date.now() - metricsRef.current.textStartTime;
      setLoadingState((prev) => ({
        ...prev,
        textLoaded: true,
        isAdaptive: true,
      }));
    }, adaptiveTiming.text * 1000);

    // Images load after text with adaptive timing
    metricsRef.current.imagesStartTime = Date.now();
    const imagesTimer = setTimeout(() => {
      metricsRef.current.actualLoadTimes.images =
        Date.now() - metricsRef.current.imagesStartTime;
      setLoadingState((prev) => ({ ...prev, imagesLoaded: true }));
    }, adaptiveTiming.images * 1000);

    // Navigation loads last with adaptive timing
    metricsRef.current.navigationStartTime = Date.now();
    const navTimer = setTimeout(() => {
      metricsRef.current.actualLoadTimes.navigation =
        Date.now() - metricsRef.current.navigationStartTime;
      setLoadingState((prev) => ({ ...prev, navigationLoaded: true }));
    }, adaptiveTiming.navigation * 1000);

    // All loaded - ensure minimum loading time for smooth experience
    const minLoadingTime = 2500; // Minimum 2.5 seconds for smooth experience
    const allLoadedTimer = setTimeout(() => {
      setLoadingState((prev) => ({
        ...prev,
        allLoaded: true,
        loadingProgress: 1,
        estimatedTimeRemaining: 0,
      }));
    }, Math.max(minLoadingTime, adaptiveTiming.navigation * 1000 + 500));

    return () => {
      clearTimeout(textTimer);
      clearTimeout(imagesTimer);
      clearTimeout(navTimer);
      clearTimeout(allLoadedTimer);
      clearInterval(progressInterval);
    };
  }, [detectConnectionQuality, calculateAdaptiveTiming, updateLoadingProgress]);

  return loadingState;
}

// Hook for managing individual element loading states
export function useElementLoading(delay: number = 0) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  return isLoaded;
}

// Hook for staggered loading of multiple elements
export function useStaggeredLoading(
  count: number,
  baseDelay: number = 0,
  staggerDelay: number = LOADING_SEQUENCE.STAGGER_DELAY
) {
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        // More efficient Set update - avoid spreading into array
        setLoadedIndices((prev) => {
          const newSet = new Set(prev);
          newSet.add(i);
          return newSet;
        });
      }, (baseDelay + i * staggerDelay) * 1000);

      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [count, baseDelay, staggerDelay]);

  return loadedIndices;
}
