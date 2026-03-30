import type { Metadata } from "next"
import { redirect } from "next/navigation"

import HomeLanding from "@/app/components/pages/HomeLanding"

type HomePageProps = {
  searchParams?: Promise<{
    writings?: string | string[]
  }>
}

export const metadata: Metadata = {
  title: "Raf V.",
  description: "Raf V. - AI Designer",
}

/** Avoid static prerender of `/` — client bundle (motion, tray) hit a webpack-runtime require error during SSG. */
export const dynamic = "force-dynamic"

export default async function Page({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {}
  const writings = Array.isArray(params.writings) ? params.writings[0] : params.writings

  if (typeof writings === "string" && writings.length > 0) {
    redirect(`/works?writings=${encodeURIComponent(writings)}`)
  }

  return <HomeLanding />
}
