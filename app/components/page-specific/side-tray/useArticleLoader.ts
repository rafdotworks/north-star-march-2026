"use client"

import { useCallback, useState } from "react"
import matter from "gray-matter"

import type { ArticleContent } from "@/app/components/page-specific/side-tray/types"

export function useArticleLoader(apiBasePath: string = "/api/article") {
  const [content, setContent] = useState<ArticleContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadArticle = useCallback(
    async (articleId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBasePath}/${articleId}`)

        if (!response.ok) {
          throw new Error(`Failed to load article: ${response.status}`)
        }

        const data = await response.json()

        if (!data.content) {
          throw new Error("Article content is empty")
        }

        const parsed = matter(data.content)

        setContent({
          title: parsed.data.title || "Untitled",
          date:
            typeof parsed.data.date === "string"
              ? parsed.data.date
              : parsed.data.date?.toLocaleDateString() || "",
          content: parsed.content,
          frontmatter: {
            title: parsed.data.title || "Untitled",
            role: parsed.data.role,
            company: parsed.data.company,
            year: parsed.data.year,
            heroImage: parsed.data.heroImage,
            heroAlt: parsed.data.heroAlt,
          },
        })
      } catch (err) {
        console.error("Error loading article:", err)
        setError(err instanceof Error ? err.message : "Failed to load article")
        setContent(null)
      } finally {
        setIsLoading(false)
      }
    },
    [apiBasePath],
  )

  const resetContent = useCallback(() => {
    setContent(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { content, isLoading, error, loadArticle, resetContent }
}
