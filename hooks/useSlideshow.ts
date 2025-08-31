import { useState, useEffect, useRef, useCallback } from "react";

interface SlideshowConfig {
  images: string[];
  interval?: number;
  autoPlay?: boolean;
}

interface SlideshowState {
  currentImageIndex: number;
  transitionProgress: number;
  isSlideshowPaused: boolean;
  lastImageChangeTime: number;
  loadedImages: { [key: string]: boolean };
  imageLoadingProgress: { [key: string]: number };
}

export function useSlideshow({
  images,
  interval = 3000,
  autoPlay = true,
}: SlideshowConfig) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const [lastImageChangeTime, setLastImageChangeTime] = useState(Date.now());
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const [imageLoadingProgress, setImageLoadingProgress] = useState<{
    [key: string]: number;
  }>({});
  
  const slideshowRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  // Handle image loading
  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages((prev) => ({ ...prev, [src]: true }));
  }, []);

  // Handle image loading progress
  const handleImageProgress = useCallback((src: string, event: ProgressEvent) => {
    if (event.lengthComputable) {
      const progress = Math.round((event.loaded / event.total) * 100);
      setImageLoadingProgress((prev) => ({ ...prev, [src]: progress }));
    }
  }, []);

  // Navigation functions
  const nextImage = useCallback(() => {
    setIsSlideshowPaused(true);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setIsSlideshowPaused(true);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsSlideshowPaused(true);
  }, []);

  const resumeSlideshow = useCallback(() => {
    setIsSlideshowPaused(false);
  }, []);

  // Viewport detection
  useEffect(() => {
    if (!slideshowRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(slideshowRef.current);

    return () => {
      if (slideshowRef.current) {
        observer.unobserve(slideshowRef.current);
      }
    };
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (!autoPlay || isSlideshowPaused || !isInViewport) return;

    const slideshowInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(slideshowInterval);
  }, [autoPlay, isSlideshowPaused, isInViewport, images.length, interval]);

  // Update last change time when image changes
  useEffect(() => {
    setLastImageChangeTime(Date.now());
  }, [currentImageIndex]);

  // Fallback mechanism to restart slideshow if stuck
  useEffect(() => {
    if (!autoPlay || isSlideshowPaused) return;

    const checkInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastChange = currentTime - lastImageChangeTime;

      if (timeSinceLastChange > interval * 4) {
        console.log("Slideshow appears stuck, restarting...");
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setTransitionProgress(0);
        setLastImageChangeTime(currentTime);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [autoPlay, isSlideshowPaused, lastImageChangeTime, interval, images.length]);

  // Preload images
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => handleImageLoad(src);
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        handleImageLoad(src); // Mark as loaded anyway to prevent blocking
      };
    });
  }, [images, handleImageLoad]);

  return {
    // State
    currentImageIndex,
    transitionProgress,
    isSlideshowPaused,
    loadedImages,
    imageLoadingProgress,
    isInViewport,
    
    // Actions
    nextImage,
    prevImage,
    goToImage,
    resumeSlideshow,
    setIsSlideshowPaused,
    handleImageLoad,
    handleImageProgress,
    
    // Ref
    slideshowRef,
  };
}