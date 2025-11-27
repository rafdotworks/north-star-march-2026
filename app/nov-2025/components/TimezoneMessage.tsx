/**
 * ============================================================================
 * TIMEZONE MESSAGE COMPONENT - app/nov-2025/components/TimezoneMessage.tsx
 * ============================================================================
 *
 * Displays the timezone message showing relative difference from Raf's location.
 * Handles both mobile and desktop layouts with appropriate positioning.
 *
 * FEATURES:
 * - Responsive positioning (mobile vs desktop via CSS classes)
 * - Safe area inset support for devices with notches
 * - Blur effect when panels are open (mobile only)
 * - Consistent styling across breakpoints
 *
 * POSITIONING:
 * - Mobile: Absolute positioning at bottom-left with safe area insets
 * - Desktop: Absolute positioning at bottom-left with fixed offset
 *
 * BLUR BEHAVIOR:
 * - Mobile: Blurs when any panel is open (blurWhenOpen prop)
 * - Desktop: No blur effect
 *
 * @component
 * @see app/nov-2025/page.tsx for usage examples
 */

"use client"

import React, { memo } from "react"

/**
 * Props for TimezoneMessage component.
 *
 * @interface TimezoneMessageProps
 * @property {string} message - The timezone message text to display
 * @property {boolean} [blurWhenOpen] - Whether to blur the message when panels are open (mobile only)
 */
interface TimezoneMessageProps {
  message: string
  blurWhenOpen?: boolean
}

/**
 * TimezoneMessage Component
 *
 * Displays timezone message with responsive positioning and optional blur effect.
 * Uses CSS classes (md:hidden, hidden md:block) to handle mobile vs desktop layouts.
 *
 * @param {TimezoneMessageProps} props - Component props
 * @returns {JSX.Element} The TimezoneMessage component
 */
function TimezoneMessage({ message, blurWhenOpen = false }: TimezoneMessageProps) {
  return (
    <>
      {/*
        MOBILE LAYOUT:
        - Positioned absolutely at bottom-left of viewport
        - Uses safe area insets to avoid notches/device cutouts
        - Blurs when any side tray is open

        POSITIONING:
        - bottom: max(1rem, safe-area-inset-bottom + 1rem)
        - left: max(2rem, safe-area-inset-left + 2rem) (matching px-8 padding)

        This ensures the message is always visible and not hidden by device UI.
      */}
      <div
        className="md:hidden absolute"
        style={{
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
          left: 'max(2rem, calc(env(safe-area-inset-left, 0px) + 2rem))'
        }}
      >
        <p
          className="text-[10px] text-muted-foreground/50 leading-relaxed transition-all duration-200 whitespace-nowrap"
          style={{ filter: blurWhenOpen ? 'blur(4px)' : 'blur(0px)' }}
        >
          {message}
        </p>
      </div>

      {/*
        DESKTOP LAYOUT:
        - Positioned absolutely in bottom-left corner
        - Uses safe area insets to avoid notches/device cutouts
        - No blur effect on desktop

        POSITIONING:
        - bottom: max(1.5rem, safe-area-inset-bottom + 1.5rem)
        - left: max(5rem, safe-area-inset-left + 5rem)

        This ensures the message is always visible and not hidden by device UI.
      */}
      <div
        className="hidden md:block absolute bottom-4 left-20"
        style={{
          bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
          left: 'max(5rem, calc(env(safe-area-inset-left, 0px) + 5rem))'
        }}
      >
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed transition-colors duration-200">
          {message}
        </p>
      </div>
    </>
  )
}

/**
 * Memoized TimezoneMessage component to prevent unnecessary re-renders.
 *
 * Only re-renders when props change, improving performance when parent
 * component updates but timezone message remains the same.
 */
export default memo(TimezoneMessage)
