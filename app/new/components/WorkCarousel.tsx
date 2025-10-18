"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface WorkItem {
  id: string;
  title: string;
  image: string;
}

const workItems: WorkItem[] = [
  { id: "coinbase", title: "Coinbase", image: "/work/cb-1.png" },
  { id: "coinbase-2", title: "Coinbase", image: "/work/cb-d.png" },
  { id: "voiceflow", title: "Voiceflow", image: "/work/voiceflow-landing.png" },
  { id: "theoriq", title: "Theoriq", image: "/work/theoriq.png" },
  { id: "theoriq-2", title: "Theoriq", image: "/work/theoriq-prod-hero.png" },
  { id: "theoriq-3", title: "Theoriq", image: "/work/theoriq-mobile-chat.png" },
  { id: "atlas", title: "Atlas", image: "/work/atlas-1.png" },
  { id: "zalando", title: "Zalando", image: "/work/zalando-spread.png" },
  { id: "zalando-2", title: "Zalando", image: "/work/zalando-dodont.png" },
  { id: "curbcut", title: "CurbCutOS", image: "/work/curbcut.png" },
  { id: "defi", title: "DeFi", image: "/work/defi.png" },
  { id: "ethos", title: "Ethos", image: "/work/ethos.png" },
  { id: "wombo", title: "Wombo", image: "/work/wombo.png" },
  { id: "wai", title: "WAI", image: "/work/wai.png" },
  { id: "apple", title: "Apple", image: "/work/apple.png" },
];

export function WorkCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<WorkItem | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!hasScrolled && container.scrollLeft > 0) {
        setHasScrolled(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  return (
    <div className="relative w-full h-full">
      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="flex items-center gap-6 md:gap-8 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide h-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {workItems.map((item, index) => {
          const isLast = index === workItems.length - 1;

          return (
            <motion.div
              key={item.id}
              className={`flex-shrink-0 snap-start h-full flex items-center justify-center ${isLast ? "mr-0" : ""}`}
              initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1.6,
                delay: 0.4 + index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Image card */}
              <motion.div
                className="relative flex h-full w-[220px] md:w-[260px] items-center justify-center rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(item)}
                animate={{
                  filter: hasScrolled ? "blur(0px)" : "blur(6px)",
                  opacity: hasScrolled ? 1 : 0.7,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: 1.03,
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1]
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={1600}
                  height={1200}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Hide scrollbar globally for this component */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            className="relative max-w-[90vw] max-h-[90vh]"
            initial={{ scale: 0.9, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.image}
              alt={selectedImage.title}
              width={1600}
              height={1200}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
            />
            <motion.button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/40 hover:text-white text-sm transition-colors duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
