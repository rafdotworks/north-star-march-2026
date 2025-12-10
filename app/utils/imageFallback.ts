/**
 * ============================================================================
 * IMAGE FALLBACK UTILITY - app/utils/imageFallback.ts
 * ============================================================================
 *
 * Utility functions for handling image format fallbacks, particularly
 * WebP to GIF fallback for browser compatibility.
 *
 * Provides fallback path resolution for images that need format alternatives.
 */

/**
 * Gets the fallback image path for a given source.
 * 
 * @remarks
 * For WebP images, returns the corresponding GIF fallback path.
 * For other formats, returns null (no fallback needed).
 * 
 * @param src - Image source path (e.g., "/work/cb.webp")
 * @returns Object with webp and gif paths, or null if no fallback needed
 * 
 * @example
 * ```ts
 * getImageFallback("/work/cb.webp") 
 * // Returns { webp: "/work/cb.webp", gif: "/work/cb.gif" }
 * 
 * getImageFallback("/work/cb-1.png") 
 * // Returns null (no fallback needed)
 * ```
 */
export function getImageFallback(
  src: string
): { webp: string; gif: string } | null {
  // Only provide fallback for WebP images
  if (!src.toLowerCase().endsWith(".webp")) {
    return null;
  }

  // Replace .webp extension with .gif
  const gifPath = src.replace(/\.webp$/i, ".gif");

  return {
    webp: src,
    gif: gifPath,
  };
}

/**
 * Checks if an image source needs format fallback.
 * 
 * @param src - Image source path
 * @returns True if the image is WebP and may need fallback
 */
export function needsFallback(src: string): boolean {
  return src.toLowerCase().endsWith(".webp");
}


