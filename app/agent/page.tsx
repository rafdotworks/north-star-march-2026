'use client'

import { useEffect, useRef, useState } from 'react'
import { type UIMessage } from 'ai'
import { motion } from 'framer-motion'
import { XIcon } from './icons'
import Link from 'next/link'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

// Helper function to safely extract text from message parts
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('')
}

// Helper function to check if message has non-empty text content
function hasTextContent(message: UIMessage): boolean {
  return message.role !== 'assistant' || getMessageText(message).length > 0
}

export default function AgentPage() {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    // Add user message
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: message }]
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.parts.find((p): p is { type: 'text'; text: string } => p.type === 'text')?.text || ''
          }))
        })
      })

      // Check rate limit headers
      const remaining = response.headers.get('X-RateLimit-Remaining')
      if (remaining) {
        setMessagesRemaining(parseInt(remaining, 10))
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      const assistantMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        parts: [{ type: 'text', text: '' }]
      }

      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Decode the chunk directly - toTextStreamResponse returns plain text
          const chunk = decoder.decode(value, { stream: true })
          assistantText += chunk

          // Update the assistant message with accumulated text
          setMessages(prev => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg.role === 'assistant') {
              lastMsg.parts = [{ type: 'text', text: assistantText }]
            }
            return updated
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      // Remove empty assistant messages
      setMessages(prev => prev.filter(hasTextContent))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt)
  }

  return (
    <div className="min-h-screen bg-[hsl(220,10%,99%)] text-[hsl(220,15%,10%)] font-[var(--font-ronzino)]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, filter: 'blur(15px)', y: -20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="px-6 md:px-12 py-6 md:py-8"
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-lg md:text-xl font-normal tracking-tight">
              <span className="text-[hsl(220,10%,40%)]">Talk to</span>{' '}
              <span className="font-[var(--font-edu-marist)] text-[hsl(220,15%,10%)]">
                Raf
              </span>
            </h1>
          </div>

          <Link
            href="/"
            className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,15%,10%)] transition-colors duration-300"
            aria-label="Close and return home"
          >
            <XIcon size={20} />
          </Link>
        </div>

        {/* Rate limit indicator - only show when < 3 messages */}
        {messagesRemaining !== null && messagesRemaining < 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="max-w-5xl mx-auto mt-6 pt-6 border-t border-[hsl(220,12%,86%)]"
          >
            <p className="text-xs text-[hsl(220,10%,45%)]">
              {messagesRemaining > 0 ? (
                <>
                  {messagesRemaining} {messagesRemaining === 1 ? 'message' : 'messages'} remaining
                </>
              ) : (
                <>
                  Rate limit reached. <a href="mailto:raf@raf.works" className="text-[hsl(220,15%,10%)] hover:underline">Email me</a>
                </>
              )}
            </p>
          </motion.div>
        )}
      </motion.header>

      {/* Main Chat Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="pb-24"
      >
        {/* Messages */}
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onPromptSelect={handlePromptSelect}
        />
        <div ref={messagesEndRef} />


      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 md:px-12 pb-4"
        >
          <div className="max-w-3xl mx-auto px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
            {error || 'Something went wrong. Try again or reach out at raf@raf.works'}
          </div>
        </motion.div>
      )}

      {/* Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || messagesRemaining === 0}
          placeholder={
            messagesRemaining === 0
              ? 'Rate limit reached. Email raf@raf.works'
              : undefined
          }
        />
      </div>

      {/* Scoped styles for agent page only */}
      <style jsx>{`
        /* Backdrop filter fallback for unsupported browsers */
        @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
          :global(.backdrop-blur-\[14px\]) {
            background: rgba(255, 255, 255, 0.95) !important;
          }
          :global(.backdrop-blur-\[12px\]) {
            background: rgba(255, 255, 255, 0.90) !important;
          }
          :global(.backdrop-blur-\[8px\]) {
            background: rgba(255, 255, 255, 0.85) !important;
          }
        }
      `}</style>
    </div>
  )
}
