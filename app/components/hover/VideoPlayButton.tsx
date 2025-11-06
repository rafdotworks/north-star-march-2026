"use client";

import React from "react";

interface VideoPlayButtonProps {
  onClick?: () => void;
}

/**
 * Localized video play button component
 * Provides consistent play button styling and interactions
 */
export const VideoPlayButton: React.FC<VideoPlayButtonProps> = ({
  onClick,
}) => {
  return (
    <>
      {/* Centered play button - positioned in the center of the image */}
      <div className="absolute inset-0 flex items-center justify-center z-[100]">
        <div
          className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-black/30 group-hover:scale-110 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          style={{
            pointerEvents: "auto",
            zIndex: 100,
            cursor: "pointer",
          }}
        >
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
    </>
  );
};
