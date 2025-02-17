"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import localFont from "next/font/local";

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
});

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="px-8 py-12 md:p-24 bg-background"
    >
      <div className="flex items-center gap-4 mb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-2xl font-normal text-foreground ${eduMarist.className}`}
        >
          Raf
        </motion.h1>
      </div>

      <div className="space-y-32">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16"
        >
          <h2 className="text-base font-normal mb-8 md:mb-0 text-foreground">
            About
          </h2>

          <div className="space-y-6 text-base leading-relaxed max-w-2xl">
            <p className="text-foreground">
              I'm a founding product designer who codes - currently leading
              design at Theoriq across product, marketing and web.
              <span className="text-foreground/60">
                {" "}
                7+ years building products driving $100M+ in collective revenue.{" "}
              </span>
            </p>

            <p>
              <span className="text-foreground">Based in Toronto.</span>
              <span className="text-foreground/60">
                {" "}
                I grew up on Italy's Amalfi Coast and lived in Lisbon and NYC.
              </span>
            </p>

            <p>
              <span className="text-foreground">
                {" "}
                I value direct communication, proactive thinking, and inclusive
                design.
              </span>
              <span className="text-foreground/60">
                {" "}
                When not crafting digital experiences, you'll find me practicing
                yoga, chasing the sun, and diving deep into interiors.
              </span>
            </p>
          </div>
        </motion.section>

        {/* Work section with image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16"
        >
          <div className="mb-8 md:mb-0"></div>
          <div className="space-y-4">
            <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt="Work preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 items-baseline">
              <h2 className="text-base font-normal text-foreground">
                Selected work.
              </h2>
              <a
                href="https://rafvitale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-foreground/40 hover:text-foreground transition-colors ml-auto"
              >
                Full portfolio ↗
              </a>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="md:grid md:grid-cols-[200px,1fr] md:gap-16"
        >
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
        </motion.section>
      </div>
    </motion.main>
  );
}
