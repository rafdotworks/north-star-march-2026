"use client";

/**
 * ============================================================================
 * PICTURE IMAGE COMPONENT - app/components/PictureImage.tsx
 * ============================================================================
 *
 * Wrapper component that provides format fallback support using HTML <picture> element.
 * For WebP images, automatically provides GIF fallback for browser compatibility.
 * For other formats, uses Next.js Image component for optimization.
 *
 * FEATURES:
 * - Automatic WebP → GIF fallback using native <picture> element
 * - Maintains Next.js Image optimization for non-WebP images
 * - Preserves all Next.js Image props and behavior
 * - No JavaScript required for format selection (browser-native)
 */

import React from "react";
import Image from "next/image";
import { getImageFallback, needsFallback } from "@/app/utils/imageFallback";

/**
 * Props compatible with Next.js Image component
 */
interface PictureImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  draggable?: boolean;
}

/**
 * PictureImage Component
 *
 * Renders images with format fallback support. For WebP images, uses HTML
 * <picture> element with WebP and GIF sources. For other formats, uses
 * Next.js Image component directly.
 */
export const PictureImage: React.FC<PictureImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  style,
  loading = "lazy",
  priority = false,
  quality = 85,
  sizes,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  draggable,
  ...restProps
}) => {
  // Check if this image needs format fallback
  const fallback = getImageFallback(src);

  // If no fallback needed, use Next.js Image directly (maintains optimization)
  if (!fallback) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={loading}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={onLoad}
        onError={onError}
        draggable={draggable}
        {...restProps}
      />
    );
  }

  // For WebP images, use HTML <picture> element with format fallback
  // Browser automatically selects the best format it supports
  return (
    <picture style={{ display: "block", width: "100%", height: "100%" }}>
      {/* WebP source - preferred format for modern browsers */}
      <source srcSet={fallback.webp} type="image/webp" />
      {/* GIF fallback - for browsers that don't support WebP */}
      <source srcSet={fallback.gif} type="image/gif" />
      {/* Fallback img element - required by picture element spec */}
      <img
        src={fallback.gif}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={loading}
        onLoad={onLoad}
        onError={onError}
        draggable={draggable}
        {...restProps}
      />
    </picture>
  );
};

