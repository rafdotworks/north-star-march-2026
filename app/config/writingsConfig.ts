/**
 * ============================================================================
 * WRITINGS CONFIGURATION - app/config/writingsConfig.ts
 * ============================================================================
 *
 * Centralized configuration for writing articles and personal notes.
 * Now organized into two sections:
 * - WRITINGS: Work-related content, principles, professional articles
 * - PERSONAL NOTES: Personal diary entries, reflections, self-discovery
 *
 * This file is imported by:
 * - app/components/page-specific/SideTray.tsx (for displaying article lists)
 *
 * STRUCTURE:
 * Each article has:
 * - id: Unique identifier used for API fetching (matches markdown file name)
 * - title: Display title of the article
 * - date: Publication date (formatted string)
 *
 * FEATURED ITEMS:
 * Each section can define featured items independently.
 * Featured items appear with full color; non-featured items are muted.
 */

export type WritingSection = 'writings' | 'personalNotes'

export interface WritingItem {
  id: string
  title: string
  date: string
  /** When true, title is shown with a gentle strikethrough (e.g. deprecated or paused pieces). */
  strikethrough?: boolean
}

/**
 * WRITINGS SECTION
 * Work-related content, design principles, and professional articles.
 * Featured: First 2 items (Why corporate now, Working Philosophy)
 */
export const writings: WritingItem[] = [
  // Featured writings (appear in full color)
  { id: "why-corporate-now", title: "Why corporate now", date: "February 24, 2026" },
  { id: "working-philosophy", title: "Working Philosophy", date: "Nov 16, 2025" },
  { id: "personal-blueprint", title: "Personal Blueprint", date: "Nov 3, 2025" },
  // Other writings (appear muted)
  { id: "on-ai-agents", title: "On AI Agents", date: "Feb 15, 2025" },
] as const

/**
 * PERSONAL NOTES SECTION
 * Personal diary entries, reflections, and self-discovery.
 * Featured: First 1 item (Personal README)
 */
export const personalNotes: WritingItem[] = [
  // Featured personal notes (appear in full color)
  { id: "personal-readme", title: "Personal README", date: "Dec 26, 2025" },
  // Other personal notes (appear muted)
  { id: "moving-to-europe", title: "Why I decided to move back to Europe", date: "January 5, 2026", strikethrough: true },
  { id: "memorable-excellence", title: "Memorable Excellence", date: "Jun 14, 2025" },
  { id: "config-sf-slowing-down", title: "Config, SF, slowing down", date: "May 9, 2025" },
  { id: "the-path-not-the-road", title: "The Path, not the Road", date: "Aug 17, 2025" },
  { id: "why-frequent-job-changes", title: "Why frequent job changes", date: "Apr 11, 2025" },
  { id: "my-personality-tests", title: "My Personality Tests", date: "Mar 6, 2025" },
  { id: "my-music-dna", title: "My Music DNA", date: "Mar 5, 2025" },
  { id: "slipping-through-winter", title: "Slipping Through Winter", date: "Feb 26, 2025" },
] as const

/**
 * Number of featured items per section.
 * Items before this index appear in full color.
 */
export const FEATURED_COUNT = {
  writings: 2,
  personalNotes: 1,
} as const

/**
 * BACKWARDS COMPATIBILITY
 * Preserve the original allWritings export for any legacy code.
 * This combines both sections in the original order.
 */
export const allWritings = [
  ...writings,
  ...personalNotes,
] as const

/**
 * Helper function to get writings by section.
 */
export function getWritingsBySection(section: WritingSection): readonly WritingItem[] {
  return section === 'writings' ? writings : personalNotes
}

/**
 * Helper function to get featured count for a section.
 */
export function getFeaturedCount(section: WritingSection): number {
  return FEATURED_COUNT[section]
}
