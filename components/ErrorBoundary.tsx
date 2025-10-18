"use client";

/**
 * ============================================================================
 * ERROR BOUNDARY - components/ErrorBoundary.tsx
 * ============================================================================
 *
 * React error boundary component for graceful error handling.
 *
 * FEATURES:
 * - Catches JavaScript errors in child component tree
 * - Logs error details to console
 * - Shows user-friendly fallback UI
 * - Provides refresh button to recover
 * - Optional custom fallback component
 *
 * USAGE:
 * Wrap critical UI sections to prevent full page crashes:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * Used by: app/page.tsx to wrap main content
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

/** Props for ErrorBoundary component */
interface Props {
  children: ReactNode; // Content to protect with error boundary
  fallback?: ReactNode; // Optional custom error UI
}

/** Internal state tracking error status */
interface State {
  hasError: boolean; // Whether an error has occurred
  error?: Error; // The caught error object
}

/**
 * Error boundary component (class-based, required by React)
 * Catches errors during rendering, lifecycle methods, and constructors
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="text-center">
              <h1 className="text-2xl font-medium text-foreground mb-4">
                Something went wrong
              </h1>
              <p className="text-foreground/60 mb-6">
                Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
