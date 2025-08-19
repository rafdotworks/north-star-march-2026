"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  timeToFirstByte: number;
  timeToFirstContentfulPaint: number;
  timeToLargestContentfulPaint: number;
  connectionSpeed: string;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      const timeToFirstByte =
        navigation.responseStart - navigation.requestStart;
      const timeToFirstContentfulPaint =
        paint.find((entry) => entry.name === "first-contentful-paint")
          ?.startTime || 0;
      const timeToLargestContentfulPaint =
        paint.find((entry) => entry.name === "largest-contentful-paint")
          ?.startTime || 0;

      // Detect connection speed
      let connectionSpeed = "unknown";
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType) {
          connectionSpeed = connection.effectiveType;
        }
      }

      setMetrics({
        timeToFirstByte,
        timeToFirstContentfulPaint,
        timeToLargestContentfulPaint,
        connectionSpeed,
      });

      // Log performance data for optimization
      console.log("Performance Metrics:", {
        timeToFirstByte: `${timeToFirstByte.toFixed(2)}ms`,
        timeToFirstContentfulPaint: `${timeToFirstContentfulPaint.toFixed(
          2
        )}ms`,
        timeToLargestContentfulPaint: `${timeToLargestContentfulPaint.toFixed(
          2
        )}ms`,
        connectionSpeed,
      });
    };

    // Wait for performance metrics to be available
    if (performance.getEntriesByType("paint").length > 0) {
      measurePerformance();
    } else {
      // Fallback: measure after a delay
      setTimeout(measurePerformance, 1000);
    }
  }, []);

  // Only show in development and only if metrics are available
  if (process.env.NODE_ENV !== "development" || !metrics) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>TTFB: {metrics.timeToFirstByte.toFixed(0)}ms</div>
        <div>FCP: {metrics.timeToFirstContentfulPaint.toFixed(0)}ms</div>
        <div>LCP: {metrics.timeToLargestContentfulPaint.toFixed(0)}ms</div>
        <div>Speed: {metrics.connectionSpeed}</div>
      </div>
    </div>
  );
};
