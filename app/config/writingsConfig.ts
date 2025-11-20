/**
 * ============================================================================
 * WRITINGS CONFIGURATION - app/config/writingsConfig.ts
 * ============================================================================
 * 
 * Centralized configuration for writing articles displayed in the Writing section.
 * Contains the list of all available writing articles with their metadata.
 * 
 * This file is imported by:
 * - app/new/components/SideTray.tsx (for displaying article list)
 * 
 * STRUCTURE:
 * Each article has:
 * - id: Unique identifier used for API fetching (matches markdown file name)
 * - title: Display title of the article
 * - date: Publication date (formatted string)
 * 
 * ORDERING:
 * Featured articles appear at the top, followed by other articles in reverse
 * chronological order (newest first).
 */

/**
 * Writing articles list - displayed in writing mode.
 * 
 * Featured articles appear at the top, followed by other articles.
 * Each article has an id (used for API fetching), title, and date.
 * 
 * The id corresponds to the markdown file name in the /writings directory
 * (without the .md extension).
 */
export const allWritings = [
  // Featured articles at the top
  { id: "working-philosophy", title: "Working Philosophy", date: "Nov 16, 2025" },
  { id: "personal-blueprint", title: "Personal Blueprint", date: "Nov 3, 2025" },
  // Other articles below
  { id: "the-path-not-the-road", title: "The Path, not the Road", date: "Aug 17, 2025" },
  { id: "memorable-excellence", title: "Memorable Excellence", date: "Jun 14, 2025" },
  { id: "config-sf-slowing-down", title: "Config, SF, slowing down", date: "May 9, 2025" },
  { id: "why-frequent-job-changes", title: "Why frequent job changes", date: "Apr 11, 2025" },
  { id: "my-personality-tests", title: "My Personality Tests", date: "Mar 6, 2025" },
  { id: "my-music-dna", title: "My Music DNA", date: "Mar 5, 2025" },
  { id: "slipping-through-winter", title: "Slipping Through Winter", date: "Feb 26, 2025" },
  { id: "on-ai-agents", title: "On AI Agents", date: "Feb 15, 2025" },
] as const


