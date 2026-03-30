"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMotionValue, useReducedMotion, useTransform } from "framer-motion"

import { LOAD_FOCUS } from "@/components/animations/LoadingAnimations"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSystemTheme } from "@/hooks/use-system-theme"

function getThemeBlendValues(prefersDark: boolean) {
  return prefersDark
    ? { percent: "100%", number: "1" }
    : { percent: "0%", number: "0" }
}

type MobileScene = {
  bgStart: string
  bgEnd: string
  title: string
  primary: string
  meta: string
  link: string
}

const MOBILE_SCRUB_STOPS = [0, 0.33, 0.66, 1]

const MOBILE_LIGHT_SCENES: readonly MobileScene[] = [
  {
    bgStart: "#2C4A6E",
    bgEnd: "#264060",
    title: "#FAF6F0",
    primary: "#FAF6F0",
    meta: "#D6CFC4",
    link: "#E8D5B8",
  },
  {
    bgStart: "#264060",
    bgEnd: "#335680",
    title: "#E8D5B8",
    primary: "#FAF6F0",
    meta: "#D6CFC4",
    link: "#E8D5B8",
  },
  {
    bgStart: "#335680",
    bgEnd: "#2C4A6E",
    title: "#FAF6F0",
    primary: "#FAF6F0",
    meta: "#D6CFC4",
    link: "#E8D5B8",
  },
  {
    bgStart: "#141E2E",
    bgEnd: "#1A2738",
    title: "#D6CFC4",
    primary: "#FAF6F0",
    meta: "#D6CFC4",
    link: "#D6CFC4",
  },
]

