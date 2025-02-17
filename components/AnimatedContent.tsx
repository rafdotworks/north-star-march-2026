"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function AnimatedContent({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <motion.div variants={staggerChildren} initial="initial" animate="animate">
        {children}
      </motion.div>
    </motion.div>
  )
}

export function AnimatedSection({ children }: { children: ReactNode }) {
  return (
    <motion.section className="space-y-8" variants={fadeInUp}>
      {children}
    </motion.section>
  )
}

export function AnimatedParagraph({ children }: { children: ReactNode }) {
  return <motion.p variants={fadeInUp}>{children}</motion.p>
}

