# Design System Reference

> **Complete Self-Serving Guide** for building pages with matching aesthetic
>
> This document contains everything you need to build pages that match the design system. All patterns, tokens, and components are fully documented with complete, working examples. No need to reference the codebase—everything is explained here.

## Design Philosophy

This design system follows a **minimal, elegant aesthetic** with:

- **Refined Typography**: Light weights, tight letter spacing, generous line heights
- **Subtle Interactions**: Gentle hover states, smooth transitions, minimal animations
- **Mobile-First**: Optimized for touch, with progressive enhancement for desktop
- **System Theme Matching**: Automatically matches user's system dark/light preference
- **Accessibility First**: Full keyboard navigation, proper ARIA labels, reduced motion support
- **Safe Area Aware**: Respects device notches and safe areas on mobile devices

---

## Table of Contents

1. [Quick Reference (Copy-Paste Snippets)](#quick-reference-copy-paste-snippets)
2. [Typography Quick Reference](#typography-quick-reference)
3. [Design Tokens](#design-tokens)
   - [Spacing](#spacing)
   - [Typography](#typography)
   - [Colors](#colors)
   - [Layout](#layout)
4. [Responsive Patterns](#responsive-patterns)
   - [Breakpoints](#breakpoints)
   - [Mobile-First Strategy](#mobile-first-strategy)
   - [Safe Area Handling](#safe-area-handling)
5. [Theme System](#theme-system)
   - [Theme Detection](#theme-detection)
   - [Theme Application](#theme-application)
   - [Color Tokens](#color-tokens)
6. [Component Patterns](#component-patterns)
   - [Navigation Items](#navigation-items)
   - [Layout Containers](#layout-containers)
   - [Interactive Elements](#interactive-elements)
7. [Animation & Transitions](#animation--transitions)
8. [Accessibility Guidelines](#accessibility-guidelines)

---

## Quick Reference (Copy-Paste Snippets)

### Complete Base Page Structure

**What it does:**
- Creates a full-viewport page that matches system theme
- Handles mobile safe areas (notches, home indicators)
- Provides edge-to-edge background with proper content padding
- Prevents mobile scrolling while allowing desktop overflow
- Responsive layout: vertical stack on mobile, horizontal on desktop

**Visual Result:**
- **Mobile**: Full-height page, content stacked vertically with 32px horizontal padding
- **Desktop**: Content centered vertically, 80px left padding, 32px right padding
- **Background**: Extends edge-to-edge on mobile, respects safe areas automatically

```tsx
"use client"

import { useMemo, useEffect } from "react"

// Required hook - see "Theme System" section for complete implementation
function useSystemTheme() {
  const [prefersDark, setPrefersDark] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    setPrefersDark(mql.matches)
    setIsReady(true)

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }

    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return { prefersDark, isReady }
}

export default function Page() {
  const { prefersDark, isReady } = useSystemTheme()
  
  // Only apply theme after client-side detection to prevent hydration mismatch
  const shouldShowDark = useMemo(() => {
    return prefersDark && isReady
  }, [prefersDark, isReady])

  // Apply theme to entire document (html element) for full-page background
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const theme = shouldShowDark ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [shouldShowDark])

  return (
    {/* 
      Outer container: Creates edge-to-edge background
      - Negative margins counteract root layout's mobile-gutter padding
      - Width calculation accounts for safe areas on both sides
      - On desktop (sm:), margins reset to 0 and width becomes normal
    */}
    <div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
      <main
        className="h-screen h-[100dvh] max-h-[100dvh] bg-background flex flex-col md:flex-row md:items-center px-0 md:pl-20 relative md:pt-0 transition-all duration-200 overflow-hidden md:overflow-visible md:pr-8 w-full"
        style={{
          // Safe area padding: Ensures content isn't hidden behind notches
          // Top: At least 4rem (64px), or safe area inset if larger
          // Bottom: At least 2rem (32px), or safe area inset if larger
          paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
        }}
      >
        {/* Your content here */}
      </main>
    </div>
  )
}
```

### Responsive Container with Mobile Gutter

**What it does:**
- Creates edge-to-edge background that respects device safe areas
- Provides proper content padding on mobile (32px) while allowing full-width backgrounds
- Automatically handles iPhone notches and Android safe areas

**Why this pattern:**
The root layout wraps all pages in a `.mobile-gutter` class that adds padding for safe areas. To create edge-to-edge backgrounds, we need to:
1. Use negative margins to counteract the mobile-gutter padding
2. Expand width to account for the negative margins
3. Reset on desktop where safe areas aren't needed

**Visual Result:**
- **Mobile**: Background extends to screen edges, content has 32px padding from edges
- **Desktop**: Normal width container, no special handling needed

```tsx
{/* 
  Edge-to-edge background container
  
  How it works:
  1. Negative margin counteracts root layout's mobile-gutter padding
  2. Width calculation adds back the margin width + accounts for safe areas
  3. On desktop (sm:), everything resets to normal
*/}
<div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
  {/* 
    Content container with proper padding
    - Mobile: 32px horizontal padding (2rem)
    - Desktop: No horizontal padding (handled by parent or grid)
  */}
  <div className="px-8 md:px-0">
    {/* Your content */}
  </div>
</div>
```

### Two-Column Desktop Grid

**What it does:**
- Creates a responsive two-column layout
- Mobile: Vertical stack with items left-aligned, 48px spacing between sections
- Desktop: Two-column grid with 64px gap, items aligned to baseline

**Visual Result:**
- **Mobile**: 
  ```
  [Column 1 Content]
  (48px gap)
  [Column 2 Content]
  ```
- **Desktop**:
  ```
  [Column 1]  (64px gap)  [Column 2]
  ```

**Why these specific values:**
- `gap-16` (64px): Generous spacing creates visual breathing room between columns
- `items-baseline`: Aligns text baselines for typographic harmony
- `mb-12` (48px): Mobile spacing matches the generous desktop gap proportionally

```tsx
{/* 
  Responsive grid container
  - Mobile: Flex column, full width, takes available space
  - Desktop: Grid with 2 columns, 64px gap, auto width
  - Overflow: Hidden on mobile (prevents scroll), visible on desktop
*/}
<div className="flex flex-col items-start flex-1 md:flex-none md:grid md:grid-cols-2 md:gap-16 w-full md:w-auto md:items-baseline md:my-0 px-8 md:px-0 min-h-0 max-h-full overflow-hidden md:overflow-visible">
  {/* 
    Column 1: Name/Title section
    - Mobile: 48px bottom margin
    - Desktop: No margin, relative positioning for absolute children
    - gap-1: 4px spacing between name and subtitle
  */}
  <div className="relative flex flex-col items-start md:items-start md:relative mb-12 md:mb-0 gap-1">
    <h1 className="text-base font-light text-foreground tracking-wide leading-[1.5]">
      Name
    </h1>
    <p className="text-xs text-muted-foreground leading-[1.5]">
      Subtitle
    </p>
  </div>
  
  {/* 
    Column 2: Navigation or secondary content
    - Mobile: Flex row (if multiple items), 48px bottom margin
    - Desktop: Block display, no margin
  */}
  <div className="flex justify-start md:block mb-12 md:mb-0">
    {/* Navigation items or other content */}
  </div>
</div>
```

### Navigation Item Pattern

**What it does:**
- Creates an accessible, interactive navigation item
- Mobile: Larger tap target (48px height), subtle scale feedback on tap
- Desktop: Hover state changes text color, group hover affects all items

**Visual Behavior:**
- **Default State**: Muted gray text (`text-muted-foreground`)
- **Mobile Tap**: Slightly scales down (98%), text becomes primary color
- **Desktop Hover**: Text becomes primary color, smooth 200ms transition
- **Group Hover**: When hovering over menu container, all items fade to 70% opacity, hovered item becomes full opacity

**Why these interactions:**
- Mobile scale feedback provides tactile response without being jarring
- Group hover creates a cohesive menu experience
- Color transitions are subtle and elegant (200ms duration)

```tsx
{/* 
  Complete navigation item with all interactions
  
  Mobile behavior:
  - -mx-2 px-2 py-2: Creates 48px tap target (Apple's minimum recommendation)
  - active:scale-[0.98]: Subtle press feedback (2% scale down)
  - active:text-foreground: Color change on tap
  
  Desktop behavior:
  - md:mx-0 md:px-0 md:py-0: Removes mobile padding
  - md:group-hover/menu:...: Fades to 70% when hovering menu group
  - md:hover:!text-foreground: Full opacity primary color on individual hover
  - md:active:scale-100: No scale on desktop (mouse doesn't need it)
*/}
<div
  role="button"
  tabIndex={0}
  onClick={() => handleClick()}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
  aria-label="Descriptive label for screen readers"
  style={{
    WebkitTapHighlightColor: 'transparent', // Remove iOS blue tap highlight
    WebkitUserSelect: 'none',                 // Prevent text selection
    userSelect: 'none',                      // Prevent text selection
    outline: 'none'                          // Remove default focus outline (add custom if needed)
  }}
>
  Label
</div>

{/* 
  Navigation group with hover effect
  
  The group/menu class enables group hover functionality.
  When you hover anywhere in this container, all child items
  with group-hover/menu classes will respond.
*/}
<div className="flex flex-col gap-1 group/menu">
  <NavigationItem label="About" onClick={handleAboutClick} />
  <NavigationItem label="Works" onClick={handleWorksClick} />
  <NavigationItem label="Writing" onClick={handleWritingClick} />
</div>
```

### Typography Patterns

**Design Intent:**
Typography uses a refined, minimal approach:
- **Light weights** (300) for headings create elegance without heaviness
- **Tight letter spacing** (-0.02em) creates modern, cohesive word shapes
- **Generous line height** (1.5) improves readability and breathing room
- **Small sizes** (12-16px) create intimacy and focus

**Visual Hierarchy:**
1. **Name/Heading** (16px, light): Primary identifier, most prominent
2. **Subtitle** (12px, muted): Secondary information, less prominent
3. **Navigation** (12px desktop, 14px mobile, muted): Tertiary, interactive

```tsx
{/* 
  Name/Heading - Primary identifier
  - 16px size (text-base)
  - Light weight (300) for elegance
  - Wide tracking (0.025em) for refinement
  - Primary text color
  - Smooth color transitions for theme changes
*/}
<h1 className="text-base md:text-base font-light text-foreground tracking-wide leading-[1.5] transition-colors duration-200">
  Name
</h1>

{/* 
  Subtitle - Secondary information
  - 12px size (text-xs) - smaller than name for hierarchy
  - Muted color (35% opacity in light, 70% in dark)
  - Same line height for consistency
  - Smooth transitions for theme changes
*/}
<p className="text-xs md:text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">
  Subtitle
</p>

{/* 
  Navigation Text - Interactive elements
  - 14px on mobile (text-sm) for better tap targets
  - 12px on desktop (text-xs) for refinement
  - Muted color until hover/active
  - Consistent line height
*/}
<span className="text-sm md:text-xs text-muted-foreground leading-[1.5]">
  Navigation Item
</span>

{/* 
  Body Text - For longer content
  - 16px base size (matches name for consistency)
  - Relaxed line height (1.625) for better readability in paragraphs
  - Primary text color
*/}
<p className="text-base leading-relaxed text-foreground">
  Longer body text content goes here. The relaxed line height
  creates comfortable reading rhythm for paragraphs.
</p>
```

---

## Typography Quick Reference

> **Full Documentation**: See [`TYPOGRAPHY.md`](TYPOGRAPHY.md) for comprehensive typography system documentation, including **minimal identity** and **hero** rules (main hero max 22px; use body/secondary/caption; 26px for rare emphasis only).

### Golden Ratio Scale

All text sizes use a **Golden Ratio scale** (φ ≈ 1.618) with a 14px anchor point. This scale is enforced in Tailwind config, ensuring consistency across the entire codebase.

| Size | Pixels | Tailwind | CSS Variable | Common Use Cases |
|------|--------|----------|--------------|------------------|
| 2xs  | 10px   | `text-2xs` | `--text-2xs` | Labels, timestamps, section headers |
| xs   | 12px   | `text-xs` | `--text-xs` | Metadata, captions, footer links |
| sm   | 14px   | `text-sm` | `--text-sm` | Body text, navigation (anchor point) |
| base | 16px   | `text-base` | `--text-base` | Modal content, emphasized text |
| lg   | 20px   | `text-lg` | `--text-lg` | Subheadings |
| xl   | 22px   | `text-xl` | `--text-xl` | Page titles, "Raf" name |
| 2xl  | 26px   | `text-2xl` | `--text-2xl` | Rare emphasis, large display; not for main hero identity |

### Semantic Typography Classes

Use semantic classes when meaning is more important than appearance:

```tsx
// Caption: Quiet, secondary text (12px, muted, light)
<p className="type-caption">2024 · Contract</p>

// Body: Default secondary content (14px, muted)
<p className="type-body">Work description goes here.</p>

// Body Primary: Emphasized content (14px, primary color)
<p className="type-body-primary">Important intro text.</p>

// Title: Work card titles (22px, Edu Marist)
<h2 className="type-title">Project Name</h2>
```

### Font Families

Three-tier font system:

```tsx
// Body font (Ronzino) - applied automatically
<p className="text-sm">Default body text</p>

// Accent font (Edu Marist) - for headings, emphasis
<h1 className="font-edu-marist text-xl">Heading</h1>
<span className="font-edu-marist text-xl">Raf</span>

// Monospace font (CoFo Sans Mono) - for code
<code className="font-mono text-xs">console.log()</code>
```

### Heading Hierarchies

Choose the appropriate hierarchy based on context:

#### Primary Hierarchy (Full Articles)
```tsx
<h1 className="text-xl font-edu-marist">Main Article Title</h1>
<h2 className="text-lg font-edu-marist">Section Heading</h2>
<h3 className="text-base font-semibold">Subsection</h3>
```

#### Compact Hierarchy (Modals, Side Panels)
```tsx
<h1 className="text-base font-edu-marist">Modal Title</h1>
<h2 className="text-sm font-semibold">Section Heading</h2>
<h3 className="text-xs font-semibold">Subsection</h3>
```

#### Minimal Hierarchy (Stories, Dense Layouts)
```tsx
<h1 className="text-sm font-edu-marist">Story Title</h1>
<h2 className="text-xs font-semibold">Section</h2>
<h3 className="text-xs font-semibold">Subsection</h3>
```

### Line Heights

```tsx
// Tight (1.25) - for headings, compact text
<h1 className="text-xl leading-tight">Heading</h1>

// Normal (1.5) - for UI elements, short text
<p className="text-sm leading-[1.5]">UI text</p>

// Relaxed (1.625) - for long-form content
<article className="text-base leading-relaxed">Article content</article>
```

### Letter Spacing

```tsx
// Tight (-0.02em) - auto-applied with Edu Marist
<span className="font-edu-marist">Tight spacing</span>

// Body (-0.01em) - auto-applied globally to body element
// No need to specify

// Wide (0.025em) - for special emphasis
<h1 className="text-base tracking-wide">Raf V.</h1>
```

### Common Patterns

```tsx
// Navigation items (mobile-first)
<nav className="text-sm md:text-xs">Menu Item</nav>

// Work descriptions
<p className="type-body">Project description</p>

// Hero intro (emphasized)
<p className="type-body-primary">
  <span className="font-edu-marist text-xl">Raf</span> designs products.
</p>

// Footer captions
<span className="type-caption">2024 · Full-time</span>

// Work card titles
<h2 className="type-title">Project Name</h2>
```

### Implementation Files

- **Tailwind Config**: [`tailwind.config.js`](tailwind.config.js) - fontSize scale override
- **CSS Variables**: [`app/globals.css`](app/globals.css) lines 54-71 - CSS variables
- **Semantic Classes**: [`app/globals.css`](app/globals.css) lines 11-42 - `.type-*` classes
- **TypeScript Constants**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) - Programmatic access
- **Font Loading**: [`app/layout.tsx`](app/layout.tsx) - Next.js font loading

### Semantic Labels (New!)

**Choose typography by meaning, not size.** See [`TYPOGRAPHY.md`](TYPOGRAPHY.md) for complete semantic typography documentation.

| Semantic Label | Mobile | Desktop | Use Cases |
|----------------|--------|---------|-----------|
| **Display** | 22px (`text-xl`) | 26px (`text-2xl`) | Hero text, page hero names |
| **Page Title** | 22px (`text-xl`) | 22px (`text-xl`) | Main page titles, work titles |
| **Heading** | 16px (`text-base`) | 20px (`text-lg`) | Section headings |
| **Subheading** | 14px (`text-sm`) | 16px (`text-base`) | Subsection headings |
| **Body** | 14px (`text-sm`) | 14px (`text-sm`) | Main content, descriptions |
| **Body Large** | 16px (`text-base`) | 16px (`text-base`) | Emphasized paragraphs |
| **Secondary** | 14px (`text-sm`) | 12px (`text-xs`) | Navigation, metadata |
| **Caption** | 12px (`text-xs`) | 10px (`text-2xs`) | Timestamps, fine print |

**Usage**:
```tsx
import { SEMANTIC_TYPOGRAPHY } from '@/app/config/typographyConfig'

<h1 className={`${SEMANTIC_TYPOGRAPHY.pageTitle.mobile} md:${SEMANTIC_TYPOGRAPHY.pageTitle.desktop}`}>
  Title
</h1>
```

### Vertical Rhythm (New!)

**Consistent spacing based on 4px grid.** See [`TYPOGRAPHY.md`](TYPOGRAPHY.md) for complete vertical rhythm documentation.

| Element | Spacing | Pixels | Utility Class |
|---------|---------|--------|---------------|
| Paragraph gap | `space-y-6` | 24px | `.rhythm-paragraph` |
| Section gap | `space-y-8` | 32px | `.rhythm-section` |
| List gap | `space-y-4` | 16px | `.rhythm-list` |
| H1 below/above | `mb-6` / `mt-12` | 24px / 48px | `.rhythm-heading` |
| H2 below/above | `mb-4` / `mt-8` | 16px / 32px | `.rhythm-heading` |
| H3 below/above | `mb-3` / `mt-6` | 12px / 24px | `.rhythm-heading` |

**Usage**:
```tsx
<article className="rhythm-paragraph rhythm-heading">
  <h1>Title</h1>
  <p>Paragraph with automatic 24px spacing.</p>
  <p>Second paragraph.</p>
</article>
```

### Measure (Line Length) (New!)

**Optimal line length for readability.** See [`TYPOGRAPHY.md`](TYPOGRAPHY.md) for complete measure documentation.

| Measure | Value | Tailwind | Use Cases |
|---------|-------|----------|-----------|
| **Narrow** | 45ch (~470px) | `max-w-prose-narrow` | Modals, side panels |
| **Optimal** | 65ch (~680px) | `max-w-prose` | Body text, articles |
| **Wide** | 80ch (~840px) | `max-w-prose-wide` | Technical content, code |

**Usage**:
```tsx
<article className="prose-article mx-auto px-8">
  <p>Content with optimal 65ch line length for readability.</p>
</article>
```

### Quick Lookup

| Need | Use |
|------|-----|
| Tiny label | `text-2xs` (10px) |
| Caption/meta | `text-xs` (12px) or `.type-caption` |
| Body text | `text-sm` (14px) or `.type-body` |
| Emphasized body | `text-base` (16px) or `.type-body-primary` |
| Subheading | `text-lg` (20px) |
| Main heading | `text-xl` (22px) or `.type-title` |
| Hero text | `text-2xl` (26px) |
| Accent font | `font-edu-marist` |
| Code | `font-mono` |
| **Prose container** | `prose-article` (measure + rhythm) |
| **Rhythm spacing** | `.rhythm-paragraph` `.rhythm-heading` |

---

## Common Patterns & Complete Examples

### Complete Working Page Example

Here's a complete, working page that demonstrates all patterns:

```tsx
"use client"

import { useMemo, useEffect, useState } from "react"

// Theme detection hook (complete implementation in Theme System section)
function useSystemTheme() {
  const [prefersDark, setPrefersDark] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    setPrefersDark(mql.matches)
    setIsReady(true)
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return { prefersDark, isReady }
}

export default function ExamplePage() {
  const { prefersDark, isReady } = useSystemTheme()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  
  const shouldShowDark = useMemo(() => {
    return prefersDark && isReady
  }, [prefersDark, isReady])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const theme = shouldShowDark ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [shouldShowDark])

  const handleNavClick = (item: string) => {
    setSelectedItem(item === selectedItem ? null : item)
  }

  return (
    <div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
      <main
        className="h-screen h-[100dvh] max-h-[100dvh] bg-background flex flex-col md:flex-row md:items-center px-0 md:pl-20 relative md:pt-0 transition-all duration-200 overflow-hidden md:overflow-visible md:pr-8 w-full"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
        }}
      >
        <div className="flex flex-col items-start flex-1 md:flex-none md:grid md:grid-cols-2 md:gap-16 w-full md:w-auto md:items-baseline md:my-0 px-8 md:px-0 min-h-0 max-h-full overflow-hidden md:overflow-visible">
          {/* Column 1: Name and Title */}
          <div className="relative flex flex-col items-start md:items-start md:relative mb-12 md:mb-0 gap-1">
            <h1 className="text-base md:text-base font-light text-foreground tracking-wide leading-[1.5] transition-colors duration-200">
              Your Name
            </h1>
            <p className="text-xs md:text-xs text-muted-foreground leading-[1.5] transition-colors duration-200">
              Your Title
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex justify-start md:block mb-12 md:mb-0">
            <div className="flex flex-col gap-1 group/menu">
              {['About', 'Works', 'Writing'].map((item) => (
                <div
                  key={item}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleNavClick(item)
                    }
                  }}
                  className={`cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs transition-all duration-200 leading-[1.5] ${
                    selectedItem === item
                      ? 'text-foreground'
                      : 'text-muted-foreground md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground'
                  } active:scale-[0.98] md:active:scale-100`}
                  aria-label={`Navigate to ${item}`}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

### Simple Content Page Pattern

For pages that don't need the full homepage layout:

```tsx
"use client"

import { useMemo, useEffect } from "react"
// ... useSystemTheme hook from above ...

export default function ContentPage() {
  const { prefersDark, isReady } = useSystemTheme()
  const shouldShowDark = useMemo(() => {
    return prefersDark && isReady
  }, [prefersDark, isReady])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', shouldShowDark ? "dark" : "light")
    }
  }, [shouldShowDark])

  return (
    <div className="min-h-screen bg-background">
      <article className="mobile-gutter max-w-3xl mx-auto py-12 md:py-20 px-8 md:px-0">
        <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight leading-[1.5] mb-6">
          Page Title
        </h1>
        <div className="text-base leading-relaxed text-foreground space-y-4">
          <p>Your content here...</p>
        </div>
      </article>
    </div>
  )
}
```

---

## Design Tokens

### Spacing

#### Mobile Spacing
- **Content Padding**: `px-8` (2rem / 32px)
- **Mobile Gutter**: `max(16px, calc(env(safe-area-inset-left, 0px) + 16px))`
- **Vertical Spacing**: `mb-12` (3rem / 48px) between sections
- **Item Gap**: `gap-1` (0.25rem / 4px) for navigation items

#### Desktop Spacing
- **Left Padding**: `md:pl-20` (5rem / 80px)
- **Right Padding**: `md:pr-8` (2rem / 32px) or `md:pr-[50%]` (when side panel open)
- **Column Gap**: `md:gap-16` (4rem / 64px) between grid columns
- **Vertical Margin**: `md:my-0` (no vertical margin on desktop)

#### Safe Area Spacing
- **Top Padding**: `max(env(safe-area-inset-top, 0), 4rem)`
- **Bottom Padding**: `max(env(safe-area-inset-bottom, 0), 2rem)`
- **Left Safe Area**: `env(safe-area-inset-left, 0px)`
- **Right Safe Area**: `env(safe-area-inset-right, 0px)`

#### Spacing Scale Reference
```css
/* Tailwind spacing scale (rem values) */
0.25rem = 1 (gap-1)
0.5rem = 2
1rem = 4
1.5rem = 6
2rem = 8 (px-8, pr-8)
3rem = 12 (mb-12)
4rem = 16 (gap-16, padding-top min)
5rem = 20 (pl-20)
```

### Typography

#### Font Families

**Font Stack:**
1. **Primary Body** (`font-sans`): Ronzino Regular
   - Custom font loaded via Next.js `localFont`
   - Variable: `--font-ronzino`
   - Used for: Body text, navigation, general UI
   - Characteristics: Clean, modern, slightly geometric

2. **Accent/Secondary** (`font-edu-marist`): Edu Marist Regular
   - Custom font loaded via Next.js `localFont`
   - Variable: `--font-edu-marist`
   - Used for: Headings, special emphasis
   - Characteristics: Refined, elegant, slightly condensed
   - Applied via: `.font-edu-marist` class or `font-edu-marist` Tailwind class

3. **System Fallback**: Inter
   - Loaded via Google Fonts
   - Used as: Fallback if custom fonts fail to load
   - Characteristics: Highly legible, neutral

**Font Loading Pattern:**
```tsx
// In your root layout (app/layout.tsx)
import localFont from "next/font/local"

const ronzino = localFont({
  src: "../public/fonts/Ronzino-Regular.otf",
  variable: "--font-ronzino",
  display: "swap", // Show fallback while loading
})

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
  display: "swap",
})

// Apply to html element
<html className={`${ronzino.variable} ${eduMarist.variable}`}>
```

#### Font Sizes
- **Base**: `16px` (1rem) - set in `body` element
- **Name/Heading**: `text-base` (1rem / 16px)
- **Subtitle**: `text-xs` (0.75rem / 12px)
- **Navigation**: `text-sm md:text-xs` (0.875rem mobile / 0.75rem desktop)

#### Font Weights
- **Light**: `font-light` (300) - for headings
- **Normal**: `font-normal` (400) - default body text
- **Medium**: `font-medium` (500) - for emphasis

#### Letter Spacing

**Why negative letter spacing?**
Modern fonts are often designed with slightly loose default spacing. Tightening it creates:
- More cohesive word shapes
- Modern, refined appearance
- Better visual density

**Spacing Values:**
- **Headings** (`-0.02em`): Applied via `.font-edu-marist` class
  - Example: "Raf V." with `-0.02em` looks tighter, more refined
  - Applied automatically when using `font-edu-marist` class
  
- **Body** (`-0.01em`): Set globally in `body` element
  - Subtle tightening for all body text
  - Improves readability without being noticeable
  
- **Wide Tracking** (`tracking-wide` = `0.025em`): For special headings
  - Used for name/primary identifier
  - Creates elegant, spacious feel
  - Example: Name headings use `tracking-wide` for refinement

**Visual Comparison:**
```
Normal spacing:  R a f   V .
Tight (-0.02em):  Raf V.
Wide (0.025em):   R a f   V .
```

#### Line Heights

**Why these specific values?**
Line height affects readability and visual rhythm:
- **1.5 (150%)**: Standard for UI elements
  - Provides breathing room without excessive space
  - Used for: Headings, navigation, short text
  - Creates tight, cohesive blocks of text
  
- **1.625 (162.5%)**: Relaxed for longer content
  - More generous spacing improves reading comfort
  - Used for: Paragraphs, body text, markdown content
  - Prevents text from feeling cramped in long-form content

**Visual Comparison:**
```
Tight (1.2):     Line 1
                 Line 2
                 Line 3

Standard (1.5):  Line 1
                 
                 Line 2
                 
                 Line 3

Relaxed (1.625): Line 1
                  
                  Line 2
                  
                  Line 3
```

**When to use each:**
- `leading-[1.5]`: Navigation items, headings, labels, short text
- `leading-relaxed`: Paragraphs, articles, long-form content, markdown

#### Typography Classes Reference
```tsx
{/* Name/Title */}
className="text-base font-light text-foreground tracking-wide leading-[1.5]"

{/* Subtitle */}
className="text-xs text-muted-foreground leading-[1.5]"

{/* Navigation */}
className="text-sm md:text-xs text-muted-foreground leading-[1.5]"

{/* Body Text */}
className="text-base leading-relaxed"
```

### Colors

#### Semantic Color Tokens (Tailwind Classes)
- **Background**: `bg-background` → `hsl(var(--background))`
- **Foreground (Primary Text)**: `text-foreground` → `hsl(var(--foreground))`
- **Muted Text**: `text-muted-foreground` → `hsl(var(--muted-foreground))`
- **Card Background**: `bg-card` → `hsl(var(--card))`
- **Border**: `border-border` → `hsl(var(--border))`
- **Primary Accent**: `text-primary` / `bg-primary` → `hsl(var(--primary))`

#### CSS Custom Properties (HSL Values)

**Light Mode:**
```css
--background: var(--neutral-h) var(--neutral-s) 99%;
--foreground: var(--neutral-h) 15% 10%;
--muted-foreground: var(--neutral-h) 10% 35%;
--primary: var(--accent-h) var(--accent-s) var(--accent-l);
```

**Dark Mode:**
```css
--background: var(--neutral-h) 14% 8%;
--foreground: var(--neutral-h) 15% 95%;
--muted-foreground: var(--neutral-h) 10% 70%;
--primary: var(--accent-h) 85% 70%;
```

#### Core Hue Anchors

**Color System Architecture:**
The color system uses HSL (Hue, Saturation, Lightness) with anchor points that can be adjusted to change the entire palette.

**Hue Anchors:**
```css
--accent-h: 226;  /* Indigo/blue hue (226° on color wheel) */
--accent-s: 92%;  /* High saturation - vibrant, not muted */
--accent-l: 66%;  /* Medium-light - bright but not washed out */

--neutral-h: 220; /* Cool gray hue (slightly blue-tinted) */
--neutral-s: 10%; /* Low saturation - neutral, not colorful */
```

**What this means:**
- **Accent color** (226°): Indigo/blue range
  - Used for: Primary actions, links, accents
  - High saturation makes it vibrant and noticeable
  - Medium-light ensures good contrast on both light and dark backgrounds
  
- **Neutral color** (220°): Cool gray
  - Used for: Backgrounds, text, borders
  - Low saturation keeps it neutral
  - Slight blue tint prevents it from feeling warm/brown

**Adjusting the Palette:**
To change the entire color scheme, adjust these anchors:
```css
/* Warmer palette example */
--accent-h: 30;   /* Orange instead of blue */
--neutral-h: 0;   /* Pure gray instead of cool gray */

/* Muted palette example */
--accent-s: 50%;  /* Less vibrant */
--neutral-s: 5%;  /* Even more neutral */
```

**Visual Reference:**
- Accent (226°, 92%, 66%): Bright indigo-blue (#5B8DFF approximate)
- Neutral (220°, 10%): Cool gray base for all neutrals

#### Color Usage Patterns
```tsx
{/* Primary text */}
className="text-foreground"

{/* Secondary/muted text */}
className="text-muted-foreground"

{/* Background */}
className="bg-background"

{/* With transitions */}
className="text-foreground transition-colors duration-200"
```

### Layout

#### Viewport Constraints

**The Problem:**
On mobile browsers, the viewport height changes as the browser UI (address bar, toolbars) shows/hides. This can cause layout shifts and unwanted scrolling.

**The Solution:**
Use multiple height constraints to handle all scenarios:

```tsx
className="h-screen h-[100dvh] max-h-[100dvh]"
```

**What each does:**
- `h-screen`: Standard viewport height (100vh)
  - Fallback for older browsers
  - Uses static viewport height
  
- `h-[100dvh]`: Dynamic viewport height
  - Accounts for mobile browser UI changes
  - Updates as browser bars show/hide
  - Modern solution for mobile viewport issues
  
- `max-h-[100dvh]`: Maximum height constraint
  - Prevents content from exceeding viewport
  - Ensures no overflow even if content tries to grow

**Why all three?**
- `h-screen`: Broad browser support
- `h-[100dvh]`: Modern mobile fix
- `max-h-[100dvh]`: Safety constraint

**Visual Result:**
```
┌─────────────────────┐
│                     │ ← Exactly viewport height
│                     │
│   Page Content      │
│                     │
│                     │
└─────────────────────┘
  No scrolling, no overflow
```

#### Overflow Strategy

**Why different strategies?**
Mobile and desktop have different interaction patterns:
- **Mobile**: Touch-based, fixed viewport, no scrolling needed
- **Desktop**: Mouse-based, can scroll, overflow is acceptable

**Implementation:**
```tsx
className="overflow-hidden md:overflow-visible"
```

**Mobile (`overflow-hidden`):**
- Prevents any scrolling
- Content must fit within viewport
- Forces careful layout planning
- Creates app-like experience

**Desktop (`md:overflow-visible`):**
- Allows content to overflow
- Enables scrolling if needed
- More flexible layout options
- Traditional web experience

**When to use:**
- **Fixed viewport pages** (like homepage): Use this pattern
- **Scrollable pages** (like articles): Use `overflow-visible` on both
- **Modal/panel content**: Use `overflow-auto` for scrollable content within fixed container

#### Flexbox Patterns
```tsx
{/* Mobile: Column, Desktop: Row */}
className="flex flex-col md:flex-row md:items-center"

{/* Mobile: Column, Desktop: Grid */}
className="flex flex-col md:grid md:grid-cols-2"

{/* Item Alignment */}
className="items-start md:items-baseline"
```

#### Grid Patterns
```tsx
{/* Two-column desktop grid */}
className="md:grid md:grid-cols-2 md:gap-16"

{/* Three-column (if needed) */}
className="md:grid md:grid-cols-3 md:gap-16"
```

#### Width Patterns
```tsx
{/* Full width mobile, auto desktop */}
className="w-full md:w-auto"

{/* Full width always */}
className="w-full"

{/* Edge-to-edge with safe area calculation */}
className="w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full"
```

#### Position Patterns
```tsx
{/* Relative positioning for absolute children */}
className="relative"

{/* Absolute positioning (e.g., name above title) */}
className="md:absolute md:bottom-full md:mb-1"
```

---

## Responsive Patterns

### Breakpoints

#### Tailwind Breakpoints
- **Mobile (default)**: `< 640px` (sm breakpoint)
- **Tablet/Desktop**: `>= 768px` (md breakpoint) - **Primary breakpoint used**
- **Large Desktop**: `>= 1024px` (lg breakpoint)
- **XL Desktop**: `>= 1280px` (xl breakpoint)

#### Breakpoint Strategy
- **Mobile-First**: Base styles target mobile, `md:` prefix for desktop
- **Primary Breakpoint**: `md:` (768px) - most common responsive change
- **Breakpoint Constant**: `768px` (defined in `hooks/use-mobile.tsx`)

#### Breakpoint Usage Pattern
```tsx
{/* Mobile default, desktop override */}
className="text-sm md:text-xs"

{/* Mobile hidden, desktop visible */}
className="hidden md:block"

{/* Mobile visible, desktop hidden */}
className="block md:hidden"

{/* Mobile column, desktop row */}
className="flex-col md:flex-row"
```

### Mobile-First Strategy

#### Core Principles
1. **Base styles target mobile** - no prefix = mobile
2. **Desktop overrides use `md:`** - `md:` prefix = desktop (>= 768px)
3. **Progressive enhancement** - start simple, add complexity for larger screens

#### Common Mobile-First Patterns
```tsx
{/* Spacing: Less on mobile, more on desktop */}
className="px-8 md:pl-20"

{/* Layout: Stack on mobile, grid on desktop */}
className="flex flex-col md:grid md:grid-cols-2"

{/* Visibility: Show on mobile, hide on desktop */}
className="block md:hidden"

{/* Text size: Larger on mobile, smaller on desktop */}
className="text-sm md:text-xs"
```

#### Mobile-Specific Constraints
```tsx
{/* Prevent scrolling on mobile */}
className="overflow-hidden md:overflow-visible"

{/* Full viewport height on mobile */}
className="h-screen h-[100dvh] max-h-[100dvh]"

{/* Mobile gutter handling */}
className="px-8 md:px-0"
```

### Safe Area Handling

#### Safe Area Inset Variables

**What are safe areas?**
Safe areas are regions of the screen that may be obscured by device UI:
- **Top**: iPhone notch, status bar, camera cutouts
- **Bottom**: iPhone home indicator, Android navigation bar
- **Left/Right**: Curved screen edges, gesture areas

**CSS Environment Variables:**
```css
/* These return pixel values for safe area insets */
env(safe-area-inset-top, 0px)    /* Top safe area (notch) - typically 44-47px on iPhone */
env(safe-area-inset-bottom, 0px) /* Bottom safe area (home indicator) - typically 34px on iPhone */
env(safe-area-inset-left, 0px)   /* Left safe area - usually 0 unless landscape with notch */
env(safe-area-inset-right, 0px)  /* Right safe area - usually 0 unless landscape with notch */

/* The second parameter (0px) is the fallback if env() isn't supported */
```

**Real-world values:**
- iPhone with notch: `top: 44px`, `bottom: 34px`
- iPhone without notch: `top: 0px`, `bottom: 34px`
- Android: Varies by device, typically `bottom: 0-48px`
- Desktop: All values are `0px`

#### Safe Area Padding Pattern
```tsx
style={{
  paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
  paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
}}
```

#### Mobile Gutter Pattern

**What is mobile gutter?**
The root layout wraps all pages in a `.mobile-gutter` class that adds horizontal padding to respect safe areas. This ensures content isn't hidden behind device UI.

**CSS Implementation:**
```css
.mobile-gutter {
  /* 
    Left padding: At least 16px, or safe area + 16px if larger
    Example: iPhone in landscape might have 44px safe area
    Result: 44px + 16px = 60px padding
  */
  padding-left: max(16px, calc(env(safe-area-inset-left, 0px) + 16px));
  padding-right: max(16px, calc(env(safe-area-inset-right, 0px) + 16px));
}

/* On desktop (640px+), remove mobile gutter */
@media (min-width: 640px) {
  .mobile-gutter {
    padding-left: 0;
    padding-right: 0;
  }
}
```

**Visual Example:**
```
┌─────────────────────────────────┐
│ [Safe Area]                    │ ← 44px safe area (notch)
│ ┌───────────────────────────┐  │
│ │ 16px + safe area = 60px   │  │ ← Mobile gutter padding
│ │                           │  │
│ │     Your Content          │  │
│ │                           │  │
│ └───────────────────────────┘  │
│ [Safe Area]                    │ ← 34px safe area (home indicator)
└─────────────────────────────────┘
```

**Why this pattern?**
- Ensures content is always readable, never hidden behind device UI
- Provides consistent 16px minimum padding on all devices
- Automatically adapts to devices with larger safe areas
- Desktop doesn't need it, so it's removed at 640px breakpoint

#### Edge-to-Edge Background Pattern

**The Problem:**
- Root layout adds `.mobile-gutter` padding (16px + safe area)
- You want a background color to extend edge-to-edge
- But content should still respect the mobile gutter

**The Solution:**
Use negative margins to counteract the mobile-gutter, then expand width to compensate.

**Visual Explanation:**
```
Normal flow (with mobile-gutter):
┌─────────────────────────────────┐
│ [16px gutter] Content [16px]   │ ← Background stops here
└─────────────────────────────────┘

With negative margins:
┌─────────────────────────────────┐
│ Content (background extends)    │ ← Background goes edge-to-edge
└─────────────────────────────────┘
     ↑
  Negative margin pulls content out
```

**Complete Pattern:**
```tsx
{/* 
  Step 1: Outer container with negative margins
  - Negative margin counteracts the mobile-gutter padding
  - Width calculation adds back the margin width + accounts for both safe areas
  - On desktop (sm:), reset to normal (no mobile gutter exists)
*/}
<div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
  {/* 
    Step 2: Inner content container
    - Mobile: Add back 32px horizontal padding for content spacing
    - Desktop: No padding (handled by parent or grid system)
  */}
  <div className="px-8 md:px-0">
    {/* Your content with proper spacing */}
  </div>
</div>
```

**Why this works:**
1. Negative margin pulls container outside mobile-gutter bounds
2. Width calculation ensures container is full-width despite negative margin
3. Inner padding provides content spacing
4. Desktop reset removes all special handling (no mobile gutter on desktop)

#### Safe Area Utility Classes
```css
.pt-safe { padding-top: env(safe-area-inset-top, 0px); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
.pl-safe { padding-left: env(safe-area-inset-left, 0px); }
.pr-safe { padding-right: env(safe-area-inset-right, 0px); }
```

---

## Theme System

### Theme Detection

**Complete Hook Implementation**

You need this hook to detect system theme preference. Here's the complete implementation:

```tsx
import { useEffect, useState } from "react"

/**
 * Hook to detect system theme preference (light/dark mode)
 * 
 * Returns:
 * - prefersDark: boolean - true if system prefers dark mode
 * - isReady: boolean - true when detection is complete (prevents hydration mismatch)
 * 
 * Why isReady is needed:
 * - On server-side render, window is undefined
 * - We default to false (light mode) on server
 * - isReady ensures we only apply theme after client-side detection
 * - Prevents React hydration warnings from mismatched server/client HTML
 */
function useSystemTheme() {
  const [prefersDark, setPrefersDark] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    // Guard: Only run on client side
    if (typeof window === "undefined") return

    // Create media query listener for system preference
    const mql = window.matchMedia("(prefers-color-scheme: dark)")

    // Set initial value immediately
    setPrefersDark(mql.matches)
    setIsReady(true)

    // Handler for when user changes system preference
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }

    // Listen for changes (user switches system theme)
    mql.addEventListener("change", onChange)

    // Cleanup
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return { prefersDark, isReady }
}
```

#### Usage Pattern

```tsx
import { useMemo, useEffect } from "react"

function MyComponent() {
  const { prefersDark, isReady } = useSystemTheme()
  
  // Only determine theme after client-side detection is ready
  // This prevents hydration mismatches between server and client
  const shouldShowDark = useMemo(() => {
    return prefersDark && isReady
  }, [prefersDark, isReady])

  // Apply theme to document element for full-page background
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const theme = shouldShowDark ? "dark" : "light"
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [shouldShowDark])

  return (
    <div className="bg-background text-foreground">
      {/* Your content */}
    </div>
  )
}
```

**Key Points:**
- `prefersDark`: `true` if system prefers dark mode, `false` for light mode
- `isReady`: `true` when client-side detection completes (prevents hydration mismatch)
- **Theme matches system preference** - if user's OS is dark, site is dark
- **Reactive**: Automatically updates if user changes system preference
- **SSR-safe**: Returns safe defaults on server, updates on client

### Theme Application

#### Applying Theme to HTML Element

**Why apply to `document.documentElement`?**
- The `html` element is the root of the document
- Setting `data-theme` here ensures the entire page (including body and all children) gets the correct theme
- CSS variables cascade from root, so all components inherit theme colors
- Full-page background color comes from the html/body elements, not just your main component

**Complete Implementation:**
```tsx
useEffect(() => {
  // Guard: Only run on client side (document doesn't exist on server)
  if (typeof document !== 'undefined') {
    const theme = shouldShowDark ? "dark" : "light"
    // Apply to html element (document.documentElement)
    // This ensures full-page background and theme cascade
    document.documentElement.setAttribute('data-theme', theme)
  }
}, [shouldShowDark])
```

#### How CSS Theme System Works

The CSS supports three theme modes (in order of specificity):

1. **System Preference** (default):
   ```css
   @media (prefers-color-scheme: dark) {
     :root {
       --background: var(--neutral-h) 14% 8%;
       /* ... dark mode tokens ... */
     }
   }
   ```

2. **Explicit Dark** (overrides system preference):
   ```css
   [data-theme="dark"] {
     --background: var(--neutral-h) 14% 8%;
     /* ... dark mode tokens ... */
   }
   ```

3. **Explicit Light** (overrides system preference):
   ```css
   [data-theme="light"] {
     --background: var(--neutral-h) var(--neutral-s) 99%;
     /* ... light mode tokens ... */
   }
   ```

**Why this approach?**
- `data-theme` attribute has higher specificity than media queries
- Allows programmatic theme control while respecting system preference by default
- CSS variables cascade, so all components automatically get correct colors
- No need to pass theme props through component trees

### Color Tokens

#### HSL Color System Architecture

**Core Hue Anchors:**
```css
--accent-h: 226;        /* indigo/blue hue */
--accent-s: 92%;        /* accent saturation */
--accent-l: 66%;        /* accent lightness */

--neutral-h: 220;       /* cool gray hue */
--neutral-s: 10%;       /* neutral saturation */
```

**Semantic Tokens (Light Mode):**
```css
--background: var(--neutral-h) var(--neutral-s) 99%;
--foreground: var(--neutral-h) 15% 10%;
--muted-foreground: var(--neutral-h) 10% 35%;
--primary: var(--accent-h) var(--accent-s) var(--accent-l);
--border: var(--neutral-h) 12% 86%;
```

**Semantic Tokens (Dark Mode):**
```css
--background: var(--neutral-h) 14% 8%;
--foreground: var(--neutral-h) 15% 95%;
--muted-foreground: var(--neutral-h) 10% 70%;
--primary: var(--accent-h) 85% 70%;
--border: var(--neutral-h) 12% 18%;
```

#### Tailwind Integration
Tailwind consumes HSL triplets (without `hsl()` wrapper):
```css
/* Tailwind format: H S L (space-separated) */
--background: var(--neutral-h) var(--neutral-s) 99%;
--foreground: var(--neutral-h) 15% 10%;

/* Used in Tailwind config */
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
}
```

#### Color Token Reference
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `220 10% 99%` | `220 14% 8%` | Page background |
| `--foreground` | `220 15% 10%` | `220 15% 95%` | Primary text |
| `--muted-foreground` | `220 10% 35%` | `220 10% 70%` | Secondary text |
| `--primary` | `226 92% 66%` | `226 85% 70%` | Accent color |
| `--border` | `220 12% 86%` | `220 12% 18%` | Borders |

---

## Component Patterns

### Navigation Items

#### Complete Navigation Item Component
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => handleClick()}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  className="cursor-pointer -mx-2 px-2 py-2 md:mx-0 md:px-0 md:py-0 text-sm md:text-xs text-muted-foreground active:text-foreground active:scale-[0.98] md:active:scale-100 md:group-hover/menu:text-muted-foreground/70 md:hover:!text-foreground transition-all duration-200 leading-[1.5]"
  aria-label="Descriptive label for screen readers"
  style={{
    WebkitTapHighlightColor: 'transparent',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    outline: 'none'
  }}
>
  Label
</div>
```

#### Navigation Item Breakdown

**Mobile Tap Targets:**
- `-mx-2 px-2 py-2`: Negative margin + padding creates larger tap area
- `active:scale-[0.98]`: Visual feedback on tap

**Desktop Behavior:**
- `md:mx-0 md:px-0 md:py-0`: Reset mobile padding
- `md:active:scale-100`: No scale on desktop
- `md:group-hover/menu:text-muted-foreground/70`: Group hover effect
- `md:hover:!text-foreground`: Individual hover state

**Accessibility:**
- `role="button"`: Semantic button role
- `tabIndex={0}`: Keyboard focusable
- `onKeyDown`: Enter/Space key handling
- `aria-label`: Screen reader description

**Interaction Styles:**
- `WebkitTapHighlightColor: 'transparent'`: Remove iOS tap highlight
- `userSelect: 'none'`: Prevent text selection
- `outline: 'none'`: Remove default focus outline (ensure visible focus indicator)

#### Navigation Group Pattern
```tsx
<div className="flex flex-col gap-1 group/menu">
  <NavigationItem label="About" ... />
  <NavigationItem label="Works" ... />
  <NavigationItem label="Writing" ... />
</div>
```

### Layout Containers

#### Main Page Container
```tsx
<div className="-mx-[max(16px,calc(env(safe-area-inset-left,0px)+16px))] sm:mx-0 w-[calc(100%+max(32px,calc(env(safe-area-inset-left,0px)+env(safe-area-inset-right,0px)+32px)))] sm:w-full">
  <main
    className="h-screen h-[100dvh] max-h-[100dvh] bg-background flex flex-col md:flex-row md:items-center px-0 md:pl-20 relative md:pt-0 transition-all duration-200 overflow-hidden md:overflow-visible md:pr-8 w-full"
    style={{
      paddingTop: 'max(env(safe-area-inset-top, 0), 4rem)',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0), 2rem)'
    }}
  >
    {/* Content */}
  </main>
</div>
```

#### Content Grid Container
```tsx
<div className="flex flex-col items-start flex-1 md:flex-none md:grid md:grid-cols-2 md:gap-16 w-full md:w-auto md:items-baseline md:my-0 px-8 md:px-0 min-h-0 max-h-full overflow-hidden md:overflow-visible">
  {/* Columns */}
</div>
```

#### Column Container
```tsx
{/* Column with absolute positioning support */}
<div className="relative flex flex-col items-start md:items-start md:relative mb-12 md:mb-0 gap-1">
  {/* Content */}
</div>
```

### Interactive Elements

#### Clickable Element Pattern
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  className="cursor-pointer transition-all duration-200"
  aria-label="Action description"
  style={{
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    outline: 'none'
  }}
>
  Content
</div>
```

#### Hover States
```tsx
{/* Simple hover */}
className="hover:text-foreground transition-colors duration-200"

{/* Group hover (parent has group/menu) */}
className="group-hover/menu:text-muted-foreground/70 hover:!text-foreground"

{/* With important override */}
className="md:hover:!text-foreground"
```

#### Active States
```tsx
{/* Mobile tap feedback */}
className="active:scale-[0.98] md:active:scale-100"

{/* Active color change */}
className="active:text-foreground"
```

---

## Animation & Transitions

### Transition Patterns

#### Standard Transitions
```tsx
{/* All properties */}
className="transition-all duration-200"

{/* Colors only */}
className="transition-colors duration-200"

{/* Transform only */}
className="transition-transform duration-200"
```

#### Transition Duration
- **Standard**: `duration-200` (200ms / 0.2s)
- **Fast**: `duration-150` (150ms)
- **Slow**: `duration-300` (300ms)

#### Easing Functions
Default Tailwind easing:
- `ease-in-out`: Default (slow start, fast middle, slow end)
- `ease-out`: Fast start, slow end
- `ease-in`: Slow start, fast end

#### Common Transition Combinations
```tsx
{/* Color transitions */}
className="text-muted-foreground hover:text-foreground transition-colors duration-200"

{/* Transform + color */}
className="active:scale-[0.98] active:text-foreground transition-all duration-200"

{/* Conditional padding transition */}
className={`transition-all duration-200 ${isPanelOpen ? 'md:pr-[50%]' : 'md:pr-8'}`}
```

### Animation Patterns

#### Scale Animations
```tsx
{/* Tap feedback */}
className="active:scale-[0.98]"

{/* Hover scale (if needed) */}
className="hover:scale-105"
```

#### Fade Animations
```tsx
{/* Opacity transitions */}
className="opacity-70 hover:opacity-100 transition-opacity duration-200"
```

#### Conditional Animations
```tsx
{/* Dynamic padding based on state */}
className={`transition-all duration-200 ${isWorksPanelOpen ? 'md:pr-[50%]' : 'md:pr-8'}`}
```

---

## Accessibility Guidelines

### Keyboard Navigation

#### Keyboard Event Handling
```tsx
const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}

<div
  onKeyDown={handleKeyDown}
  tabIndex={0}
  role="button"
>
  Content
</div>
```

**Supported Keys:**
- `Enter`: Primary activation
- `Space`: Secondary activation (prevent default scroll)

### ARIA Labels

#### Proper Labeling
```tsx
{/* Descriptive label */}
<div aria-label="About Raf V.">About</div>

{/* Button with context */}
<button aria-label="Close side panel">×</button>

{/* Navigation item */}
<div aria-label="View Works portfolio">Works</div>
```

### Focus Management

#### Focus Styles
```tsx
{/* Remove default outline, ensure custom focus indicator */}
style={{ outline: 'none' }}

{/* Custom focus ring (if needed) */}
className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

#### Focusable Elements
```tsx
{/* Make div focusable */}
tabIndex={0}

{/* Remove from tab order (use sparingly) */}
tabIndex={-1}
```

### Screen Reader Support

#### Semantic HTML
```tsx
{/* Use semantic elements when possible */}
<button onClick={handleClick}>Action</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
```

#### Role Attributes
```tsx
{/* When div must act as button */}
<div role="button" tabIndex={0}>Click me</div>

{/* Navigation landmark */}
<nav role="navigation" aria-label="Main">...</nav>
```

### Reduced Motion

#### Respecting User Preferences
```tsx
import { useReducedMotion } from "framer-motion"

const shouldReduceMotion = useReducedMotion()

{/* Conditional animation */}
<motion.div
  animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
>
  Content
</motion.div>
```

#### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

#### Text Contrast Requirements

**WCAG Guidelines:**
- **Normal Text** (under 18pt): Requires 4.5:1 contrast ratio (WCAG AA)
- **Large Text** (18pt+ or 14pt+ bold): Requires 3:1 contrast ratio (WCAG AA)
- **Enhanced** (WCAG AAA): 7:1 for normal text, 4.5:1 for large text

**How Our Tokens Meet Requirements:**

**Light Mode:**
- `text-foreground` on `bg-background`: ~15:1 contrast (exceeds AAA)
- `text-muted-foreground` on `bg-background`: ~4.8:1 contrast (meets AA)

**Dark Mode:**
- `text-foreground` on `bg-background`: ~15:1 contrast (exceeds AAA)
- `text-muted-foreground` on `bg-background`: ~7:1 contrast (meets AAA)

**Color Token Usage:**
```tsx
{/* High contrast: Primary text - always readable */}
className="text-foreground bg-background"

{/* Lower contrast: Secondary text - still meets WCAG AA */}
className="text-muted-foreground"

{/* Accent color: Use sparingly, ensure contrast */}
className="text-primary" // Check contrast on your background

{/* Avoid: Low contrast combinations */}
// Don't use muted-foreground on muted backgrounds
// Don't use similar lightness values together
```

**Testing Contrast:**
Use tools like:
- Browser DevTools: Check computed contrast ratio
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome Lighthouse: Accessibility audit includes contrast checks

---

## Complete Hook Implementations

### useSystemTheme Hook

Complete implementation for theme detection (see "Theme System" section for usage):

```tsx
import { useEffect, useState } from "react"

export function useSystemTheme() {
  const [prefersDark, setPrefersDark] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    setPrefersDark(mql.matches)
    setIsReady(true)

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches)
    }

    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return { prefersDark, isReady }
}
```

### useIsMobile Hook

Complete implementation for mobile detection:

```tsx
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(newIsMobile)
      if (!isReady) {
        setIsReady(true)
      }
    }

    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [isReady])

  return isMobile
}
```

## Visual Design Reference

### Typography Scale Visual

```
┌─────────────────────────────────────┐
│ Name (16px, light, wide tracking)   │ ← Primary identifier
│                                     │
│ Subtitle (12px, muted)             │ ← Secondary info
│                                     │
│ Navigation (12px desktop, muted)  │ ← Interactive elements
│ Navigation (14px mobile, muted)     │
│                                     │
│ Body text (16px, relaxed)         │ ← Long-form content
│ with comfortable line height        │
│ for readability                     │
└─────────────────────────────────────┘
```

### Color System Visual

**Light Mode:**
- Background: Very light gray (99% lightness) - almost white
- Foreground: Very dark gray (10% lightness) - almost black
- Muted: Medium gray (35% lightness) - secondary text
- Primary: Indigo/blue (226° hue, 66% lightness) - accents

**Dark Mode:**
- Background: Very dark gray (8% lightness) - almost black
- Foreground: Very light gray (95% lightness) - almost white
- Muted: Light gray (70% lightness) - secondary text
- Primary: Lighter indigo/blue (70% lightness) - accents

### Spacing Rhythm Visual

```
Mobile Layout:
┌─────────────────────────────┐
│ [32px padding]               │
│                             │
│ Content                     │
│                             │
│ [48px gap]                  │
│                             │
│ More Content                │
│                             │
│ [32px padding]              │
└─────────────────────────────┘

Desktop Layout:
┌─────────────────────────────────────────────┐
│ [80px left]  Content  [64px gap]  Content  │
│                                             │
│ [32px right padding]                       │
└─────────────────────────────────────────────┘
```

---

## Quick Copy-Paste Checklist

When building a new page, ensure you include:

### Essential Setup
- [ ] Theme detection and application (`useSystemTheme` hook)
- [ ] Theme applied to `document.documentElement` via `data-theme` attribute
- [ ] Edge-to-edge background container with mobile gutter handling (if needed)
- [ ] Safe area padding on main element (for fixed viewport pages)

### Layout
- [ ] Viewport height constraints (`h-screen h-[100dvh] max-h-[100dvh]` for fixed pages)
- [ ] Overflow strategy (`overflow-hidden md:overflow-visible` for fixed pages)
- [ ] Responsive spacing (`px-8 md:pl-20` or appropriate for your layout)
- [ ] Mobile-first responsive classes (base = mobile, `md:` = desktop)

### Typography & Colors
- [ ] Typography tokens (`text-foreground`, `text-muted-foreground`)
- [ ] Appropriate font sizes (`text-base`, `text-xs`, `text-sm`)
- [ ] Line heights (`leading-[1.5]` for UI, `leading-relaxed` for content)
- [ ] Color transitions (`transition-colors duration-200`)

### Interactivity
- [ ] Keyboard navigation for interactive elements (Enter/Space keys)
- [ ] Hover states for desktop (`md:hover:...`)
- [ ] Active/tap states for mobile (`active:...`)
- [ ] Proper tap targets on mobile (minimum 48px height)

### Accessibility
- [ ] ARIA labels for interactive elements
- [ ] Semantic HTML (`role="button"` for divs acting as buttons)
- [ ] Focus management (visible focus indicators)
- [ ] Reduced motion support (if using animations)

### Testing
- [ ] Test on mobile device (safe areas, touch targets)
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test theme switching (system preference changes)
- [ ] Test contrast ratios (WCAG AA minimum)
- [ ] Test with screen reader (basic navigation)

---

**Last Updated**: Based on `app/page.tsx` and design system files as of current implementation.

