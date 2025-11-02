"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Mail } from "lucide-react"
import SideTray from "./components/SideTray"

export default function NewMinimalPage() {
  const [timezoneMessage, setTimezoneMessage] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)

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
      className="min-h-screen min-h-[100dvh] bg-[#0a0a0a] flex md:items-center px-8 md:pl-20 md:pr-8 relative pt-16 md:pt-0"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
      }}
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-20 w-full md:w-auto md:items-start md:my-0">
        {/* Column 1 - Name and Title */}
        <div className="space-y-6 md:space-y-8">
          {/* Main text */}
          <div className="space-y-1">
            <h1 className="text-base md:text-base font-light text-white tracking-wide">Raf V</h1>
            <p className="text-xs md:text-xs text-neutral-500">AI Product Designer</p>
          </div>
        </div>

        {/* Column 2 - About */}
        <div className="pt-[1.875rem] md:pt-[1.625rem]">
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
            className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-neutral-500 active:text-white active:scale-[0.98] md:active:scale-100 md:hover:text-white transition-all duration-200"
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

        {/* Column 3 - Links */}
        <div className="pt-[1.875rem] md:pt-[1.625rem]">
          {/* Navigation links */}
          <nav className="space-y-2 md:space-y-1 group/nav">
            <a
              href="https://linkedin.com/in/raffaelevitaledesign"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 md:gap-1.5 py-2 md:py-0 -mx-2 px-2 md:mx-0 md:px-0 text-sm md:text-xs text-neutral-500 md:group-hover/nav:text-neutral-700 md:hover:!text-white transition-colors duration-200"
              aria-label="Visit Raf on LinkedIn"
            >
              LinkedIn
              <ExternalLink size={12} className="w-[12px] h-[12px] md:w-[10px] md:h-[10px] opacity-100 md:opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
            </a>
            <br className="hidden md:block" />
            <a
              href="mailto:raf@raf.works"
              className="group/link inline-flex items-center gap-2 md:gap-1.5 py-2 md:py-0 -mx-2 px-2 md:mx-0 md:px-0 text-sm md:text-xs text-neutral-500 md:group-hover/nav:text-neutral-700 md:hover:!text-white transition-colors duration-200"
              aria-label="Send email to Raf"
            >
              Email
              <Mail size={12} className="w-[12px] h-[12px] md:w-[10px] md:h-[10px] opacity-100 md:opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
            </a>
            <br className="hidden md:block" />
            <a
              href="/documents/CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 md:gap-1.5 py-2 md:py-0 -mx-2 px-2 md:mx-0 md:px-0 text-sm md:text-xs text-neutral-500 md:group-hover/nav:text-neutral-700 md:hover:!text-white transition-colors duration-200"
              aria-label="Download CV"
            >
              CV
              <ExternalLink size={12} className="w-[12px] h-[12px] md:w-[10px] md:h-[10px] opacity-100 md:opacity-0 md:-ml-1 md:group-hover/link:opacity-70 md:group-hover/link:ml-0 transition-all duration-200" />
            </a>
          </nav>
        </div>
      </div>

      {/* Timezone Difference - Bottom Right Corner */}
      <div
        className="absolute bottom-6 md:bottom-4 right-6 md:right-4"
        style={{
          bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
          right: 'max(1.5rem, calc(env(safe-area-inset-right, 0px) + 1.5rem))'
        }}
      >
        <p className="text-[10px] md:text-[10px] text-neutral-700 tracking-wide">{timezoneMessage}</p>
      </div>

      {/* Side tray for reading articles */}
      <SideTray articleId={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </main>
  )
}