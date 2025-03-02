"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import localFont from "next/font/local";
import Link from "next/link";
import Image from "next/image";

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
});

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("morning");

  const images = [
    "/work/theoriq.png",
    "/work/theoriq-prod-hero.png",
    "/work/atlas-1.png",
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
    "/photos/josh.JPG",
    "/photos/omar.JPG",
    "/photos/adrien.JPG",
    "/photos/jordi.JPG",
    "/photos/flo.JPG",
    "/photos/kelindi.JPG",
    "/photos/vin.JPG",
    "/photos/anna.JPG",
  ];

  useEffect(() => {
    setMounted(true);

    // Set time of day based on current hour
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay("morning");
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay("afternoon");
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay("evening");
      } else {
        setTimeOfDay("night");
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isZoomed) return; // Don't run interval if modal is open

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isZoomed, images.length]);

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => ({ ...prev, [src]: true }));
  };

  const fadeInAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 sm:px-8 py-12 md:px-24 bg-background relative overflow-x-hidden"
    >
      {/* Immersive ambient background with animated elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary ambient gradient that moves like the sun */}
        <div
          className="absolute inset-0 opacity-25 transition-all duration-1000"
          style={{
            background:
              timeOfDay === "morning"
                ? "radial-gradient(70% 50% at 20% 30%, rgba(255, 220, 180, 0.6) 0%, rgba(255, 255, 255, 0) 100%)"
                : timeOfDay === "afternoon"
                ? "radial-gradient(60% 50% at 50% 20%, rgba(255, 240, 200, 0.5) 0%, rgba(255, 255, 255, 0) 100%)"
                : timeOfDay === "evening"
                ? "radial-gradient(70% 50% at 80% 30%, rgba(255, 180, 140, 0.5) 0%, rgba(255, 255, 255, 0) 100%)"
                : "radial-gradient(50% 50% at 95% 80%, rgba(180, 180, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Animated primary orb - follows sun path */}
        <motion.div
          animate={{
            x: [0, 10, 0, -10, 0],
            y: [0, -10, 0, 10, 0],
            scale: [1, 1.05, 1, 0.95, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
          className="absolute w-1/3 h-1/3 rounded-full blur-[150px] opacity-15 transition-all duration-1000"
          style={{
            top:
              timeOfDay === "morning"
                ? "30%"
                : timeOfDay === "afternoon"
                ? "20%"
                : timeOfDay === "evening"
                ? "30%"
                : "80%",
            left:
              timeOfDay === "morning"
                ? "20%"
                : timeOfDay === "afternoon"
                ? "50%"
                : timeOfDay === "evening"
                ? "80%"
                : "95%",
            transform: `translateX(-50%) translateY(-50%)`,
            background:
              timeOfDay === "morning"
                ? "rgba(255, 200, 150, 0.8)"
                : timeOfDay === "afternoon"
                ? "rgba(255, 240, 200, 0.8)"
                : timeOfDay === "evening"
                ? "rgba(255, 150, 120, 0.8)"
                : "rgba(150, 150, 220, 0.8)",
          }}
        />

        {/* Animated secondary orb - complementary light */}
        <motion.div
          animate={{
            x: [0, -15, 0, 15, 0],
            y: [0, 15, 0, -15, 0],
            scale: [1, 0.9, 1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut",
          }}
          className="absolute w-1/4 h-1/4 rounded-full blur-[180px] opacity-15 transition-colors duration-1000"
          style={{
            bottom: "20%",
            left: "5%",
            background:
              timeOfDay === "morning"
                ? "rgba(200, 230, 255, 0.8)"
                : timeOfDay === "afternoon"
                ? "rgba(220, 240, 255, 0.8)"
                : timeOfDay === "evening"
                ? "rgba(255, 200, 180, 0.8)"
                : "rgba(180, 180, 240, 0.8)",
          }}
        />

        {/* Subtle accent orb - atmospheric glow */}
        <motion.div
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
          }}
          className="absolute w-1/5 h-1/5 rounded-full blur-[120px] transition-colors duration-1000"
          style={{
            top: "60%",
            right: "30%",
            background:
              timeOfDay === "morning"
                ? "rgba(255, 230, 200, 0.6)"
                : timeOfDay === "afternoon"
                ? "rgba(240, 240, 220, 0.6)"
                : timeOfDay === "evening"
                ? "rgba(255, 180, 160, 0.6)"
                : "rgba(180, 180, 240, 0.6)",
          }}
        />
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.div
          variants={fadeInAnimation}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-32 relative"
        >
          {/* Subtle glow effect behind the name */}
          <div
            className="absolute pointer-events-none transition-all duration-1000"
            style={{
              top: "50%",
              left: "1.5rem",
              width: "8rem",
              height: "8rem",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background:
                timeOfDay === "morning"
                  ? "radial-gradient(circle, rgba(255, 220, 180, 0.15) 0%, rgba(255, 255, 255, 0) 70%)"
                  : timeOfDay === "afternoon"
                  ? "radial-gradient(circle, rgba(255, 240, 200, 0.12) 0%, rgba(255, 255, 255, 0) 70%)"
                  : timeOfDay === "evening"
                  ? "radial-gradient(circle, rgba(255, 180, 140, 0.15) 0%, rgba(255, 255, 255, 0) 70%)"
                  : "radial-gradient(circle, rgba(180, 180, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)",
              filter: "blur(15px)",
              zIndex: -1,
            }}
          />

          <h1
            className={`text-2xl font-normal text-foreground ${eduMarist.className} relative z-10`}
          >
            Raf
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 2,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="space-y-32"
        >
          <section className="md:grid md:grid-cols-[200px,minmax(0,1fr)] md:gap-16 w-full">
            <h2 className="text-base font-normal mb-8 md:mb-0 text-foreground">
              About
            </h2>

            <div className="space-y-4 text-base leading-relaxed">
              <p className="text-foreground">
                Product Designer who codes.{" "}
                <span className="text-foreground/60">
                  Currently leading design at Theoriq.
                </span>
                {/* <span className="text-foreground/60">
                  {" "}
                  With 7+ years of experience building products that have driven
                  $100M+ in collective revenue.{" "}
                </span> */}
              </p>

              <p>
                <span className="text-foreground">Toronto-based.</span>
                <span className="text-foreground/60">
                  {" "}
                  International background spanning Italy's Amalfi Coast,
                  Lisbon, NYC and more.
                </span>
              </p>

              <p>
                <span className="text-foreground">
                  Values direct communication, proactive thinking, and inclusive
                  design.
                </span>
                <span className="text-foreground/60">
                  {" "}
                  Yoga. Interiors. Mindfulness.{" "}
                </span>
              </p>
            </div>
          </section>

          <div className="md:grid md:grid-cols-[200px,1fr] md:gap-16 w-full">
            <div className="mb-8 md:mb-0">
              <h2 className="text-base font-normal text-foreground">
                Selected works
              </h2>
            </div>

            <div className="space-y-6">
              <div className="w-full mb-0 overflow-hidden relative">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt="Work preview"
                  className="w-full cursor-pointer bg-transparent max-w-full"
                  style={{
                    objectPosition: "center center",
                    display: "block",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: loadedImages[images[currentImageIndex]] ? 1 : 0,
                  }}
                  transition={{ duration: 0 }}
                  onClick={() => setIsZoomed(true)}
                  onLoad={() => handleImageLoad(images[currentImageIndex])}
                />
                {/* Preload next image */}
                <img
                  src={images[(currentImageIndex + 1) % images.length]}
                  alt="Next work preview"
                  className="hidden"
                  onLoad={() =>
                    handleImageLoad(
                      images[(currentImageIndex + 1) % images.length]
                    )
                  }
                />
              </div>
              {/* <div className="flex gap-2 items-baseline mt-0">
                <a
                  href="https://rafvitale.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-foreground/40 hover:text-foreground transition-colors"
                >
                  Open Portfolio ↗
                </a>
              </div> */}
            </div>
          </div>

          <section className="md:grid md:grid-cols-[200px,1fr] md:gap-16 w-full">
            <h2 className="text-base font-normal text-foreground mb-8 md:mb-0">
              Photos
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {photos.slice(0, 3).map((photo, index) => (
                  <motion.div
                    key={index}
                    className="aspect-[3/4] md:aspect-[2/3] cursor-pointer"
                    initial={fadeInAnimation.initial}
                    animate={{ opacity: loadedImages[photo] ? 1 : 0 }}
                    transition={fadeInAnimation.transition}
                    onClick={() => setIsPhotosModalOpen(true)}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onLoad={() => handleImageLoad(photo)}
                    />
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setIsPhotosModalOpen(true)}
                className="text-base text-foreground/60 hover:text-foreground transition-colors"
              >
                View all photos
              </button>
            </div>
          </section>

          <section className="md:grid md:grid-cols-[200px,1fr] md:gap-16 w-full">
            <h2 className="text-base font-normal mb-8 md:mb-0 text-foreground">
              Contact
            </h2>

            <div className="space-y-6 max-w-2xl">
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
            </div>
          </section>
        </motion.div>

        {/* Fullscreen Modal */}
        <AnimatePresence>
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
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
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
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                src={images[currentImageIndex]}
                alt="Work preview"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photos Modal */}
        <AnimatePresence>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsPhotosModalOpen(false);
                  }
                }}
              >
                {/* Sticky close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="sticky top-6 float-right mr-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPhotosModalOpen(false);
                  }}
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
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl mx-auto px-6 md:px-8 py-20 space-y-32"
                  onClick={(e) => e.stopPropagation()}
                >
                  {photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="w-full flex flex-col items-center space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        width={800}
                        height={600}
                        className="w-auto max-w-full max-h-[80vh] rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span
                        className="text-sm text-foreground/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {photo.split("/").pop()?.split(".")[0]}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
