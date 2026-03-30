"use client"

import ReactMarkdown from "react-markdown"
import { motion, type MotionProps } from "framer-motion"

import { markdownComponents } from "@/app/components/markdown/markdownComponents"
import { storyMarkdownComponents } from "@/app/components/markdown/storyMarkdownComponents"
import { trayMarkdownComponents } from "@/app/components/markdown/trayMarkdownComponents"
import { StoryHeader } from "@/app/components/story"
import type { ArticleContent, TrayColors } from "@/app/components/page-specific/side-tray/types"

interface ArticleViewProps {
  content: ArticleContent
  apiBasePath: string
  isMobile: boolean
  transitionVariants?: MotionProps["variants"]
}

export function ArticleView({
  content,
  apiBasePath,
  isMobile,
  transitionVariants,
}: ArticleViewProps) {
  return (
    <motion.div
      key="article"
      variants={transitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <article aria-label={content.title || "Article"}>
        <div className="prose-article-narrow tray-about-text-fade">
          {apiBasePath === "/api/story" && content.frontmatter && (
            <StoryHeader frontmatter={content.frontmatter} isMobile={isMobile} />
          )}
          <ReactMarkdown
            components={
              apiBasePath === "/api/story"
                ? storyMarkdownComponents
                : apiBasePath === "/api/article"
                  ? trayMarkdownComponents
                  : markdownComponents
            }
          >
            {content.content}
          </ReactMarkdown>
        </div>
      </article>
    </motion.div>
  )
}

interface ArticleErrorViewProps {
  error: string
  onRetry: () => void
  trayColors: TrayColors
}

export function ArticleErrorView({ error, onRetry, trayColors }: ArticleErrorViewProps) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-center py-8"
    >
      <p className="text-xs mb-2" style={{ color: trayColors.fgMuted }}>
        Unable to load this article
      </p>
      <p className="text-[10px] font-light" style={{ color: trayColors.fgMuted, opacity: 0.7 }}>
        {error}
      </p>
      <motion.button
        onClick={onRetry}
        className="mt-4 text-xs type-caption cursor-pointer focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
        style={{
          color: trayColors.fgMuted,
          background: "transparent",
          border: "none",
          padding: 0,
          outline: "none",
          textDecoration: "underline",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = trayColors.fg
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = trayColors.fgMuted
        }}
      >
        Try again
      </motion.button>
    </motion.div>
  )
}
