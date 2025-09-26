"use client";

import React from "react";
import Image from "next/image";
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
  // Localized image styling based on variant
  const imageClasses =
    variant === "mobile"
      ? `w-full object-contain bg-transparent max-w-full transition-all duration-800 ${
          hasVideo ? "group-hover:brightness-101" : ""
        }`
      : `w-full h-full object-contain bg-transparent max-w-full transition-all duration-900 ${
          hasVideo ? "group-hover:brightness-101 group-hover:contrast-101" : ""
        }`;

  const imageStyle =
    variant === "desktop"
      ? {
          objectPosition: "center center",
          display: "block",
          width: "100%",
          height: "100%",
          filter: !isLoaded ? "blur(20px)" : "none",
          opacity: !isLoaded ? 0.5 : 1,
          transition:
            "filter 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }
      : {
          width: "100%",
          height: "auto",
        };

  return (
    <WorkImageHover
      hasVideo={hasVideo}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
      {hasVideo && <VideoPlayButton onClick={onVideoClick} />}
    </WorkImageHover>
  );
};
