# Theme Token Sheet

Global theme tokens live in [`app/globals.css`](/Users/raf/Documents/2-areas/dev/raf.works/app/globals.css#L153), Tailwind aliases in [`tailwind.config.js`](/Users/raf/Documents/2-areas/dev/raf.works/tailwind.config.js#L41), and font loading in [`app/layout.tsx`](/Users/raf/Documents/2-areas/dev/raf.works/app/layout.tsx#L40).

The system has two endpoints:

- Light theme
- Dark theme

At runtime, many colors interpolate between those endpoints via `--theme-blend` and `--theme-blend-num`, but the tables below show the resolved endpoint values from the explicit `[data-theme="light"]` and `[data-theme="dark"]` blocks in [`app/globals.css`](/Users/raf/Documents/2-areas/dev/raf.works/app/globals.css#L382).

## Palette Anchors

- Neutral ramp: `hsl(220 10% ...)`
- Accent hue: `226`
- Light primary: `hsl(226 92% 66%)`
- Dark primary: `hsl(226 85% 70%)`
- Viewport theme-color: light `#FCFCFD`, dark `#131619`

## Light Theme

| Token | Swatch | Hex | HSL / Value | Usage |
|---|---|---|---|---|
| `--bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#FCFCFD;border-radius:3px;"></span> | `#FCFCFD` | `hsl(220 10% 99%)` | page background |
| `--bg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#F7F7F8;border-radius:3px;"></span> | `#F7F7F8` | `hsl(220 10% 97%)` | muted surfaces |
| `--bg-subtle` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#F1F2F4;border-radius:3px;"></span> | `#F1F2F4` | `hsl(220 10% 95%)` | subtle fills |
| `--fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#16181D;border-radius:3px;"></span> | `#16181D` | `hsl(220 15% 10%)` | primary text |
| `--fg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #7A808C;background:#505662;border-radius:3px;"></span> | `#505662` | `hsl(220 10% 35%)` | secondary text |
| `--fg-inverse` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#FCFCFD;border-radius:3px;"></span> | `#FCFCFD` | `hsl(220 10% 99%)` | inverse-on-dark text |
| `--border-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #B8BDC7;background:#D7DAE0;border-radius:3px;"></span> | `#D7DAE0` | `hsl(220 12% 86%)` | default borders |
| `--border-strong` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A8AEB9;background:#C6CAD2;border-radius:3px;"></span> | `#C6CAD2` | `hsl(220 12% 80%)` | emphasized borders |
| `--input-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#E8EAED;border-radius:3px;"></span> | `#E8EAED` | `hsl(220 12% 92%)` | inputs, fields |
| `--primary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #365EDC;background:#597EF8;border-radius:3px;"></span> | `#597EF8` | `hsl(226 92% 66%)` | main brand/accent |
| `--primary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#FFFFFF;border-radius:3px;"></span> | `#FFFFFF` | `white` | text on primary |
| `--secondary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#E8EAED;border-radius:3px;"></span> | `#E8EAED` | `hsl(220 12% 92%)` | secondary surfaces |
| `--secondary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#1A1D23;border-radius:3px;"></span> | `#1A1D23` | `hsl(220 15% 12%)` | text on secondary |
| `--accent-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#EEF1FC;border-radius:3px;"></span> | `#EEF1FC` | `hsl(226 70% 96%)` | soft accent fills |
| `--accent-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#1D3172;border-radius:3px;"></span> | `#1D3172` | `hsl(226 60% 28%)` | text on accent |
| `--destructive-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A01D1D;background:#DB2424;border-radius:3px;"></span> | `#DB2424` | `hsl(0 72% 50%)` | destructive state |
| `--success` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1C7A41;background:#29A35C;border-radius:3px;"></span> | `#29A35C` | `hsl(145 60% 40%)` | success state |
| `--warning` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #9E6B05;background:#DA950B;border-radius:3px;"></span> | `#DA950B` | `hsl(40 90% 45%)` | warning state |
| `--code-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #C6CAD2;background:#F3F4F6;border-radius:3px;"></span> | `#F3F4F6` | `hsl(220 15% 96%)` | inline/block code bg |
| `--code-fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#262B36;border-radius:3px;"></span> | `#262B36` | `hsl(220 18% 18%)` | code text |
| `--ring-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #365EDC;background:#3D68F5;border-radius:3px;"></span> | `#3D68F5` | `hsl(226 90% 60%)` | focus ring |

## Dark Theme

| Token | Swatch | Hex | HSL / Value | Usage |
|---|---|---|---|---|
| `--bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#121317;border-radius:3px;"></span> | `#121317` | `hsl(220 14% 8%)` | page background |
| `--bg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#16181D;border-radius:3px;"></span> | `#16181D` | `hsl(220 14% 10%)` | muted surfaces |
| `--bg-subtle` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#1A1D23;border-radius:3px;"></span> | `#1A1D23` | `hsl(220 14% 12%)` | subtle fills |
| `--fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A8AEB9;background:#F0F2F4;border-radius:3px;"></span> | `#F0F2F4` | `hsl(220 15% 95%)` | primary text |
| `--fg-muted` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #8E94A0;background:#ABB0BA;border-radius:3px;"></span> | `#ABB0BA` | `hsl(220 10% 70%)` | secondary text |
| `--fg-inverse` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#0D0F12;border-radius:3px;"></span> | `#0D0F12` | `hsl(220 15% 6%)` | inverse-on-light text |
| `--border-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#282C33;border-radius:3px;"></span> | `#282C33` | `hsl(220 12% 18%)` | default borders |
| `--border-strong` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#363B45;border-radius:3px;"></span> | `#363B45` | `hsl(220 12% 24%)` | emphasized borders |
| `--input-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#1F2228;border-radius:3px;"></span> | `#1F2228` | `hsl(220 12% 14%)` | inputs, fields |
| `--primary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #4D6FD9;background:#7190F4;border-radius:3px;"></span> | `#7190F4` | `hsl(226 85% 70%)` | main brand/accent |
| `--primary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#0E0F11;border-radius:3px;"></span> | `#0E0F11` | `hsl(220 10% 6%)` | text on primary |
| `--secondary-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#24272E;border-radius:3px;"></span> | `#24272E` | `hsl(220 12% 16%)` | secondary surfaces |
| `--secondary-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #A8AEB9;background:#E8EAED;border-radius:3px;"></span> | `#E8EAED` | `hsl(220 12% 92%)` | text on secondary |
| `--accent-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#1A254D;border-radius:3px;"></span> | `#1A254D` | `hsl(226 50% 20%)` | soft accent fills |
| `--accent-foreground-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #8E94A0;background:#B1C3FB;border-radius:3px;"></span> | `#B1C3FB` | `hsl(226 90% 84%)` | text on accent |
| `--destructive-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #9C3737;background:#E25050;border-radius:3px;"></span> | `#E25050` | `hsl(0 72% 60%)` | destructive state |
| `--success` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #1C7A41;background:#29A35C;border-radius:3px;"></span> | `#29A35C` | `hsl(145 60% 40%)` | success state |
| `--warning` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #9E6B05;background:#DA950B;border-radius:3px;"></span> | `#DA950B` | `hsl(40 90% 45%)` | warning state |
| `--code-bg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #444;background:#16181D;border-radius:3px;"></span> | `#16181D` | `hsl(220 14% 10%)` | inline/block code bg |
| `--code-fg` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #8E94A0;background:#D5D9E2;border-radius:3px;"></span> | `#D5D9E2` | `hsl(220 18% 86%)` | code text |
| `--ring-color` | <span style="display:inline-block;width:14px;height:14px;border:1px solid #4D6FD9;background:#567CFB;border-radius:3px;"></span> | `#567CFB` | `hsl(226 95% 66%)` | focus ring |

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
| `--shadow-sm` light | `0 1px 2px hsl(0 0% 0% / 0.06)` |
| `--shadow-sm` dark | `0 1px 3px hsl(0 0% 0% / 0.2)` |
| `--shadow-md` light | `0 8px 20px hsl(0 0% 0% / 0.1)` |
| `--shadow-md` dark | `0 4px 12px hsl(0 0% 0% / 0.35)` |
| `--theme-transition-duration` | `0.15s` |
| `--theme-transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--grain-opacity` light | `0.025` |
| `--grain-opacity` dark | `0.03` |
| `--grain-blend` light | `multiply` |
| `--grain-blend` dark | `overlay` |

## Notes

- `success` and `warning` do not change between light and dark.
- Navigation color tokens (`--nav-work`, `--nav-about`, `--nav-projects`, `--nav-contact`) all map to `--primary-color`.
- Modals and trays use `--modal-*` tokens so they follow system theme directly rather than the scroll blend.
