'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassMessageContainerProps {
  children: ReactNode
  delay?: number
}

export function GlassMessageContainer({
  children,
  delay = 0.3
}: GlassMessageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{
        duration: 1.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] // EASING.textReveal
      }}
      className="relative group"
    >
      <div
        className="
          backdrop-blur-[14px]
          bg-white/60
          border border-[hsl(220,12%,86%)]
          rounded-2xl
          px-6 md:px-10
          py-5 md:py-8
          shadow-[0_2px_16px_rgba(0,0,0,0.06)]
        "
      >
        {children}
      </div>
    </motion.div>
  )
}
