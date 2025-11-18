"use client"

import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import matter from "gray-matter"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ExternalLink, Mail } from "lucide-react"
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
  isWritingMode?: boolean
  onArticleSelect?: (articleId: string | null) => void
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

export default function SideTray({ articleId, onClose, isWritingMode = false, onArticleSelect }: SideTrayProps) {
  const { content, isLoading, error, loadArticle, resetContent } = useArticleLoader()
  const [viewMode, setViewMode] = useState<'list' | 'article' | 'about' | 'writing-list'>('list')
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  
  // For nested writing tray, we need to track if we're showing the list or an article
  const isNestedWritingTray = isWritingMode && articleId !== null

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
      if (isWritingMode) {
        setViewMode('writing-list')
      } else {
        setViewMode('list')
      }
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

    // If in writing mode and articleId is set, show the article
    if (isWritingMode) {
      setViewMode('article')
      loadArticle(articleId)
      return
    }

    // Load the specific article
    setViewMode('article')
    loadArticle(articleId)
  }, [articleId, loadArticle, resetContent, isWritingMode])

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
      <h1 className="text-base font-light text-foreground tracking-wider mb-6 mt-8 transition-colors duration-200">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-sm font-normal text-foreground/90 mb-4 mt-7 transition-colors duration-200">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xs font-medium text-foreground/80 mb-3 mt-5 transition-colors duration-200">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-xs text-muted-foreground mb-4 leading-[1.5] transition-colors duration-200">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="text-xs text-muted-foreground mb-4 ml-4 space-y-2 list-disc list-inside transition-colors duration-200">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="text-xs text-muted-foreground mb-4 ml-4 space-y-2 list-decimal list-inside transition-colors duration-200">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">{children}</li>
    ),
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http://') || href?.startsWith('https://')
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="group/link inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hover:!text-foreground transition-colors duration-200 visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none"
          style={{
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {children}
          {isExternal && (
            <ExternalLink size={12} className="hidden md:block w-[10px] h-[10px] opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
          )}
        </a>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="text-xs text-muted-foreground border-l-2 border-border pl-3 my-4 italic transition-colors duration-200">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="text-[10px] bg-muted px-1 py-0.5 rounded text-foreground font-mono transition-colors duration-200">
        {children}
      </code>
    ),
    strong: ({ children }) => (
      <strong className="font-medium text-foreground transition-colors duration-200">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    hr: () => <hr className="border-border my-6 transition-colors duration-200" />
  }

  // Determine if we should show the tray
  // Show tray if: writing mode (always show), or articleId is set (normal mode)
  const shouldShowTray = isWritingMode || articleId !== null
  
  // For writing mode: show list tray when no article selected, show article tray when article selected
  const showWritingListTray = isWritingMode && articleId === null
  const showWritingArticleTray = isWritingMode && articleId !== null
  const showNormalTray = !isWritingMode && articleId !== null
  
  return (
    <>
      {/* Writing list tray (first tray when in writing mode) */}
      <AnimatePresence>
        {showWritingListTray && (
          <>
            {/* Backdrop */}
            <motion.div
              key="writing-list-backdrop"
              className="fixed inset-0 bg-background/50 backdrop-blur-sm transition-colors duration-200 z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            {/* Writing list tray */}
            <motion.div
              key="writing-list-tray"
              className={`fixed ${isMobile ? 'inset-x-0 bottom-0 h-[92vh] max-h-[92dvh] rounded-t-3xl' : 'right-0 top-0 h-full w-full md:w-[500px]'} bg-background transition-colors duration-200 z-50`}
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
                    <div className="w-12 h-1.5 rounded-full bg-muted transition-colors duration-200" />
                  </div>
                )}

                {/* Close button */}
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
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                >
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

                {/* Content */}
                <div
                  className={`flex-1 overflow-y-auto ${isMobile ? 'px-6 pt-14 pb-8' : 'px-8 pt-16 pb-8'}`}
                  style={isMobile ? {
                    paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))'
                  } : {}}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="writing-list"
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
                            if (onArticleSelect) {
                              onArticleSelect(article.id)
                            }
                          }}
                          className="cursor-pointer space-y-1 transition-opacity duration-200"
                          whileHover={{ x: 4, opacity: 1 }}
                          transition={{ duration: 0.2, ease: EASING.smooth }}
                        >
                          <p className="text-xs text-foreground transition-colors duration-200">{article.title}</p>
                          <p className="text-xs text-muted-foreground transition-colors duration-200">{article.date}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Writing article tray (nested tray when article selected) or normal tray */}
      <AnimatePresence>
        {(showWritingArticleTray || showNormalTray) && (
          <>
            {/* Backdrop - always show to enable click-outside-to-close */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-background/50 backdrop-blur-sm transition-colors duration-200 z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            {/* Side tray with 3D perspective and mobile optimization */}
            <motion.div
              key="tray"
              className={`fixed ${isMobile ? 'inset-x-0 bottom-0 h-[92vh] max-h-[92dvh] rounded-t-3xl' : 'right-0 top-0 h-full w-full md:w-[500px]'} bg-background transition-colors duration-200`}
              variants={activeTrayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                ...(isMobile ? {
                  paddingTop: 'env(safe-area-inset-top, 0px)',
                  maxHeight: 'calc(100dvh - env(safe-area-inset-top, 0px))'
                } : { transformStyle: "preserve-3d", perspective: "1200px" }),
                // Higher z-index for nested writing tray
                zIndex: isNestedWritingTray ? 60 : 50,
              }}
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
                  <div className="w-12 h-1.5 rounded-full bg-muted transition-colors duration-200" />
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
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
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
                    if (isWritingMode && onArticleSelect) {
                      // For writing mode, go back to list
                      onArticleSelect(null)
                    } else {
                      setViewMode('list')
                      resetContent()
                    }
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
                    color: 'hsl(var(--muted-foreground))',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none'
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
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
                  {viewMode === 'writing-list' ? (
                    // Writing list view
                    <motion.div
                      key="writing-list"
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
                            if (onArticleSelect) {
                              onArticleSelect(article.id)
                            }
                          }}
                          className="cursor-pointer space-y-1 transition-opacity duration-200"
                          whileHover={{ x: 4, opacity: 1 }}
                          transition={{ duration: 0.2, ease: EASING.smooth }}
                        >
                          <p className="text-xs text-foreground transition-colors duration-200">{article.title}</p>
                          <p className="text-xs text-muted-foreground transition-colors duration-200">{article.date}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : viewMode === 'about' ? (
                    // About content with sophisticated transitions
                    <motion.div
                      key="about"
                      variants={activeViewTransitionVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* Opening */}
                      <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                        I spent the first twenty years of my life on the Amalfi Coast, Italy. I design and build products that connect logic with feeling.
                      </p>

                      {/* Work Modes */}
                      <div className="space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                          My work moves in two modes:
                        </p>
                        <div className="space-y-3 ml-4">
                          <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                            <span className="font-medium text-foreground">1.</span> Full-time inside early teams where I shape the foundations of new products. I&apos;ve been a <span className="font-medium text-foreground">Founding Product Designer</span> at Theoriq, <span className="font-medium text-foreground">Product Design Lead</span> for accessibility at CurbCutOS, and <span className="font-medium text-foreground">Design Lead</span> at an early crypto startup. Before that, <span className="font-medium text-foreground">Founding Designer</span> at Artscapy and UX/UI Design Intern at Apple Developer Academy.
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                            <span className="font-medium text-foreground">2.</span> Contract work where I join for clarity, speed and system thinking. Recently designing AI agents at Voiceflow and developer tools at Coinbase. Before that, design systems at Zalando and product work at TravelNest.
                          </p>
                        </div>
                      </div>

                      {/* Full-time vs Contract */}
                      <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                        Full-time gives me depth. Contract gives me range. Since 2016, I&apos;ve also led design at Never Before Seen Studio, a freelance practice.
                      </p>

                      {/* Today */}
                      <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                        Today I focus on AI systems and design-engineering work that makes complex products feel clear, fast and trustworthy.
                      </p>

                      {/* 2025 */}
                      {/* <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                        2025 is an intentional year of exploration across design, design engineering and product.
                      </p> */}

                      {/* Location */}
                      <p className="text-xs text-muted-foreground leading-relaxed transition-colors duration-200">
                        I now live in Toronto, often spending time in Lisbon and New York City. I&apos;m usually on a yoga mat, cycling, or chasing light through quiet spaces.
                      </p>

                      {/* Principles */}
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground transition-colors duration-200">— How you do anything is how you do everything</p>
                        <p className="text-xs text-muted-foreground transition-colors duration-200">— Always happy, never satisfied</p>
                        <p className="text-xs text-muted-foreground transition-colors duration-200">— Progress over movement</p>
                      </div>

                      {/* Contact Links */}
                      <nav className="flex flex-col gap-1 group/nav pt-2">
                        <a
                          href="https://linkedin.com/in/raffaelevitaledesign"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hover:!text-foreground transition-colors duration-200 leading-[1.5] visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none"
                          aria-label="Visit Raf on LinkedIn"
                          style={{
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          LinkedIn
                          <ExternalLink size={12} className="hidden md:block w-[10px] h-[10px] opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
                        </a>
                        <a
                          href="mailto:raf@raf.works"
                          className="group/link inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hover:!text-foreground transition-colors duration-200 leading-[1.5] visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none"
                          aria-label="Send email to Raf"
                          style={{
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          Email
                          <Mail size={12} className="hidden md:block w-[10px] h-[10px] opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
                        </a>
                        <a
                          href="/documents/CV.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1.5 text-xs text-muted-foreground md:hover:!text-foreground transition-colors duration-200 leading-[1.5] visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none"
                          aria-label="Download CV"
                          style={{
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          CV
                          <ExternalLink size={12} className="hidden md:block w-[10px] h-[10px] opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
                        </a>
                      </nav>

                    </motion.div>
                  ) : viewMode === 'list' ? (
                    // Show all articles list with enhanced transitions (legacy mode, not used in writing mode)
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
                          <p className="text-xs text-foreground transition-colors duration-200">{article.title}</p>
                          <p className="text-xs text-muted-foreground transition-colors duration-200">{article.date}</p>
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
                          className="h-4 bg-muted rounded transition-colors duration-200"
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
                      <p className="text-xs text-muted-foreground mb-2 transition-colors duration-200">Unable to load this article</p>
                      <p className="text-xs text-muted-foreground transition-colors duration-200">{error}</p>
                      <motion.button
                        onClick={() => articleId && loadArticle(articleId)}
                        className="mt-4 text-xs text-primary hover:text-foreground transition-colors duration-200 underline"
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
                      className="space-y-6"
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
    </>
  )
}