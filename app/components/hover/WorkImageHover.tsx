"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASING } from "@/components/animations/LoadingAnimations";

interface WorkImageHoverProps {
  children: React.ReactNode;
  hasVideo?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  className?: string;
  variant?: "mobile" | "desktop";
}

/**
 * Localized hover effect component for work images
 * Provides consistent hover animations and interactions
 */
export const WorkImageHover: React.FC<WorkImageHoverProps> = ({
  children,
  hasVideo = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className = "",
  variant = "desktop",
}) => {
  // Localized hover configurations based on variant.
  // Using EASING.primary ([0.12, 1, 0.28, 1]) — expressive deceleration for lift effect.
  // The transition prop inside whileHover/whileTap governs FM-controlled properties (scale, y).
  // Shadow transition is handled separately by Tailwind's transition-shadow class.
  const hoverConfig = {
    mobile: {
      scale: 1.005,
      y: -1,
      transition: {
        duration: 0.8,
        ease: EASING.primary,
      },
    },
    desktop: {
      scale: 1.003,
      y: -1,
      transition: {
        duration: 0.9,
        ease: EASING.primary,
      },
    },
  };

  const tapConfig = {
    mobile: {
      scale: 0.998,
      transition: {
        duration: 0.2,
        ease: EASING.primary,
      },
    },
    desktop: {
      scale: 0.999,
      transition: {
        duration: 0.2,
        ease: EASING.primary,
      },
    },
  };

  const shadowClasses =
    variant === "mobile"
      ? "transition-shadow duration-800 hover:shadow-[0_18px_40px_rgba(15,15,15,0.16)]"
      : "transition-shadow duration-900 hover:shadow-[0_22px_55px_rgba(15,15,15,0.18)]";

  const baseClasses =
    variant === "mobile"
      ? "group relative w-full overflow-hidden"
      : "group relative flex h-full w-full items-center justify-center overflow-hidden";

  return (
    <motion.div
      className={`${baseClasses} ${
        hasVideo ? "cursor-pointer" : ""
      } ${shadowClasses} ${className}`}
      onClick={hasVideo ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={hoverConfig[variant]}
      whileTap={tapConfig[variant]}
      style={{
        // height only — FM manages scale/y/transition; no raw CSS transition override
        height: variant === "desktop" ? "100%" : undefined,
        cursor: hasVideo ? "pointer" : undefined,
      }}
    >
      {children}
    </motion.div>
  );
};
