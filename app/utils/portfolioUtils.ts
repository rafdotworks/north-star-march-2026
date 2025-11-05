/**
 * ============================================================================
 * PORTFOLIO UTILITY FUNCTIONS - app/utils/portfolioUtils.ts
 * ============================================================================
 *
 * Helper functions for portfolio data retrieval and manipulation.
 * All functions are pure (no side effects) and well-documented.
 *
 * This file is imported by:
 * - app/page.tsx (main page component)
 * - Future extracted components
 */

import {
  PROJECT_VIDEOS,
  PROJECT_ALIAS,
  PROJECT_CAPTIONS,
  IMAGE_ALT_TEXT,
} from "@/app/config/portfolioConfig";

// ============================================================================
// PROJECT IDENTIFICATION
// ============================================================================

/**
 * Derives project key from image source path.
 * 
 * @remarks
 * Extracts the project identifier from an image path. Handles special cases
 * for projects with non-standard naming (early-works, curbcut, zalando, etc.)
 * before falling back to generic hyphen-based extraction.
 * 
 * Special cases handled:
 * - "early-works" or "earlyworks" → "earlyworks"
 * - "curbcut" → "curbcut"
 * - "zalando" → "zalando"
 * - "/us.png" → "nationalArchives"
 * 
 * Generic case: Extracts prefix before first hyphen in filename.
 * Example: "/work/cb-1.png" → "cb"
 * 
 * @param src - Image source path (e.g., "/work/cb-1.png")
 * @returns Project key (e.g., "cb") or null if not found
 * 
 * @example
 * ```ts
 * getProjectFromSrc("/work/cb-1.png") // Returns "cb"
 * getProjectFromSrc("/work/early-works.webp") // Returns "earlyworks"
 * getProjectFromSrc("/work/us.png") // Returns "nationalArchives"
 * getProjectFromSrc("/work/unknown.png") // Returns null
 * ```
 */
export function getProjectFromSrc(src: string): string | null {
  // Check specific cases first before generic hyphen parsing
  // These are projects with non-standard naming conventions
  if (src.includes("early-works")) return "earlyworks";
  if (src.includes("curbcut")) return "curbcut";
  if (src.includes("zalando")) return "zalando";
  if (src.includes("earlyworks")) return "earlyworks";
  
  // Special case for National Archives project
  if (src.endsWith("/us.png") || src.includes("/us.png"))
    return "nationalArchives";

  // Generic hyphen-based extraction for standard project images
  // Most projects follow pattern: "/work/{project}-{number}.png"
  if (src.includes("/work/")) {
    const filename = src.split("/").pop() || "";
    const hasHyphen = filename.includes("-");
    if (hasHyphen) {
      const prefix = filename.split("-")[0];
      if (prefix) return prefix;
    }
  }

  return null;
}

// ============================================================================
// VIDEO RETRIEVAL
// ============================================================================

/**
 * Gets Vimeo video URL for a given image source.
 * 
 * @remarks
 * Returns the Vimeo embed URL if a video exists for the project.
 * Handles special rules and project aliases.
 * 
 * Special rules:
 * - Atlas video only shows on atlas-2.png (not atlas-1.png)
 *   This is because the video is specifically for the second Atlas image.
 * 
 * Project aliases:
 * - "defituna" project uses "defi" video key
 *   This handles legacy naming differences between PROJECTS and PROJECT_VIDEOS.
 * 
 * @param src - Image source path
 * @returns Vimeo embed URL or null if no video exists
 * 
 * @example
 * ```ts
 * getVideoForSrc("/work/atlas-2.png") // Returns atlas video URL
 * getVideoForSrc("/work/atlas-1.png") // Returns null (special rule)
 * getVideoForSrc("/work/defituna-1.png") // Returns defi video URL (via alias)
 * getVideoForSrc("/work/cb-1.png") // Returns null (no video)
 * ```
 */
export function getVideoForSrc(src: string): string | null {
  const project = getProjectFromSrc(src);
  if (!project) return null;
  
  // Special rule: atlas video only on second image
  // This ensures the video matches the correct Atlas project image
  if (project === "atlas" && !src.endsWith("atlas-2.png")) {
    return null;
  }
  
  // Handle project aliases (e.g., "defituna" → "defi")
  // Some projects have different keys in PROJECTS vs PROJECT_VIDEOS
  const key = PROJECT_ALIAS[project] ?? project;
  return PROJECT_VIDEOS[key] ?? null;
}

// ============================================================================
// CAPTION RETRIEVAL
// ============================================================================

/**
 * Gets project-level caption for an image source.
 * 
 * @remarks
 * Looks up the caption for the project associated with the given image.
 * Returns null if project not found or has no caption.
 * 
 * @param src - Image source path
 * @returns Caption string or null
 * 
 * @example
 * ```ts
 * getCaptionForSrc("/work/cb-1.png") 
 * // Returns "Q3 2025 — Shipped SQL AI Playground..."
 * getCaptionForSrc("/work/unknown.png") // Returns null
 * ```
 */
