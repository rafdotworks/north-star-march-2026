"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideInUp } from "../lib/animations";
import { slideSpacing } from "../lib/typography";

interface SlideContainerProps {
  children: React.ReactNode;
  id: number;
  onClick?: () => void;
  className?: string;
}

export function SlideContainer({
  children,
  id,
  onClick,
  className = "",
}: SlideContainerProps) {
  return (
    <motion.div
      id={`slide-${id}`}
      className={`${slideSpacing.slide.minHeight} ${slideSpacing.slide.padding} flex flex-col justify-center ${className}`}
      initial={slideInUp.initial}
      whileInView={slideInUp.animate}
      viewport={{ once: true, margin: "-100px" }}
      transition={slideInUp.transition}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
