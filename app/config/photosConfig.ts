/**
 * ============================================================================
 * PHOTOS CONFIGURATION - app/config/photosConfig.ts
 * ============================================================================
 *
 * Centralized list of photographs displayed in the Photos side tray.
 * Paths are relative to public (e.g. "/photos/filename.webp").
 *
 * Used by: app/components/page-specific/SideTray.tsx (photos mode + optional About tray image)
 *
 * TO ADD PHOTOS: Add files to public/photos/ and add an entry here.
 */

export interface PhotoEntry {
  src: string
  alt?: string
  caption?: string
}

/**
 * Optional personal image for the About tray.
 * Set to `null` to keep the slot collapsed.
 */
export const ABOUT_TRAY_IMAGE: PhotoEntry | null = {
  src: "/image-canvas.JPG",
  alt: "Portrait of Raf",
}

export const PHOTOS: PhotoEntry[] = [
  { src: "/photos/adrien.webp", alt: "Adrien" },
  { src: "/photos/anna.webp", alt: "Anna" },
  { src: "/photos/chessboard.webp", alt: "Chessboard" },
  { src: "/photos/daybreak-2.webp", alt: "Daybreak 2" },
  { src: "/photos/daybreak-3.webp", alt: "Daybreak 3" },
  { src: "/photos/daybreak.webp", alt: "Daybreak" },
  { src: "/photos/flo.webp", alt: "Flo" },
  { src: "/photos/jordi.webp", alt: "Jordi" },
  { src: "/photos/josh.webp", alt: "Josh" },
  { src: "/photos/marianne.webp", alt: "Marianne" },
  { src: "/photos/newstadium.webp", alt: "New stadium" },
  { src: "/photos/omar.webp", alt: "Omar" },
  { src: "/photos/vin-2.webp", alt: "Vin 2" },
  { src: "/photos/vin.JPG", alt: "Vin" },
]
