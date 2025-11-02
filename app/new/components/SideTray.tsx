"use client"

import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import matter from "gray-matter"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

const allWritings = [
  { id: "on-ai-agents", title: "On AI Agents", date: "Feb 15, 2025" },
  { id: "slipping-through-winter", title: "Slipping Through Winter", date: "Feb 26, 2025" },
  { id: "my-music-dna", title: "My Music DNA", date: "Mar 5, 2025" },
  { id: "my-personality-tests", title: "My Personality Tests", date: "Mar 6, 2025" },
  { id: "why-frequent-job-changes", title: "Why frequent job changes", date: "Apr 11, 2025" },
  { id: "config-sf-slowing-down", title: "Config, SF, slowing down", date: "May 9, 2025" },
  { id: "memorable-excellence", title: "Memorable Excellence", date: "Jun 14, 2025" },
  { id: "the-path-not-the-road", title: "The Path, not the Road", date: "Aug 17, 2025" },
]

interface SideTrayProps {
  articleId: string | null
  onClose: () => void
}

interface ArticleContent {
  title: string
  date: string
  content: string
}

// Custom easing curves for beautiful animations
const EASING = {
  smooth: [0.4, 0.0, 0.2, 1] as const,
  spring: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1.0] as const,
  elastic: [0.12, 1, 0.28, 1] as const,
  stagger: [0.19, 1, 0.22, 1] as const
} as const

// Enhanced multi-stage animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASING.smooth
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: EASING.smooth
    }
  }
} as const

const trayVariants = {
  hidden: {
    x: "100%",
    scale: 0.98,
    rotateY: -5,
  },
  visible: {
    x: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      x: {
        type: "spring" as const,
        stiffness: 300,
        damping: 35,
        duration: 0.5
      },
      scale: {
        duration: 0.6,
        ease: EASING.elastic,
        delay: 0.1
      },
      rotateY: {
        duration: 0.7,
        ease: EASING.spring,
        delay: 0.05
      }
    }
  },
  exit: {
    x: "100%",
    scale: 0.98,
    rotateY: -5,
    transition: {
      duration: 0.35,
      ease: EASING.smooth
    }
  }
} as const

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(10px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: {
        duration: 0.5,
        ease: EASING.smooth,
        delay: 0.3
      },
      y: {
        duration: 0.6,
        ease: EASING.elastic,
        delay: 0.35
      },
      filter: {
        duration: 0.7,
        ease: EASING.gentle,
        delay: 0.3
      }
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(5px)",
    transition: {
      duration: 0.25,
      ease: EASING.smooth
    }
  }
} as const

const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)"
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: EASING.stagger,
      delay: i * 0.04,
      filter: {
        duration: 0.5,
        ease: EASING.gentle
      }
    }
  })
}

// Enhanced view transition variants
const viewTransitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    rotateX: -5,
    filter: "blur(8px)"
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: EASING.elastic,
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -20,
    rotateX: 5,
    filter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: EASING.smooth
    }
  }
}

