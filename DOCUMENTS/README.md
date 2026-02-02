# raf.works

A sophisticated Next.js 15 portfolio website for Raf, an AI designer. Features elegant animations and an interactive image carousel.

## Features

- **Interactive Image Carousel** - Showcases work with smooth transitions and video support
- **Adaptive Loading Sequence** - Network-aware loading strategy for optimal performance
- **Responsive Design** - Mobile-first approach with iOS safe area support
- **Custom Animations** - Built with Framer Motion for sophisticated reveals and transitions
- **Multiple Layout Modes** - Traditional portfolio view and minimal text-based layout

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom fonts (Ronzino, Edu Marist)
- **Animations**: Framer Motion
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd raf.works
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env.local
```

Add environment variables to `.env.local` as needed.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
raf.works/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main minimal portfolio entry point
│   ├── layout.tsx                # Root layout with fonts & metadata
│   ├── globals.css               # Global styles & CSS variables
│   ├── q3-2025/                  # Previous landing page version
│   │   └── page.tsx              # Previous portfolio (carousel/slideshow)
│   ├── api/
│   │   ├── article/              # Article content API
│   │   ├── story/                # Story content API
│   │   └── weather/              # Weather data API
│   └── components/               # App-specific components
│       └── hover/                # Hover effect components
├── components/                   # Shared components
│   ├── ErrorBoundary.tsx         # Error handling wrapper
│   └── animations/               # Animation system
│       └── LoadingAnimations.tsx # Centralized animation configs
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx            # Mobile breakpoint detection
│   └── useLoadingSequence.ts    # Adaptive loading logic
├── public/                       # Static assets
│   ├── images/                   # Work samples & photos
│   └── fonts/                    # Custom font files
├── writings/                     # Markdown articles
├── CLAUDE.md                     # Claude Code instructions
└── README.md                     # This file
```

## Key Routes

- **`/`** - Main minimal portfolio entry point (text-based layout)
- **`/q3-2025`** - Previous portfolio version (image carousel/slideshow)
- **`/deck`** - Redirects to Figma presentation

## Architecture Highlights

### Animation System
Centralized in [`components/animations/LoadingAnimations.tsx`](components/animations/LoadingAnimations.tsx):
- Reusable animation components (`TextReveal`, `WordReveal`, `ImageCarouselItem`)
- Custom easing curves optimized for smooth motion
- Loading sequence timing constants

### Adaptive Loading
[`hooks/useLoadingSequence.ts`](hooks/useLoadingSequence.ts) detects network conditions and adjusts loading strategy:
- Fast connections: Parallel loading
- Slow connections: Sequential, prioritized loading
- Progressive stages: text → images → navigation

### Styling Approach
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theme variables (dark mode via system preference)
- **Framer Motion** for declarative animations
- Custom fonts loaded via Next.js font optimization

## Environment Variables

Optional environment variables (see `.env.example`):

```bash
OPENWEATHERMAP_API_KEY=   # OpenWeatherMap API key for weather data (get free key at https://openweathermap.org/api)
```

## Development Notes

### Main Page Component
The main portfolio page ([`app/page.tsx`](app/page.tsx)) is a large component (~1000 lines) that includes:
- Image carousel with auto-advance and manual controls
- Video modal with playback controls
- About modal with biography
- Responsive touch/mouse interactions

**Note**: When reading this file, use offset/limit parameters due to its size.

### Image Optimization
Images are currently unoptimized (`next.config.js`). This is intentional for:
- Static site generation flexibility
- Custom loading sequence control

### Mobile Detection
Uses a 768px breakpoint ([`hooks/use-mobile.tsx`](hooks/use-mobile.tsx)) for responsive behavior.

## Deployment

This project is optimized for deployment on Vercel:

```bash
# Using Vercel CLI
vercel deploy
```

Ensure environment variables are configured in your Vercel project settings.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari (with safe area inset support)
- Mobile-first responsive design

## Contributing

This is a personal portfolio project. If you notice bugs or have suggestions, feel free to open an issue.

## License

All rights reserved. The code structure and components may be referenced for educational purposes, but the content, design, and images are proprietary.

---

Built with care by Raf. Powered by Next.js, TypeScript, and Tailwind CSS.
