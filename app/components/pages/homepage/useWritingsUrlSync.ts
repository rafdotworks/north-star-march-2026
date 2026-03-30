"use client"

import { useEffect } from "react"

interface UseWritingsUrlSyncProps {
  pathname: string
  isWritingOpen: boolean
  selectedWritingArticle: string | null
  syncWritingFromUrl: (articleId: string | null) => void
}

function getWritingSlugFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get("writings")
}

export function useWritingsUrlSync({
  pathname,
  isWritingOpen,
  selectedWritingArticle,
  syncWritingFromUrl,
}: UseWritingsUrlSyncProps) {
  useEffect(() => {
    syncWritingFromUrl(getWritingSlugFromUrl())
  }, [syncWritingFromUrl])

  useEffect(() => {
    if (isWritingOpen && selectedWritingArticle) {
      window.history.pushState({}, "", `${pathname}?writings=${selectedWritingArticle}`)
      return
    }

    if (getWritingSlugFromUrl()) {
      window.history.pushState({}, "", pathname)
    }
  }, [isWritingOpen, pathname, selectedWritingArticle])

  useEffect(() => {
    const handlePopState = () => {
      syncWritingFromUrl(getWritingSlugFromUrl())
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [syncWritingFromUrl])
}
