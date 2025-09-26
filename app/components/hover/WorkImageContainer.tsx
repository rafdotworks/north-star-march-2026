"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { WorkImageHover } from "./WorkImageHover";
import { VideoPlayButton } from "./VideoPlayButton";

interface WorkImageContainerProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  hasVideo?: boolean;
  onVideoClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onLoad?: () => void;
  className?: string;
  variant?: "mobile" | "desktop";
  // Image optimization props
  priority?: boolean;
  loading?: "eager" | "lazy";
  quality?: number;
  sizes?: string;
  placeholder?: "blur";
  blurDataURL?: string;
  // Loading state
  isLoaded?: boolean;
}

/**
 * Localized work image container component
 * Combines image display with hover effects and video interactions
 */
export const WorkImageContainer: React.FC<WorkImageContainerProps> = ({
  src,
  alt,
  width,
  height,
  hasVideo = false,
  onVideoClick,
  onMouseEnter,
  onMouseLeave,
  onLoad,
  className = "",
  variant = "desktop",
  priority = false,
  loading = "lazy",
  quality = 85,
  sizes = "100vw",
  placeholder,
  blurDataURL,
  isLoaded = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverEasingMotion = [0.22, 1, 0.36, 1] as const;
  const hoverEasingCss = "cubic-bezier(0.22, 1, 0.36, 1)";

  const hoverScale = hasVideo
    ? variant === "desktop"
      ? 0.986
      : 0.992
    : variant === "desktop"
    ? 1.01
    : 1.008;
  const hoverFilter = hasVideo
    ? variant === "desktop"
      ? "brightness(0.9) saturate(0.88)"
      : "brightness(0.94) saturate(0.92)"
    : variant === "desktop"
    ? "brightness(1.04) saturate(1.04)"
    : "brightness(1.03) saturate(1.02)";

  const filterSegments = [
    !isLoaded ? "blur(20px)" : "",
    isLoaded && isHovered ? hoverFilter : "",
  ].filter(Boolean);

  const transformValue = isHovered ? `scale(${hoverScale})` : "scale(1)";
  const filterValue = filterSegments.join(" ") || "none";
  const transitionDuration = variant === "desktop" ? 0.75 : 0.65;
  const transitionValue = `transform ${transitionDuration}s ${hoverEasingCss}, filter ${transitionDuration}s ${hoverEasingCss}, opacity 0.6s ${hoverEasingCss}`;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };
  // Localized image styling based on variant
  const imageClasses =
    variant === "mobile"
      ? `w-full object-contain bg-transparent max-w-full`
      : `w-full h-full object-contain bg-transparent max-w-full`;

  const imageStyle =
    variant === "desktop"
      ? {
          objectPosition: "center center",
          display: "block",
          width: "100%",
          height: "100%",
          filter: filterValue,
          opacity: !isLoaded ? 0.5 : 1,
          transform: transformValue,
          transition: transitionValue,
        }
      : {
          width: "100%",
          height: "auto",
          filter: filterValue,
          opacity: !isLoaded ? 0.5 : 1,
          transform: transformValue,
          transition: transitionValue,
        };

  const overlayVariants = hasVideo
    ? {
        rest: {
          opacity: 0,
          scale: 0.97,
          transition: { duration: 0.55, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 0.32,
          scale: 1,
          transition: { duration: 0.55, ease: hoverEasingMotion },
        },
      }
    : {
        rest: {
          opacity: 0,
          scale: 0.97,
          transition: { duration: 0.45, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 0.16,
          scale: 1,
          transition: { duration: 0.45, ease: hoverEasingMotion },
        },
      };

  const overlayBackgroundClass = hasVideo
    ? "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.25)_100%)]"
    : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0)_80%)]";

  return (
    <WorkImageHover
      hasVideo={hasVideo}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={hasVideo ? onVideoClick : undefined}
      variant={variant}
      className={className}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imageClasses}
        style={imageStyle}
        onLoad={onLoad}
        loading={loading}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        quality={quality}
      />
      <motion.div
        className={`pointer-events-none absolute inset-0 ${overlayBackgroundClass}`}
        variants={overlayVariants}
        initial="rest"
        animate={isHovered ? "hover" : "rest"}
      />
      {hasVideo && <VideoPlayButton onClick={onVideoClick} />}
    </WorkImageHover>
  );
};
