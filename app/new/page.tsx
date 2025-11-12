"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Mail } from "lucide-react"
import SideTray from "./components/SideTray"
import { useSystemTheme } from "@/hooks/use-system-theme"

export default function NewMinimalPage() {
  const [timezoneMessage, setTimezoneMessage] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const { prefersDark } = useSystemTheme()

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

  return (
    <main
      className="min-h-screen min-h-[100dvh] bg-background flex flex-col md:flex-row md:items-center px-0 md:pl-20 md:pr-8 relative pt-16 md:pt-0 transition-colors duration-200"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
      }}
    >
      {/* Mobile: Flex column layout with left alignment and links at bottom */}
      <div className="flex flex-col items-start flex-1 md:flex-none md:grid md:grid-cols-3 md:gap-16 w-full md:w-auto md:items-baseline md:my-0 px-8 md:px-0">
        {/* Column 1 - Name and Title */}
        <div className="relative flex flex-col items-start md:items-start md:relative mb-12 md:mb-0">
          <h1 className="text-base md:text-base font-light text-foreground tracking-wide leading-[1.5] md:absolute md:bottom-full md:mb-1 transition-colors duration-200">Raf V</h1>
          <p className="text-xs md:text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">Senior AI Product Designer</p>
        </div>

        {/* Column 2 - About */}
        <div className="flex justify-start md:block mb-12 md:mb-0">
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
            className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:hover:text-foreground transition-all duration-200 leading-[1.5]"
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
        </div>

        {/* Spacer for equal spacing on mobile - pushes links to bottom */}
        <div className="flex-1 md:hidden"></div>

        {/* Column 3 - Links and Timezone on same line (mobile) */}
        <div className="w-full md:w-auto flex flex-row justify-between items-center md:block md:mt-0">
          {/* Navigation links */}
          <nav className="flex flex-row gap-2 md:flex-col md:space-y-0 group/nav">
            <a
              href="https://linkedin.com/in/raffaelevitaledesign"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 md:gap-1.5 py-2 md:py-0 -mx-2 px-2 md:mx-0 md:px-0 text-sm md:text-xs text-muted-foreground md:group-hover/nav:text-muted-foreground/70 md:hover:!text-foreground transition-colors duration-200 leading-[1.5] visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none whitespace-nowrap"
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
              className="group/link inline-flex items-center gap-2 md:gap-1.5 py-2 md:py-0 -mx-2 px-2 md:mx-0 md:px-0 text-sm md:text-xs text-muted-foreground md:group-hover/nav:text-muted-foreground/70 md:hover:!text-foreground transition-colors duration-200 leading-[1.5] visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none whitespace-nowrap"
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
              className="group/link inline-flex items-center gap-2 md:gap-1.5 py-2 md:py-0 -mx-2 px-2 md:mx-0 md:px-0 text-sm md:text-xs text-muted-foreground md:group-hover/nav:text-muted-foreground/70 md:hover:!text-foreground transition-colors duration-200 leading-[1.5] visited:text-muted-foreground active:text-foreground focus:text-muted-foreground focus:outline-none whitespace-nowrap"
              aria-label="Download CV"
              style={{
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              CV
              <ExternalLink size={12} className="hidden md:block w-[10px] h-[10px] opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
            </a>
          </nav>

          {/* Timezone message - inline with links on mobile, absolute on desktop */}
          <div className="md:hidden flex items-center">
            <p className="text-[10px] text-muted-foreground tracking-wide transition-colors duration-200 whitespace-nowrap">{timezoneMessage}</p>
          </div>
        </div>
      </div>

      {/* Timezone Difference - Bottom Right Corner (Desktop only) */}
      <div
        className="hidden md:block absolute bottom-4 right-4"
        style={{
          bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
          right: 'max(1.5rem, calc(env(safe-area-inset-right, 0px) + 1.5rem))'
        }}
      >
        <p className="text-[10px] text-muted-foreground tracking-wide transition-colors duration-200">{timezoneMessage}</p>
      </div>

      {/* Side tray for reading articles */}
      <SideTray articleId={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </main>
  )
}