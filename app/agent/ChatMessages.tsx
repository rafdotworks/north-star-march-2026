'use client'

import { motion } from 'framer-motion'
import { type UIMessage } from 'ai'
import ReactMarkdown from 'react-markdown'
import { TypingIndicator } from './TypingIndicator'
import { EmptyStateHero } from './EmptyStateHero'
import { GlassMessageContainer } from './GlassMessageContainer'

interface ChatMessagesProps {
  messages: UIMessage[]
  isLoading: boolean
  onPromptSelect: (prompt: string) => void
}

export function ChatMessages({ messages, isLoading, onPromptSelect }: ChatMessagesProps) {
  return (
    <div className="px-6 md:px-12 py-12">
      <div className="max-w-3xl mx-auto space-y-16 md:space-y-24">
        {/* Empty state hero */}
        {messages.length === 0 && !isLoading && (
          <EmptyStateHero onPromptSelect={onPromptSelect} />
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const isUser = message.role === 'user'

          // Extract text content from message parts
          const textContent = message.parts
            .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
            .map(part => part.text)
            .join('')

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, filter: 'blur(25px)', y: 30 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{
                duration: 1.8,
                delay: index === 0 ? 0 : 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="space-y-6"
            >
              {isUser ? (
                // USER QUESTION: Section header treatment
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-normal tracking-tight leading-tight text-[hsl(220,15%,10%)]">
                    {textContent}
                  </h3>
                  <div className="w-12 h-px bg-[hsl(220,12%,80%)]" />
                </div>
              ) : (
                // AI RESPONSE: Body text with glass container
                <GlassMessageContainer delay={0.3}>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-base md:text-lg leading-relaxed text-[hsl(220,10%,25%)] mb-6 last:mb-0">
                            {children}
                          </p>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[hsl(226,92%,50%)] underline underline-offset-4 decoration-[hsl(226,92%,66%)]/30 hover:decoration-[hsl(226,92%,50%)] transition-colors duration-300"
                          >
                            {children}
                          </a>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-medium text-[hsl(220,15%,10%)]">
                            {children}
                          </strong>
                        ),
                        code: ({ children }) => (
                          <code className="px-2 py-1 rounded-lg bg-[hsl(220,12%,95%)] text-[hsl(220,10%,20%)] text-sm font-mono border border-[hsl(220,12%,86%)]">
                            {children}
                          </code>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 mb-6">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-2 mb-6">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-[hsl(220,10%,25%)] leading-relaxed">
                            {children}
                          </li>
                        )
                      }}
                    >
                      {textContent}
                    </ReactMarkdown>
                  </div>
                </GlassMessageContainer>
              )}
            </motion.div>
          )
        })}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}
      </div>
    </div>
  )
}
