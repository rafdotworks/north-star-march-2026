"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import localFont from "next/font/local";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { notes, Note, getCategoryColor } from "./data/notes";

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
});

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAllNotesModalOpen, setIsAllNotesModalOpen] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("morning");

  // Create refs for photos
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    { src: "/photos/marianne.jpeg", name: "Marianne" },
    { src: "/photos/josh.JPG", name: "Josh" },
    { src: "/photos/omar.JPG", name: "Omar" },
    { src: "/photos/adrien.JPG", name: "Adrien" },
    { src: "/photos/jordi.JPG", name: "Jordi" },
    { src: "/photos/flo.JPG", name: "Flo" },
    { src: "/photos/kelindi.JPG", name: "Kelindi" },
    { src: "/photos/vin.JPG", name: "Vin" },
    { src: "/photos/anna.JPG", name: "Anna" },
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

  // Add keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomed) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      } else if (e.key === "Escape") {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed, images.length]);

  useEffect(() => {
    if (
      isZoomed ||
      isPhotosModalOpen ||
      isNotesModalOpen ||
      isAllNotesModalOpen
    )
      return; // Don't run interval if any modal is open

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [
    isZoomed,
    isPhotosModalOpen,
    isNotesModalOpen,
    isAllNotesModalOpen,
    images.length,
  ]);

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

  const handleOpenNote = (index: number) => {
    setCurrentNoteIndex(index);
    setIsNotesModalOpen(true);
  };

  const handleOpenAllNotes = () => {
    setIsAllNotesModalOpen(true);
  };

  const handleNextNote = () => {
    setCurrentNoteIndex((prev) => (prev + 1) % notes.length);
  };

  const handlePrevNote = () => {
    setCurrentNoteIndex((prev) => (prev - 1 + notes.length) % notes.length);
  };

  // Effect to scroll to the selected photo when modal opens
  useEffect(() => {
    if (isPhotosModalOpen && photoRefs.current[currentPhotoIndex]) {
      setTimeout(() => {
        photoRefs.current[currentPhotoIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // Small delay to ensure modal is fully rendered
    }
  }, [isPhotosModalOpen, currentPhotoIndex]);

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 sm:px-10 py-16 md:px-28 bg-background relative overflow-x-hidden"
    >
      {/* Immersive ambient background with animated elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Dynamic gradient based on time of day */}
        <div
          className={`absolute inset-0 opacity-20 transition-opacity duration-1000 ease-in-out ${
            timeOfDay === "morning"
              ? "bg-gradient-to-br from-amber-100/30 via-sky-200/20 to-transparent"
              : timeOfDay === "afternoon"
              ? "bg-gradient-to-br from-blue-100/30 via-amber-100/20 to-transparent"
              : timeOfDay === "evening"
              ? "bg-gradient-to-br from-amber-200/30 via-purple-200/20 to-transparent"
              : "bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent"
          }`}
        />

        {/* Subtle glow effect that changes with time of day */}
        <div
          className={`absolute top-[20%] left-[30%] w-[40vw] h-[40vh] rounded-full blur-[120px] opacity-15 transition-all duration-1000 ease-in-out ${
            timeOfDay === "morning"
              ? "bg-amber-200"
              : timeOfDay === "afternoon"
              ? "bg-blue-200"
              : timeOfDay === "evening"
              ? "bg-purple-300"
              : "bg-indigo-500"
          }`}
        />

        {/* Secondary glow for depth */}
        <div
          className={`absolute bottom-[10%] right-[20%] w-[30vw] h-[30vh] rounded-full blur-[150px] opacity-10 transition-all duration-1000 ease-in-out ${
            timeOfDay === "morning"
              ? "bg-sky-200"
              : timeOfDay === "afternoon"
              ? "bg-amber-300"
              : timeOfDay === "evening"
              ? "bg-pink-300"
              : "bg-purple-600"
          }`}
        />

        {/* Subtle animated particle effect */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute top-1/4 left-1/3 w-1 h-1 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "0s", animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "0.5s", animationDuration: "5s" }}
          />
          <div
            className="absolute top-3/4 left-2/3 w-1 h-1 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "6s" }}
          />
          <div
            className="absolute top-1/3 left-3/4 w-1 h-1 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
          />
          <div
            className="absolute top-2/3 left-1/2 w-1 h-1 rounded-full bg-white animate-pulse"
            style={{ animationDelay: "2s", animationDuration: "5.5s" }}
          />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.div
          variants={fadeInAnimation}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-40 relative"
        >
          {/* Subtle glow effect behind the name */}
          <div className="absolute w-12 h-12 rounded-full bg-foreground/5 blur-xl -z-10 left-0 transform -translate-x-1/4"></div>

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
          className="space-y-36"
        >
          <section className="md:grid md:grid-cols-[180px,minmax(0,1fr)] md:gap-20 w-full">
            <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
              About
            </h2>

            <div className="space-y-6 text-base leading-relaxed">
              <p className="text-foreground">
                Raf is a Product Designer{" "}
                <span className="text-foreground/60">
                  - founding designer and design engineer.{" "}
                </span>
                {/* <span className="text-foreground/60">
                  {" "}
                  With 7+ years of experience building products that have driven
                  $100M+ in collective revenue.{" "}
                </span> */}
              </p>

              <p>
                <span className="text-foreground/60">
                  {" "}
                  Originally from Italy and now
                </span>{" "}
                <span className="text-foreground">based in Toronto,</span>
                <span className="text-foreground/60">
                  {" "}
                  Raf has 8 years of experience working in-house and as a
                  contractor for big companies and small startups,
                </span>
                <span className="text-foreground">
                  {" "}
                  pursuing excellence
                </span>{" "}
                <span className="text-foreground/60">
                  {" "}
                  with a deep passion for craft and collaboration.
                </span>
              </p>

              <p>
                <span className="text-foreground/60">
                  He enjoys portrait photography, yoga, and interior design.
                </span>
              </p>
            </div>
          </section>

          <div className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
            <div className="mb-10 md:mb-0">
              <h2 className="text-base font-normal text-foreground">
                Selected works
              </h2>
            </div>

            <div className="space-y-8">
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
              <div className="hidden md:block mt-4">
                <a
                  href="https://rafvitale.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
                >
                  View all works ↗
                </a>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <section className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
            <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
              Notes
            </h2>

            <div className="space-y-8">
              <div className="flex flex-col divide-y divide-foreground/5">
                {/* Sort notes by date (newest first) and show only the 3 most recent */}
                {notes
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .slice(0, 3)
                  .map((note, index) => (
                    <motion.div
                      key={note.id}
                      className="py-7 first:pt-0 cursor-pointer"
                      initial={fadeInAnimation.initial}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      onClick={() => handleOpenNote(index)}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-10 items-start">
                        <div className="text-sm text-foreground/50 whitespace-nowrap min-w-[90px]">
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex-1">
                          <p className="text-base text-foreground hover:text-foreground/90 transition-colors line-clamp-2">
                            {note.title} {note.excerpt}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenAllNotes();
                }}
                className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                View all notes
              </Link>
            </div>
          </section>

          <section className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
            <h2 className="text-base font-normal text-foreground mb-10 md:mb-0">
              Photos
            </h2>

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-3">
                {photos.slice(0, 3).map((photo, index) => (
                  <motion.div
                    key={index}
                    className="aspect-[3/4] md:aspect-[2/3] cursor-pointer relative"
                    initial={fadeInAnimation.initial}
                    animate={{ opacity: loadedImages[photo.src] ? 1 : 0 }}
                    transition={fadeInAnimation.transition}
                    onClick={() => {
                      setCurrentPhotoIndex(index);
                      setIsPhotosModalOpen(true);
                    }}
                  >
                    <img
                      src={photo.src}
                      alt={`Photo of ${photo.name}`}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(photo.src)}
                    />
                  </motion.div>
                ))}
              </div>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPhotoIndex(0);
                  setIsPhotosModalOpen(true);
                }}
                className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                View all photos
              </Link>
            </div>
          </section>

          <section className="md:grid md:grid-cols-[180px,1fr] md:gap-20 w-full">
            <h2 className="text-base font-normal mb-10 md:mb-0 text-foreground">
              Contact
            </h2>

            <div className="space-y-8 max-w-2xl">
              <div>
                <p className="text-sm text-foreground/50 mb-1">Email</p>
                <a
                  href="mailto:raf@raf.works"
                  className="text-base text-foreground/80 hover:text-foreground transition-colors"
                >
                  raf@raf.works
                </a>
              </div>

              <div>
                <p className="text-sm text-foreground/50 mb-1">LinkedIn</p>
                <a
                  href="https://www.linkedin.com/in/raffaelevitaledesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-foreground/80 hover:text-foreground transition-colors"
                >
                  raffaelevitaledesign
                </a>
              </div>

              <div>
                <p className="text-sm text-foreground/50 mb-1">Twitter/X</p>
                <a
                  href="https://twitter.com/lfgraf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-foreground/80 hover:text-foreground transition-colors"
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

              {/* Navigation controls at the bottom */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="rounded-full bg-gray-200/10 backdrop-blur-sm p-1.5 hover:bg-gray-200/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    );
                  }}
                  aria-label="Previous image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="rounded-full bg-gray-200/10 backdrop-blur-sm p-1.5 hover:bg-gray-200/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % images.length);
                  }}
                  aria-label="Next image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.button>
              </div>
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
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                onClick={() => setIsPhotosModalOpen(false)}
              />

              {/* Scrollable content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
                  transition={{ delay: 0.2, duration: 0.3 }}
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
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-3xl mx-auto px-6 md:px-8 py-20 space-y-32"
                >
                  {/* Photos grid */}
                  <div className="grid grid-cols-1 gap-16 md:gap-24">
                    {photos.map((photo, index) => (
                      <motion.div
                        key={index}
                        ref={(el) => {
                          photoRefs.current[index] = el;
                        }}
                        className="aspect-[3/4] cursor-pointer relative max-w-2xl mx-auto w-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: loadedImages[photo.src] ? 1 : 0,
                          y: loadedImages[photo.src] ? 0 : 10,
                        }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={photo.src}
                          alt={`Photo of ${photo.name}`}
                          className="w-full h-full object-cover"
                          onLoad={() => handleImageLoad(photo.src)}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex justify-center items-center">
                          <span className="text-white text-sm font-light">
                            {photo.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Notes Modal */}
        <AnimatePresence>
          {isNotesModalOpen && (
            <>
              {/* Fixed backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                onClick={() => setIsNotesModalOpen(false)}
              />

              {/* Scrollable content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsNotesModalOpen(false);
                  }
                }}
              >
                {/* Card stack container */}
                <div className="w-full max-w-3xl mx-auto relative my-12 pt-4">
                  {/* Background cards for stack effect */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotate: -0.5 }}
                    animate={{ opacity: 1, y: 0, rotate: -0.5 }}
                    exit={{ opacity: 0, y: -5, rotate: -0.5 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute inset-x-0 top-4 mx-auto w-[98%] h-[calc(100%-16px)] bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg -z-10"
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotate: 0.5 }}
                    animate={{ opacity: 1, y: 0, rotate: 0.5 }}
                    exit={{ opacity: 0, y: -5, rotate: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute inset-x-0 top-2 mx-auto w-[99%] h-[calc(100%-8px)] bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-lg -z-20"
                  ></motion.div>

                  {/* Main content card */}
                  <motion.div
                    key={currentNoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-xl px-6 md:px-12 py-16 pb-24 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Date in top right corner */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="absolute top-6 left-6 text-xs text-foreground/40"
                    >
                      {new Date(
                        notes[currentNoteIndex].date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </motion.div>

                    {/* Close button - positioned in top right */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="absolute top-6 right-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNotesModalOpen(false);
                      }}
                      aria-label="Close notes"
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

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="prose prose-invert max-w-none mt-12"
                    >
                      <ReactMarkdown>
                        {notes[currentNoteIndex].content}
                      </ReactMarkdown>
                    </motion.div>

                    {/* Subtle navigation controls */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mt-16 flex justify-center items-center gap-8"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevNote();
                        }}
                        className="text-foreground/40 hover:text-foreground transition-colors p-2"
                        aria-label="Previous note"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                      </motion.button>

                      {/* Note selector dots */}
                      <div className="flex gap-3">
                        {notes.map((_, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentNoteIndex(index);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              currentNoteIndex === index
                                ? "bg-foreground w-3"
                                : "bg-foreground/30"
                            }`}
                            aria-label={`Go to note ${index + 1}`}
                          />
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextNote();
                        }}
                        className="text-foreground/40 hover:text-foreground transition-colors p-2"
                        aria-label="Next note"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* All Notes Modal */}
        <AnimatePresence>
          {isAllNotesModalOpen && (
            <>
              {/* Fixed backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 backdrop-blur-lg bg-background/60 z-50"
                onClick={() => setIsAllNotesModalOpen(false)}
              />

              {/* Scrollable content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsAllNotesModalOpen(false);
                  }
                }}
              >
                {/* Content container */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-3xl mx-auto px-6 md:px-12 py-16 pb-24 my-12 bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button - positioned in top right */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="absolute top-6 right-6 rounded-full bg-gray-200/20 backdrop-blur-sm p-2 hover:bg-gray-200/30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAllNotesModalOpen(false);
                    }}
                    aria-label="Close all notes"
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

                  <motion.h2
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-3xl font-medium mb-8 text-foreground"
                  >
                    All Notes
                  </motion.h2>

                  <div className="flex flex-col divide-y divide-foreground/10">
                    {notes
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((note, index) => (
                        <motion.div
                          key={note.id}
                          className="py-6 first:pt-0 cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                          }}
                          whileHover={{ x: 2 }}
                          onClick={() => {
                            setCurrentNoteIndex(index);
                            setIsAllNotesModalOpen(false);
                            setTimeout(() => setIsNotesModalOpen(true), 100);
                          }}
                        >
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-start">
                            <div className="text-sm text-foreground/50 whitespace-nowrap min-w-[90px]">
                              {new Date(note.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="flex-1">
                              <p className="text-lg text-foreground hover:text-foreground/90 transition-colors mb-1">
                                {note.title}
                              </p>
                              <p className="text-base text-foreground/60 line-clamp-2">
                                {note.excerpt}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
