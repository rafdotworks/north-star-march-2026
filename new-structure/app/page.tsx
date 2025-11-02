"use client"

import { useEffect, useState } from "react"

export default function Home() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const ampm = hours >= 12 ? "PM" : "AM"
      const displayHours = hours % 12 || 12

      setTime(`${displayHours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4] flex items-center px-6 md:pl-20 md:pr-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-24 lg:gap-32 w-full md:w-auto">
        <div className="space-y-2">
          <h1 className="text-sm font-normal">Raf V</h1>
          <p className="text-sm font-normal text-[#a3a3a3]">Senior Product Designer - AI & LLMs</p>
        </div>
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-normal">Toronto</p>
            <p className="text-sm font-normal text-[#a3a3a3]">{time}</p>
          </div>
          <nav className="space-y-1 md:space-y-1.5">
            <a
              href="mailto:raf@raf.works"
              className="block text-sm font-normal text-[#a3a3a3] hover:text-[#d4d4d4] transition-colors"
            >
              Email
            </a>
            <a
              href="https://twitter.com/lfgraf"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-normal text-[#a3a3a3] hover:text-[#d4d4d4] transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com/in/raffaelevitaledesign"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-normal text-[#a3a3a3] hover:text-[#d4d4d4] transition-colors"
            >
              LinkedIn
            </a>
          </nav>
        </div>
      </div>
    </main>
  )
}
