"use client";

/**
 * ============================================================================
 * 404 NOT FOUND PAGE - app/not-found.tsx
 * ============================================================================
 *
 * Interactive 404 page with a portrait whose eyes follow the cursor.
 * Features:
 * - Full viewport height layout with no scrolling
 * - Centered portrait with generous white space
 * - Smooth eye-following cursor effect
 * - Subtle "Page not found" messaging
 * - Link back to home page
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface EyePosition {
  x: number;
  y: number;
}

export default function NotFound() {
  const portraitRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState<EyePosition>({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // Eye movement constraints (in pixels from center)
  const MAX_EYE_MOVEMENT = 8; // Maximum pixels the eyes can move from center

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !portraitRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!portraitRef.current) return;

      const rect = portraitRef.current.getBoundingClientRect();
      const portraitCenterX = rect.left + rect.width / 2;
      const portraitCenterY = rect.top + rect.height / 2;

      // Calculate distance from cursor to portrait center
      const deltaX = e.clientX - portraitCenterX;
      const deltaY = e.clientY - portraitCenterY;

      // Calculate distance for normalization
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = Math.max(window.innerWidth, window.innerHeight) * 0.5;

      // Normalize and constrain eye movement (handle zero distance case)
      if (distance === 0) {
        setEyePosition({ x: 0, y: 0 });
        return;
      }

      const normalizedX = Math.min(distance / maxDistance, 1) * (deltaX / distance);
      const normalizedY = Math.min(distance / maxDistance, 1) * (deltaY / distance);

      setEyePosition({
        x: normalizedX * MAX_EYE_MOVEMENT,
        y: normalizedY * MAX_EYE_MOVEMENT,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMounted]);

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-8 px-6">
        {/* Portrait Container */}
        <div
          ref={portraitRef}
          className="relative w-[400px] max-w-[90vw] aspect-[3/4] flex items-center justify-center"
        >
          {/* Portrait Image Container */}
          <div className="relative w-full h-full">
            {/* Base Portrait Image - Static */}
            <Image
              src="/image-portrait.jpeg"
              alt="Portrait"
              fill
              className="object-contain"
              priority
              quality={90}
            />

            {/* Left Eye Region - Clipped window that reveals moving eye content */}
            <div
              className="absolute top-[42%] left-[38%] w-[12%] h-[8%] pointer-events-none overflow-hidden"
              style={{
                clipPath: "ellipse(50% 50% at 50% 50%)",
                borderRadius: "50%",
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  width: "1000%",
                  height: "1000%",
                  left: "-450%",
                  top: "-450%",
                }}
                animate={{
                  x: -eyePosition.x * 20,
                  y: -eyePosition.y * 20,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                  mass: 0.5,
                }}
              >
                <Image
                  src="/image-portrait.jpeg"
                  alt=""
                  fill
                  className="object-contain"
                  style={{
                    objectPosition: "38% 42%",
                  }}
                  quality={90}
                />
              </motion.div>
            </div>

            {/* Right Eye Region - Clipped window that reveals moving eye content */}
            <div
              className="absolute top-[42%] right-[38%] w-[12%] h-[8%] pointer-events-none overflow-hidden"
              style={{
                clipPath: "ellipse(50% 50% at 50% 50%)",
                borderRadius: "50%",
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  width: "1000%",
                  height: "1000%",
                  left: "-450%",
                  top: "-450%",
                }}
                animate={{
                  x: -eyePosition.x * 20,
                  y: -eyePosition.y * 20,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                  mass: 0.5,
                }}
              >
                <Image
                  src="/image-portrait.jpeg"
                  alt=""
                  fill
                  className="object-contain"
                  style={{
                    objectPosition: "62% 42%",
                  }}
                  quality={90}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Text and Link */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-foreground/60 text-base tracking-tight">
            Page not found
          </p>
          <Link
            href="/"
            className="text-foreground/80 hover:text-foreground text-sm tracking-tight transition-colors duration-200 underline-offset-4 hover:underline"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

