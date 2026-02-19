"use client";

/**
 * ============================================================================
 * WORK IMAGE CONTAINER - app/components/hover/WorkImageContainer.tsx
 * ============================================================================
 *
 * Main container for work portfolio images with sophisticated hover effects.
 *
 * FEATURES:
 * - Responsive hover animations (scale, brightness, saturation)
 * - Mobile vs desktop variants with different interaction patterns
 * - Video preview integration with play button
 * - Next.js Image optimization (lazy loading, blur placeholders)
 * - Loading state transitions
 *
 * HOVER BEHAVIOR:
 * - With video: Scales down, darkens (invites click to play)
 * - Without video: Scales up, brightens (showcases work)
 *
 * Used by: app/page.tsx for all work showcase images
 */

import React, { useState } from "react";
import { PictureImage } from "../media/PictureImage";
import { motion } from "framer-motion";
import { ImageProtectionWrapper } from "../media/ImageProtectionWrapper";
import { WorkImageHover } from "./WorkImageHover";
import { VideoPlayButton } from "./VideoPlayButton";
import { VimeoInlineEmbed } from "../media/VimeoInlineEmbed";

/** Helper function to detect if src is a Vimeo URL */
const isVimeoUrl = (src: string): boolean => {
  return src.includes("vimeo.com") || src.includes("player.vimeo.com");
};

/** Props for WorkImageContainer component */
interface WorkImageContainerProps {
  src: string; // Image source path
  alt: string; // Accessibility description
  width: number; // Natural image width
  height: number; // Natural image height
  hasVideo?: boolean; // Whether image has associated video
  onVideoClick?: () => void; // Video play handler
  onMouseEnter?: () => void; // Mouse enter handler (pauses slideshow)
  onMouseLeave?: () => void; // Mouse leave handler (resumes slideshow)
  onLoad?: () => void; // Image load completion handler
  className?: string; // Additional CSS classes
  variant?: "mobile" | "desktop"; // Responsive variant
  // Next.js Image optimization props
  priority?: boolean; // Load eagerly (critical images)
  loading?: "eager" | "lazy"; // Loading strategy
  quality?: number; // Image quality (1-100)
  sizes?: string; // Responsive sizes attribute
  placeholder?: "blur"; // Blur-up placeholder
  blurDataURL?: string; // Blur placeholder data URL
  // Loading state
  isLoaded?: boolean; // Image loaded status
}

/**
 * Work image container with localized hover effects and video integration
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
  // ========================================================================
  // STATE & CONSTANTS
  // ========================================================================

  const [isHovered, setIsHovered] = useState(false);

  /** Easing curve for smooth hover transitions */
  const hoverEasingMotion = [0.22, 1, 0.36, 1] as const;
  const hoverEasingCss = "cubic-bezier(0.22, 1, 0.36, 1)";

  // ========================================================================
  // HOVER EFFECT CALCULATIONS
  // ========================================================================

  /**
   * Scale on hover - different for video vs non-video images
   * Video: Scale down (0.986/0.992) - invites interaction
   * No video: Scale up (1.01/1.008) - showcases detail
   */
  const hoverScale = hasVideo
    ? variant === "desktop"
      ? 0.986 // Desktop with video: subtle scale down
      : 0.992 // Mobile with video: very subtle scale down
    : variant === "desktop"
    ? 1.01 // Desktop no video: subtle scale up
    : 1.008; // Mobile no video: very subtle scale up

  /**
   * Filter effects on hover
   * Video: Darken/desaturate - suggests interactivity
   * No video: Brighten/saturate - enhances appearance
   */
  const hoverFilter = hasVideo
    ? variant === "desktop"
      ? "brightness(0.9) saturate(0.88)" // Desktop: more dramatic darkening
      : "brightness(0.94) saturate(0.92)" // Mobile: subtle darkening
    : variant === "desktop"
    ? "brightness(1.04) saturate(1.04)" // Desktop: subtle brightening
    : "brightness(1.03) saturate(1.02)"; // Mobile: very subtle brightening

  /**
   * Combined filter segments (loading blur + hover effects)
   * Only applies hover filter when image is loaded
   */
  const filterSegments = [
    !isLoaded ? "blur(20px)" : "", // Loading state blur
    isLoaded && isHovered ? hoverFilter : "", // Hover effect filter
  ].filter(Boolean);

  /** Final computed values for image styling */
  const transformValue = isHovered ? `scale(${hoverScale})` : "scale(1)";
  const filterValue = filterSegments.join(" ") || "none";
  const transitionDuration = variant === "desktop" ? 0.75 : 0.65; // Desktop slightly longer
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
      ? `w-full max-h-full object-contain bg-transparent max-w-full`
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
          cursor: hasVideo ? "pointer" : undefined,
        }
      : {
          width: "100%",
          height: "auto",
          filter: filterValue,
          opacity: !isLoaded ? 0.5 : 1,
          transform: transformValue,
          transition: transitionValue,
          cursor: hasVideo ? "pointer" : undefined,
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

  // Check if src is a Vimeo URL for inline embed
  const isInlineVimeo = isVimeoUrl(src);

  return (
    <WorkImageHover
      hasVideo={hasVideo && !isInlineVimeo} // Don't show play button for inline videos
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={hasVideo && !isInlineVimeo ? onVideoClick : undefined}
      variant={variant}
      className={className}
    >
      {isInlineVimeo ? (
        <VimeoInlineEmbed videoUrl={src} className="w-full h-full" />
      ) : (
        <ImageProtectionWrapper className="relative w-full h-full">
          <PictureImage
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
            draggable={false}
          />
        </ImageProtectionWrapper>
      )}
      {!isInlineVimeo && (
        <motion.div
          className={`pointer-events-none absolute inset-0 ${overlayBackgroundClass}`}
          variants={overlayVariants}
          initial="rest"
          animate={isHovered ? "hover" : "rest"}
        />
      )}
      {hasVideo && !isInlineVimeo && <VideoPlayButton onClick={onVideoClick} />}
    </WorkImageHover>
  );
};
