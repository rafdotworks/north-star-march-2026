"use client"

import { useEffect } from "react"

type ClientInteractionsProps = {
  sectionIds: string[]
}

export default function ClientInteractions({ sectionIds }: ClientInteractionsProps) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-portfolio-root]")
    if (!root) return

    const motionToggle = root.querySelector<HTMLButtonElement>("[data-motion-toggle]")
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const storageKey = "raf-portfolio-motion"

    const readStoredMotion = () => {
      try {
        return localStorage.getItem(storageKey)
      } catch {
        return null
      }
    }

    const writeStoredMotion = (value: string) => {
      try {
        localStorage.setItem(storageKey, value)
      } catch {
        // Ignore storage failures
      }
    }

    let motionEnabled = (() => {
      const stored = readStoredMotion()
      if (stored === "on") return true
      if (stored === "off") return false
      return !prefersReduced.matches
    })()

    const applyMotion = (enabled: boolean) => {
      root.dataset.motion = enabled ? "on" : "off"
      if (motionToggle) {
        motionToggle.textContent = `Motion: ${enabled ? "On" : "Off"}`
        motionToggle.setAttribute("aria-pressed", enabled ? "true" : "false")
      }
    }

    applyMotion(motionEnabled)

    const onToggle = () => {
      motionEnabled = !motionEnabled
      writeStoredMotion(motionEnabled ? "on" : "off")
      applyMotion(motionEnabled)
    }

    const onPrefChange = () => {
      if (prefersReduced.matches) {
        motionEnabled = false
        writeStoredMotion("off")
        applyMotion(false)
      }
    }

    motionToggle?.addEventListener("click", onToggle)

    if (typeof prefersReduced.addEventListener === "function") {
      prefersReduced.addEventListener("change", onPrefChange)
    } else {
      prefersReduced.addListener(onPrefChange)
    }

    const copyButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-copy]"))
    const timeouts = new Map<HTMLButtonElement, number>()

    const setButtonState = (button: HTMLButtonElement, label: string, state: string) => {
      button.textContent = label
      button.dataset.state = state
    }

    const onCopy = async (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement
      const value = button.dataset.copy
      if (!value) return

      const originalLabel = button.dataset.label ?? button.textContent ?? "Copy"
      let nextLabel = "Copied"
      let nextState = "copied"

      try {
        await navigator.clipboard.writeText(value)
      } catch {
        nextLabel = "Copy failed"
        nextState = "error"
      }

      setButtonState(button, nextLabel, nextState)

      const existingTimeout = timeouts.get(button)
      if (existingTimeout) window.clearTimeout(existingTimeout)

      const timeoutId = window.setTimeout(() => {
        setButtonState(button, originalLabel, "ready")
      }, 1200)

      timeouts.set(button, timeoutId)
    }

    copyButtons.forEach((button) => button.addEventListener("click", onCopy))

    const navItems = new Map<string, HTMLAnchorElement>()
    sectionIds.forEach((id) => {
      const link = root.querySelector<HTMLAnchorElement>(`[data-section="${id}"]`)
      if (link) navItems.set(id, link)
    })

    const setActive = (id: string) => {
      navItems.forEach((link, key) => {
        const active = key === id
        link.dataset.active = active ? "true" : "false"
        if (active) {
          link.setAttribute("aria-current", "page")
        } else {
          link.removeAttribute("aria-current")
        }
      })
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return

        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        setActive(visible[0].target.id)
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.2, 0.6, 1],
      }
    )

    sections.forEach((section) => observer.observe(section))

    const onNavClick = (event: Event) => {
      const target = event.currentTarget as HTMLElement
      const id = target.dataset.section
      if (id) setActive(id)
    }

    navItems.forEach((link) => link.addEventListener("click", onNavClick))

    if (sectionIds[0]) setActive(sectionIds[0])

    return () => {
      motionToggle?.removeEventListener("click", onToggle)
      if (typeof prefersReduced.removeEventListener === "function") {
        prefersReduced.removeEventListener("change", onPrefChange)
      } else {
        prefersReduced.removeListener(onPrefChange)
      }
      copyButtons.forEach((button) => button.removeEventListener("click", onCopy))
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
      navItems.forEach((link) => link.removeEventListener("click", onNavClick))
      sections.forEach((section) => observer.unobserve(section))
      observer.disconnect()
    }
  }, [sectionIds])

  return null
}
