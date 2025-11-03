# Recent Changes Documentation

This document captures the key changes made to the portfolio site before restoring to production version.

## 1. Text Typography and Styles

### Desktop Caption Animations
**Location:** `app/page.tsx` (lines ~1862-1928)

- **Caption container animation:**
  - Duration increased: `0.6s → 1.2s` (slower, more deliberate reveal)
  - Delay increased: `0.08s → 0.3s` (more staged appearance)
  - Added blur-to-focus effect: `blur(10px) saturate(0.96) → blur(0px) saturate(1)`
  - Easing: `[0.16, 1, 0.3, 1]` (smooth, organic motion)

- **Year text styling:**
  - Color: `text-foreground/50` (subtle, muted)
  - Size: `text-sm leading-snug`
  - No animation (static display)

- **Description text styling:**
  - Color: `text-foreground/80` (more prominent than year)
  - Size: `text-sm leading-snug`
  - Alignment: `sm:text-right` (right-aligned on desktop)
  - Animation duration: `0.55s → 1.0s` (slower reveal)
  - Animation delay: `0.02s → 0.15s` (staged after year)
  - Same blur-to-focus effect as container

### Mobile Text Styling
**Location:** `app/page.tsx` (lines ~1591-1616)

- Fixed positioning at `25vh + safe-area-inset-top`
- Text blur animation: `blur(35px) → blur(0px)` over `2.8s`
- Text size: `text-base` (slightly larger than desktop)
- Color: `text-foreground/70` for main text, `text-foreground` for "Raf" link
- Interactive "Raf" link with hover effects:
  - Underline: `decoration-foreground/20` → `hover:decoration-foreground/50`
  - Background: `hover:bg-foreground/5`
  - Transition: `transition-all duration-200`

### Header Text (Desktop)
**Location:** `app/page.tsx` (lines ~1542-1569)

- Size: `text-lg`
- Color: `text-foreground/70` for main text
- Animation: `blur(20px) → blur(0px)` over `1.2s`
- Same interactive "Raf" link styling as mobile

---

## 2. Carousel Click Effects (Desktop)

### Clickable Navigation Zones
**Location:** `app/page.tsx` (lines ~1793-1821)

**Implementation:**
- **Left zone:** 38% width, full height
  - Position: `absolute left-0 top-0`
  - Cursor: `cursor-w-resize` (indicates backward navigation)
  - Z-index: `z-[60]`
  - Action: Navigate backward (`navigateBy(-1)`)

- **Right zone:** 38% width, full height
  - Position: `absolute right-0 top-0`
  - Cursor: `cursor-e-resize` (indicates forward navigation)
  - Z-index: `z-[60]`
  - Action: Navigate forward (`navigateBy(1)`)

- **Center zone:** 24% width (non-clickable)
  - Position: `absolute left-[38%]`
  - Z-index: `z-[95]` (above click zones)
  - Pointer events: `pointer-events-none`
  - Purpose: Protects center area from accidental clicks, allows video/image interactions

### Debounce Logic
**Location:** `app/page.tsx` (lines ~60, ~1798-1804, ~1812-1818)

- **Debounce constant:** `NAVIGATION_DEBOUNCE = 300ms`
- Prevents rapid clicking during transition animations
- Uses `isNavigating` state flag
- Auto-resets after 300ms timeout

### Click Handler Implementation
```typescript
onClick={(event) => {
  event.stopPropagation(); // Prevent bubbling
  if (isNavigating) return; // Ignore if already navigating
  setIsNavigating(true); // Set flag
  navigateBy(-1); // or navigateBy(1)
  window.setTimeout(
    () => setIsNavigating(false),
    NAVIGATION_DEBOUNCE
  );
}}
```

---

## 3. Other Significant Changes

### Image Loading Strategy
- **INITIAL_IMAGE_COUNT:** Changed from `2 → 4` images
- Location: `app/page.tsx` (line ~85)
- Impact: More images loaded upfront, faster initial carousel experience

### Mobile Footer Visibility
- **footerRevealReady:** Default changed from `false → true`
- Location: `app/page.tsx` (line ~486)
- Impact: Footer links are immediately visible (no scroll-based reveal)

### Mobile Contact Links
- Added CV link: `{ href: "/documents/CV.pdf", label: "CV", ... }`
- Location: `app/page.tsx` (lines ~124-129)
- Added to `MOBILE_CONTACT_LINKS` array

### Image Hover Effects
**Files:** 
- `app/components/hover/WorkImageContainer.tsx`
- `app/components/hover/WorkImageHover.tsx`
- `app/components/hover/VideoPlayButton.tsx`

**Key features:**
- Sophisticated hover animations with scale, brightness, saturation effects
- Different behaviors for images with/without video
- Glassmorphism play button with backdrop blur
- Platform-specific variants (mobile vs desktop)

### Animation System Refinements
**Files:**
- `components/animations/imageTransitions.ts`
- `hooks/useAnimationLevel.ts`

**Changes:**
- Refined page-turn variants with blur-to-focus cross-fades
- Animation levels (0-3) for performance optimization
- Hardware detection for adaptive animation complexity
- Removed spatial transforms (x, y, rotate) for stable premium feel

### Extensive Documentation
- Added comprehensive inline documentation throughout
- State management flow diagrams in comments
- Animation timing breakdowns
- Performance optimization notes
- Algorithm explanations with ASCII diagrams

### Video Play Button
**Location:** `app/components/hover/VideoPlayButton.tsx`

- Glassmorphism design: `bg-black/20 backdrop-blur-sm`
- Hover effects: `bg-black/30 scale-110`
- 48x48px circular button (WCAG compliant)
- SVG play icon with opacity transitions

### Caption Text Parsing
- Enhanced `parseCaption()` function
- Split on `" — "` (em dash) separator
- Separate year and description rendering
- Year displayed with muted opacity, description with higher contrast

---

## Files Modified

1. `app/page.tsx` - Main homepage component (extensive changes)
2. `app/components/hover/VideoPlayButton.tsx` - Video play button component
3. `app/components/hover/WorkImageContainer.tsx` - Image container with hover effects
4. `app/components/hover/WorkImageHover.tsx` - Hover wrapper component
5. `components/animations/imageTransitions.ts` - Animation variants
6. `hooks/useAnimationLevel.ts` - Animation level detection hook

---

## Summary Statistics

- **Total lines changed:** ~1,215 insertions, ~989 deletions across 6 files
- **Primary focus:** Animation refinements, interaction improvements, typography enhancements
- **User experience:** Slower, more deliberate animations; better click affordances; refined text styling

---

## Notes for Restoration

When restoring to production version, these changes will be lost:
- Click-to-navigate carousel zones
- Refined caption animation timings
- Text styling improvements
- Enhanced hover effects
- Mobile footer visibility change
- CV link in mobile footer
- Documentation additions

If you want to restore production but keep some of these improvements, consider:
1. Keeping the click zones (high value, minimal complexity)
2. Keeping the CV link addition (simple change)
3. Keeping text styling improvements (visual polish)
4. Re-evaluating animation timings based on user feedback

