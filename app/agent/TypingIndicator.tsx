'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'

export const TypingIndicator = memo(function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(25px)', y: 30 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="space-y-6"
    >
      {/* Glass container matching AI responses */}
      <div className="backdrop-blur-[14px] bg-white/60 border border-[hsl(220,12%,86%)] rounded-2xl px-6 md:px-10 py-5 md:py-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-[hsl(226,92%,66%)]"
              animate={{
                opacity: [0.3, 0.9, 0.3],
                scale: [1, 1.3, 1],
                y: [0, -4, 0]
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            />
          ))}
          <span className="ml-2 text-sm text-[hsl(220,10%,45%)]">Thinking...</span>
        </div>
      </div>
    </motion.div>
  )
})
