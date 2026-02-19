"use client"

/**
 * ============================================================================
 * IMAGE PROTECTION WRAPPER - app/components/media/ImageProtectionWrapper.tsx
 * ============================================================================
 *
 * Wraps content to discourage copying (drag, right-click save, selection).
 * Optional brief feedback message when user attempts to copy or drag.
 *
 * EXPORTS: ImageProtectionWrapper
 * USAGE: Wrap any image (or image container). Child Image/PictureImage should
 *        use draggable={false} for full effect.
 */

import React, { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { EASING } from "@/components/animations/constants"

const FEEDBACK_DURATION_MS = 1500

interface ImageProtectionWrapperProps {
  children: React.ReactNode
  /** Pass through for layout (e.g. "relative w-full") */
  className?: string
  /** When true, show a brief "Images are protected" message on context menu or drag attempt. Default true. */
  showFeedback?: boolean
}

export function ImageProtectionWrapper({
  children,
  className = "",
  showFeedback = true,
}: ImageProtectionWrapperProps) {
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  useEffect(() => {
    if (!feedbackVisible) return
    const t = setTimeout(() => setFeedbackVisible(false), FEEDBACK_DURATION_MS)
    return () => clearTimeout(t)
  }, [feedbackVisible])

  const handleProtect = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault()
      if (showFeedback && !feedbackVisible) setFeedbackVisible(true)
    },
    [showFeedback, feedbackVisible]
  )

  const wrapperClass = [
    "select-none",
    showFeedback ? "relative" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={wrapperClass}
      onDragStart={handleProtect}
      onContextMenu={handleProtect}
      onCopy={handleProtect}
    >
      {children}
      <AnimatePresence>
        {showFeedback && feedbackVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASING.smooth }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs bg-foreground/90 text-background shadow-sm pointer-events-none"
            aria-live="polite"
          >
            Images are protected
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