const MOBILE_DARK_SCENES: readonly MobileScene[] = [
  {
    bgStart: "#141E2E",
    bgEnd: "#1A2738",
    title: "#FAF6F0",
    primary: "#FAF6F0",
    meta: "#A89E90",
    link: "#D6CFC4",
  },
  {
    bgStart: "#1A2738",
    bgEnd: "#1F2F44",
    title: "#D6CFC4",
    primary: "#FAF6F0",
    meta: "#A89E90",
    link: "#D6CFC4",
  },
  {
    bgStart: "#1F2F44",
    bgEnd: "#141E2E",
    title: "#FAF6F0",
    primary: "#FAF6F0",
    meta: "#A89E90",
    link: "#D6CFC4",
  },
  {
    bgStart: "#0F1A28",
    bgEnd: "#141E2E",
    title: "#D6CFC4",
    primary: "#FAF6F0",
    meta: "#A89E90",
    link: "#D6CFC4",
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

type MobileScrubStyle = CSSProperties & {
  "--mobile-home-bg-start"?: string
  "--mobile-home-bg-end"?: string
  "--mobile-home-title"?: string
  "--mobile-home-primary"?: string
  "--mobile-home-meta"?: string
  "--mobile-home-link"?: string
}

export function useHomepageScrollEffects() {
  const { prefersDark, isReady } = useSystemTheme()
  const isMobile = useIsMobile()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [themeInverted, setThemeInverted] = useState(false)
  const prefersDarkRef = useRef(prefersDark)
  const mobileShellRef = useRef<HTMLElement | null>(null)
  const mobileFirstWorkImageRef = useRef<HTMLDivElement>(null)
  const desktopFirstWorkImageRef = useRef<HTMLDivElement>(null)
  const theoriqVideoRef = useRef<HTMLDivElement>(null)
  const coinbaseSectionRef = useRef<HTMLDivElement>(null)
  const mobileScenes = prefersDark ? MOBILE_DARK_SCENES : MOBILE_LIGHT_SCENES
  const mobileSceneProgress = useMotionValue(0)
  const desktopFirstImageProgress = useMotionValue(0)
  const firstImageScale = useTransform(desktopFirstImageProgress, [0, 1], [0.75, 1])
  const mobileBgStart = useTransform(
    mobileSceneProgress,
    MOBILE_SCRUB_STOPS,
    mobileScenes.map((scene) => scene.bgStart),
  )
  const mobileBgEnd = useTransform(
    mobileSceneProgress,
    MOBILE_SCRUB_STOPS,
    mobileScenes.map((scene) => scene.bgEnd),
  )
  const mobileTitleColor = useTransform(
    mobileSceneProgress,
    MOBILE_SCRUB_STOPS,
    mobileScenes.map((scene) => scene.title),
  )
  const mobilePrimaryColor = useTransform(
    mobileSceneProgress,
    MOBILE_SCRUB_STOPS,
    mobileScenes.map((scene) => scene.primary),
  )
  const mobileMetaColor = useTransform(
    mobileSceneProgress,
    MOBILE_SCRUB_STOPS,
    mobileScenes.map((scene) => scene.meta),
  )
  const mobileLinkColor = useTransform(
    mobileSceneProgress,
    MOBILE_SCRUB_STOPS,
    mobileScenes.map((scene) => scene.link),
  )
  const [scrollProgress, setScrollProgress] = useState(0)
  const desktopTicking = useRef(false)
  const mobileTicking = useRef(false)
  const [loadComplete, setLoadComplete] = useState(false)

  useEffect(() => {
    prefersDarkRef.current = prefersDark
  }, [prefersDark])

  useEffect(() => {
    if (!isReady || typeof document === "undefined") return

    const themeBlend = themeInverted ? 1 : 0
    const finalBlend = prefersDarkRef.current ? (1 - themeBlend) * 100 : themeBlend * 100

    document.documentElement.style.setProperty("--theme-blend", `${finalBlend}%`)
    document.documentElement.style.setProperty("--theme-blend-num", `${finalBlend / 100}`)
  }, [themeInverted, isReady])

  useEffect(() => {
    if (!isReady || typeof document === "undefined") return

    const initialBlend = getThemeBlendValues(prefersDark)

    document.documentElement.style.setProperty("--theme-blend", initialBlend.percent)
    document.documentElement.style.setProperty("--theme-blend-num", initialBlend.number)

    return () => {
      const resetBlend = getThemeBlendValues(prefersDarkRef.current)
      document.documentElement.style.setProperty("--theme-blend", resetBlend.percent)
      document.documentElement.style.setProperty("--theme-blend-num", resetBlend.number)
    }
  }, [isReady, prefersDark])

  useEffect(() => {
    if (!isMobile) {
      mobileSceneProgress.set(0)
      return
    }

    if (shouldReduceMotion) {
      mobileSceneProgress.set(0)
      return
    }

    const updateMobileProgress = () => {
      const mobileShell = mobileShellRef.current

      if (!mobileShell) {
        mobileSceneProgress.set(0)
        return
      }

      const mobileShellRect = mobileShell.getBoundingClientRect()
      const mobileShellTop = window.scrollY + mobileShellRect.top
      const scrollRange = Math.max(mobileShell.offsetHeight - window.innerHeight, 1)
      const progress = clamp((window.scrollY - mobileShellTop) / scrollRange, 0, 1)

      mobileSceneProgress.set(progress)
    }

    const handleMobileScroll = () => {
      if (!mobileTicking.current) {
        requestAnimationFrame(() => {
          updateMobileProgress()
          mobileTicking.current = false
        })
        mobileTicking.current = true
      }
    }

    updateMobileProgress()
    window.addEventListener("scroll", handleMobileScroll, { passive: true })
    window.addEventListener("resize", handleMobileScroll)

    return () => {
      window.removeEventListener("scroll", handleMobileScroll)
      window.removeEventListener("resize", handleMobileScroll)
    }
  }, [isMobile, mobileSceneProgress, shouldReduceMotion])

  useEffect(() => {
    if (isMobile) {
      setScrollProgress(0)
      setThemeInverted(false)
      desktopFirstImageProgress.set(0)
      return
    }

    const updateDesktopProgress = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const progress = Math.min(1, Math.max(0, scrollY / (viewportHeight * 0.8)))
      const desktopFirstImage = desktopFirstWorkImageRef.current

      setScrollProgress(1 - Math.pow(1 - progress, 3))

      if (desktopFirstImage) {
        const desktopFirstImageRect = desktopFirstImage.getBoundingClientRect()
        desktopFirstImageProgress.set(
          clamp((viewportHeight - desktopFirstImageRect.top) / viewportHeight, 0, 1),
        )
      } else {
        desktopFirstImageProgress.set(0)
      }

      const theoriqVideo = theoriqVideoRef.current
      const coinbaseSection = coinbaseSectionRef.current

      if (!theoriqVideo || !coinbaseSection) {
        setThemeInverted(false)
        return
      }

      const theoriqRect = theoriqVideo.getBoundingClientRect()
      const coinbaseRect = coinbaseSection.getBoundingClientRect()
      const themeStartY = scrollY + theoriqRect.top - viewportHeight
      const themeEndY = scrollY + coinbaseRect.top - viewportHeight

      setThemeInverted(scrollY >= themeStartY && scrollY < themeEndY)
    }

    const handleScroll = () => {
      if (!desktopTicking.current) {
        requestAnimationFrame(() => {
          updateDesktopProgress()
          desktopTicking.current = false
        })
        desktopTicking.current = true
      }
    }

    updateDesktopProgress()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [desktopFirstImageProgress, isMobile])

  useEffect(() => {
    if (shouldReduceMotion) {
      setLoadComplete(true)
      return
    }

    const timer = setTimeout(() => setLoadComplete(true), 1700)
    const onScroll = () => {
      clearTimeout(timer)
      setLoadComplete(true)
    }

    window.addEventListener("scroll", onScroll, { once: true, passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [shouldReduceMotion])

  let heroBlur: number
  let heroOpacity: number
  let heroScale: number

  if (scrollProgress < 0.4) {
    const progress = scrollProgress / 0.4
    const eased = 1 - Math.pow(1 - progress, 2)
    heroBlur = eased * 32
    heroOpacity = 1 - eased * 0.05
    heroScale = 1 - eased * 0.03
  } else if (scrollProgress < 0.7) {
    heroBlur = 32
    heroOpacity = 0.95
    heroScale = 0.97
  } else {
    const progress = (scrollProgress - 0.7) / 0.3
    heroBlur = 32
    heroOpacity = 0.95 - progress * 0.75
    heroScale = 0.97 - progress * 0.09
  }

  const containerStyle = useMemo(
    () => ({
      backgroundColor: "var(--bg)",
      color: "var(--fg)",
      transition:
        "background-color var(--theme-transition-duration) var(--theme-transition-easing), color var(--theme-transition-duration) var(--theme-transition-easing)",
    }),
    [],
  )

  const heroStyle = useMemo(
    () =>
      isMobile
        ? {
            filter: "none",
            transform: "none",
            opacity: 1,
            willChange: "auto" as const,
          }
        : {
            filter: `blur(${heroBlur}px)`,
            transform: `scale(${heroScale})`,
            opacity: heroOpacity,
            willChange: scrollProgress > 0 ? "filter, transform, opacity" : "auto",
          },
    [heroBlur, heroOpacity, heroScale, isMobile, scrollProgress],
  )

  const loadMotionProps = useMemo(
    () => ({
      initial:
        !shouldReduceMotion && !loadComplete
          ? { filter: `blur(${LOAD_FOCUS.BLUR_PX}px)`, opacity: 0 }
          : false,
      animate:
        !shouldReduceMotion && !loadComplete
          ? { filter: "blur(0px)", opacity: 1 }
          : false,
      transition: shouldReduceMotion
        ? undefined
        : {
            opacity: {
              duration: LOAD_FOCUS.DURATION_OPACITY,
              ease: LOAD_FOCUS.EASE,
            },
            filter: {
              duration: LOAD_FOCUS.DURATION_BLUR,
              ease: LOAD_FOCUS.EASE,
            },
          },
      style: !shouldReduceMotion && !loadComplete ? { willChange: "filter, opacity" } : undefined,
    }),
    [loadComplete, shouldReduceMotion],
  )

  const mobileShellStyle = useMemo(() => {
    if (!isMobile) {
      return undefined
    }

    if (shouldReduceMotion) {
      const scene = mobileScenes[0]

      return {
        "--mobile-home-bg-start": scene.bgStart,
        "--mobile-home-bg-end": scene.bgEnd,
        "--mobile-home-title": scene.title,
        "--mobile-home-primary": scene.primary,
        "--mobile-home-meta": scene.meta,
        "--mobile-home-link": scene.link,
      } satisfies MobileScrubStyle
    }

    return {
      "--mobile-home-bg-start": mobileBgStart,
      "--mobile-home-bg-end": mobileBgEnd,
      "--mobile-home-title": mobileTitleColor,
      "--mobile-home-primary": mobilePrimaryColor,
      "--mobile-home-meta": mobileMetaColor,
      "--mobile-home-link": mobileLinkColor,
    } as unknown as MobileScrubStyle
  }, [
    isMobile,
    mobileBgEnd,
    mobileBgStart,
    mobileLinkColor,
    mobileMetaColor,
    mobilePrimaryColor,
    mobileScenes,
    mobileTitleColor,
    shouldReduceMotion,
  ])

  return {
    containerStyle,
    heroStyle,
    isMobile,
    loadMotionProps,
    mobileShellRef,
    mobileShellStyle,
    refs: {
      mobileFirstWorkImageRef,
      desktopFirstWorkImageRef,
      theoriqVideoRef,
      coinbaseSectionRef,
    },
    shouldReduceMotion,
    firstImageScale,
  }
}
