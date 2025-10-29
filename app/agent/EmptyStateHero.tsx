'use client'

import { motion } from 'framer-motion'
import { SuggestedPrompts } from './SuggestedPrompts'

interface EmptyStateHeroProps {
  onPromptSelect: (prompt: string) => void
}

// Staggered text reveal animation matching main page
const staggeredTextReveal = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.12
      }
    }
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(30px)',
      y: 35,
      scale: 0.96
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      transition: {
        duration: 2.2,
        ease: [0.25, 0.46, 0.45, 0.94] // EASING.textReveal
      }
    }
  }
}

export function EmptyStateHero({ onPromptSelect }: EmptyStateHeroProps) {
  return (
    <motion.div
      variants={staggeredTextReveal.container}
      initial="hidden"
      animate="visible"
      className="space-y-20 max-w-3xl mx-auto py-20 md:py-32"
    >
      {/* Hero headline */}
      <motion.div variants={staggeredTextReveal.item}>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight">
          Hey, I&apos;m{' '}
          <span className="font-[var(--font-edu-marist)]">Raf</span>
          <span className="text-[hsl(220,10%,40%)]">
            — or at least, a version of me.
          </span>
        </h2>
      </motion.div>

      {/* Supporting text */}
      <motion.div
        variants={staggeredTextReveal.item}
        className="space-y-6 text-lg md:text-xl leading-relaxed text-[hsl(220,10%,35%)]"
      >
        <p>
          Ask me about my work, process, or how I think about design and engineering.
        </p>
        <p className="text-base text-[hsl(220,10%,45%)]">
          I&apos;m trained on my portfolio, case studies, and design philosophy.
        </p>
      </motion.div>

      {/* Suggested prompts */}
      <motion.div variants={staggeredTextReveal.item}>
        <SuggestedPrompts onSelect={onPromptSelect} show={true} />
      </motion.div>
    </motion.div>
  )
}
