"use client"

import { useEffect, useState, useMemo } from "react"
import SideTray from "./components/SideTray"
import WorksPanel from "./components/WorksPanel"
import { useSystemTheme } from "@/hooks/use-system-theme"

export default function NewMinimalPage() {
  const [timezoneMessage, setTimezoneMessage] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [selectedWritingArticle, setSelectedWritingArticle] = useState<string | null>(null)
  const { prefersDark, isReady } = useSystemTheme()

  // Invert theme: show opposite of user's system preference, defaulting to dark
  const shouldShowDark = useMemo(() => {
    // Default to dark during SSR/initial render or when user prefers light
    return !prefersDark || !isReady
  }, [prefersDark, isReady])

  useEffect(() => {
    const updateTimezoneMessage = () => {
      const now = new Date()

      // Get user's local time
      const userHour = now.getHours()

      // Get Toronto time
      const torontoTime = new Date(now.toLocaleString("en-US", {
        timeZone: "America/Toronto"
      }))
      const torontoHour = torontoTime.getHours()

      // Calculate difference
      let difference = torontoHour - userHour

      // Handle day boundary crossing
      if (difference > 12) difference -= 24
      if (difference < -12) difference += 24

      // Generate message
      let message = ""
      if (difference === 0) {
        message = "Raf is in your timezone"
      } else if (difference > 0) {
        message = `Raf is ${difference} hour${difference !== 1 ? 's' : ''} ahead of you`
      } else {
        message = `Raf is ${Math.abs(difference)} hour${Math.abs(difference) !== 1 ? 's' : ''} behind you`
      }

      setTimezoneMessage(message)
    }

    updateTimezoneMessage()
    // Update every minute (timezone difference won't change more frequently)
    const interval = setInterval(updateTimezoneMessage, 60000)

    return () => clearInterval(interval)
  }, [])

  const isWorksPanelOpen = selectedArticle === "works"

  return (
    <main
      className={`min-h-screen min-h-[100dvh] bg-background flex flex-col md:flex-row md:items-center px-0 md:pl-20 relative pt-16 md:pt-0 transition-all duration-200 ${isWorksPanelOpen ? 'md:pr-[50%]' : 'md:pr-8'}`}
      data-theme={shouldShowDark ? "dark" : "light"}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
      }}
    >
      {/* Mobile: Flex column layout with left alignment */}
      <div className="flex flex-col items-start flex-1 md:flex-none md:grid md:grid-cols-2 md:gap-16 w-full md:w-auto md:items-baseline md:my-0 px-8 md:px-0">
        {/* Column 1 - Name and Title */}
        <div className="relative flex flex-col items-start md:items-start md:relative mb-12 md:mb-0 gap-1">
          <h1 className="text-base md:text-base font-light text-foreground tracking-wide leading-[1.5] md:absolute md:bottom-full md:mb-1 transition-colors duration-200">Raf V</h1>
          <p className="text-xs md:text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">Senior AI Product Designer</p>
        </div>

        {/* Column 2 - About, Works, Writing */}
        <div className="flex justify-start md:block mb-12 md:mb-0">
          <div className="flex flex-col gap-1 group/menu">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedArticle("about")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedArticle("about");
                }
              }}
              className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
              aria-label="About Raf"
              style={{
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                outline: 'none'
              }}
            >
              About
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedArticle("works")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedArticle("works");
                }
              }}
              className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
              aria-label="View Works"
              style={{
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                outline: 'none'
              }}
            >
              Works
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedArticle("writing")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedArticle("writing");
                }
              }}
              className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
              aria-label="View Writing"
              style={{
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                outline: 'none'
              }}
            >
              Writing
            </div>
          </div>
        </div>

        {/* Timezone message - inline on mobile */}
        <div className="md:hidden flex items-center w-full mt-auto pt-4">
          <p className="text-[10px] text-muted-foreground tracking-wide transition-colors duration-200 whitespace-nowrap">{timezoneMessage}</p>
        </div>
      </div>

      {/* Timezone Difference - Bottom Left Corner (Desktop only) */}
      <div
        className="hidden md:block absolute bottom-4 left-20"
        style={{
          bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
          left: 'max(5rem, calc(env(safe-area-inset-left, 0px) + 5rem))'
        }}
      >
        <p className="text-[10px] text-muted-foreground tracking-wide transition-colors duration-200">{timezoneMessage}</p>
      </div>

      {/* Side tray for reading articles */}
      <SideTray 
        articleId={selectedArticle === "writing" ? selectedWritingArticle : selectedArticle === "about" ? "about" : null} 
        onClose={() => {
          if (selectedArticle === "writing") {
            // Close the entire writing tray (both list and article views)
            setSelectedArticle(null)
            setSelectedWritingArticle(null)
          } else {
            setSelectedArticle(null)
          }
        }}
        isWritingMode={selectedArticle === "writing"}
        onArticleSelect={selectedArticle === "writing" ? setSelectedWritingArticle : undefined}
      />
      
      {/* Works Panel */}
      <WorksPanel 
        isOpen={selectedArticle === "works"} 
        onClose={() => setSelectedArticle(null)} 
      />
    </main>
  )
}

