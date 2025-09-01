"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play } from "lucide-react";
import { useSlideshow } from "@/hooks/useSlideshow";
import { imageLoader, getImagePlaceholder } from "@/utils/imageUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { EASING } from "@/components/animations/LoadingAnimations";

interface SlideshowSectionProps {
  images: string[];
  workVideos: { [key: string]: string };
  onOpenVideoModal: (videoUrl: string) => void;
  isAnyModalOpen: boolean;
}

export function SlideshowSection({
  images,
  workVideos,
  onOpenVideoModal,
  isAnyModalOpen,
}: SlideshowSectionProps) {
  const isMobile = useIsMobile();
  const [blurAmount, setBlurAmount] = useState(0);

  const {
    currentImageIndex,
    loadedImages,
    nextImage,
    prevImage,
    slideshowRef,
  } = useSlideshow({
    images,
    interval: 3000,
    autoPlay: !isAnyModalOpen,
  });

  const handleOpenVideoModal = (imageSrc: string) => {
    const videoUrl = workVideos[imageSrc];
    if (videoUrl) {
      onOpenVideoModal(videoUrl);
    }
  };

  // Enhanced cascading animation variants inspired by text animation
  const cascadingContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.8,
        ease: EASING.staggeredText,
      },
    },
  };

  const cascadingItemVariants = {
    hidden: {
      opacity: 0,
      filter: "blur(20px)",
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 1.4,
        ease: EASING.textReveal,
      },
    },
  };

  const mainCarouselVariants = {
    hidden: {
      opacity: 0,
      filter: "blur(15px)",
      y: 25,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        duration: 1.8,
        ease: EASING.textReveal,
      },
    },
  };

  return (
    <motion.div
      ref={slideshowRef}
      className="w-full mb-0 overflow-hidden relative"
      variants={cascadingContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative w-full h-full">
        {/* Mobile Layout */}
        {isMobile && (
          <motion.div
            className="block sm:hidden space-y-4"
            variants={cascadingContainerVariants}
          >
            {images.slice(0, 6).map((src, index) => (
              <motion.div
                key={`mobile-${index}`}
                className="w-full"
                variants={cascadingItemVariants}
                custom={index}
              >
                <div
                  className="relative w-full h-[400px] cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => handleOpenVideoModal(src)}
                >
                  {loadedImages[src] ? (
                    <Image
                      src={src}
                      alt="Work"
                      fill
                      sizes="100vw"
                      loader={imageLoader}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{
                        filter:
                          blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-lg animate-pulse"
                      style={{ backgroundColor: getImagePlaceholder(index) }}
                    />
                  )}

                  {workVideos[src] && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: EASING.tertiary }}
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Desktop Layout */}
        {!isMobile && (
          <motion.div
            className="hidden sm:block relative w-full h-full"
            variants={mainCarouselVariants}
          >
            <motion.div
              className="relative w-full h-[600px] overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => handleOpenVideoModal(images[currentImageIndex])}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6, ease: EASING.tertiary }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0"
                  initial={{
                    opacity: 0,
                    filter: "blur(10px)",
                    scale: 1.05,
                  }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    filter: "blur(10px)",
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: EASING.textReveal,
                  }}
                >
                  {loadedImages[images[currentImageIndex]] ? (
                    <Image
                      src={images[currentImageIndex]}
                      alt="Current work"
                      fill
                      sizes="100vw"
                      loader={imageLoader}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{
                        filter:
                          blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-lg animate-pulse"
                      style={{
                        backgroundColor: getImagePlaceholder(currentImageIndex),
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Video play overlay */}
              {workVideos[images[currentImageIndex]] && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASING.bounce }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Navigation arrows */}
            <motion.button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
              aria-label="Previous image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASING.tertiary }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            <motion.button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
              aria-label="Next image"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASING.tertiary }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            {/* Image indicators */}
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2"
              variants={cascadingContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {images.slice(0, 6).map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white" : "bg-white/40"
                  }`}
                  variants={cascadingItemVariants}
                  whileHover={{ scale: 1.3 }}
                  transition={{ duration: 0.2, ease: EASING.tertiary }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
