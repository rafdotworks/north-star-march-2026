# Engineering notes (reliability, performance, APIs)

Operational reference for future work. **Design tokens and visual rules** live in [TYPOGRAPHY.md](../TYPOGRAPHY.md) and [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)—this file does not duplicate them.

## Commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run lint` | ESLint (Next + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` (fast, no bundle) |
| `npm run test` | Vitest unit tests (`**/*.test.ts`) |
| `npm run build` | Production build (includes typecheck via Next) |

CI runs `lint` → `typecheck` → `test` → `build` on push/PR to `main` (see [.github/workflows/ci.yml](../.github/workflows/ci.yml)).

**Dependencies:** Run `npm audit` occasionally; `npm audit fix` (without `--force`) is safe for routine transitive bumps. Re-run `build` and smoke-test the site after lockfile changes.

## Route and config map

- **Home** (`/`): [app/page.tsx](../app/page.tsx) — server entry; `export const dynamic = "force-dynamic"` (avoids a Next SSG/webpack-runtime issue with the client home tree). Renders [HomeLanding](../app/components/pages/HomeLanding.tsx): minimal landing, work gallery, theme blend, scroll effects, [SideTray](../app/components/page-specific/SideTray.tsx).
- **Works** (`/works`): [app/works/page.tsx](../app/works/page.tsx) — [WorksHomepage](../app/components/pages/WorksHomepage.tsx): fuller hero + gallery + writing tray with URL sync ([useWritingsUrlSync](../app/components/pages/homepage/useWritingsUrlSync.ts)).
- **Tray / subviews**: [app/components/page-specific/SideTray.tsx](../app/components/page-specific/SideTray.tsx) and `side-tray/`.
- **Config**: [app/config/](../app/config/) — portfolio, footer, about modal, contact links, location, writings, typography, homepage gallery, etc.
- **Shared hooks**: [hooks/](../hooks/) — mobile, theme, loading, animation level.
- **Pure helpers**: [app/lib/](../app/lib/) — token stripping for About copy, weather helpers; covered by Vitest (`*.test.ts` colocated with sources).
- **Page-level UI**: [app/components/pages/](../app/components/pages/) — `HomeLanding`, `WorksHomepage`, shared gallery, homepage hooks (`useHomepageScrollEffects`, `useWritingsUrlSync`, etc.).
- **Tray subcomponents**: [app/components/page-specific/side-tray/](../app/components/page-specific/side-tray/) — About biography, writing list, article reader, photos grid, shared types/animations and `useArticleLoader` (keeps [SideTray.tsx](../app/components/page-specific/SideTray.tsx) focused on shell, stacking, and gestures).

## Release / URL contract

- **`/` vs `/works`**: `/` is the lighter **HomeLanding** experience. **`/works`** is the primary surface for the full hero, company links, and **writing tray state synced to `?writings=<slug>`**.
- **Root query redirect**: `GET /?writings=<slug>` → **307** to `/works?writings=<slug>` (implemented in [app/page.tsx](../app/page.tsx)).
- **Legacy writings URLs**: `GET /writings/<slug>` → **308** permanent redirect to `/works?writings=<slug>` ([next.config.js](../next.config.js)).
- **Icons / OG**: Favicons and [site.webmanifest](../public/site.webmanifest) point at PNGs under `/public`. Open Graph / Twitter images use `/image-portrait.jpeg` (see [app/layout.tsx](../app/layout.tsx)).

## API: `GET /api/me`

- **File**: [app/api/me/route.ts](../app/api/me/route.ts).
- **Purpose**: JSON identity for humans/agents.
- **Caching**: `Cache-Control: public, max-age=60` — safe for repeated fetches.
- **Response shape** (200): `name` (string), `bio` (string), `location` (`city`, `timezone`), `contact` (`email`, `linkedin`, `x`), `principles` (array, from about config), `writings` (array of `{ id, title }`), `site` (canonical URL string). On error: `{ error: string }` with 500.

## Performance and visual parity

Performance work (smaller bundles, splitting, fewer wasted renders) is **in scope** when the **visible result** stays the same: layout, spacing, type, color, motion as you experience it.

- Prefer measuring before/after (Lighthouse, bundle analyzer) when changing bundles or loading.
- Lazy loading / `dynamic()` can change **first paint** or show placeholders—**verify** after changes that nothing looks wrong.
- **Sheet**: `react-modal-sheet` is **pinned** in [package.json](../package.json); bumping it may change tray behavior—QA if you upgrade.

## Build snapshot (reference)

Captured **2026-03-30** from `npm run build` (Next 15.5.14). Re-run the build and compare this table when you are optimizing bundles.

| Route | Page size | First Load JS |
|-------|-----------|----------------|
| `/` | 2.18 kB | 265 kB |
| `/works` | 2.06 kB | 265 kB |
| `/blueprint` | 2.46 kB | 148 kB |
| `/portfolio` | 2.07 kB | 104 kB |
| `/haptics-demo` | 3.31 kB | 109 kB |
| `/theme-token-preview` | 163 B | 106 kB |
| `/cv` | 341 B | 102 kB |
| `/text-2026` | 142 B | 102 kB |
| `/_not-found` | 142 B | 102 kB |
| API routes | ~142 B | 102 kB |
| **Shared** | — | **102 kB** |

**Note:** `/` and `/works` share the largest first-load number; most weight is in the shared framework chunk. Deeper cuts usually need `next/dynamic` or fewer client dependencies—**only** after visual QA.

## Testing

- **Unit**: Vitest for pure logic in `app/lib` (and similar) — see `*.test.ts` next to sources.
- **Manual / visual**: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — typography-focused checks plus **routes and deep links**; smoke **`npm run build && npm run start`** for production parity before ship.

## Theme tokens and preview

- **Reference docs**: [DOCUMENTS/THEME_TOKEN_SHEET.md](../DOCUMENTS/THEME_TOKEN_SHEET.md) describes CSS variables and light/dark behavior; `THEME_TOKEN_SHEET-SUGGESTION.md` is an optional companion for naming tweaks—neither file is imported by the app.
- **Dev route**: [`/theme-token-preview`](../app/theme-token-preview/) renders a small matrix of semantic surface tokens against the live theme (useful when adjusting [app/globals.css](../app/globals.css)).

## CI and agent tooling

- **GitHub Actions**: [.github/workflows/ci.yml](../.github/workflows/ci.yml) runs `lint` → `typecheck` → `test` → `build` on every push and PR to `main` (Node 22, `npm ci`). If a push is rejected with *refusing to allow an OAuth App to create or update workflow … without `workflow` scope*, commit this file from a normal terminal using **SSH** or a **personal access token** that includes the **workflow** scope (some IDE/Git integrations omit it).
- **`skills-lock.json`** (repo root): optional hash lock for externally sourced agent skills; safe to commit so collaborators get the same skill revisions.

## Ship checklist

Before merging or pushing to `main`, run the same sequence as CI: `npm run lint && npm run typecheck && npm run test && npm run build`. After deploy, spot-check `/`, `/works`, deep links with `?writings=<slug>`, and tray flows (About, Writing, Photos) on mobile and desktop.
