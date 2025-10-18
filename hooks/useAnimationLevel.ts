"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type AnimationLevel = 0 | 1 | 2 | 3;

function getHardwareHints(): { deviceMemory?: number; cores?: number } {
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
}

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";
  return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

export function useAnimationLevel(override?: AnimationLevel): AnimationLevel {
  const prefersReduced = useReducedMotion();
  const [level, setLevel] = useState<AnimationLevel>(0);

  const computed = useMemo<AnimationLevel>(() => {
    if (typeof override === "number") return override;
    if (prefersReduced) return 0;

    const { deviceMemory, cores } = getHardwareHints();
    const mobile = isMobileUA();

    // Heuristic mapping
    if (
      mobile ||
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

  useEffect(() => setLevel(computed), [computed]);

  return level;
}

export default useAnimationLevel;
