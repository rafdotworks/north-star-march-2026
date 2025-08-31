import { useState, useEffect } from "react";
import { LOADING_SEQUENCE } from "@/components/animations/LoadingAnimations";

export interface LoadingSequenceState {
  textLoaded: boolean;
  imagesLoaded: boolean;
  navigationLoaded: boolean;
  allLoaded: boolean;
}

export function useLoadingSequence() {
  const [loadingState, setLoadingState] = useState<LoadingSequenceState>({
    textLoaded: false,
    imagesLoaded: false,
    navigationLoaded: false,
    allLoaded: false,
  });

  useEffect(() => {
    // Images load first (work carousel priority)
    const imagesTimer = setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, imagesLoaded: true }));
    }, LOADING_SEQUENCE.IMAGES_DELAY * 1000);

    // Text loads after images
    const textTimer = setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, textLoaded: true }));
    }, LOADING_SEQUENCE.TEXT_DELAY * 1000);

    // Navigation loads last
    const navTimer = setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, navigationLoaded: true }));
    }, LOADING_SEQUENCE.NAV_DELAY * 1000);

    // All loaded
    const allLoadedTimer = setTimeout(() => {
      setLoadingState((prev) => ({ ...prev, allLoaded: true }));
    }, (LOADING_SEQUENCE.NAV_DELAY + 0.5) * 1000);

    return () => {
      clearTimeout(imagesTimer);
      clearTimeout(textTimer);
      clearTimeout(navTimer);
      clearTimeout(allLoadedTimer);
    };
  }, []);

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
        setLoadedIndices((prev) => new Set([...prev, i]));
      }, (baseDelay + i * staggerDelay) * 1000);

      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [count, baseDelay, staggerDelay]);

  return loadedIndices;
}
