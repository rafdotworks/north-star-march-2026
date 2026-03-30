"use client"

import type { CSSProperties, MouseEvent, TouchEvent } from "react"
import { useRef } from "react"

import { HERO_UNDERLINE_CLASSES } from "@/app/components/layout/InlineExternalLink"

const TAP_MOVE_THRESHOLD_PX = 10

interface HomepageIdentityTriggerProps {
  onOpen: () => void
  className?: string
  style?: CSSProperties
  label?: string
}

export default function HomepageIdentityTrigger({
  onOpen,
  className,
  style,
  label = "Raf V.",
}: HomepageIdentityTriggerProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    const touch = event.targetTouches[0]
    if (!touch) return

    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = event.changedTouches[0]
    if (!touch) return

    const dx = Math.abs(touch.clientX - start.x)
    const dy = Math.abs(touch.clientY - start.y)

    if (dx <= TAP_MOVE_THRESHOLD_PX && dy <= TAP_MOVE_THRESHOLD_PX) {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      className={`mobile-home-identity-link inline-flex items-baseline cursor-pointer select-none appearance-none border-0 bg-transparent p-0 text-left text-inherit outline-none ring-0 shadow-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:[box-shadow:none] focus-visible:[box-shadow:none] ${HERO_UNDERLINE_CLASSES}${className ? ` ${className}` : ""}`}
      style={{
        background: "transparent",
        boxShadow: "none",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        WebkitAppearance: "none",
        MozAppearance: "none",
        ...style,
      }}
    >
      {label}
    </button>
  )
}
