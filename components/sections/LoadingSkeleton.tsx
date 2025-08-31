"use client";

import React from "react";
import { motion } from "framer-motion";
import { EASING } from "@/components/animations/LoadingAnimations";

interface LoadingSkeletonProps {
  imagesLoaded: boolean;
}

export function LoadingSkeleton({ imagesLoaded }: LoadingSkeletonProps) {
  if (imagesLoaded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 2.8,
        delay: 1.0,
        ease: EASING.secondary,
      }}
      className="space-y-36"
    >
      <div className="w-full">
        <div className="space-y-8">
          {/* Skeleton for slideshow */}
          <div className="w-full mb-0 overflow-hidden relative">
            <div className="relative w-full h-full">
              {/* Mobile skeleton */}
              <div className="block sm:hidden space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: 1.5 + i * 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="w-full h-[400px] bg-foreground/5 rounded-lg animate-pulse" />
                  </motion.div>
                ))}
              </div>

              {/* Desktop skeleton */}
              <div className="hidden sm:block relative w-full h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 2.0,
                    delay: 1.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full h-[600px] bg-foreground/5 rounded-lg animate-pulse"
                />
              </div>
            </div>
          </div>

          {/* Subtle loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center justify-center mt-12"
          >
            <motion.div
              className="w-12 h-0.5 bg-gradient-to-r from-transparent via-foreground/40 to-transparent rounded-full"
              animate={{
                scaleX: [0.4, 1, 0.4],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Skeleton for other sections */}
          <div className="space-y-8">
            <div className="w-full h-[200px] bg-foreground/5 rounded animate-pulse" />
            <div className="w-full h-[300px] bg-foreground/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}