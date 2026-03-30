# Theme Token Sheet

Global theme tokens live in [`app/globals.css`](/Users/raf/Documents/2-areas/dev/raf.works/app/globals.css#L153), Tailwind aliases in [`tailwind.config.js`](/Users/raf/Documents/2-areas/dev/raf.works/tailwind.config.js#L41), and font loading in [`app/layout.tsx`](/Users/raf/Documents/2-areas/dev/raf.works/app/layout.tsx#L40).

The system has two endpoints:

- Light theme
- Dark theme

At runtime, many colors interpolate between those endpoints via `--theme-blend` and `--theme-blend-num`, but the tables below show the resolved endpoint values from the explicit `[data-theme="light"]` and `[data-theme="dark"]` blocks in [`app/globals.css`](/Users/raf/Documents/2-areas/dev/raf.works/app/globals.css#L382).

## Palette Anchors

- Background anchor: `#2C4A6E` (Amalfi Dusk)
- Foreground ramp: warm cream (`#FAF6F0` → `#A89E90`)
- Accent hue: warm gold `#E8D5B8`
- Light primary: `#E8D5B8`
- Dark primary: `#D6CFC4`
- Viewport theme-color: light `#2C4A6E`, dark `#141E2E`

## Light Theme

| Token | Swatch | Hex | HSL / Value | Usage |
|---|---|---|---|---|
| `--bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#2C4A6E;border-radius:3px;"></span> | `#2C4A6E` | `hsl(213 43% 30%)` | page background |
| `--bg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#264060;border-radius:3px;"></span> | `#264060` | `hsl(213 43% 26%)` | muted surfaces |
| `--bg-subtle` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#335680;border-radius:3px;"></span> | `#335680` | `hsl(213 43% 35%)` | subtle fills |
| `--fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #D6CFC4;background:#FAF6F0;border-radius:3px;"></span> | `#FAF6F0` | `hsl(36 56% 96%)` | primary text |
| `--fg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A89E90;background:#D6CFC4;border-radius:3px;"></span> | `#D6CFC4` | `hsl(37 22% 80%)` | secondary text |
| `--fg-inverse` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#2C4A6E;border-radius:3px;"></span> | `#2C4A6E` | `hsl(213 43% 30%)` | inverse-on-light text |
| `--border-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #4A6F96;background:#3D5E84;border-radius:3px;"></span> | `#3D5E84` | `hsl(213 37% 38%)` | default borders |
| `--border-strong` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #6E92B5;background:#4A6F96;border-radius:3px;"></span> | `#4A6F96` | `hsl(213 34% 44%)` | emphasized borders |
| `--input-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#264060;border-radius:3px;"></span> | `#264060` | `hsl(213 43% 26%)` | inputs, fields |
| `--primary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C4AD8E;background:#E8D5B8;border-radius:3px;"></span> | `#E8D5B8` | `hsl(33 52% 82%)` | main brand/accent |
| `--primary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#1A2E46;border-radius:3px;"></span> | `#1A2E46` | `hsl(213 45% 19%)` | text on primary |
| `--secondary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#335680;border-radius:3px;"></span> | `#335680` | `hsl(213 43% 35%)` | secondary surfaces |
| `--secondary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #D6CFC4;background:#E8E0D4;border-radius:3px;"></span> | `#E8E0D4` | `hsl(36 30% 87%)` | text on secondary |
| `--accent-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#1F3755;border-radius:3px;"></span> | `#1F3755` | `hsl(213 47% 23%)` | soft accent fills |
| `--accent-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #D6CFC4;background:#E8D5B8;border-radius:3px;"></span> | `#E8D5B8` | `hsl(33 52% 82%)` | text on accent |
| `--destructive-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A01D1D;background:#E25050;border-radius:3px;"></span> | `#E25050` | `hsl(0 72% 60%)` | destructive state |
| `--success` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1C7A41;background:#5CB88A;border-radius:3px;"></span> | `#5CB88A` | `hsl(150 38% 54%)` | success state |
| `--warning` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #9E6B05;background:#E8A832;border-radius:3px;"></span> | `#E8A832` | `hsl(40 82% 55%)` | warning state |
| `--code-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#1F3755;border-radius:3px;"></span> | `#1F3755` | `hsl(213 47% 23%)` | inline/block code bg |
| `--code-fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #D6CFC4;background:#E8E0D4;border-radius:3px;"></span> | `#E8E0D4` | `hsl(36 30% 87%)` | code text |
| `--ring-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C4AD8E;background:#E8D5B8;border-radius:3px;"></span> | `#E8D5B8` | `hsl(33 52% 82%)` | focus ring |

## Dark Theme

| Token | Swatch | Hex | HSL / Value | Usage |
|---|---|---|---|---|
| `--bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#141E2E;border-radius:3px;"></span> | `#141E2E` | `hsl(213 40% 13%)` | page background |
| `--bg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#1A2738;border-radius:3px;"></span> | `#1A2738` | `hsl(213 38% 16%)` | muted surfaces |
| `--bg-subtle` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#1F2F44;border-radius:3px;"></span> | `#1F2F44` | `hsl(213 38% 19%)` | subtle fills |
| `--fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #D6CFC4;background:#FAF6F0;border-radius:3px;"></span> | `#FAF6F0` | `hsl(36 56% 96%)` | primary text |
| `--fg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #7A7068;background:#A89E90;border-radius:3px;"></span> | `#A89E90` | `hsl(34 14% 61%)` | secondary text |
| `--fg-inverse` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#141E2E;border-radius:3px;"></span> | `#141E2E` | `hsl(213 40% 13%)` | inverse-on-light text |
| `--border-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#243548;border-radius:3px;"></span> | `#243548` | `hsl(213 33% 21%)` | default borders |
| `--border-strong` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1B3A5C;background:#2E4560;border-radius:3px;"></span> | `#2E4560` | `hsl(213 35% 28%)` | emphasized borders |
| `--input-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#1A2738;border-radius:3px;"></span> | `#1A2738` | `hsl(213 38% 16%)` | inputs, fields |
| `--primary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A89E90;background:#D6CFC4;border-radius:3px;"></span> | `#D6CFC4` | `hsl(37 22% 80%)` | main brand/accent |
| `--primary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#141E2E;border-radius:3px;"></span> | `#141E2E` | `hsl(213 40% 13%)` | text on primary |
| `--secondary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#1F2F44;border-radius:3px;"></span> | `#1F2F44` | `hsl(213 38% 19%)` | secondary surfaces |
| `--secondary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A89E90;background:#D6CFC4;border-radius:3px;"></span> | `#D6CFC4` | `hsl(37 22% 80%)` | text on secondary |
| `--accent-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#182438;border-radius:3px;"></span> | `#182438` | `hsl(213 40% 16%)` | soft accent fills |
| `--accent-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A89E90;background:#D6CFC4;border-radius:3px;"></span> | `#D6CFC4` | `hsl(37 22% 80%)` | text on accent |
| `--destructive-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #9C3737;background:#E25050;border-radius:3px;"></span> | `#E25050` | `hsl(0 72% 60%)` | destructive state |
| `--success` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1C7A41;background:#5CB88A;border-radius:3px;"></span> | `#5CB88A` | `hsl(150 38% 54%)` | success state |
| `--warning` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #9E6B05;background:#E8A832;border-radius:3px;"></span> | `#E8A832` | `hsl(40 82% 55%)` | warning state |
| `--code-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #0A1520;background:#0F1A28;border-radius:3px;"></span> | `#0F1A28` | `hsl(213 45% 11%)` | inline/block code bg |
| `--code-fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A89E90;background:#C4BAA8;border-radius:3px;"></span> | `#C4BAA8` | `hsl(38 18% 71%)` | code text |
| `--ring-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A89E90;background:#D6CFC4;border-radius:3px;"></span> | `#D6CFC4` | `hsl(37 22% 80%)` | focus ring |

## Tailwind-Exposed Theme Aliases

These are the named colors wired into Tailwind in [`tailwind.config.js`](/Users/raf/Documents/2-areas/dev/raf.works/tailwind.config.js#L41):

| Tailwind Alias | Backing Token |
|---|---|
| `background` | `--background` |
| `foreground` | `--foreground` |
| `border` | `--border` |
| `primary` | `--primary` / `--primary-foreground` |
| `secondary` | `--secondary` / `--secondary-foreground` |
| `muted` | `--muted` / `--muted-foreground` |

Everything else is still available via CSS variables, for example:

```tsx
className="bg-[var(--accent-color)] text-[var(--accent-foreground-color)]"
className="border-[var(--border-color)] shadow-[var(--shadow-md)]"
className="ring-2 ring-[var(--ring-color)]"
className="bg-[var(--code-bg)] text-[var(--code-fg)]"
```

## Usable Classes Cheat Sheet

### Typography

- `font-sans`, `font-serif`: both use `Ronzino`
- `font-edu-marist`: accent/title font with `letter-spacing: -0.02em`
- `font-mono`: `CoFo Sans Mono`
- `text-2xs`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- `type-caption`: `12px`, quiet/meta text
- `type-body`: `14px`, default secondary body copy
- `type-body-primary`: `14px`, emphasized body copy
- `type-title`: `22px`, Edu Marist title styling

### Theme Utilities

- `bg-background`
- `text-foreground`
- `border-border`
- `bg-primary text-primary-foreground`
- `bg-secondary text-secondary-foreground`
- `bg-muted text-muted-foreground`
- `rounded-lg`, `rounded-md`, `rounded-sm`
- `shadow-sm`, `shadow-md`

### Layout and Measure

- `max-w-prose-narrow`: `45ch`
- `max-w-prose`: `65ch`
- `max-w-prose-wide`: `80ch`
- `max-w-reading`: `680px`
- `max-w-article`: `720px`
- `prose-container`
- `prose-narrow`
- `prose-wide`
- `prose-article`
- `prose-article-narrow`
- `prose-article-wide`

### Rhythm and Spacing

- `rhythm-paragraph`: paragraph spacing
- `rhythm-section`: section spacing
- `rhythm-list`: list spacing
- `rhythm-heading`: heading margin rhythm

### Motion and Effects

- `animate-pulse-subtle`
- `transition-colors duration-200`
- `scrollbar-gutter-stable`
- `tray-about-text-fade`

## Non-Color Styling Tokens

| Token | Value |
|---|---|
| `--text-2xs` | `10px` |
| `--text-xs` | `12px` |
| `--text-sm` | `14px` |
| `--text-base` | `16px` |
| `--text-lg` | `20px` |
| `--text-xl` | `22px` |
| `--text-2xl` | `26px` |
| `--leading-tight` | `1.25` |
| `--leading-normal` | `1.5` |
| `--radius` | `14px` |
| `--shadow-sm` light | `0 1px 2px hsl(213 40% 5% / 0.12)` |
| `--shadow-sm` dark | `0 1px 3px hsl(213 40% 5% / 0.3)` |
| `--shadow-md` light | `0 8px 20px hsl(213 40% 5% / 0.18)` |
| `--shadow-md` dark | `0 4px 12px hsl(213 40% 5% / 0.45)` |
| `--theme-transition-duration` | `0.15s` |
| `--theme-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--grain-opacity` light | `0.03` |
| `--grain-opacity` dark | `0.04` |
| `--grain-blend` light | `overlay` |
| `--grain-blend` dark | `overlay` |

## Notes

- `success` and `warning` are adjusted for legibility on blue-toned backgrounds. Both themes share the same values.
- Navigation color tokens (`--nav-work`, `--nav-about`, `--nav-projects`, `--nav-contact`) all map to `--primary-color` (warm gold in light, warm sand in dark).
- Modals and trays use `--modal-*` tokens so they follow system theme directly rather than the scroll blend.
- The entire neutral ramp has shifted from cool gray (`hsl(220 10%)`) to the Amalfi Dusk blue family (`hsl(213 38-43%)`). Foreground text uses a warm cream ramp instead of near-black/near-white.
- Shadows now use the Amalfi hue (`hsl(213 40% 5%)`) instead of pure black for warmer, more integrated shadow tones.
- Grain blend mode is `overlay` for both themes (was `multiply` for light) to work better on blue-toned backgrounds.
