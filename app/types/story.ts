/**
 * Story Frontmatter Types
 *
 * TypeScript interfaces for story markdown frontmatter.
 * Used by SideTray to render project stories with rich metadata.
 */

/**
 * Story frontmatter schema
 * Parsed from YAML frontmatter in story markdown files
 */
export interface StoryFrontmatter {
  /** Project name e.g., "Theoriq" */
  title: string

  /** Role held e.g., "Founding AI Product Designer" */
  role?: string

  /** Company name e.g., "Theoriq" */
  company?: string

  /** Year or range e.g., "2024-2025" or "2024" */
  year?: string

  /** Path to hero image e.g., "/stories/theo/hero.png" */
  heroImage?: string

  /** Alt text for hero image */
  heroAlt?: string
}

/**
 * Parsed story content returned from API
 */
export interface StoryContent {
  /** Story frontmatter metadata */
  frontmatter: StoryFrontmatter

  /** Markdown content (without frontmatter) */
  content: string
}
