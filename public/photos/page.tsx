"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PhotosPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="px-8 py-12 md:p-24"
    >
      <div className="mb-16">
        <Link
          href="/"
          className="text-base text-gray-muted hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-normal mb-16"
      >
        Photos
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {/* Add more photos here */}
        <img
          src="/photos/marianne.JPG"
          alt="Marianne"
          className="w-full aspect-[4/3] object-cover rounded-lg"
        />
        <img
          src="/photos/omar.JPG"
          alt="Omar"
          className="w-full aspect-[4/3] object-cover rounded-lg"
        />
        <img
          src="/photos/kelindi.JPG"
          alt="Kelindi"
          className="w-full aspect-[4/3] object-cover rounded-lg"
        />
      </motion.div>
    </motion.main>
  );
}
