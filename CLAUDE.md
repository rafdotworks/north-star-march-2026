# RAF.WORKS - Animation & Design Engineering Documentation

## Project Overview

This portfolio website is a sophisticated Next.js 15.3.0 application that demonstrates advanced animation techniques and design engineering principles. The site combines multiple animation libraries and custom implementations to create immersive user experiences with a focus on performance and visual storytelling.

## Architecture & Technology Stack

### Core Framework
- **Next.js 15.3.0** with TypeScript and App Router
- **React 19** with modern concurrent features
- **Tailwind CSS** with extensive customization and animation utilities

### Animation Libraries
- **Framer Motion** (latest) - Primary React animation library
- **GSAP 3.12.7** - High-performance timeline animations
- **Tailwind CSS Animate** - Utility-based CSS animations
- **Custom WebGL-style shaders** - Pure JavaScript implementation

## Animation System Architecture

### 1. Japanese Curtain Loading Animation
**File:** `components/Curtain/Curtain.tsx`

A sophisticated GSAP-powered loading sequence that serves as the site's entrance experience.

**Key Features:**
- Time-aware color theming (day/night adjustments)
- 3D perspective transforms with rotationY and rotationX
- Multi-stage timeline orchestration
- Hardware-accelerated rendering
- Automatic cleanup and memory management

**Code Example:**
```typescript
const tl = gsap.timeline({
  defaults: { ease: "power3.inOut" },
  onComplete: () => {
    onAnimationComplete?.();
    curtain.remove();
  },
});

tl.to(".curtain-panel", {
  duration: 0.6,
  scale: 1.01,
  filter: "brightness(1.02)",
  ease: "power2.inOut",
})
.to(".curtain-left", {
  x: "-105%",
  rotationY: -6,
  duration: 1.4,
  ease: "power2.inOut",
})
.to(".curtain-right", {
  x: "105%",
  rotationY: 6,
  duration: 1.4,
  ease: "power2.inOut",
}, "<")
```

**Performance Optimizations:**
- `transform-gpu` classes for hardware acceleration
- `perspective: "1800px"` for 3D transforms
- Proper animation disposal to prevent memory leaks

### 2. Liquid Glass Interactive Effect
**File:** `components/LiquidGlass.tsx`

A custom WebGL-style shader implementation using pure JavaScript and SVG filters.

**Technical Implementation:**
- Mathematical SDF (Signed Distance Function) calculations
- Real-time displacement mapping
- Interactive mouse tracking with smooth interpolation
- Canvas-based distortion generation
- SVG filter integration for visual effects

**Core Shader Class:**
```typescript
class Shader {
  updateShader() {
    const w = this.width * this.canvasDPI;
    const h = this.height * this.canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const uv = this.fragment({ x: x / w, y: y / h }, proxy);
      const dx = uv.x * w - x;
      const dy = uv.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
    }
    
    this.feDisplacementMap.setAttribute("scale", (maxScale / this.canvasDPI).toString());
  }
}
```

### 3. Progressive Image Loading System
**File:** `app/components/ProgressiveImage.tsx`

Advanced image loading with real-time progress tracking and smooth transitions.

**Features:**
- XMLHttpRequest-based progress monitoring
- Shimmer placeholder effects during loading
- Blur-to-focus transitions using Framer Motion
- Memory-efficient blob URL handling
- Graceful error handling and fallbacks

**Shimmer Effect:**
```typescript
<motion.div
  className="absolute inset-0 w-full h-full"
  style={{
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transform: "skewX(-20deg)",
  }}
  animate={{
    x: ["calc(-100% - 50px)", "calc(100% + 50px)"],
  }}
  transition={{
    duration: 2.5,
    repeat: Infinity,
    ease: "linear",
  }}
/>
```

### 4. Weather-Based Environmental Animations
**File:** `app/globals.css`

CSS keyframe animations that respond to environmental conditions.

**Animation Types:**
- Rain drops with realistic physics
- Snowfall with rotation and drift
- Lightning flashes with timing variations
- Fog effects with opacity transitions

**Example:**
```css
@keyframes rainDrop {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(50vh) translateX(5px);
    opacity: 0.5;
  }
  100% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
}
```

## Design Engineering Patterns

### 1. Consistent Easing System
All animations use a unified cubic-bezier easing function: `[0.22, 1, 0.36, 1]`

This creates a consistent feel across different animation libraries and ensures smooth, natural motion throughout the site.

### 2. Performance-First Architecture
- **Hardware Acceleration:** Strategic use of `transform-gpu` and `translateZ(0)`
- **Animation Cleanup:** Proper disposal in useEffect hooks
- **Selective Rendering:** Conditional animation execution based on component state
- **Memory Management:** Careful handling of animation instances and event listeners

### 3. Responsive Animation Timing
- **Fast interactions:** 0.2-0.3s (button hovers, micro-interactions)
- **Medium transitions:** 0.5-0.8s (page elements, modal appearances)
- **Long reveals:** 1.4-2s (major content transitions)
- **Ambient effects:** 2-8s (breathing animations, environmental effects)

### 4. Progressive Enhancement
- Fallbacks for users with reduced motion preferences
- Graceful degradation when animation libraries fail to load
- Performance scaling based on device capabilities

## Custom Tailwind Animations

**File:** `tailwind.config.js`

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
},
animation: {
  "slow-pulse": "slow-pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  twinkle: "twinkle 5s ease-in-out infinite",
},
```

## Framer Motion Integration

### Staggered Animation Patterns
```typescript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
```

### Page Transition System
```typescript
const cardVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.98,
    y: 10,
  }),
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
      y: { duration: 0.3 },
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.98,
    y: 10,
  }),
};
```

## Animation Library Coordination

### Strategic Library Usage
- **GSAP:** Complex timeline animations requiring precise control (curtain effect)
- **Framer Motion:** React component animations and page transitions
- **CSS Keyframes:** Background effects and environmental animations
- **Custom JavaScript:** Real-time interactive effects (liquid glass)

### Integration Benefits
1. **Performance Optimization:** Each library used for its strengths
2. **Consistent Timing:** Unified easing across all implementations
3. **Maintainable Code:** Clear separation of concerns
4. **Scalable Architecture:** Easy to extend with new animation types

## Development Guidelines

### Adding New Animations
1. Choose appropriate library based on animation complexity
2. Use consistent easing: `[0.22, 1, 0.36, 1]`
3. Implement proper cleanup in useEffect hooks
4. Add hardware acceleration for transform-heavy animations
5. Test performance across devices
6. Consider reduced motion preferences

### Performance Considerations
- Always clean up animation instances
- Use `transform-gpu` for hardware acceleration
- Implement conditional rendering for complex animations
- Monitor memory usage during development
- Test on lower-end devices

### Code Organization
- Keep animation logic close to components
- Create reusable animation variants
- Document complex animation sequences
- Use TypeScript for animation parameters
- Implement proper error boundaries

## Notable Technical Achievements

1. **Hybrid Animation System:** Successfully integrates GSAP, Framer Motion, and custom implementations
2. **WebGL-Style Shaders:** Pure JavaScript implementation without WebGL dependency
3. **Real-Time Progress Tracking:** Custom XHR-based image loading with visual feedback
4. **Time-Aware Theming:** Dynamic animations that respond to time of day
5. **Interactive Physics:** Mathematical approach to liquid distortion effects
6. **Performance Optimization:** Strategic use of hardware acceleration and cleanup

This animation system represents advanced design engineering practices with a focus on user experience, performance, and maintainable code architecture.