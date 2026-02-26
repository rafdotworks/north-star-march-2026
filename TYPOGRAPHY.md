# Typography System

> **Complete Typography Reference**  
> Golden Ratio scale · Semantic labels · Vertical rhythm · Mobile adaptation

This document is the definitive guide to the typography system used throughout the site. All type sizes, spacing, and responsive behavior are documented here.

---

## Table of Contents

0. [Minimal Identity & Hero](#0-minimal-identity--hero)
1. [Typography Scale](#i-typography-scale)
2. [Semantic Labels](#ii-semantic-labels)
3. [Heading Hierarchies](#iii-heading-hierarchies)
4. [Mobile Adaptation](#iv-mobile-adaptation)
5. [Vertical Rhythm](#v-vertical-rhythm)
6. [Measure & Line Length](#vi-measure--line-length)
7. [Font Families](#vii-font-families)
8. [Implementation Guide](#viii-implementation-guide)
9. [Common Patterns](#ix-common-patterns)

---

## 0. Minimal Identity & Hero

The site identity is **minimal and simple**: typography should feel calm, readable, and restrained—never loud or oversized.

**Rules for the main site hero (homepage identity block):**

- **Max size for main hero:** 22px (`text-xl`). The main identity hero does not use 26px (`text-2xl`).
- **Preferred range:** Use **body** (14px), **secondary** (14px mobile / 12px desktop), and **caption** for supporting text. Optionally use one **title** size (22px) for a single emphasized line.
- **26px (Display):** Reserved for rare emphasis outside the main hero (e.g. work card titles, special layouts). Do not use for the primary hero identity.
- **Single source of truth:** Hero typography uses the same semantic classes as the rest of the site (e.g. `type-body-primary`, `type-body`, `type-caption`) so changes are consistent.

This keeps the hero inspirational through clarity and hierarchy, not through large type.

**Portfolio hero:** The portfolio page hero ([`app/portfolio/portfolio.module.css`](app/portfolio/portfolio.module.css)) uses the same principle: `.heroTitle` is capped at 22px (1.375rem) via a small clamp (20px–22px) so it aligns with the main site minimal identity.

---

## I. Typography Scale

The typography system uses a **Golden Ratio scale** (φ ≈ 1.618) with a **14px anchor point**. This creates harmonious size relationships across all text.

### Scale Reference

| Token | Pixels | Tailwind | Use Cases |
|-------|--------|----------|-----------|
| `2xs` | 10px | `text-2xs` | Labels, timestamps, uppercase section headers |
| `xs` | 12px | `text-xs` | Metadata (year, role), captions, fine print |
| `sm` | 14px | `text-sm` | **Body text, descriptions, navigation (anchor)** |
| `base` | 16px | `text-base` | Modal content, emphasized body text |
| `lg` | 20px | `text-lg` | Subheadings, section titles |
| `xl` | 22px | `text-xl` | Page titles, main headings, "Raf" name |
| `2xl` | 26px | `text-2xl` | Rare emphasis, large display; **not for main hero identity** |

### Why Golden Ratio?

The Golden Ratio creates natural, pleasing proportions:
- Each size is ~1.6× the previous size
- Creates clear visual hierarchy
- Feels organic and balanced
- 14px anchor point is optimal for body text

### Implementation

**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `TYPOGRAPHY_SCALE`  
**Tailwind**: [`tailwind.config.js`](tailwind.config.js) → `theme.extend.fontSize`  
**CSS Variables**: [`app/globals.css`](app/globals.css) → `--text-*` (lines 54-64)

---

## II. Semantic Labels

Choose typography by **meaning**, not by size number. Semantic labels map intent to responsive size classes.

### Semantic Type System

| Semantic Label | Mobile | Desktop | Line Height | Use Cases |
|----------------|--------|---------|-------------|-----------|
| **Display** | 22px (`text-xl`) | 26px (`text-2xl`) | `leading-tight` (1.25) | Hero text, page hero names, largest emphasis |
| **Page Title** | 22px (`text-xl`) | 22px (`text-xl`) | `leading-tight` (1.25) | Main page titles, work card titles |
| **Heading** | 16px (`text-base`) | 20px (`text-lg`) | `leading-tight` (1.25) | Section headings, subsections |
| **Subheading** | 14px (`text-sm`) | 16px (`text-base`) | `leading-tight` (1.25) | Subsection headings, card titles |
| **Body** | 14px (`text-sm`) | 14px (`text-sm`) | `leading-[1.5]` (1.5) | Main content, descriptions |
| **Body Large** | 16px (`text-base`) | 16px (`text-base`) | `leading-relaxed` (1.625) | Emphasized paragraphs, intro text |
| **Secondary** | 14px (`text-sm`) | 12px (`text-xs`) | `leading-[1.5]` (1.5) | Navigation, metadata, labels |
| **Caption** | 12px (`text-xs`) | 10px (`text-2xs`) | `leading-[1.4]` (1.4) | Timestamps, fine print, subtle metadata |

### Usage Examples

```tsx
// ❌ BAD: Choosing by size number (unclear intent)
<h1 className="text-xl">Title</h1>
<p className="text-sm">Body text</p>

// ✅ GOOD: Using semantic labels (clear intent)
import { SEMANTIC_TYPOGRAPHY } from '@/app/config/typographyConfig'

<h1 className={`${SEMANTIC_TYPOGRAPHY.pageTitle.mobile} md:${SEMANTIC_TYPOGRAPHY.pageTitle.desktop}`}>
  Title
</h1>
<p className={SEMANTIC_TYPOGRAPHY.body.mobile}>
  Body text
</p>
```

### Why Semantic Labels?

- **Clarity**: Intent is obvious from the name
- **Consistency**: Same semantic meaning = same size across site
- **Maintainability**: Change semantics, not individual instances
- **Mobile-first**: Automatically includes responsive sizing

### Implementation

**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `SEMANTIC_TYPOGRAPHY`

---

## III. Heading Hierarchies

Three standard heading hierarchies for different contexts:

### 1. Primary Hierarchy (Full Articles)

**Use for**: Full articles, writing pages, long-form content  
**Priority**: Maximum readability

```tsx
h1: text-xl (22px)   // Main article title
h2: text-lg (20px)   // Section headings
h3: text-base (16px) // Subsection headings
h4: text-sm (14px)   // Minor headings
```

**Used in**: [`app/components/markdown/markdownComponents.tsx`](app/components/markdown/markdownComponents.tsx)

### 2. Compact Hierarchy (Modals, Panels)

**Use for**: Modal content, side panels, constrained spaces  
**Priority**: Space efficiency

```tsx
h1: text-base (16px) // Modal title
h2: text-sm (14px)   // Section headings
h3: text-xs (12px)   // Subsection headings
```

**Used in**: [`app/components/markdown/markdownBaseStyles.tsx`](app/components/markdown/markdownBaseStyles.tsx), About modal, Blueprint content

### 3. Minimal Hierarchy (Stories, Dense Layouts)

**Use for**: Story pages, dense content, minimal layouts  
**Priority**: Subtle hierarchy

```tsx
h1: text-sm (14px) // Story title
h2: text-xs (12px) // Section headings
h3: text-xs (12px) // Subsection headings (same as h2)
```

**Used in**: Story markdown components

### Choosing a Hierarchy

| Context | Hierarchy | Reason |
|---------|-----------|--------|
| Blog post / Article | Primary | Maximum readability for long-form content |
| Modal / Side panel | Compact | Limited space, need to fit more content |
| Story / Dense UI | Minimal | Subtle hierarchy, focus on content not structure |

### Implementation

**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `HEADING_HIERARCHIES`

---

## IV. Mobile Adaptation

### Responsive Strategy

**Core principle**: Most text stays the same size. Only hero/display text and interactive elements adjust.

| Category | Strategy | Reason |
|----------|----------|--------|
| Display text | **Scale DOWN** on mobile (-4px) | Prevent overwhelming small screens |
| Navigation | **Scale UP** on mobile (+2px) | Larger tap targets (48px minimum) |
| Body text | **Stay SAME** (14px) | 14px is optimal for reading on all devices |
| Titles | **Stay SAME** (22px) | Maintain visual hierarchy |
| Captions | **Mobile larger** (12px), desktop smaller (10px) | Legibility on small screens |

### Specific Adjustments

#### Hero Name (Display)
```tsx
// Desktop: 26px, Mobile: 22px
className="text-xl md:text-2xl"
```
**Reason**: Large text can overwhelm mobile screens. Scaling down maintains impact without dominating viewport.

#### Navigation (Secondary)
```tsx
// Desktop: 12px, Mobile: 14px
className="text-sm md:text-xs"
```
**Reason**: Larger tap targets on mobile (48px height minimum per Apple/Material Design guidelines).

#### Body Text (Stays Same)
```tsx
// Both: 14px
className="text-sm"
```
**Reason**: 14px is the optimal reading size for both mobile and desktop. The Golden Ratio anchor point.

#### Work Card Titles (Stays Same)
```tsx
// Both: 22px
className="text-xl"
```
**Reason**: Visual hierarchy must be maintained across devices. Titles need presence on all screens.

### Spacing Adjustments

```tsx
// Section gaps: Smaller on mobile
className="mb-12 md:mb-16"  // 48px mobile, 64px desktop

// Column gaps: Stack mobile, grid desktop
className="mb-12 md:gap-16" // 48px vertical mobile, 64px horizontal desktop

// Content padding: Mobile has safe area handling
className="px-8 md:px-0"    // 32px mobile, grid handles desktop
```

### Tap Target Requirements (Mobile)

- **Minimum**: 48px height (Apple & Material Design guideline)
- **Implementation**: Add padding to text elements
  ```tsx
  // Example: Navigation item
  className="py-2 text-sm" // 16px padding + 14px text + ~21px line-height = ~51px ✓
  ```

### Breakpoint

**Mobile**: `< 768px`  
**Desktop**: `≥ 768px`

Defined in [`hooks/use-mobile.tsx`](hooks/use-mobile.tsx) and [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts)

### Implementation

**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `MOBILE_ADAPTATION`

---

## V. Vertical Rhythm

### System Overview

**Base unit**: 4px (Tailwind's spacing unit)  
**Line height reference**: 1.5 (24px for 16px text)  
**Core principle**: All vertical spacing uses multiples of 4px

### Spacing Rules

#### 1. Paragraph Spacing (24px)

Space between body paragraphs = **1.5× line-height**

```tsx
// Gap between paragraphs
className="space-y-6"  // 24px

// After paragraph block
className="mb-6"       // 24px
```

**Why 24px?** With 1.5 line-height, this creates comfortable visual separation without breaking flow.

#### 2. Heading to Content (Below Headings)

Space after heading before content starts:

```tsx
h1: mb-6  // 24px - generous space
h2: mb-4  // 16px - moderate space
h3: mb-3  // 12px - tight space
h4: mb-2  // 8px - minimal space
```

**Progressive scale**: Larger headings get more space.

#### 3. Content to Heading (Above Headings)

Space before heading after previous content (larger than below):

```tsx
h1: mt-12 // 48px - major section break
h2: mt-8  // 32px - section break
h3: mt-6  // 24px - subsection break
h4: mt-4  // 16px - minor break
```

**Why larger?** Creates clear visual section breaks. Signals new topic.

#### 4. Section Spacing (32px)

Large breaks between major sections:

```tsx
className="space-y-8"  // 32px between sections (2× line-height)
className="mb-12"      // 48px after major section
```

#### 5. List Spacing (16px)

```tsx
// Between list items
className="space-y-4"  // 16px

// After list
className="mb-4"       // 16px

// List marker indent
className="pl-5"       // 20px (for list-outside)
```

#### 6. Blockquote Spacing (24px)

```tsx
className="my-6"  // 24px vertical margin
className="pl-4"  // 16px left padding
```

### Rhythm Utility Classes

Ready-to-use classes in [`app/globals.css`](app/globals.css):

```css
.rhythm-paragraph { space-y-6 }  /* 24px paragraph spacing */
.rhythm-section { space-y-8 }    /* 32px section spacing */
.rhythm-list { space-y-4 }       /* 16px list spacing */

.rhythm-heading h1 { mb-6 mt-12 } /* Heading rhythm */
.rhythm-heading h2 { mb-4 mt-8 }
.rhythm-heading h3 { mb-3 mt-6 }
.rhythm-heading h4 { mb-2 mt-4 }
```

### Usage Example

```tsx
<article className="rhythm-paragraph rhythm-heading">
  <h1>Article Title</h1>
  <p>Introduction paragraph.</p>
  <p>Second paragraph with automatic 24px spacing.</p>
  
  <h2>Section Heading</h2>
  <p>Content paragraph with proper heading spacing.</p>
</article>
```

### Visual Rhythm Chart

```
┌─────────────────────────┐
│ h1 (Heading)            │
│                         │ ← 24px (mb-6)
│ Paragraph 1             │
│                         │ ← 24px (space-y-6)
│ Paragraph 2             │
│                         │ ← 48px (mt-12)
│ h2 (Next Section)       │
│                         │ ← 16px (mb-4)
│ Content...              │
└─────────────────────────┘
```

### Implementation

**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `VERTICAL_RHYTHM`  
**CSS Utilities**: [`app/globals.css`](app/globals.css) → `.rhythm-*` classes

---

## VI. Measure & Line Length

### Optimal Line Length

**Research finding**: 45-75 characters per line is optimal for reading comprehension.  
**Sweet spot**: 65 characters per line

### Three Measure Constraints

#### 1. Optimal Measure (65ch)

**Best for**: Body text, articles, main content

```tsx
className="max-w-prose"  // 65ch (~680px at 14px)
```

- **Character range**: 60-70 characters
- **Why**: Eye tracking research shows this is optimal for reading speed and comprehension
- **Use**: Most body content, blog posts, documentation

#### 2. Narrow Measure (45ch)

**Best for**: Modals, side panels, constrained spaces

```tsx
className="max-w-prose-narrow"  // 45ch (~470px at 14px)
```

- **Character range**: 40-50 characters
- **Why**: Shorter lines work better in narrow containers
- **Use**: Modal content, side trays, mobile-first panels

#### 3. Wide Measure (80ch)

**Best for**: Technical content, code examples

```tsx
className="max-w-prose-wide"  // 80ch (~840px at 14px)
```

- **Character range**: 75-85 characters
- **Why**: Longer lines acceptable for reference/scanning material
- **Use**: Code documentation, technical specs, tables

### Prose Container Classes

Ready-to-use classes in [`app/globals.css`](app/globals.css):

```css
/* Just the measure constraint */
.prose-container { max-width: 65ch; margin: 0 auto; }
.prose-narrow { max-width: 45ch; }
.prose-wide { max-width: 80ch; }

/* Measure + vertical rhythm combined */
.prose-article { max-width: 65ch; margin: 0 auto; space-y-6; }
.prose-article-narrow { max-width: 45ch; space-y-6; }
.prose-article-wide { max-width: 80ch; space-y-6; }
```

### Usage Examples

```tsx
// Standard article with optimal measure
<article className="prose-article mx-auto px-8">
  <h1>Article Title</h1>
  <p>Content with optimal 65ch line length...</p>
</article>

// Side panel with narrow measure
<aside className="prose-article-narrow p-6">
  <h2>Related Content</h2>
  <p>Shorter lines work better here...</p>
</aside>

// Technical documentation with wide measure
<section className="prose-article-wide">
  <h2>API Reference</h2>
  <pre>Long code examples fit better...</pre>
</section>
```

### Pixel-Based Alternatives

For specific layout requirements:

```tsx
className="max-w-reading"  // 680px (matches 65ch at 14px)
className="max-w-article"  // 720px (slightly wider for mixed content)
```

### Why Character-Based (`ch`) is Better

- **Responsive**: Scales with font size automatically
- **Semantic**: 65 characters is the goal, not 680 pixels
- **Accessible**: Works with user font size preferences

### Implementation

**Tailwind Config**: [`tailwind.config.js`](tailwind.config.js) → `theme.extend.maxWidth`  
**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `MEASURE_GUIDELINES`  
**CSS Utilities**: [`app/globals.css`](app/globals.css) → `.prose-*` classes

---

## VII. Font Families

### Three-Tier Font System

#### 1. Body Font (Ronzino Regular)

**Variable**: `--font-ronzino`  
**Class**: `font-sans` (default)  
**Use**: All body text, navigation, UI elements

```tsx
// Applied automatically - no class needed
<p>Default body text uses Ronzino</p>

// Explicit usage
<span className="font-sans">Body font</span>
```

**Characteristics**: Clean, modern, slightly geometric. Excellent for long-form reading.

#### 2. Accent Font (Edu Marist Regular)

**Variable**: `--font-edu-marist`  
**Class**: `font-edu-marist`  
**Use**: Headings, emphasis, special names (e.g., "Raf")

```tsx
<h1 className="font-edu-marist text-xl">Heading</h1>
<span className="font-edu-marist text-xl">Raf</span>
```

**Characteristics**: Refined, elegant, slightly condensed. Creates clear hierarchy.  
**Auto-applied**: Letter-spacing `-0.02em` (tighter tracking for headings)

#### 3. Monospace Font (CoFo Sans Mono Regular)

**Variable**: `--font-mono`  
**Class**: `font-mono`  
**Use**: Code blocks, inline code, technical content

```tsx
<code className="font-mono text-xs">console.log('hello')</code>
<pre className="font-mono text-sm">function example() { }</pre>
```

**Characteristics**: Fixed-width, technical, legible for code.

### Font Loading

Fonts are loaded via Next.js `localFont` in [`app/layout.tsx`](app/layout.tsx):

```tsx
import localFont from "next/font/local"

const ronzino = localFont({
  src: "../public/fonts/Ronzino-Regular.otf",
  variable: "--font-ronzino",
  display: "swap",
})

const eduMarist = localFont({
  src: "../public/fonts/EduMarist-Regular.woff2",
  variable: "--font-edu-marist",
  display: "swap",
})
```

### Letter Spacing

Each font has specific letter-spacing applied:

- **Edu Marist** (headings): `-0.02em` (auto-applied with `.font-edu-marist`)
- **Ronzino** (body): `-0.01em` (auto-applied globally to `body`)
- **Special emphasis**: `tracking-wide` (`0.025em`) for names like "Raf V."

### Font Files Location

**Directory**: [`public/fonts/`](public/fonts/)

- `Ronzino-Regular.otf`
- `EduMarist-Regular.woff2`
- `CoFoSansMono-Regular.ttf`
- `licenses/` - Font license files

### Implementation

**TypeScript**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) → `FONT_FAMILIES`  
**Font Loading**: [`app/layout.tsx`](app/layout.tsx)  
**CSS**: [`app/globals.css`](app/globals.css) → `.font-edu-marist` (lines 44-49)

---

## VIII. Implementation Guide

### Getting Started

#### 1. Import the Config

```tsx
import {
  SEMANTIC_TYPOGRAPHY,
  VERTICAL_RHYTHM,
  MEASURE_GUIDELINES,
  HEADING_HIERARCHIES,
} from '@/app/config/typographyConfig'
```

#### 2. Choose Typography by Meaning

```tsx
// ❌ BAD: Using raw size classes
<h1 className="text-xl">Title</h1>
<p className="text-sm">Body</p>

// ✅ GOOD: Using semantic labels
<h1 className={`${SEMANTIC_TYPOGRAPHY.pageTitle.mobile} md:${SEMANTIC_TYPOGRAPHY.pageTitle.desktop}`}>
  Title
</h1>
<p className={SEMANTIC_TYPOGRAPHY.body.mobile}>
  Body text
</p>
```

#### 3. Apply Vertical Rhythm

```tsx
// Option A: Use rhythm utility classes
<article className="rhythm-paragraph rhythm-heading">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</article>

// Option B: Use rhythm constants
<div className={VERTICAL_RHYTHM.paragraph.gap}>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</div>
```

#### 4. Add Measure Constraints

```tsx
// For optimal readability
<article className="prose-article mx-auto px-8">
  <h1>Article Title</h1>
  <p>Content with 65ch line length...</p>
</article>

// For narrow spaces
<aside className="prose-article-narrow p-6">
  <p>Shorter lines...</p>
</aside>
```

### Complete Example Component

```tsx
import { SEMANTIC_TYPOGRAPHY, VERTICAL_RHYTHM } from '@/app/config/typographyConfig'

export function ArticlePage({ title, content }: Props) {
  return (
    <article className="prose-article mx-auto px-8 py-12">
      {/* Page title with semantic sizing */}
      <h1 className={`
        ${SEMANTIC_TYPOGRAPHY.pageTitle.mobile}
        md:${SEMANTIC_TYPOGRAPHY.pageTitle.desktop}
        font-edu-marist
        ${VERTICAL_RHYTHM.contentToHeading.h1}
        ${VERTICAL_RHYTHM.headingToContent.h1}
      `}>
        {title}
      </h1>
      
      {/* Body content with vertical rhythm */}
      <div className="rhythm-paragraph rhythm-heading">
        {content}
      </div>
    </article>
  )
}
```

### Best Practices

1. **Use semantic labels** over raw size classes
2. **Apply rhythm utilities** to containers for consistent spacing
3. **Add measure constraints** to all long-form content
4. **Test mobile** - verify tap targets are 48px minimum
5. **Check line length** - aim for 60-70 characters per line
6. **Maintain hierarchy** - headings should have clear size progression

### Common Mistakes to Avoid

```tsx
// ❌ DON'T: Mix semantics and raw sizes
className="text-xl"  // What does this mean? Display? Title? Heading?

// ✅ DO: Use semantic labels
className={SEMANTIC_TYPOGRAPHY.pageTitle.mobile}

// ❌ DON'T: Arbitrary spacing
className="mb-7 mt-9"  // Not on the 4px grid

// ✅ DO: Use rhythm system
className={`${VERTICAL_RHYTHM.contentToHeading.h2} ${VERTICAL_RHYTHM.headingToContent.h2}`}

// ❌ DON'T: Forget measure constraints
<article>
  <p>Very long line that goes on forever making it hard to read...</p>
</article>

// ✅ DO: Add measure
<article className="prose-article">
  <p>Optimal 65ch line length for comfortable reading...</p>
</article>
```

---

## IX. Common Patterns

### Pattern 1: Standard Article

```tsx
<article className="prose-article mx-auto px-8 md:px-0 py-12 md:py-20">
  {/* Title with semantic sizing */}
  <h1 className="text-xl font-edu-marist mb-6 mt-0">
    Article Title
  </h1>
  
  {/* Body with rhythm */}
  <div className="rhythm-paragraph">
    <p className="text-sm leading-[1.5] text-muted-foreground">
      Introduction paragraph with optimal line length.
    </p>
    <p className="text-sm leading-[1.5] text-muted-foreground">
      Second paragraph with automatic 24px spacing.
    </p>
  </div>
</article>
```

### Pattern 2: Modal Content (Narrow Measure)

```tsx
<div className="prose-article-narrow p-6">
  <h1 className="text-base font-edu-marist mb-4">
    Modal Title
  </h1>
  <div className="rhythm-paragraph">
    <p className="text-xs text-muted-foreground">
      Modal content with narrow measure for constrained space.
    </p>
  </div>
</div>
```

### Pattern 3: Hero Section with Display Typography

```tsx
<section className="px-8 py-20">
  {/* Display typography - responsive sizing */}
  <h1 className="text-xl md:text-2xl font-edu-marist leading-tight mb-6">
    Hero Name
  </h1>
  
  {/* Body large for emphasis */}
  <p className="text-base leading-relaxed text-foreground max-w-prose">
    Emphasized introduction text with comfortable line height.
  </p>
</section>
```

### Pattern 4: Work Card with Semantic Classes

```tsx
<article className="group">
  {/* Title using semantic class */}
  <h2 className="type-title mb-2">
    Project Name
  </h2>
  
  {/* Description using semantic class */}
  <p className="type-body mb-2">
    Brief project description.
  </p>
  
  {/* Metadata using semantic class */}
  <span className="type-caption">
    2024 · Contract
  </span>
</article>
```

### Pattern 5: Navigation with Mobile Tap Targets

```tsx
<nav className="flex flex-col gap-1">
  {/* Larger on mobile (14px) for tap targets, smaller on desktop (12px) */}
  <a
    href="/about"
    className="text-sm md:text-xs text-muted-foreground py-2 md:py-0 -mx-2 md:mx-0 px-2 md:px-0"
  >
    About
  </a>
  <a
    href="/work"
    className="text-sm md:text-xs text-muted-foreground py-2 md:py-0 -mx-2 md:mx-0 px-2 md:px-0"
  >
    Work
  </a>
</nav>
```

### Pattern 6: List with Proper Rhythm

```tsx
<ul className="rhythm-list list-disc list-outside ml-5">
  <li className="text-sm text-muted-foreground pl-2">
    List item with 16px spacing
  </li>
  <li className="text-sm text-muted-foreground pl-2">
    Second item
  </li>
  <li className="text-sm text-muted-foreground pl-2">
    Third item
  </li>
</ul>
```

### Pattern 7: Section with Heading Rhythm

```tsx
<section className="rhythm-heading max-w-prose mx-auto">
  <h1>Main Section</h1>
  {/* Automatic mt-12 mb-6 from rhythm-heading */}
  
  <p>Content paragraph.</p>
  
  <h2>Subsection</h2>
  {/* Automatic mt-8 mb-4 from rhythm-heading */}
  
  <p>More content.</p>
</section>
```

---

## Quick Reference Tables

### Size → Use Case Lookup

| Need | Size | Tailwind Class |
|------|------|----------------|
| Tiny label/timestamp | 10px | `text-2xs` |
| Caption/metadata | 12px | `text-xs` |
| Body text | 14px | `text-sm` |
| Emphasized body | 16px | `text-base` |
| Subheading | 20px | `text-lg` |
| Main heading | 22px | `text-xl` |
| Hero text | 26px | `text-2xl` |

### Semantic → Size Lookup

| Semantic | Mobile | Desktop |
|----------|--------|---------|
| Display | 22px (`text-xl`) | 26px (`text-2xl`) |
| Page Title | 22px (`text-xl`) | 22px (`text-xl`) |
| Heading | 16px (`text-base`) | 20px (`text-lg`) |
| Subheading | 14px (`text-sm`) | 16px (`text-base`) |
| Body | 14px (`text-sm`) | 14px (`text-sm`) |
| Body Large | 16px (`text-base`) | 16px (`text-base`) |
| Secondary | 14px (`text-sm`) | 12px (`text-xs`) |
| Caption | 12px (`text-xs`) | 10px (`text-2xs`) |

### Spacing Quick Reference

| Spacing | Tailwind | Pixels | Use |
|---------|----------|--------|-----|
| Paragraph gap | `space-y-6` | 24px | Between paragraphs |
| Section gap | `space-y-8` | 32px | Between sections |
| List gap | `space-y-4` | 16px | Between list items |
| H1 below | `mb-6` | 24px | After h1 |
| H1 above | `mt-12` | 48px | Before h1 |
| H2 below | `mb-4` | 16px | After h2 |
| H2 above | `mt-8` | 32px | Before h2 |

### Measure Quick Reference

| Measure | Value | Tailwind | Use |
|---------|-------|----------|-----|
| Narrow | 45ch | `max-w-prose-narrow` | Modals, panels |
| Optimal | 65ch | `max-w-prose` | Body text, articles |
| Wide | 80ch | `max-w-prose-wide` | Technical content |

---

## File References

- **TypeScript Config**: [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts)
- **Tailwind Config**: [`tailwind.config.js`](tailwind.config.js)
- **CSS Variables & Utilities**: [`app/globals.css`](app/globals.css)
- **Design System**: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)
- **Font Files**: [`public/fonts/`](public/fonts/)

---

**Last Updated**: January 2026  
**Version**: 2.0 (Enhanced with semantic labels, vertical rhythm, measure system)
