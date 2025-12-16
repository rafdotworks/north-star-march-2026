"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { EASING } from "@/components/animations/constants"
import type { StoryFrontmatter } from "@/app/types/story"

interface StoryHeaderProps {
  frontmatter: StoryFrontmatter
  isMobile: boolean
}

/**
 * Story Header Component
 *
 * Displays project title, metadata (role/company/year), and optional hero image
 * with blur-to-focus animations consistent with the design system.
 */
export function StoryHeader({ frontmatter, isMobile }: StoryHeaderProps) {
  const [heroLoaded, setHeroLoaded] = useState(false)

  const { title, role, company, year, heroImage, heroAlt } = frontmatter

  // Build metadata line: "Role at Company, Year"
  const parts: string[] = []
  if (role) parts.push(role)
  if (company) parts.push(`at ${company}`)
  if (year) parts.push(year)
  const metadataLine = parts.join(company ? " " : ", ")

  return (
    <motion.header
      className="mb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING.smooth }}
    >
      {/* Title */}
      <motion.h1
        className="type-title text-foreground mb-2"
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: EASING.smooth, delay: 0.1 }}
      >
        {title}
      </motion.h1>

      {/* Metadata */}
      {metadataLine && (
        <motion.p
          className="type-caption mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASING.smooth, delay: 0.2 }}
        >
          {metadataLine}
        </motion.p>
      )}

      {/* Hero Image */}
      {heroImage && (
        <motion.div
          className="relative w-full aspect-[16/9] rounded-[14px] overflow-hidden mt-4 bg-muted/20"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.6, ease: EASING.smooth, delay: 0.3 }}
        >
          <Image
            src={heroImage}
            alt={heroAlt || title}
            fill
            className="object-cover transition-all duration-700"
            style={{
              filter: heroLoaded ? "blur(0px)" : "blur(20px)",
              opacity: heroLoaded ? 1 : 0.5,
              transform: heroLoaded ? "scale(1)" : "scale(1.02)",
            }}
            sizes={isMobile ? "100vw" : "468px"}
            onLoad={() => setHeroLoaded(true)}
            priority
          />
        </motion.div>
      )}
    </motion.header>
  )
}
