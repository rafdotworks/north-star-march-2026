"use client";

import React from "react";

interface VideoPlayButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Localized video play button component
 * Provides consistent play button styling and interactions
 */
export const VideoPlayButton: React.FC<VideoPlayButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <>
      {/* Centered play button - positioned in the center of the image */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-black/30 group-hover:scale-110">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="white"
            stroke="none"
            className="ml-1 opacity-90 group-hover:opacity-100 transition-opacity"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
      {/* Clickable overlay */}
      <div
        className="absolute inset-0 cursor-pointer group"
        onClick={onClick}
        style={{
          pointerEvents: "auto",
          zIndex: 3,
        }}
      >
        {/* Subtle overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors duration-900"></div>
      </div>
    </>
  );
};
