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
      ? "hover:shadow-md hover:shadow-black/3 transition-shadow duration-800"
      : "hover:shadow-lg hover:shadow-black/4 transition-shadow duration-900";

  const transitionStyle =
    variant === "mobile"
      ? "all 0.8s cubic-bezier(0.12, 1, 0.25, 1)"
      : "all 0.9s cubic-bezier(0.12, 1, 0.25, 1)";

  return (
    <motion.div
      className={`relative w-full overflow-hidden ${
        hasVideo ? "cursor-pointer group" : ""
      } ${shadowClasses} ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={hoverConfig[variant]}
      whileTap={tapConfig[variant]}
      style={{
        transition: transitionStyle,
      }}
    >
      {children}
    </motion.div>
  );
};
