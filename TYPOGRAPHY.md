# Typography System

This document defines the complete typography system for raf.works, based on a **Golden Ratio scale** (φ ≈ 1.618) with a 14px anchor point.

## Table of Contents

1. [Overview](#overview)
2. [Typography Scale](#typography-scale)
3. [Font Families](#font-families)
4. [Semantic Typography Classes](#semantic-typography-classes)
5. [Heading Hierarchies](#heading-hierarchies)
6. [Line Heights](#line-heights)
7. [Letter Spacing](#letter-spacing)
8. [Usage Guidelines](#usage-guidelines)
9. [Implementation Details](#implementation-details)

---

## Overview

### Design Philosophy

The typography system follows these principles:

- **Golden Ratio Progression**: Harmonious size relationships using φ ≈ 1.618
- **14px Anchor**: Base body text size for optimal readability
- **Three Font Families**: Ronzino (body), Edu Marist (accent), CoFo Sans Mono (code)
- **Semantic Classes**: Meaningful class names that describe purpose, not appearance
- **Three Hierarchies**: Different heading scales for different contexts (primary, compact, minimal)
- **Consistent Spacing**: Unified line height and letter spacing system

### Single Source of Truth

**Tailwind Config** ([`tailwind.config.js`](tailwind.config.js))
- Overrides Tailwind's default fontSize scale
- All `text-*` utilities use Golden Ratio values
- Ensures consistency across entire codebase

**CSS Variables** ([`app/globals.css`](app/globals.css) lines 54-71)
- Fallback for direct CSS usage
- Defines `--text-2xs` through `--text-2xl`
- Maps 1:1 with Tailwind fontSize scale

---

## Typography Scale

### Golden Ratio Progression

Starting from 14px (body text anchor), sizes progress using φ ≈ 1.618:

| Size | Pixels | Tailwind Class | CSS Variable | Use Case |
|------|--------|----------------|--------------|----------|
| 2xs  | 10px   | `text-2xs`     | `--text-2xs` | Labels, timestamps, uppercase section headers |
| xs   | 12px   | `text-xs`      | `--text-xs`  | Metadata (year, role, contract type), captions |
| sm   | 14px   | `text-sm`      | `--text-sm`  | Body text, descriptions, navigation |
| base | 16px   | `text-base`    | `--text-base`| Modal content, emphasized body text |
| lg   | 20px   | `text-lg`      | `--text-lg`  | Subheadings |
| xl   | 22px   | `text-xl`      | `--text-xl`  | Page titles, main headings, "Raf" name |
| 2xl  | 26px   | `text-2xl`     | `--text-2xl` | Hero name (desktop), large display text |

### Visual Scale Reference

```
2xl  ██████████████████████  26px  (φ³ from 10px)
xl   ████████████████████    22px  (φ² from 10px)
lg   ██████████████          20px  (φ² from 12px)
base ████████████            16px  (φ from 10px)
sm   ██████████              14px  (anchor point)
xs   ████████                12px  (φ from 10px, inverse)
2xs  ██████                  10px  (base unit)
```

### Why These Specific Sizes?

- **10px → 12px**: ~1.2× ratio (slightly compressed for small text legibility)
- **12px → 14px**: ~1.167× ratio (comfortable jump for body text)
- **14px → 16px**: ~1.143× ratio (emphasis without overwhelming)
- **16px → 20px**: 1.25× ratio (clear hierarchy step)
- **20px → 22px**: 1.1× ratio (refined large text)
- **22px → 26px**: ~1.18× ratio (display sizes)

While not strict φ ratios at every step, the overall progression creates visual harmony inspired by the Golden Ratio.

---

## Font Families

### Three-Tier System

#### 1. **Ronzino** (Primary Body)
- **Variable**: `--font-ronzino`
- **Tailwind**: `font-sans`, `font-serif`
- **File**: `public/fonts/Ronzino-Regular.otf`
- **Usage**: Default body text, navigation, general UI
- **Characteristics**: Clean, modern, geometric, neutral

```tsx
// Applied automatically (body default)
<p className="text-sm">Body text uses Ronzino by default</p>
```

#### 2. **Edu Marist** (Accent/Headings)
- **Variable**: `--font-edu-marist`
- **Tailwind**: `font-edu-marist`
- **File**: `public/fonts/EduMarist-Regular.woff2`
- **Usage**: Headings, emphasis, special names (e.g., "Raf")
- **Characteristics**: Refined, elegant, slightly condensed
- **Letter Spacing**: `-0.02em` (tight for cohesive word shapes)

```tsx
// Use for headings and emphasis
<h1 className="font-edu-marist text-xl">Heading with Edu Marist</h1>
<span className="font-edu-marist text-xl">Raf</span>
```

#### 3. **CoFo Sans Mono** (Code)
- **Variable**: `--font-mono`
- **Tailwind**: `font-mono`
- **File**: `public/fonts/CoFoSansMono-Regular.ttf`
- **Usage**: Code blocks, inline code, technical content
- **Characteristics**: Monospaced, clean, readable

```tsx
// Use for code
<code className="font-mono text-xs">console.log('Hello')</code>
```

### Font Loading

Fonts are loaded in [`app/layout.tsx`](app/layout.tsx) using Next.js `localFont`:

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

const cofoSansMono = localFont({
  src: "../public/fonts/CoFoSansMono-Regular.ttf",
  variable: "--font-mono",
  display: "swap",
})
```

**Fallback**: Inter (loaded via Google Fonts) serves as fallback if custom fonts fail to load.

---

## Semantic Typography Classes

Four semantic classes defined in [`app/globals.css`](app/globals.css) lines 11-42:

### `.type-caption`
**Purpose**: Quiet, secondary text  
**Size**: 12px  
**Color**: Muted (`--fg-muted`)  
**Line Height**: 1.4  
**Letter Spacing**: 0.02em  
**Weight**: Light (300)

**Use for**:
- Principles, timestamps, meta information
- Footer links
- Year labels, contract types
- Quiet labels

```tsx
<p className="type-caption">2024 · Contract</p>
```

### `.type-body`
**Purpose**: Default body text for secondary content  
**Size**: 14px  
**Color**: Muted (`--fg-muted`)  
**Line Height**: 1.65

**Use for**:
- Work descriptions
- Secondary content
- Navigation items (desktop)

```tsx
<p className="type-body">This is a work description.</p>
```

### `.type-body-primary`
**Purpose**: Emphasized body text  
**Size**: 14px  
**Color**: Primary (`--fg`)  
**Line Height**: 1.65

**Use for**:
- Hero intro text
- Important descriptions
- Primary call-to-action text
- Emphasized content within body text

```tsx
<p className="type-body-primary">This is emphasized content.</p>
```

**Note**: This class was previously unused. Implement it for emphasized body text to maintain semantic clarity.

### `.type-title`
**Purpose**: Work card titles  
**Size**: 22px (`text-xl`)  
**Font**: Edu Marist  
**Color**: Primary (`--fg`)  
**Line Height**: 1.3

**Use for**:
- Work card titles
- Project names
- Feature headings

```tsx
<h2 className="type-title">Project Name</h2>
```

---

## Heading Hierarchies

### Three Standard Hierarchies

Different contexts require different heading scales. Choose the appropriate hierarchy based on context:

#### 1. **Primary Hierarchy** (Full Articles, Long-form Content)

Use for: Main articles, writing pages, full-width content

| Element | Size | Tailwind | Pixels | Use |
|---------|------|----------|--------|-----|
| h1      | xl   | `text-xl` | 22px  | Main article title |
| h2      | lg   | `text-lg` | 20px  | Section headings |
| h3      | base | `text-base` | 16px | Subsection headings |
| h4      | sm   | `text-sm` | 14px | Minor headings |

**Example** ([`markdownComponents.tsx`](app/components/markdown/markdownComponents.tsx)):

```tsx
h1: "text-xl font-edu-marist leading-tight mb-4"
h2: "text-lg font-edu-marist leading-tight mb-3"
h3: "text-base font-semibold leading-tight mb-2"
```

#### 2. **Compact Hierarchy** (Modal Content, Side Panels)

Use for: Modals, side trays, constrained spaces, blueprint content

| Element | Size | Tailwind | Pixels | Use |
|---------|------|----------|--------|-----|
| h1      | base | `text-base` | 16px | Modal title |
| h2      | sm   | `text-sm` | 14px | Section headings |
| h3      | xs   | `text-xs` | 12px | Subsection headings |

**Example** ([`markdownBaseStyles.tsx`](app/components/markdown/markdownBaseStyles.tsx)):

```tsx
h1: "text-base font-edu-marist leading-tight"
h2: "text-sm font-semibold leading-tight"
h3: "text-xs font-semibold leading-tight"
```

#### 3. **Minimal Hierarchy** (Story Pages, Constrained Spaces)

Use for: Story pages, dense content, minimal layouts

| Element | Size | Tailwind | Pixels | Use |
|---------|------|----------|--------|-----|
| h1      | sm   | `text-sm` | 14px | Story title |
| h2      | xs   | `text-xs` | 12px | Section headings |
| h3      | xs   | `text-xs` | 12px | Subsection headings (same as h2) |

**Example** ([`storyMarkdownComponents.tsx`](app/components/markdown/storyMarkdownComponents.tsx)):

```tsx
h1: "text-sm font-edu-marist leading-tight"
h2: "text-xs font-semibold leading-tight"
h3: "text-xs font-semibold leading-tight"
```

### Choosing the Right Hierarchy

| Context | Hierarchy | Rationale |
|---------|-----------|-----------|
| Full articles, writing pages | Primary | Maximum readability, clear hierarchy |
| Modal content, side panels | Compact | Fits constrained space, maintains hierarchy |
| Story pages, dense layouts | Minimal | Maximizes content, subtle hierarchy |

---

## Line Heights

### Two-Tier System

Defined in [`app/globals.css`](app/globals.css) lines 66-71:

#### **Tight** (`--leading-tight`: 1.25)

**Use for**:
- Headings (h1-h6)
- Compact text blocks
- Navigation items
- Short labels

**Tailwind**: `leading-tight` (predefined)

```tsx
<h1 className="text-xl leading-tight">Tight heading</h1>
```

#### **Normal** (`--leading-normal`: 1.5)

**Use for**:
- All body text
- Descriptions
- UI elements
- Navigation (mobile)

**Tailwind**: `leading-[1.5]` (custom value)

```tsx
<p className="text-sm leading-[1.5]">Body text with normal line height.</p>
```

#### **Relaxed** (1.625)

**Use for**:
- Long-form content
- Paragraphs in articles
- Markdown body text

**Tailwind**: `leading-relaxed`

```tsx
<p className="text-base leading-relaxed">
  Long paragraph content with comfortable reading rhythm.
</p>
```

### Visual Comparison

```
Tight (1.25):    Line one
                 Line two
                 Line three

Normal (1.5):    Line one
                 
                 Line two
                 
                 Line three

Relaxed (1.625): Line one
                  
                  Line two
                  
                  Line three
```

---

## Letter Spacing

### Three Levels

#### **Tight** (`-0.02em`)

**Applied to**: Edu Marist font (headings, accent text)  
**Auto-applied via**: `.font-edu-marist` class  
**Purpose**: Creates cohesive word shapes for elegant headings

```tsx
// Letter spacing applied automatically
<h1 className="font-edu-marist">Raf V.</h1>
```

#### **Body** (`-0.01em`)

**Applied to**: All body text  
**Auto-applied via**: `body` element in [`globals.css`](app/globals.css) line 441  
**Purpose**: Subtle tightening for improved readability

This is set globally and doesn't need to be specified per-element.

#### **Wide** (`0.025em`)

**Applied to**: Special emphasis (e.g., name headings)  
**Tailwind**: `tracking-wide`  
**Purpose**: Creates elegant, spacious feel for primary identifiers

```tsx
<h1 className="text-base tracking-wide">Raf V.</h1>
```

### Visual Comparison

```
Tight (-0.02em):  RafV.
Normal (0):       Raf V.
Wide (0.025em):   R a f  V .
```

---

## Usage Guidelines

### When to Use What

#### Tailwind Utilities vs. Semantic Classes

**Use Tailwind utilities** (`text-xs`, `text-sm`, etc.) when:
- Building one-off components
- Composing custom layouts
- Needing fine-grained control
- Context is obvious from the component

```tsx
<nav className="text-xs text-muted-foreground">Navigation</nav>
```

**Use semantic classes** (`.type-caption`, `.type-body`, etc.) when:
- Styling repeating patterns (work cards, footer links)
- Meaning is more important than appearance
- Consistency across similar elements is critical
- Future design changes should update all instances

```tsx
<a className="type-caption">Footer Link</a>
```

### Common Patterns

#### Navigation Items

```tsx
// Mobile: Larger for touch targets
// Desktop: Smaller for refinement
<nav className="text-sm md:text-xs">Navigation Item</nav>
```

#### Hero/Name Text

```tsx
// Special treatment for primary identifier
<h1 className="text-xl font-edu-marist tracking-wide">Raf V.</h1>
```

#### Work Descriptions

```tsx
// Secondary content, muted color
<p className="type-body">Project description goes here.</p>
```

#### Emphasized Intro Text

```tsx
// Primary color, same size as body
<p className="type-body-primary">Important introductory text.</p>
```

#### Modal Headings

```tsx
// Compact hierarchy for constrained space
<h1 className="text-base font-edu-marist">Modal Title</h1>
<h2 className="text-sm font-semibold">Section Heading</h2>
```

#### Code Snippets

```tsx
// Monospace font for code
<code className="font-mono text-xs bg-code-bg text-code-fg px-1 rounded">
  npm install
</code>
```

### Responsive Typography

#### Mobile-First Approach

Base styles target mobile, use `md:` prefix for desktop:

```tsx
// Larger on mobile for touch, smaller on desktop for refinement
<span className="text-sm md:text-xs">Responsive text</span>
```

#### Common Responsive Patterns

```tsx
// Navigation: touch-friendly mobile, compact desktop
<nav className="text-sm md:text-xs">Menu</nav>

// Headings: dramatic on mobile, refined on desktop
<h1 className="text-xl md:text-2xl">Page Title</h1>

// Body: consistent across breakpoints
<p className="text-sm">Body text stays 14px</p>
```

---

## Implementation Details

### File Structure

**Configuration**:
- [`tailwind.config.js`](tailwind.config.js) - Tailwind fontSize scale override
- [`app/globals.css`](app/globals.css) - CSS variables, semantic classes, font styles
- [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) - TypeScript constants (programmatic access)

**Font Loading**:
- [`app/layout.tsx`](app/layout.tsx) - Next.js font loading with `localFont`

**Usage**:
- [`app/components/markdown/markdownComponents.tsx`](app/components/markdown/markdownComponents.tsx) - Primary hierarchy
- [`app/components/markdown/markdownBaseStyles.tsx`](app/components/markdown/markdownBaseStyles.tsx) - Compact hierarchy
- [`app/components/markdown/storyMarkdownComponents.tsx`](app/components/markdown/storyMarkdownComponents.tsx) - Minimal hierarchy

### Tailwind Configuration

The Golden Ratio scale is enforced in [`tailwind.config.js`](tailwind.config.js):

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        '2xs': '10px',
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '20px',
        'xl': '22px',
        '2xl': '26px',
      },
    },
  },
}
```

This **overrides** Tailwind's defaults, ensuring all `text-*` utilities use the Golden Ratio scale.

### CSS Variables

Fallback CSS variables in [`app/globals.css`](app/globals.css):

```css
:root {
  --text-2xs: 10px;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 22px;
  --text-2xl: 26px;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
}
```

### Semantic Classes

Defined in [`app/globals.css`](app/globals.css) lines 11-42:

```css
@layer components {
  .type-caption {
    font-size: 12px;
    line-height: 1.4;
    letter-spacing: 0.02em;
    color: var(--fg-muted);
    @apply font-light;
  }

  .type-body {
    font-size: 14px;
    line-height: 1.65;
    color: var(--fg-muted);
  }

  .type-body-primary {
    font-size: 14px;
    line-height: 1.65;
    color: var(--fg);
  }

  .type-title {
    font-size: 22px;
    line-height: 1.3;
    color: var(--fg);
    @apply font-normal font-edu-marist;
  }
}
```

### Font-Specific Styles

Edu Marist gets automatic letter spacing adjustment:

```css
.font-edu-marist {
  font-family: var(--font-edu-marist);
  font-weight: normal;
  letter-spacing: -0.02em;
}
```

---

## Migration Guide

### Updating Existing Code

#### Finding Non-Compliant Usage

```bash
# Find inline font usage
rg 'font-\[family-name:var\(--font-'

# Find hardcoded pixel values in className
rg 'text-\[[\d]+px\]'

# Find components not using hierarchies
rg 'text-[^"]*["\s]' app/components/
```

#### Common Replacements

| Old Pattern | New Pattern | Reason |
|-------------|-------------|--------|
| `font-[family-name:var(--font-edu-marist)]` | `font-edu-marist` | Use standard class |
| `text-[11px]` | `text-xs` (12px) | Use Golden Ratio scale |
| `text-[18px]` | `text-xl` (22px) | Use Golden Ratio scale |
| Inconsistent heading sizes | Choose hierarchy | Maintain consistency |

#### Safe Replacement Process

1. **Audit**: Run grep commands to find non-compliant patterns
2. **Categorize**: Group findings by type (fonts, sizes, headings)
3. **Replace**: Update one category at a time
4. **Verify**: Check visual regression in browser
5. **Document**: Note any intentional deviations

### Adding New Components

When creating new components:

1. **Choose Typography Early**: Decide if you need primary, compact, or minimal hierarchy
2. **Use Tailwind Utilities**: Start with `text-*` classes from the Golden Ratio scale
3. **Consider Semantics**: If the pattern repeats, create a semantic class
4. **Document Intent**: Add comments explaining typography choices
5. **Test Responsively**: Verify mobile and desktop appearance

---

## Troubleshooting

### Common Issues

#### Issue: Text appears larger/smaller than expected

**Cause**: Conflicting Tailwind defaults before config update  
**Solution**: Clear Tailwind cache and rebuild:

```bash
rm -rf .next
npm run dev
```

#### Issue: Edu Marist font not loading

**Cause**: Font path incorrect or file missing  
**Solution**: Verify font exists at `public/fonts/EduMarist-Regular.woff2`

#### Issue: Letter spacing not applying

**Cause**: Using `font-edu-marist` class without proper CSS  
**Solution**: Ensure `.font-edu-marist` class is defined in [`globals.css`](app/globals.css)

#### Issue: Heading hierarchy inconsistent

**Cause**: Multiple markdown components using different scales  
**Solution**: Verify which hierarchy (primary/compact/minimal) should be used and update component

### Verification Checklist

After making typography changes:

- [ ] Build succeeds without errors (`npm run build`)
- [ ] No console warnings about font loading
- [ ] Text sizes match Golden Ratio scale (use browser DevTools)
- [ ] Headings maintain semantic hierarchy (h1 > h2 > h3)
- [ ] Responsive breakpoints work correctly (test at 768px)
- [ ] Edu Marist font applies letter spacing automatically
- [ ] All `text-*` utilities use Golden Ratio values

---

## Reference

### Quick Lookup Table

| Need | Use | Example |
|------|-----|---------|
| Tiny label | `text-2xs` (10px) | `<span className="text-2xs">Label</span>` |
| Caption/meta | `text-xs` (12px) or `.type-caption` | `<p className="type-caption">2024</p>` |
| Body text | `text-sm` (14px) or `.type-body` | `<p className="type-body">Description</p>` |
| Emphasized body | `text-base` (16px) or `.type-body-primary` | `<p className="type-body-primary">Intro</p>` |
| Subheading | `text-lg` (20px) | `<h2 className="text-lg">Section</h2>` |
| Main heading | `text-xl` (22px) or `.type-title` | `<h1 className="type-title">Title</h1>` |
| Hero text | `text-2xl` (26px) | `<h1 className="text-2xl">Hero</h1>` |
| Accent font | `font-edu-marist` | `<span className="font-edu-marist">Raf</span>` |
| Code | `font-mono` | `<code className="font-mono">code</code>` |

### Related Documentation

- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) - Complete design system guide
- [`CLAUDE.md`](CLAUDE.md) - Project overview and architecture
- [`app/config/typographyConfig.ts`](app/config/typographyConfig.ts) - TypeScript constants
- [`tailwind.config.js`](tailwind.config.js) - Tailwind configuration
- [`app/globals.css`](app/globals.css) - CSS variables and semantic classes

---

**Last Updated**: January 2026  
**Maintained By**: Raf Vitale  
**Version**: 1.0
