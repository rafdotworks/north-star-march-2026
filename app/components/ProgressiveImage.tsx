"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  placeholderColor?: string;
}

const ProgressiveImage = ({
  src,
  alt,
  className = "",
  style = {},
  onLoad,
  placeholderColor = "rgba(245, 245, 245, 0.8)",
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setProgress(0);

    // Create a new image to track loading
    const img = new Image();

    // Set up XHR to track progress
    const xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const newProgress = Math.round((event.loaded / event.total) * 100);
        setProgress(newProgress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const url = URL.createObjectURL(xhr.response);
        img.src = url;

        img.onload = () => {
          setIsLoaded(true);
          if (onLoad) onLoad();
          URL.revokeObjectURL(url);
        };
      }
    };

    xhr.send();

    return () => {
      xhr.abort();
    };
  }, [src, onLoad]);

  return (
    <div className="relative w-full h-full">
      {/* Placeholder with shimmer while loading */}
      {!isLoaded && (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ backgroundColor: placeholderColor }}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0.5 }}
          transition={{
            opacity: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              transform: "skewX(-20deg)",
            }}
            animate={{
              x: ["calc(-100% - 50px)", "calc(100% + 50px)"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Progress indicator */}
          {progress > 0 && progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground/10">
              <motion.div
                className="h-full bg-foreground/30"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Actual image */}
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{
          ...style,
          transition: "opacity 0.5s ease-in-out, filter 0.5s ease-in-out",
        }}
        initial={{ filter: "blur(10px)" }}
        animate={{
          filter: isLoaded ? "blur(0px)" : "blur(10px)",
        }}
        transition={{
          filter: { duration: 0.5 },
        }}
      />
    </div>
  );
};

export default ProgressiveImage;
