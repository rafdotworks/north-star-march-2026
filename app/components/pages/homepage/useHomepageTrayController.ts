"use client"

import { useCallback, useEffect, useState } from "react"

export function useHomepageTrayController(initialWritingArticle: string | null = null) {
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(initialWritingArticle)
  const [isWritingOpen, setIsWritingOpen] = useState(Boolean(initialWritingArticle))
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isPhotosOpen, setIsPhotosOpen] = useState(false)

  const trayOpen = isWritingOpen || isAboutOpen || isPhotosOpen

  const closeAllTrays = useCallback(() => {
    setIsWritingOpen(false)
    setIsAboutOpen(false)
    setIsPhotosOpen(false)
    setSelectedWritingArticle(null)
  }, [])

  const closeWritingTray = useCallback(() => {
    setIsWritingOpen(false)
    setSelectedWritingArticle(null)
  }, [])

  const closePhotosTray = useCallback(() => {
    setIsPhotosOpen(false)
  }, [])

  const openAboutTray = useCallback(() => {
    setIsAboutOpen(true)
    setIsWritingOpen(false)
    setIsPhotosOpen(false)
    setSelectedWritingArticle(null)
  }, [])

  const openWritingTray = useCallback((articleId: string | null = null) => {
    setIsWritingOpen(true)
    setIsAboutOpen(false)
    setIsPhotosOpen(false)
    setSelectedWritingArticle(articleId)
  }, [])

  const openPhotosTray = useCallback(() => {
    setIsPhotosOpen(true)
    setIsWritingOpen(false)
    setSelectedWritingArticle(null)
  }, [])

  const selectWritingArticle = useCallback((articleId: string | null) => {
    setSelectedWritingArticle(articleId)
    setIsWritingOpen(true)
  }, [])

  const syncWritingFromUrl = useCallback((articleId: string | null) => {
    if (articleId) {
      setSelectedWritingArticle(articleId)
      setIsWritingOpen(true)
      setIsAboutOpen(false)
      setIsPhotosOpen(false)
      return
    }

    setIsWritingOpen(false)
    setSelectedWritingArticle(null)
  }, [])

  useEffect(() => {
    if (trayOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [trayOpen])

  return {
    trayOpen,
    isWritingOpen,
    isAboutOpen,
    isPhotosOpen,
    selectedWritingArticle,
    closeAllTrays,
    closeWritingTray,
    closePhotosTray,
    openAboutTray,
    openWritingTray,
    openPhotosTray,
    selectWritingArticle,
    syncWritingFromUrl,
  }
}
