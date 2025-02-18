"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import localFont from "next/font/local";
import Link from "next/link";

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
});

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);

  const images = [
    "/work//theoriq.png",
    "/work/theoriq-prod-hero.png",
    "/work/atlas-1.png",
    "/work/us.png",
    "/work/zalando-spread.png",
    "/work/wombo.png",
    "/work/defi.png",
    "/work/ethos.png",
    "/work/tela.png",
    "/work/art-02.png",
    "/work/zalando-dodont.png",
    "/work/apple.png",
  ];

  const photos = [
    "/photos/marianne.jpeg",
    "/photos/josh.jpg",
    "/photos/omar.jpg",
    "/photos/jordi.jpg",
    "/photos/adrien.jpg",
    "/photos/flo.jpg",
    "/photos/kelindi.jpg",
    "/photos/vin.jpg",
    "/photos/anna.jpg",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isZoomed) return; // Don't run interval if modal is open

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isZoomed, images.length]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="px-8 py-12 md:p-24 bg-background relative"
    >
      <motion.div className="flex items-center gap-4 mb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-2xl font-normal text-foreground ${eduMarist.className}`}
        >
          Raf
        </motion.h1>
      </motion.div>

      <div className="space-y-32">
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16"
        >
          <motion.h2
            variants={textVariants}
            transition={{ duration: 0.8 }}
            className="text-base font-normal mb-8 md:mb-0 text-foreground"
          >
            About
          </motion.h2>

          <motion.div className="space-y-6 text-base leading-relaxed max-w-2xl">
            <motion.p
              variants={textVariants}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-foreground"
            >
              I'm a founding product designer who codes - currently leading
              design at Theoriq across product, marketing and web.
              <span className="text-foreground/60">
                {" "}
                7+ years building products driving $100M+ in collective revenue.{" "}
              </span>
            </motion.p>

            <motion.p
              variants={textVariants}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-foreground">Based in Toronto.</span>
              <span className="text-foreground/60">
                {" "}
                I grew up on Italy's Amalfi Coast and lived in Lisbon and NYC.
              </span>
            </motion.p>

            <motion.p
              variants={textVariants}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-foreground">
                I value direct communication, proactive thinking, and inclusive
                design.
              </span>
              <span className="text-foreground/60">
                {" "}
                When not crafting digital experiences, you'll find me practicing
                yoga, chasing the sun, and diving deep into interiors.
              </span>
            </motion.p>
          </motion.div>
        </motion.section>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16"
        >
          <div className="mb-8 md:mb-0">
            <motion.h2
              variants={textVariants}
              className="text-base font-normal text-foreground"
            >
              Selected works
            </motion.h2>
          </div>

          <div className="space-y-6">
            <div
              className="w-full overflow-hidden"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={images[currentImageIndex]}
                alt="Work preview"
                className="w-full cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex gap-2 items-baseline">
              <a
                href="https://rafvitale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-foreground/40 hover:text-foreground transition-colors"
              >
                Open Portfolio ↗
              </a>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16 mb-32"
        >
          <motion.h2
            variants={textVariants}
            className="text-base font-normal mb-8 md:mb-0 text-foreground"
          >
            Photos
          </motion.h2>

          <motion.div
            variants={textVariants}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-4">
              {photos.slice(0, 3).map((photo, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] cursor-pointer"
                  onClick={() => setIsPhotosModalOpen(true)}
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsPhotosModalOpen(true)}
              className="text-base text-foreground/60 hover:text-foreground transition-colors"
            >
              View all photos
            </button>
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16"
        >
          <motion.h2
            variants={textVariants}
            className="text-base font-normal mb-8 md:mb-0 text-foreground"
          >
            Contact
          </motion.h2>

          <motion.div
            variants={textVariants}
            transition={{ delay: 0.2 }}
            className="space-y-6 max-w-2xl"
          >
            <div>
              <p className="text-sm text-foreground/60">Email</p>
              <a
                href="mailto:raf@raf.works"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                raf@raf.works
              </a>
            </div>

            <div>
              <p className="text-sm text-foreground/60">LinkedIn</p>
              <a
                href="https://www.linkedin.com/in/raffaelevitaledesign"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                raffaelevitaledesign
              </a>
            </div>

            <div>
              <p className="text-sm text-foreground/60">Twitter/X</p>
              <a
                href="https://twitter.com/lfgraf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                lfgraf
              </a>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* Fullscreen Modal */}
      {isZoomed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50 flex items-center justify-center p-6"
          onClick={() => setIsZoomed(false)}
        >
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-6 right-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
            onClick={() => setIsZoomed(false)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={images[currentImageIndex]}
            alt="Work preview"
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}

      {/* Photos Modal */}
      {isPhotosModalOpen && (
        <>
          {/* Fixed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
            onClick={() => setIsPhotosModalOpen(false)}
          />

          {/* Scrollable content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Sticky close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-6 float-right mr-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
              onClick={() => setIsPhotosModalOpen(false)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Content container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto px-6 pb-20 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.main>
  );
}
