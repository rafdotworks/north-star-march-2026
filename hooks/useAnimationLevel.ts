"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export type AnimationLevel = 0 | 1 | 2 | 3;

// Cache hardware hints at module level (doesn't change during session)
const HARDWARE_HINTS: { deviceMemory?: number; cores?: number } = (() => {
  if (typeof navigator === "undefined") return {};
  const anyNav = navigator as unknown as {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  return {
    deviceMemory:
      typeof anyNav.deviceMemory === "number" ? anyNav.deviceMemory : undefined,
    cores:
      typeof anyNav.hardwareConcurrency === "number"
        ? anyNav.hardwareConcurrency
        : undefined,
  };
})();

// Cache mobile UA detection at module level (doesn't change during session)
const IS_MOBILE_UA: boolean = (() => {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua =
    navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
  return /android|iphone|ipad|ipod|mobile/i.test(ua);
})();

export function useAnimationLevel(override?: AnimationLevel): AnimationLevel {
  const prefersReduced = useReducedMotion();

  // Return memoized value directly - no need for useState + useEffect
  return useMemo<AnimationLevel>(() => {
    if (typeof override === "number") return override;
    if (prefersReduced) return 0;

    const { deviceMemory, cores } = HARDWARE_HINTS;

    // Heuristic mapping
    if (
      IS_MOBILE_UA ||
      (deviceMemory !== undefined && deviceMemory <= 4) ||
      (cores !== undefined && cores <= 4)
    ) {
      return 1;
    }
    if (
      deviceMemory !== undefined &&
      deviceMemory >= 8 &&
      cores !== undefined &&
      cores >= 8
    ) {
      return 3;
    }
    return 2;
  }, [override, prefersReduced]);
}

export default useAnimationLevel;
