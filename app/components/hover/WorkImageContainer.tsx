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
      ? 0.985
      : 0.99
    : variant === "desktop"
    ? 1.01
    : 1.012;
  const hoverFilter = hasVideo
    ? variant === "desktop"
      ? "brightness(0.88) saturate(0.82)"
      : "brightness(0.93) saturate(0.9)"
    : variant === "desktop"
    ? "brightness(1.06) saturate(1.05)"
    : "brightness(1.05) saturate(1.03)";

  const filterSegments = [
    !isLoaded ? "blur(20px)" : "",
    isLoaded && isHovered ? hoverFilter : "",
  ].filter(Boolean);

  const transformValue = isHovered ? `scale(${hoverScale})` : "scale(1)";
  const filterValue = filterSegments.join(" ") || "none";
  const transitionDuration = hasVideo
    ? variant === "desktop"
      ? 0.9
      : 0.8
    : variant === "desktop"
    ? 0.65
    : 0.55;
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
          scale: 0.96,
          transition: { duration: 0.6, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.6, ease: hoverEasingMotion },
        },
      }
    : {
        rest: {
          opacity: 0,
          scale: 0.94,
          transition: { duration: 0.45, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 0.85,
          scale: 1,
          transition: { duration: 0.6, ease: hoverEasingMotion },
        },
      };

  const glowVariants = hasVideo
    ? {
        rest: {
          opacity: 0,
          scale: 0.9,
          transition: { duration: 0.6, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 1,
          scale: 1.08,
          transition: { duration: 0.8, ease: hoverEasingMotion },
        },
      }
    : {
        rest: {
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.45, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 0.9,
          scale: 1.04,
          transition: { duration: 0.65, ease: hoverEasingMotion },
        },
      };

  const pauseBadgeVariants = hasVideo
    ? {
        rest: {
          opacity: 0,
          scale: 0.75,
          filter: "blur(6px)",
          transition: { duration: 0.45, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.6, ease: hoverEasingMotion },
        },
      }
    : {
        rest: {
          opacity: 0,
          scale: 0.8,
          filter: "blur(4px)",
          transition: { duration: 0.4, ease: hoverEasingMotion },
        },
        hover: {
          opacity: 0.9,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease: hoverEasingMotion },
        },
      };

  const overlayBackgroundClass = hasVideo
    ? "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,rgba(0,0,0,0.5)_65%,rgba(0,0,0,0.6)_100%)]"
    : "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.12)_55%,rgba(255,255,255,0)_90%)] mix-blend-screen";

  const pauseBadgeClass = hasVideo
    ? "relative flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-md shadow-xl ring-1 ring-white/30"
    : "relative flex h-14 w-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg shadow-black/10 ring-1 ring-black/10";

  const pauseBarClass = hasVideo
    ? "block h-6 w-1 rounded-full bg-white/92"
    : "block h-6 w-1 rounded-full bg-foreground/70";

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
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        variants={overlayVariants}
        initial="rest"
        animate={isHovered ? "hover" : "rest"}
      >
        <motion.div className={overlayBackgroundClass} variants={glowVariants} />
        <motion.div className={pauseBadgeClass} variants={pauseBadgeVariants}>
          <span className={`mr-1 ${pauseBarClass}`}></span>
          <span className={pauseBarClass}></span>
        </motion.div>
      </motion.div>
      {hasVideo && <VideoPlayButton onClick={onVideoClick} />}
    </WorkImageHover>
  );
};
