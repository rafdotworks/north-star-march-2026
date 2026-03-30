"use client"

import Image from "next/image"
import { motion } from "framer-motion"

import { PHOTOS } from "@/app/config/photosConfig"
import type { TrayColors } from "@/app/components/page-specific/side-tray/types"

const PHOTO_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"] as const

function getPhotoCreditName(photo: { alt?: string; src: string }) {
  return (photo.alt ?? photo.src).replace(/\s+[23]$/, "").trim()
}

interface PhotosViewProps {
  trayColors: TrayColors
  shouldReduceMotion: boolean
  flushMobileEdges?: boolean
}

export default function PhotosView({
  trayColors,
  shouldReduceMotion,
  flushMobileEdges = false,
}: PhotosViewProps) {
  return (
    <div
      className={`flex flex-col gap-4 pb-8${flushMobileEdges ? " -mx-6" : ""}`}
    >
      {PHOTOS.map((photo, i) => (
        <motion.figure
          key={photo.src}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : i * 0.04, ease: "easeOut" }}
          className="space-y-1 w-full"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2px] bg-muted/20">
            <Image
              src={photo.src}
              alt={photo.alt ?? photo.src}
              fill
              sizes="(max-width: 500px) 100vw, 500px"
              className="object-cover"
            />
          </div>
          {photo.caption && (
            <figcaption
              className={`type-caption text-[10px] leading-tight${flushMobileEdges ? " px-6" : ""}`}
              style={{ color: trayColors.fgMuted, opacity: 0.8 }}
            >
              {photo.caption}
            </figcaption>
          )}
        </motion.figure>
      ))}
      <div className={`flex flex-col gap-1 pt-2${flushMobileEdges ? " pl-6" : ""}`}>
        {PHOTOS.map((photo, i) => (
          <p
            key={photo.src}
            className="type-caption font-edu-marist leading-relaxed"
            style={{ color: trayColors.fgMuted, opacity: 0.8 }}
          >
            <span className="opacity-70">{PHOTO_ROMAN[i]}</span> {getPhotoCreditName(photo)}
          </p>
        ))}
      </div>
    </div>
  )
}
