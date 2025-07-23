# RAF.WORKS - Design Portfolio & Animation Showcase

## Project Overview

This is a sophisticated Next.js 15.3.0 portfolio website for Raf, a Senior Product Designer and Design Engineer based in Toronto. The site showcases advanced animation techniques, interactive design elements, and a curated collection of work, photos, and design notes.

## Architecture & Technology Stack

### Core Framework
- **Next.js 15.3.0** with TypeScript and App Router
- **React 18** with modern hooks and state management
- **Tailwind CSS** with extensive customization and animation utilities
- **Framer Motion** for React-based animations
- **GSAP 3.12.7** for high-performance timeline animations

### Key Dependencies
- **Animation Libraries**: Framer Motion (latest), GSAP 3.12.7, Tailwind CSS Animate
- **UI Components**: Radix UI component library for accessible UI elements
- **Styling**: Tailwind CSS with custom extensions, @tailwindcss/typography
- **Analytics**: Vercel Analytics integration
- **Fonts**: Custom local fonts (Ronzino, Edu Marist)

## Project Structure

### Main Application Files
- `app/page.tsx` - Main portfolio page with complex state management and animations
- `app/layout.tsx` - Root layout with font configuration and metadata
- `app/globals.css` - Global styles and animation keyframes
- `tailwind.config.js` - Tailwind configuration with custom animations

### Core Components
- `components/LiquidGlass.tsx` - Interactive liquid glass effect with custom shader implementation
- `components/Curtain/Curtain.tsx` - Japanese-style curtain loading animation
- `app/components/ProgressiveImage.tsx` - Progressive image loading with real-time progress tracking
- `app/components/AnimatedContent.tsx` - Animated content containers
- `app/components/ConsoleEasterEgg.tsx` - Console-based easter egg feature

### Data Layer
- `app/data/works.ts` - Work portfolio data structure
- `app/data/notes.ts` - Design notes and reflections
- `app/data/photos.ts` - Photo collection data

## Key Features & Animations

### 1. Japanese Curtain Loading Animation
**Location**: `components/Curtain/Curtain.tsx`

A sophisticated GSAP-powered entrance animation that creates a dramatic reveal effect:

**Technical Features**:
- Time-aware color theming (adjusts based on time of day)
- 3D perspective transforms with rotationY and rotationX
- Multi-stage timeline orchestration
- Hardware-accelerated rendering with transform-gpu
- Automatic cleanup and memory management

**Animation Sequence**:
1. Initial scale and brightness adjustment
2. Horizontal panel separation with Y-axis rotation
3. Vertical movement with X-axis rotation
4. Subtle wave animation overlay

### 2. Liquid Glass Interactive Effect
**Location**: `components/LiquidGlass.tsx`

A custom WebGL-style shader implementation using pure JavaScript and SVG filters:

**Technical Implementation**:
- Mathematical SDF (Signed Distance Function) calculations
- Real-time displacement mapping
- Interactive mouse tracking with smooth interpolation
- Canvas-based distortion generation
- SVG filter integration for visual effects
- Draggable glass element with position constraints

**Core Features**:
- Rounded rectangle SDF calculations
- Smooth step interpolation
- Real-time shader updates
- Hardware-accelerated backdrop filters

### 3. Progressive Image Loading System
**Location**: `app/components/ProgressiveImage.tsx`

Advanced image loading with visual feedback and smooth transitions:

**Features**:
- XMLHttpRequest-based progress monitoring
- Shimmer placeholder effects during loading
- Blur-to-focus transitions using Framer Motion
- Memory-efficient blob URL handling
- Graceful error handling and fallbacks
- Real-time progress indicators

### 4. Main Page Complex State Management
**Location**: `app/page.tsx`

The main page demonstrates sophisticated React state management with:

**State Categories**:
- **UI State**: Modal visibility, current indices, slideshow controls
- **Loading State**: Image loading progress, transition states
- **Animation State**: Scroll tracking, animation completion flags
- **Interactive State**: Mouse tracking, viewport calculations

**Key Features**:
- Optimized scroll handling with requestAnimationFrame
- Image preloading and caching system
- Responsive slideshow functionality
- Modal system for photos, notes, and videos
- Viewport-aware animations

## Animation System Architecture

### Custom Tailwind Animations
```javascript
keyframes: {
  "slow-pulse": {
    "0%, 100%": { opacity: "0.08", transform: "scale(1)" },
    "50%": { opacity: "0.12", transform: "scale(1.05)" },
  },
  twinkle: {
    "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
    "50%": { opacity: "0.8", transform: "scale(1.2)" },
  },
}
```

### Framer Motion Integration
- Consistent easing functions across components
- Staggered animations for content reveal
- Exit animations for modal transitions
- Responsive animation scaling

### GSAP Timeline Management
- Complex multi-stage animations
- Proper cleanup and memory management
- 3D transform optimizations
- Time-based animation adjustments

## Design System

### Typography
- **Primary Font**: Ronzino (custom local font)
- **Secondary Font**: Edu Marist (custom local font)
- **Fallback**: Inter (Google Fonts)
- **Weight**: Primarily 400 (normal) with 500 for emphasis

### Color System
- HSL-based color variables for theme consistency
- Dark mode support with system preference detection
- Time-aware color adjustments in animations
- Muted color palette focusing on content

### Animation Timing
- **Micro-interactions**: 0.2-0.3s
- **Content transitions**: 0.5-0.8s
- **Major reveals**: 1.4-2s
- **Ambient effects**: 2-8s

## Performance Optimizations

### Hardware Acceleration
- Strategic use of `transform-gpu` classes
- 3D transforms for GPU acceleration
- Optimized animation sequences

### Memory Management
- Proper cleanup in useEffect hooks
- Animation instance disposal
- Event listener cleanup
- Blob URL revocation in image loading

### Loading Strategies
- Progressive image loading with visual feedback
- Critical content loading flags
- Preloading strategies for smooth transitions

## Content Management

### Portfolio Structure
- **Works**: Design projects with images and videos
- **Photos**: Personal photography collection
- **Notes**: Design reflections and thoughts

### Data Organization
- TypeScript interfaces for type safety
- Centralized data files for easy maintenance
- Structured content with metadata

## Interactive Features

### Easter Eggs
- Console-based easter egg system
- Hidden interactive elements
- Playful user discoveries

### Modal System
- Photo gallery with navigation
- Video playback integration
- Note reading experience
- Smooth enter/exit transitions

## Technical Achievements

1. **Hybrid Animation System**: Successfully integrates GSAP, Framer Motion, and CSS animations
2. **Custom Shader Implementation**: Pure JavaScript WebGL-style effects without WebGL dependency
3. **Advanced Loading Systems**: Real-time progress tracking with visual feedback
4. **Responsive Design**: Viewport-aware animations and layouts
5. **Performance Optimization**: Hardware acceleration and memory management
6. **Interactive Physics**: Mathematical approach to liquid distortion effects

## Development Guidelines

### Adding New Animations
1. Choose appropriate library based on complexity
2. Implement proper cleanup in useEffect hooks
3. Use hardware acceleration for transform-heavy animations
4. Test performance across devices
5. Consider reduced motion preferences

### Code Organization
- Keep animation logic close to components
- Use TypeScript for type safety
- Implement proper error boundaries
- Document complex animation sequences

This portfolio represents a sophisticated example of modern web animation techniques, combining multiple animation libraries with custom implementations to create a cohesive, performant, and engaging user experience.