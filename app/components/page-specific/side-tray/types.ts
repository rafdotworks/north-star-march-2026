import type { StoryFrontmatter } from "@/app/types/story"

export interface SideTrayProps {
  articleId: string | null
  onClose: () => void
  onCloseWritingOnly?: () => void
  isWritingMode?: boolean
  isAboutMode?: boolean
  onArticleSelect?: (articleId: string | null) => void
  onSwitchToWriting?: () => void
  onSwitchToPhotograph?: () => void
  onClosePhotosOnly?: () => void
  isPhotosMode?: boolean
  apiBasePath?: string
}

export interface ArticleContent {
  title: string
  date: string
  content: string
  frontmatter?: StoryFrontmatter
}

export type ViewModeType = "list" | "article" | "about" | "writing-list" | "photos"

export interface TrayColors {
  bg: string
  fg: string
  fgMuted: string
  border: string
}
