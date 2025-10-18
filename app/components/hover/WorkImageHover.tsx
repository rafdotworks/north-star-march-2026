"use client";

import React from "react";
import { motion } from "framer-motion";

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
  // Localized hover configurations based on variant
  const hoverConfig = {
    mobile: {
      scale: 1.005,
      y: -1,
      transition: {
        duration: 0.8,
        ease: [0.12, 1, 0.25, 1],
      },
    },
    desktop: {
      scale: 1.003,
      y: -1,
      transition: {
        duration: 0.9,
        ease: [0.12, 1, 0.25, 1],
      },
    },
  };

  const tapConfig = {
    mobile: {
      scale: 0.998,
      transition: {
        duration: 0.2,
        ease: [0.12, 1, 0.25, 1],
      },
    },
    desktop: {
      scale: 0.999,
      transition: {
        duration: 0.2,
        ease: [0.12, 1, 0.25, 1],
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

  const transitionStyle =
    variant === "mobile"
      ? "all 0.8s cubic-bezier(0.12, 1, 0.25, 1)"
      : "all 0.9s cubic-bezier(0.12, 1, 0.25, 1)";

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
        transition: transitionStyle,
        height: variant === "desktop" ? "100%" : undefined,
      }}
    >
      {children}
    </motion.div>
  );
};
