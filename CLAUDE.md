# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 portfolio website for Raf, a designer and design engineer. The site features sophisticated animations, custom loading sequences, and an image carousel showcasing work.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom fonts (Ronzino, Edu Marist)
- **Animations**: Framer Motion
- **Analytics**: Vercel Analytics
- **TypeScript**: Strict mode enabled

## Architecture

### App Structure

The app uses Next.js App Router with the following structure:

- `app/page.tsx` - Main homepage (large file ~1000+ lines, contains slideshow logic and layout)
- `app/layout.tsx` - Root layout with font loading, metadata, and analytics
- `app/raf/page.tsx` - Additional page route
- `app/components/` - App-specific components (hover effects, easter eggs)
- `components/` - Shared components (ErrorBoundary, LoadingAnimations)
- `hooks/` - Custom React hooks
- `public/` - Static assets (images, fonts, favicons)

### Key Systems

**Animation System** (`components/animations/LoadingAnimations.tsx`)
- Centralized animation configurations and easing curves
- Reusable animation components: `TextReveal`, `WordReveal`, `ImageCarouselItem`, `NavigationReveal`
- Loading sequence timing constants in `LOADING_SEQUENCE`
- Custom easing curves defined in `EASING` object

**Loading Sequence** (`hooks/useLoadingSequence.ts`)
- Adaptive loading based on network conditions
- Progressive loading stages: text → images → navigation
- Connection quality detection (fast/medium/slow)
- Returns loading state with progress tracking

**Hover Effects** (`app/components/hover/`)
- `WorkImageHover` - Localized hover animations with mobile/desktop variants
- `WorkImageContainer` - Container wrapper for work images
- `VideoPlayButton` - Video playback controls

**Mobile Detection** (`hooks/use-mobile.tsx`)
- Mobile breakpoint: 768px
- Returns boolean `isMobile` state

### Path Aliases

- `@/*` maps to root directory (configured in tsconfig.json)

### Styling

- Dark mode: Based on system preference (`darkMode: "media"`)
- Custom font variables: `--font-ronzino`, `--font-edu-marist`
- Custom animations: `slow-pulse`, `twinkle`
- HSL-based color system with CSS variables

### Next.js Configuration

- Images are unoptimized (`images: { unoptimized: true }`)
- Redirect `/deck` to Figma presentation

### Important Notes

- Main page is large (~1000 lines) - use offset/limit when reading
- Slideshow timing constants are defined at top of `app/page.tsx`
- Loading animations use blur effects for sophisticated reveals
- Mobile-first approach with safe area insets for iOS
- Vercel Analytics enabled in production
