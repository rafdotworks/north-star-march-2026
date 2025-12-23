"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PlayIcon } from "@/app/components/icons/PlayIcon"
import { EASING } from "@/components/animations/constants"

interface VimeoEmbedProps {
  url: string
  aspectRatio?: string
}

/**
 * Extracts Vimeo video ID from various URL formats
 */
function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

/**
 * Vimeo Embed Component
 *
 * Renders Vimeo videos inline in story content with:
 * - Thumbnail preview with play button
 * - Lazy-loads iframe on click
 * - 16:9 aspect ratio, rounded corners
 */
export function VimeoEmbed({ url, aspectRatio = "16/9" }: VimeoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const videoId = extractVimeoId(url)

  if (!videoId) {
    return (
      <div className="my-6 p-4 bg-muted/30 rounded-[14px] text-center">
        <p className="text-xs text-muted-foreground">Invalid Vimeo URL</p>
      </div>
    )
  }

  const [w, h] = aspectRatio.split("/").map(Number)
  const paddingBottom = `${(h / w) * 100}%`

  const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=0&title=0&byline=0&portrait=0&controls=1&dnt=1`
  const thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`

  return (
    <figure className="my-6">
      <motion.div
        className="relative w-full overflow-hidden rounded-[14px] bg-muted/20"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASING.smooth }}
      >
        <div className="relative w-full" style={{ paddingBottom }}>
          {isPlaying ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video"
            />
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 w-full h-full group cursor-pointer"
              aria-label="Play video"
            >
              {/* Thumbnail */}
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-90"
                style={{
                  filter: thumbnailLoaded ? "blur(0px)" : "blur(20px)",
                  opacity: thumbnailLoaded ? 1 : 0.5,
                }}
                onLoad={() => setThumbnailLoaded(true)}
              />

              {/* Play button */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: EASING.smooth }}
                >
                  <PlayIcon
                    size={24}
                    className="text-foreground ml-1"
                  />
                </motion.div>
              </motion.div>

              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}
        </div>
      </motion.div>
    </figure>
  )
}
