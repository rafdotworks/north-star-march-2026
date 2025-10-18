"use client";

import React from "react";
import { slideOpacity, slideTypography } from "../lib/typography";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onNavigate: (index: number) => void;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onNavigate,
}: SlideNavigationProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onNavigate(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === currentSlide
              ? "bg-foreground w-8"
              : `bg-foreground/20 hover:bg-foreground/40`
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
