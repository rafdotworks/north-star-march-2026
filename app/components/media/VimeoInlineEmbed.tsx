"use client";

/**
 * ============================================================================
 * VIMEO INLINE EMBED - app/components/VimeoInlineEmbed.tsx
 * ============================================================================
 *
 * Component for embedding Vimeo videos inline in the carousel (not in modal).
 *
 * FEATURES:
 * - Responsive 16:9 aspect ratio container
 * - Autoplay and loop support
 * - Muted by default for autoplay compliance
 * - Background video styling (no controls)
 * - Seamless integration with carousel layout
 *
 * Used by: WorkImageContainer when src is a Vimeo URL
 */

import React from "react";

interface VimeoInlineEmbedProps {
  videoUrl: string; // Vimeo player URL with query params
  className?: string;
}

/**
 * Extract video ID from Vimeo URL
 */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/video\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Inline Vimeo embed with autoplay and responsive sizing
 */
export const VimeoInlineEmbed: React.FC<VimeoInlineEmbedProps> = ({
  videoUrl,
  className = "",
}) => {
  const videoId = getVimeoId(videoUrl);

  if (!videoId) {
    console.error("Invalid Vimeo URL:", videoUrl);
    return null;
  }

  // Build embed URL with parameters for inline autoplay
  const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&background=1&controls=0&transparent=1&dnt=1`;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        paddingBottom: "56.25%", // 16:9 aspect ratio, matches video and images flow
        position: "relative",
      }}
    >
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        title="Theoriq Demo"
      />
    </div>
  );
};
