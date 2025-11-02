import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Raf V - Minimal",
  description: "Senior Product Designer - AI & LLMs",
}

export default function NewLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}