// Custom hook for loading articles
function useArticleLoader() {
  const [content, setContent] = useState<ArticleContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadArticle = useCallback(async (articleId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/article/${articleId}`)

      if (!response.ok) {
        throw new Error(`Failed to load article: ${response.status}`)
      }

      const data = await response.json()

      if (!data.content) {
        throw new Error("Article content is empty")
      }

      // Use gray-matter to parse frontmatter
      const parsed = matter(data.content)

      setContent({
        title: parsed.data.title || "Untitled",
        date: typeof parsed.data.date === 'string'
          ? parsed.data.date
          : parsed.data.date?.toLocaleDateString() || "",
        content: parsed.content
      })
    } catch (err) {
      console.error("Error loading article:", err)
      setError(err instanceof Error ? err.message : "Failed to load article")
      setContent(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetContent = useCallback(() => {
    setContent(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { content, isLoading, error, loadArticle, resetContent }
}

export default function SideTray({ articleId, onClose }: SideTrayProps) {
  const { content, isLoading, error, loadArticle, resetContent } = useArticleLoader()
  const [viewMode, setViewMode] = useState<'list' | 'article' | 'about'>('list')
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()

  // Mobile-optimized animation variants
  const mobileTrayVariants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 350,
        damping: 40,
        duration: 0.4
      }
    },
    exit: {
      y: "100%",
      transition: {
        duration: 0.3,
        ease: EASING.smooth
      }
    }
  } as const

  // Choose animation variants based on device
  const activeTrayVariants = isMobile ? mobileTrayVariants : trayVariants
  const activeContentVariants = shouldReduceMotion ? undefined : (isMobile ? {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: EASING.smooth,
        delay: 0.1
      }
    }
  } as const : contentVariants)
  const activeViewTransitionVariants = shouldReduceMotion ? undefined : (isMobile ? {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: EASING.smooth
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  } as const : viewTransitionVariants)

  useEffect(() => {
    if (!articleId) {
      resetContent()
      setViewMode('list')
      return
    }

    if (articleId === "all") {
      resetContent()
      setViewMode('list')
      return
    }

    if (articleId === "about") {
      resetContent()
      setViewMode('about')
      return
    }

    // Load the specific article
    setViewMode('article')
    loadArticle(articleId)
  }, [articleId, loadArticle, resetContent])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (articleId) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [articleId, onClose])

  // Custom components for ReactMarkdown with improved typography
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-base font-light text-white tracking-wider mb-6 mt-8">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-sm font-normal text-neutral-200 mb-4 mt-7">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xs font-medium text-neutral-300 mb-3 mt-5">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-xs text-neutral-400 mb-4 leading-loose">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="text-xs text-neutral-400 mb-4 ml-4 space-y-2 list-disc list-inside">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="text-xs text-neutral-400 mb-4 ml-4 space-y-2 list-decimal list-inside">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-xs text-neutral-400 leading-loose">{children}</li>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-300 hover:text-white transition-colors duration-200 underline underline-offset-2"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="text-xs text-neutral-500 border-l-2 border-neutral-700 pl-3 my-4 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="text-[10px] bg-neutral-900 px-1 py-0.5 rounded text-neutral-300 font-mono">
        {children}
      </code>
    ),
    strong: ({ children }) => (
      <strong className="font-medium text-neutral-200">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    hr: () => <hr className="border-neutral-800 my-6" />
  }

  return (
    <AnimatePresence>
      {articleId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Side tray with 3D perspective and mobile optimization */}
          <motion.div
            key="tray"
            className={`fixed ${isMobile ? 'inset-x-0 bottom-0 h-[92vh] max-h-[92dvh] rounded-t-3xl' : 'right-0 top-0 h-full w-full md:w-[500px]'} bg-[#0a0a0a]`}
            variants={activeTrayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={isMobile ? {
              paddingTop: 'env(safe-area-inset-top, 0px)',
              maxHeight: 'calc(100dvh - env(safe-area-inset-top, 0px))'
            } : { transformStyle: "preserve-3d", perspective: "1200px" }}
          >
            <motion.div
              className="h-full flex flex-col"
              variants={shouldReduceMotion ? undefined : activeContentVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
            >
              {/* Mobile drag handle */}
              {isMobile && (
                <div className="flex justify-center py-3 pt-4 pb-2">
                  <div className="w-12 h-1.5 rounded-full bg-neutral-600" />
                </div>
              )}

              {/* Minimal close button - Beautiful X icon */}
              <motion.button
                onClick={onClose}
                className={`absolute ${isMobile ? 'top-5 right-5' : 'top-6 right-6'} z-10 p-3 md:p-2 group`}
                whileHover={{ scale: 1.02, rotate: 15 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, ease: EASING.gentle }}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: 'rgb(115, 115, 115)',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(255, 255, 255)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgb(115, 115, 115)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.color = 'rgb(115, 115, 115)'
                }}
              >
                {/* X icon with thin strokes */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ pointerEvents: 'none' }}
                >
                  <path
                    d="M1 1L11 11M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>

              {/* Back button for article view */}
              {viewMode === 'article' && articleId !== "all" && (
                <motion.button
                  onClick={() => {
                    setViewMode('list')
                    resetContent()
                  }}
                  className={`absolute ${isMobile ? 'top-4 left-4' : 'top-6 left-6'} z-10 p-2 group`}
                  whileHover={{ scale: 1.02, x: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: EASING.gentle }}
                  aria-label="Back to list"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'rgb(115, 115, 115)',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgb(255, 255, 255)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgb(115, 115, 115)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.color = 'rgb(115, 115, 115)'
                  }}
                >
                  {/* Minimal arrow icon */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ pointerEvents: 'none' }}
                  >
                    <path
                      d="M7 1L2 6L7 11"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              )}

              {/* Content - adjusted padding to account for floating buttons */}
              <div
                className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-14 pb-8' : 'px-8 pt-16 pb-8'}`}
                style={isMobile ? {
                  paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))'
                } : {}}
              >
                <AnimatePresence mode="wait">
                  {viewMode === 'about' ? (
                    // About content with sophisticated transitions
                    <motion.div
                      key="about"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* Origins */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] uppercase tracking-wider text-neutral-500">Origins</h3>
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            I spent the first 20 years of my life in the Amalfi Coast, Italy. I care about clarity, systems, and the stories products tell.
                          </p>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            I started in design from software engineer + hospitality excellence through curiosity and obligation. <em className="text-neutral-500">What makes things feel right?</em>
                          </p>
                        </div>
                      </div>

                      <div className="border-b border-neutral-800/30" />

                      {/* Craft */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] uppercase tracking-wider text-neutral-500">Craft</h3>
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            Over the past eight years, I&apos;ve designed and engineered products, systems and experiences. I&apos;ve built onboarding systems, shaped design languages, and helped products grow from zero to scale.
                          </p>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            I interned at Apple and worked at Coinbase, Voiceflow, Theoriq, Zalando and many more startups, blending craft with code, and care with speed.
                          </p>
                        </div>
                      </div>

                      <div className="border-b border-neutral-800/30" />

                      {/* Presence */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] uppercase tracking-wider text-neutral-500">Presence</h3>
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            I split my time mainly between Toronto and Lisbon. This contrast keeps me balanced.
                          </p>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            I have a thing for offices and thoughtful workspaces. How they influence focus, energy, and flow. I&apos;m usually on a yoga mat, cycling, or chasing light through quiet spaces.
                          </p>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            Personality-wise, I&apos;m an ENTJ, a Red–Yellow on the Color Code, and an Enneagram 8. I value clarity, integrity, and energy that feels aligned.
                          </p>
                        </div>
                      </div>

                      <div className="border-b border-neutral-800/30" />

                      {/* Principles */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] uppercase tracking-wider text-neutral-500">Principles</h3>
                        <div className="space-y-1.5">
                          <p className="text-xs text-neutral-500">— Work hard, be kind, spread joy</p>
                          <p className="text-xs text-neutral-500">— How you do anything is how you do everything</p>
                          <p className="text-xs text-neutral-500">— Start before you think you&apos;re ready</p>
                          <p className="text-xs text-neutral-500">— Always happy, never satisfied</p>
                          <p className="text-xs text-neutral-500">— Slow is smooth, smooth is fast</p>
                        </div>
                      </div>

                    </motion.div>
                  ) : viewMode === 'list' ? (
                    // Show all articles list with enhanced transitions
                    <motion.div
                      key="list"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-4"
                    >
                      {allWritings.map((article, i) => (
                        <motion.div
                          key={article.id}
                          custom={i}
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => {
                            setViewMode('article')
                            loadArticle(article.id)
                          }}
                          className="cursor-pointer space-y-1 transition-opacity duration-200"
                          whileHover={{ x: 4, opacity: 1 }}
                          transition={{ duration: 0.2, ease: EASING.smooth }}
                        >
                          <p className="text-xs text-white">{article.title}</p>
                          <p className="text-xs text-neutral-500">{article.date}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : isLoading ? (
                    // Loading state
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-4 bg-neutral-800 rounded"
                          style={{ width: `${100 - i * 15}%` }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </motion.div>
                  ) : error ? (
                    // Error state
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-8"
                    >
                      <p className="text-xs text-neutral-400 mb-2">Unable to load this article</p>
                      <p className="text-xs text-neutral-500">{error}</p>
                      <motion.button
                        onClick={() => articleId && loadArticle(articleId)}
                        className="mt-4 text-xs text-neutral-300 hover:text-white transition-colors duration-200 underline"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try again
                      </motion.button>
                    </motion.div>
                  ) : content ? (
                    // Article content with sophisticated transitions
                    <motion.div
                      key="article"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-xs text-neutral-400 leading-loose"
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {content.content}
                      </ReactMarkdown>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}