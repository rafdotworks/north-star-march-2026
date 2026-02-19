"use client"

/**
 * ============================================================================
 * STORY IMAGE - app/components/story/StoryImage.tsx
 * ============================================================================
 *
 * Renders inline images in story markdown with blur-on-load, protection, and
 * optional caption.
 *
 * EXPORTS: StoryImage
 * FEATURES:
 * - Blur-on-load effect (20px blur → 0)
 * - Rounded corners (14px radius)
 * - Wrapped in ImageProtectionWrapper (discourage copy/drag)
 * - Optional caption below image; responsive sizing
 *
 * Used by: story/markdown rendering (e.g. text-2026, story views)
 */

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { EASING } from "@/components/animations/constants"
import { ImageProtectionWrapper } from "@/app/components/media/ImageProtectionWrapper"

interface StoryImageProps {
  src: string
  alt: string
  caption?: string
}

export function StoryImage({ src, alt, caption }: StoryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="my-6 p-4 bg-muted/30 rounded-[14px] text-center">
        <p className="text-xs text-muted-foreground">Image could not be loaded</p>
      </div>
    )
  }

  return (
    <ImageProtectionWrapper className="my-6">
      <figure className="my-0">
        <motion.div
          className="relative w-full overflow-hidden rounded-[14px] bg-muted/20"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASING.smooth }}
        >
          {/* Aspect ratio container */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover transition-all duration-700"
              style={{
                filter: isLoaded ? "blur(0px)" : "blur(20px)",
                opacity: isLoaded ? 1 : 0.5,
                transform: isLoaded ? "scale(1)" : "scale(1.02)",
              }}
              sizes="(max-width: 768px) 100vw, 468px"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              draggable={false}
            />
          </div>
        </motion.div>

        {/* Caption */}
        {caption && (
          <motion.figcaption
            className="mt-2 text-[10px] text-muted-foreground/60 text-center transition-colors duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: EASING.smooth }}
          >
            {caption}
          </motion.figcaption>
        )}
      </figure>
    </ImageProtectionWrapper>
  )
}
