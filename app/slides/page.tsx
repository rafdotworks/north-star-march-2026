"use client";

import React, { useState, useEffect } from "react";
import { SlideContainer } from "./components/SlideContainer";
import { SlideNavigation } from "./components/SlideNavigation";
import { CoverSlide } from "./components/slides/CoverSlide";
import { ManifestoSlide } from "./components/slides/ManifestoSlide";
import { ThroughlineSlide } from "./components/slides/ThroughlineSlide";
import { PrinciplesSlide } from "./components/slides/PrinciplesSlide";
import { ProjectSlide } from "./components/slides/ProjectSlide";
import { ActSlide } from "./components/slides/ActSlide";
import { ClosingSlide } from "./components/slides/ClosingSlide";
import { FitSlide } from "./components/slides/FitSlide";
import { slidesData } from "./slides-data";
import type { SlideData } from "./slides-data";

export default function SlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        navigateToSlide(Math.min(currentSlide + 1, slidesData.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateToSlide(Math.max(currentSlide - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  // Update current slide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const slideElements = document.querySelectorAll("[id^='slide-']");
      let closestSlide = 0;
      let minDistance = Infinity;

      slideElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        if (distance < minDistance) {
          minDistance = distance;
          closestSlide = index;
        }
      });

      setCurrentSlide(closestSlide);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToSlide = (index: number) => {
    const element = document.getElementById(`slide-${slidesData[index].id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentSlide(index);
    }
  };

  const renderSlide = (data: SlideData) => {
    switch (data.type) {
      case "cover":
        return <CoverSlide data={data} />;
      case "manifesto":
        return <ManifestoSlide data={data} />;
      case "throughline":
        return <ThroughlineSlide data={data} />;
      case "principles":
        return <PrinciplesSlide data={data} />;
      case "what-i-do":
        return <ManifestoSlide data={data} />; // Reuse manifesto layout
      case "project":
        return <ProjectSlide data={data} />;
      case "act":
        return <ActSlide data={data} />;
      case "system-bridge":
        return <ThroughlineSlide data={data} />; // Reuse throughline layout
      case "voices":
        return <ManifestoSlide data={data} />; // Reuse manifesto layout
      case "how-i-work":
        return <PrinciplesSlide data={data} />; // Reuse principles layout
      case "fit":
        return <FitSlide data={data} />;
      case "closing":
        return <ClosingSlide data={data} />;
      default:
        return <ManifestoSlide data={data} />;
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {slidesData.map((slide, index) => (
        <SlideContainer
          key={slide.id}
          id={slide.id}
          onClick={() =>
            navigateToSlide(Math.min(index + 1, slidesData.length - 1))
          }
          className="cursor-pointer"
        >
          {renderSlide(slide)}
        </SlideContainer>
      ))}

      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slidesData.length}
        onNavigate={navigateToSlide}
      />
    </main>
  );
}
