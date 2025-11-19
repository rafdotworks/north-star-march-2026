import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Raf V - Minimal",
  description: "Senior Product Designer - AI & LLMs",
}

/**
 * Layout for /new route - removes mobile-gutter wrapper to enable full-screen background
 * The root layout wraps all children in mobile-gutter, but we need edge-to-edge background
 * for the new minimal page. We use negative margins to counteract the mobile-gutter padding.
 */
export default function NewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Use negative margins to counteract mobile-gutter padding from root layout
  // This allows bg-background to extend edge-to-edge on mobile
  // Mobile-gutter adds: max(16px, calc(env(safe-area-inset-left, 0px) + 16px))
  // We counteract with negative margins that match
  return (
    <div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
      {children}
    </div>
  )
}