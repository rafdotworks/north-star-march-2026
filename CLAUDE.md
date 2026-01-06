# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 portfolio website for Raf, a designer and design engineer. The site features sophisticated animations, custom loading sequences, and a minimal portfolio showcase with advanced scroll effects.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom fonts (Ronzino, Edu Marist, CoFo Sans Mono)
- **Animations**: Framer Motion
- **Analytics**: Vercel Analytics
- **TypeScript**: Strict mode enabled

## Architecture

### App Structure

The app uses Next.js App Router with feature-based component organization:

**Core Routes:**
- [app/page.tsx](app/page.tsx) - Main minimal portfolio homepage (~380 lines)
- [app/layout.tsx](app/layout.tsx) - Root layout with fonts, metadata, analytics
- [app/error.tsx](app/error.tsx) - Global error boundary (moved from root in cleanup)
- [app/q3-2025/](app/q3-2025/), [app/nov-2025/](app/nov-2025/), [app/dec-2025/](app/dec-2025/) - Archived homepage variants

**Component Organization (Feature-Based):**
```
app/components/
├── layout/           - Navigation, footer, dividers, scroll effects
│   ├── NavigationItem.tsx
│   ├── FooterLink.tsx
│   ├── SectionDivider.tsx
│   ├── ScrollTopBlur.tsx
│   └── ScrollBottomBlur.tsx
├── modal/            - Modal content components
│   ├── AboutModalContent.tsx
│   └── BlueprintContent.tsx
├── media/            - Image and video components
│   ├── PictureImage.tsx
│   ├── VimeoInlineEmbed.tsx
│   └── WorkCard.tsx
├── effects/          - Visual effects and easter eggs
│   ├── AtmosphericLayers.tsx
│   └── ConsoleEasterEgg.tsx
├── page-specific/    - Large components for specific pages
│   ├── ContentGrid.tsx
│   └── SideTray.tsx (68KB - writing/story viewer)
├── hover/            - Hover interaction components
├── icons/            - SVG icon components
├── markdown/         - Markdown rendering components
└── story/            - Story page components
```

**Shared Components:**
- [components/animations/](components/animations/) - Animation system (LoadingAnimations, constants, imageTransitions)
- [components/ErrorBoundary.tsx](components/ErrorBoundary.tsx) - React error boundary

**Custom Hooks:**
- [hooks/use-mobile.tsx](hooks/use-mobile.tsx) - Responsive breakpoint detection (768px)
- [hooks/use-system-theme.tsx](hooks/use-system-theme.tsx) - System theme detection
- [hooks/use-timezone-message.tsx](hooks/use-timezone-message.tsx) - Dynamic timezone greeting
- [hooks/useLoadingSequence.ts](hooks/useLoadingSequence.ts) - Network-aware loading strategy
- [hooks/useAnimationLevel.ts](hooks/useAnimationLevel.ts) - Animation preference detection

**Configuration:**
- [app/config/portfolioConfig.ts](app/config/portfolioConfig.ts) - Work projects data
- [app/config/footerConfig.ts](app/config/footerConfig.ts) - Footer links and content
- [app/config/aboutModalConfig.ts](app/config/aboutModalConfig.ts) - About modal copy (renamed for consistency)
- [app/config/locationConfig.ts](app/config/locationConfig.ts) - Location and timezone data
- [app/config/writingsConfig.ts](app/config/writingsConfig.ts) - Writing metadata

### Key Systems

**Animation System** ([components/animations/LoadingAnimations.tsx](components/animations/LoadingAnimations.tsx))
- Centralized animation configurations and easing curves
- Reusable animation components: `TextReveal`, `WordReveal`, `ImageCarouselItem`, `NavigationReveal`
- Loading sequence timing constants in `LOADING_SEQUENCE`
- Custom easing curves defined in `EASING` object
- **Status**: Excellently documented (see file header for comprehensive docs)

**Loading Sequence** ([hooks/useLoadingSequence.ts](hooks/useLoadingSequence.ts))
- Adaptive loading based on network conditions
- Progressive loading stages: text → images → navigation
- Connection quality detection (fast/medium/slow)
- Returns loading state with progress tracking
- **Note**: Uses `as any` for Network Information API (non-standard, Chrome/Edge only) - documented with explanation

**Theme System** ([app/page.tsx](app/page.tsx) lines 80-113)
- Binary theme blend at 93% scroll (instant snap, not gradual)
- Design decision: Creates clear visual distinction between sections
- 93% threshold chosen through user testing
- CSS custom properties: `--theme-blend` and `--theme-blend-num`
- Light mode: 0% → 100% (scrolltointo dark), Dark mode: 100% → 0% (inverted)
- CSS handles smooth 1s transition despite instant value change

**Hover Effects** ([app/components/hover/](app/components/hover/))
- `WorkImageHover` - Localized hover animations with mobile/desktop variants
- `WorkImageContainer` - Container wrapper for work images
- `VideoPlayButton` - Video playback controls