export function getCaptionForSrc(src: string): string | null {
  const project = getProjectFromSrc(src);
  if (!project) return null;
  return PROJECT_CAPTIONS[project] ?? null;
}

/**
 * Gets caption for a specific project key.
 * 
 * @remarks
 * Direct lookup by project key (e.g., "cb", "vf") instead of image path.
 * Useful when you already know the project key.
 * 
 * @param project - Project key (e.g., "cb", "vf")
 * @returns Caption string or null
 * 
 * @example
 * ```ts
 * getProjectCaption("cb") 
 * // Returns "Q3 2025 — Shipped SQL AI Playground..."
 * getProjectCaption("unknown") // Returns null
 * ```
 */
export function getProjectCaption(project: string): string | null {
  return PROJECT_CAPTIONS[project] ?? null;
}

// ============================================================================
// ALT TEXT
// ============================================================================

/**
 * Gets descriptive alt text for an image.
 * 
 * @remarks
 * Returns the alt text from IMAGE_ALT_TEXT if available, otherwise
 * generates a fallback alt text using the index.
 * 
 * Provides meaningful descriptions for screen readers and accessibility.
 * 
 * @param src - Image source path
 * @param index - Fallback index number (0-based)
 * @returns Descriptive alt text string
 * 
 * @example
 * ```ts
 * getAltText("/work/cb-1.png", 0) 
 * // Returns "Coinbase Developer Platform interface..."
 * getAltText("/work/unknown.png", 5) 
 * // Returns "Work preview 6" (fallback)
 * ```
 */
export function getAltText(src: string, index: number): string {
  return IMAGE_ALT_TEXT[src] || `Work preview ${index + 1}`;
}

// ============================================================================
// CAPTION PARSING
// ============================================================================

/**
 * Parses caption string into year and description parts.
 * 
 * @remarks
 * Splits caption on the first occurrence of " — " (em dash with spaces).
 * Preserves additional dashes in the description part.
 * 
 * Format: "YEAR — Description"
 * 
 * This allows for separate styling and animation of year vs description
 * in the UI components.
 * 
 * @param caption - Full caption string (e.g., "2025 — Description text")
 * @returns Object with year and description properties
 * 
 * @example
 * ```ts
 * parseCaption("Q3 2025 — Shipped SQL AI Playground...")
 * // Returns { year: "Q3 2025", description: "Shipped SQL AI Playground..." }
 * 
 * parseCaption("No year — Description")
 * // Returns { year: "No year", description: "Description" }
 * 
 * parseCaption("No separator")
 * // Returns { year: "", description: "No separator" }
 * ```
 */
export function parseCaption(caption: string): { year: string; description: string } {
  // Split on the first occurrence of " — " only, preserving additional dashes in description
  const parts = caption.split(" — ", 2);
  if (parts.length === 2) {
    return { year: parts[0], description: parts[1] };
  }
  // If no separator found, return entire caption as description
  return { year: "", description: caption };
}

/**
 * Renders year text (placeholder for potential rolling animation).
 * 
 * @remarks
 * Currently returns the year string as-is. This function exists as a placeholder
 * for potential future animation (e.g., rolling number animation for years).
 * 
 * Handles both single years and year ranges (e.g., "2024" or "2017-2019").
 * 
 * @param year - Year string to render (can be null or undefined)
 * @returns Year string or null
 * 
 * @example
 * ```ts
 * renderYearWithRolling("2024") // Returns "2024"
 * renderYearWithRolling("2017-2019") // Returns "2017-2019"
 * renderYearWithRolling(null) // Returns null
 * ```
 */
export function renderYearWithRolling(year: string | undefined | null): string | null {
  if (!year) return null;
  // Keep it simple: return raw text for both single years and ranges
  // Future: Could add rolling animation here for numeric years
  return year;
}

// ============================================================================
// PLACEHOLDER GENERATION
// ============================================================================

/**
 * Generates SVG placeholder for images during loading.
 * 
 * @remarks
 * Creates a base64-encoded SVG data URL that can be used as a blur placeholder
 * for Next.js Image components. Shows a simple gray rectangle with "Loading..." text.
 * 
 * Used to provide visual feedback while images are loading, improving perceived
 * performance and user experience.
 * 
 * @param width - Placeholder width in pixels (default: 400)
 * @param height - Placeholder height in pixels (default: 300)
 * @returns Base64-encoded SVG data URL
 * 
 * @example
 * ```ts
 * const placeholder = generatePlaceholder(800, 600);
 * // Returns "data:image/svg+xml;base64,..."
 * 
 * <Image 
 *   src="/work/image.png"
 *   blurDataURL={generatePlaceholder(800, 600)}
 *   placeholder="blur"
 * />
 * ```
 */
export function generatePlaceholder(width = 400, height = 300): string {
  return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="14" fill="#9ca3af">Loading...</text>
      </svg>
    `)}`;
}





