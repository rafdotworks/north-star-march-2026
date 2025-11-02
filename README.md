# raf.works

A sophisticated Next.js 15 portfolio website for Raf, a designer and design engineer. Features elegant animations, an interactive image carousel, and an AI-powered chat agent to discuss work and experience.

## Features

- **Interactive Image Carousel** - Showcases work with smooth transitions and video support
- **Adaptive Loading Sequence** - Network-aware loading strategy for optimal performance
- **AI Chat Agent** - Interactive chat powered by OpenAI to discuss Raf's work and experience
- **Responsive Design** - Mobile-first approach with iOS safe area support
- **Custom Animations** - Built with Framer Motion for sophisticated reveals and transitions
- **Multiple Layout Modes** - Traditional portfolio view and minimal text-based layout

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom fonts (Ronzino, Edu Marist)
- **Animations**: Framer Motion
- **AI Integration**: Vercel AI SDK with OpenAI
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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

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
│   ├── page.tsx                  # Main portfolio (carousel/slideshow)
│   ├── layout.tsx                # Root layout with fonts & metadata
│   ├── globals.css               # Global styles & CSS variables
│   ├── agent/                    # AI chat interface
│   │   ├── page.tsx              # Chat page
│   │   ├── ChatMessages.tsx      # Message display component
│   │   ├── ChatInput.tsx         # Input component
│   │   └── context/              # AI agent knowledge base
│   ├── new/                      # Alternative minimal layout
│   │   └── page.tsx              # Text-based portfolio view
│   ├── api/
│   │   ├── chat/                 # AI chat API endpoint
│   │   └── article/              # Article content API
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
├── recovered-writings/           # Markdown articles
├── CLAUDE.md                     # Claude Code instructions
└── README.md                     # This file
```

## Key Routes

- **`/`** - Main portfolio with image carousel
- **`/new`** - Alternative minimal text-based layout
- **`/agent`** - AI chat interface to discuss Raf's work
- **`/raf`** - Additional portfolio page
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

### AI Chat Agent
[`app/api/chat/route.ts`](app/api/chat/route.ts) implements:
- Streaming responses using Vercel AI SDK
- In-memory rate limiting (10 messages/10 minutes per IP)
- Context-aware responses using knowledge base
- Error handling with user-friendly messages

### Styling Approach
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theme variables (dark mode via system preference)
- **Framer Motion** for declarative animations
- Custom fonts loaded via Next.js font optimization

## Environment Variables

Required environment variables (see `.env.example`):

```bash
OPENAI_API_KEY=           # OpenAI API key for chat agent
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
