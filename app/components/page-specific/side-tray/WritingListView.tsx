"use client"

import type React from "react"
import { AnimatePresence, motion, type MotionProps } from "framer-motion"

import { EASING } from "@/components/animations/constants"
import { personalNotes, writings, type WritingItem } from "@/app/config/writingsConfig"
import type { TrayColors } from "@/app/components/page-specific/side-tray/types"

interface WritingListViewProps {
  isMobile: boolean
  trayColors: TrayColors
  transitionVariants?: MotionProps["variants"]
  activeListItemVariants?: MotionProps["variants"]
  personalNotesExpanded: boolean
  onTogglePersonalNotes: () => void
  onArticleTap: (articleId: string) => void
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerCancel: () => void
  onArticlePointerUp: (event: React.PointerEvent<HTMLElement>, articleId: string) => void
}

interface TrayArticleRowProps {
  article: WritingItem
  index: number
  featuredCount: number
  trayColors: TrayColors
  activeListItemVariants?: MotionProps["variants"]
  onArticleTap: (articleId: string) => void
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerCancel: () => void
  onArticlePointerUp: (event: React.PointerEvent<HTMLElement>, articleId: string) => void
}

function TrayArticleRow({
  article,
  index,
  featuredCount,
  trayColors,
  activeListItemVariants,
  onArticleTap,
  onPointerDown,
  onPointerCancel,
  onArticlePointerUp,
}: TrayArticleRowProps) {
  return (
    <motion.button
      key={article.id}
      type="button"
      custom={index}
      variants={activeListItemVariants}
      initial="hidden"
      animate="visible"
      onPointerDown={onPointerDown}
      onPointerUp={(event) => onArticlePointerUp(event, article.id)}
      onPointerCancel={onPointerCancel}
      onClick={() => onArticleTap(article.id)}
      className="tray-list-button cursor-pointer space-y-1 w-full text-left touch-manipulation border-0 bg-transparent p-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
      style={{ WebkitTapHighlightColor: "transparent", outline: "none", touchAction: "manipulation" }}
      whileHover={{ x: 4, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASING.smooth }}
    >
      <p
        className={`text-xs transition-colors duration-200${article.strikethrough ? " line-through opacity-70" : ""}`}
        style={{ color: index < featuredCount ? trayColors.fg : trayColors.fgMuted }}
      >
        {article.title}
      </p>
      <p
        className="text-[10px] font-light transition-colors duration-200"
        style={{ color: trayColors.fgMuted, opacity: 0.7 }}
      >
        {article.date}
      </p>
    </motion.button>
  )
}

export default function WritingListView({
  isMobile,
  trayColors,
  transitionVariants,
  activeListItemVariants,
  personalNotesExpanded,
  onTogglePersonalNotes,
  onArticleTap,
  onPointerDown,
  onPointerCancel,
  onArticlePointerUp,
}: WritingListViewProps) {
  return (
    <motion.div
      key="writing-list"
      variants={transitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.span
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 0.5, filter: "blur(0px)" }}
        transition={{ duration: 0.4 }}
        className="type-caption opacity-50 dark:opacity-70 block mb-2"
      >
        Writings
      </motion.span>

      <div className="space-y-4">
        {writings.map((article, index) => (
          <TrayArticleRow
            key={article.id}
            article={article}
            index={index}
            featuredCount={2}
            trayColors={trayColors}
            activeListItemVariants={activeListItemVariants}
            onArticleTap={onArticleTap}
            onPointerDown={onPointerDown}
            onPointerCancel={onPointerCancel}
            onArticlePointerUp={onArticlePointerUp}
          />
        ))}
      </div>

      <div className="mt-8">
        <motion.button
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 0.5, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onPointerDown={onPointerDown}
          onPointerCancel={onPointerCancel}
          onClick={onTogglePersonalNotes}
          className="type-caption opacity-50 dark:opacity-70 hover:opacity-80 dark:hover:opacity-90 transition-opacity duration-300 ease-out cursor-pointer flex items-center gap-1.5 w-full mb-2 text-left group/notes focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            color: trayColors.fgMuted,
          }}
        >
          <span>Personal Notes</span>
          <svg
            width="6"
            height="6"
            viewBox="0 0 8 8"
            fill="none"
            stroke="currentColor"
            className={isMobile ? "opacity-50 cursor-pointer" : "opacity-0 group-hover/notes:opacity-50 transition-opacity duration-200 cursor-pointer"}
            style={{
              transform: personalNotesExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
            }}
          >
            <path d="M2 1L5 4L2 7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {personalNotesExpanded && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: EASING.smooth }}
              className="space-y-4"
            >
              {personalNotes.map((article, index) => (
                <TrayArticleRow
                  key={article.id}
                  article={article}
                  index={index + writings.length}
                  featuredCount={writings.length + 1}
                  trayColors={trayColors}
                  activeListItemVariants={activeListItemVariants}
                  onArticleTap={onArticleTap}
                  onPointerDown={onPointerDown}
                  onPointerCancel={onPointerCancel}
                  onArticlePointerUp={onArticlePointerUp}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
