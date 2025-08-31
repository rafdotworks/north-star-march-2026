"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  videoUrl,
  onClose,
}) => {
  if (!isOpen || !videoUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 backdrop-blur-md bg-black/85 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute top-6 right-6 z-10 rounded-full bg-black/10 backdrop-blur-md p-2.5 hover:bg-black/20 transition-all duration-300 shadow-lg"
              onClick={onClose}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-300 hover:scale-110 text-white/70 hover:text-white"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Video embed */}
            <div
              className="aspect-video w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Project Video"
                onEnded={onClose}
                style={{
                  background: "#000000",
                  borderRadius: "8px",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
