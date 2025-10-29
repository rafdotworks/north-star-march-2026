'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void
  show: boolean
}

const prompts = [
  "Tell me about Theoriq",
  "How do you approach onboarding design?",
  "What's your design process?",
  "Tell me about your work at Coinbase",
  "How do you think about design systems?",
  "What does 'progress over movement' mean?",
  "How do you blend design and engineering?",
  "What tools do you use?",
  "Tell me about building 0→1 products",
  "How did you scale Theoriq to 140k users?"
]

// Staggered text reveal animation matching main page
const staggeredTextReveal = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0
      }
    }
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(20px)',
      y: 20,
      scale: 0.96
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
}

export function SuggestedPrompts({ onSelect, show }: SuggestedPromptsProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  // Select 3 random prompts on mount
  useEffect(() => {
    const shuffled = [...prompts].sort(() => Math.random() - 0.5)
    setSelectedPrompts(shuffled.slice(0, 3))
  }, [])

  if (!show || selectedPrompts.length === 0) return null

  return (
    <motion.div
      variants={staggeredTextReveal.container}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.p
        variants={staggeredTextReveal.item}
        className="text-sm text-[hsl(220,10%,45%)]"
      >
        Or try asking:
      </motion.p>

      <div className="space-y-3">
        {selectedPrompts.map((prompt) => (
          <motion.button
            key={prompt}
            variants={staggeredTextReveal.item}
            onClick={() => onSelect(prompt)}
            className="w-full text-left px-6 py-4 rounded-xl bg-white/50 backdrop-blur-[12px] border border-[hsl(220,12%,86%)] hover:border-[hsl(226,92%,66%)] hover:bg-white/70 text-[hsl(220,10%,25%)] text-base transition-all duration-300 group"
          >
            <span className="group-hover:text-[hsl(220,15%,10%)] transition-colors duration-300">
              {prompt}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
