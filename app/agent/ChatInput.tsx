'use client'

import { useState, useRef, useEffect, KeyboardEvent, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

const placeholders = [
  "Ask about my work...",
  "Curious about a project?",
  "Want to know how I think?",
  "What's your question?"
]

export const ChatInput = memo(function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[hsl(220,12%,86%)] backdrop-blur-[14px] bg-white/95 px-6 md:px-12 py-6" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))' }}>
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || placeholders[currentPlaceholder]}
            disabled={disabled}
            rows={1}
            aria-label="Chat message input"
            aria-describedby="input-hint"
            className="flex-1 bg-white/80 backdrop-blur-[8px] text-[hsl(220,15%,10%)] placeholder:text-[hsl(220,10%,50%)] rounded-2xl px-6 py-4 text-base md:text-lg leading-relaxed resize-none outline-none border border-[hsl(220,12%,86%)] focus:border-[hsl(226,92%,66%)] focus:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />

          <AnimatePresence>
            {input.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleSend}
                disabled={disabled}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-[hsl(226,92%,66%)] hover:bg-[hsl(226,85%,70%)] text-white flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <ArrowUp size={20} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          id="input-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[hsl(220,10%,50%)] text-xs mt-3 px-1"
        >
          Press Enter to send, Shift + Enter for new line
        </motion.p>
      </div>
    </div>
  )
})