**Mobile Detection** ([hooks/use-mobile.tsx](hooks/use-mobile.tsx))
- Mobile breakpoint: 768px
- Returns boolean `isMobile` state

### Path Aliases

- `@/*` maps to root directory (configured in [tsconfig.json](tsconfig.json))

### Styling

- Dark mode: Based on system preference (`darkMode: "media"`)
- Custom font variables: `--font-ronzino`, `--font-edu-marist`, `--font-cofo-sans-mono`
- HSL-based color system with CSS variables
- Tailwind config optimized (removed duplicate patterns)

### Next.js Configuration

- Images: Using Next.js default handling (commented out in [next.config.js](next.config.js))
- Redirects: `/deck` → Figma presentation, `/about` → `/`

### Code Quality Standards

**What's Excellent:**
- 65+ files well-documented with comprehensive header comments
- Strong TypeScript practices (strict mode, only 1 unavoidable `as any`)
- Zero dead code, zero unused imports
- Clean separation of concerns with feature-based organization
- Comprehensive error boundaries and accessibility support

**Console Usage (Intentional):**
- [app/utils/consoleEasterEgg.ts](app/utils/consoleEasterEgg.ts) - Developer easter egg message
- [components/ErrorBoundary.tsx](components/ErrorBoundary.tsx) - Error logging for debugging
- All other console usage removed from production code

**Asset Management:**
- Active images: [public/work/](public/work/)
- Archived unused images: [public/work/archive/](public/work/archive/) (12 files moved during cleanup)
- Fonts: [public/fonts/](public/fonts/) (Ronzino, Edu Marist, CoFo Sans Mono)

### Important Notes

- Main page is ~380 lines - use offset/limit when reading large sections
- Component imports use feature-based paths (e.g., `@/app/components/layout/NavigationItem`)
- Loading animations use blur effects for sophisticated reveals
- Mobile-first approach with safe area insets for iOS
- Vercel Analytics enabled in production
- Homepage archives (q3-2025/, nov-2025/, dec-2025/) preserved intentionally for design evolution reference

### Recent Cleanup (January 2026)

The codebase underwent comprehensive cleanup and reorganization:
1. **Removed**: Stray files, empty directories, phantom dependencies (131 packages)
2. **Reorganized**: Components into feature-based folders for better scalability
3. **Archived**: 12 unused work images to [public/work/archive/](public/work/archive/)
4. **Optimized**: Config files (Tailwind, Next.js), removed commented code
5. **Documented**: Complex logic in [app/page.tsx](app/page.tsx) (theme blend system, scroll effects)
6. **Renamed**: `aboutModalContent.ts` → `aboutModalConfig.ts` for naming consistency
7. **Fixed**: All import paths (50+ files updated) after reorganization

### Component Documentation Standard

Follow the pattern in [components/animations/LoadingAnimations.tsx](components/animations/LoadingAnimations.tsx) for comprehensive component documentation:
```typescript
/**
 * ============================================================================
 * [COMPONENT NAME] - [file path]
 * ============================================================================
 *
 * [Brief description]
 *
 * EXPORTS: [what this file exports]
 * FEATURES: [key capabilities]
 * USAGE: [how to use it]
 *
 * Used by: [which files import this]
 */
```

### When Working with This Codebase

1. **Reading Files**: For large files like [app/page.tsx](app/page.tsx), use offset/limit parameters
2. **Component Imports**: Use feature-based paths after reorganization (layout/, modal/, media/, etc.)
3. **Configuration**: All configs in [app/config/](app/config/) use "Config" suffix (except landingPages.ts)
4. **Styling**: Theme-aware components use `useSystemTheme()` hook and CSS variables
5. **Mobile-First**: Base styles for mobile (< 768px), `sm:` prefix for desktop (≥ 768px)
6. **Animations**: Respect `prefers-reduced-motion` using Framer Motion's `useReducedMotion()`
7. **Type Safety**: Strict TypeScript - only acceptable `as any` is for non-standard browser APIs (documented)

### Common Patterns

**Theme-Aware Components:**
```typescript
import { useSystemTheme } from "@/hooks/use-system-theme"
const { prefersDark, isReady } = useSystemTheme()
// CSS variables: --bg, --fg, --border, etc.
```

**Responsive Design:**
```typescript
import { useIsMobile } from "@/hooks/use-mobile"
const isMobile = useIsMobile()
```

**Animation with Accessibility:**
```typescript
import { useReducedMotion } from "framer-motion"
const shouldReduceMotion = useReducedMotion()
```

### Testing Strategy

Currently manual testing workflow (no test suite):
- Build verification: `npm run build`
- Lint checking: `npm run lint`
- Visual regression: Manual testing across routes
- Browser testing: Chrome (desktop), iOS Safari (mobile)

**When to add tests**: If multiple contributors join, complex business logic is added, or regressions appear.
