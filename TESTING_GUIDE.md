# Typography System Testing Guide

Quick guide to verify the hero text jump fix and test the typography system.

**Scope:** Sections below **Quick Test** through **Theme Switching** focus on **typography and layout** on the routes you open. The **Routes and deep links** section is **full site / ship smoke** (URLs, redirects, API, static assets)—run it against a **production build** when preparing a release.

---

## Routes and deep links (ship smoke)

Use `npm run build && npm run start -- --port 3001` (or any free port) so behavior matches production. In the browser, check the Network tab for status codes.

| Check | Expected |
|--------|----------|
| `GET /` | **200** — `HomeLanding` (minimal home). |
| `GET /works` | **200** — `WorksHomepage` (full hero + gallery + writing tray). |
| `GET /?writings=<slug>` | **307** to `/works?writings=<slug>` |
| `GET /writings/<slug>` | **308** to `/works?writings=<slug>` (legacy bookmark URL) |
| `GET /api/me` | **200**, JSON with `name`, `bio`, `location`, `contact`, `principles`, `writings`, `site` |
| `GET /favicon-192x192.png`, `GET /site.webmanifest` | **200** (no 404 on referenced icons / PWA manifest) |

Optional terminal checks (replace port if needed):

```bash
npm run build && npm run start -- --port 3010
curl -sI http://127.0.0.1:3010/writings/example-slug | head -5   # expect 308 + location: /works?writings=...
curl -sI "http://127.0.0.1:3010/?writings=example-slug" | head -8   # expect 307 + location: /works?writings=...
curl -s http://127.0.0.1:3010/api/me | head -c 300
```

Tray behavior: on **`/works`**, loading with `?writings=<id>` should open the writing tray to that piece after load (see [useWritingsUrlSync](app/components/pages/homepage/useWritingsUrlSync.ts)). On **`/`**, use the site UI to open writings or follow redirects—deep links are intended to land on **`/works`**.

---

## 🔍 Quick Test: Hero Text Jump Issue

### Before Testing
**Dev server should be running**:
```bash
# Start a clean dev server for the root route mobile audit:
npm run dev -- --port 3001
# Test against: http://localhost:3001
# If localhost:3000 looks wrong, don't trust it until you restart it cleanly.
# If next dev starts serving missing chunk / manifest errors, use:
# npm run build && npm run start -- --port 3001
```

### Step-by-Step Testing

#### 1. Open Browser DevTools
1. Open http://localhost:3001
2. Open Chrome DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Keep it open while testing

#### 2. Test Hero Text (NO JUMP Expected)
1. **Hard refresh** the page (Cmd+Shift+R or Ctrl+Shift+F5)
2. Watch the line: "**Raf** designs and builds AI products that work at scale."
3. **Expected**: Text should appear at 14px and STAY at 14px
4. **Fixed**: No size jump during font loading

#### 3. Verify Font Size with Inspector
1. Right-click on "Raf" in the hero text
2. Click "Inspect Element"
3. In DevTools Elements panel, check computed styles:
   ```
   font-size: 14px ✅
   font-family: var(--font-edu-marist) ✅
   line-height: 1.65 ✅
   letter-spacing: -0.02em ✅
   ```

#### 4. Test with Slow Network (Simulate Font Loading)
1. DevTools → **Network** tab
2. Throttling dropdown → **Slow 3G**
3. **Disable cache** checkbox ✅
4. Hard refresh (Cmd+Shift+R)
5. Watch hero text load:
   - Fallback font appears first (slightly different metrics)
   - Custom font swaps in
   - Size should remain ~14px throughout
   - **Small shift is normal** (different font metrics)
   - **Large jump is fixed** (no conflicting sizes)

#### 5. Check Console for Warnings
**Expected**: NO hydration warnings related to typography

**If you see**:
```
❌ Warning: Text content did not match...
❌ Warning: Prop `className` did not match...
```
This would indicate a hydration issue (should NOT occur)

**Currently using**: `suppressHydrationWarning` on html/body  
This is acceptable for known safe mismatches (theme system)

---

## 📱 Responsive Testing

### Mobile Viewport (< 768px)
Test the root route (`/`) first.
1. DevTools → Toggle device toolbar (Cmd+Shift+M)
2. Select "iPhone 14 Pro" or similar
3. Set the preview zoom to **Fit to window** (or `100%` if the preview is readable)
4. If the page looks like a tiny strip or mostly white space, undock DevTools or widen the browser before assuming the layout is broken
5. Refresh page after switching into device mode
6. Hero text should be **14px** (same as desktop)
7. Navigation should be **14px** (mobile: larger for tap targets)

### Better Mobile Checks From Desktop
1. Use **Responsive** mode first and type an exact width like `390 x 844`
2. Hard refresh after changing viewport mode, because `100dvh`, sticky containers, and theme scripts can look wrong on a stale render
3. Keep an eye on the **Computed** panel for `width`, `height`, and `overflow` when a mobile view looks blank
4. Treat real-device parity as the primary bar. Desktop emulation is a useful check, not the sole source of truth.
5. Prefer a Chrome-channel Playwright capture when you want a desktop check that behaves more like a mobile browser viewport:

```bash
npx --yes playwright@latest screenshot \
  -b cr \
  --channel=chrome \
  --viewport-size="393,852" \
  --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1" \
  --wait-for-timeout=4000 \
  http://localhost:3001 \
  output/playwright/root-mobile-iphone14pro.png
```

6. If you want a quick fixed-size render without DevTools chrome, capture root screenshots directly:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=390,844 \
  --force-device-scale-factor=2 \
  --virtual-time-budget=4000 \
  --screenshot="$PWD/output/playwright/root-mobile-390x844.png" \
  http://localhost:3001

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=430,932 \
  --force-device-scale-factor=2 \
  --virtual-time-budget=4000 \
  --screenshot="$PWD/output/playwright/root-mobile-430x932.png" \
  http://localhost:3001
```

The Playwright command is the better source of truth for desktop mobile checks. The raw Chrome `--window-size` capture is still useful, but it can over-report white space at the bottom of `dvh` layouts.

### Desktop Viewport (>= 768px)
1. Restore normal viewport
2. Hero text should be **14px**
3. Navigation should be **12px** (desktop: smaller)

---

## 🎨 Visual Regression Checklist

### Typography Consistency
- [ ] Hero "Raf" name: Edu Marist font, 14px, no jump
- [ ] Hero description: Same size throughout line
- [ ] Work titles: 22px (`.type-title`)
- [ ] Work descriptions: 14px (`.type-body`)
- [ ] Captions/metadata: 12px (`.type-caption`)
- [ ] Footer links: 12px (`.type-caption`)

### No Layout Shifts
- [ ] Page load: Content doesn't jump vertically
- [ ] Font swap: Minimal horizontal shift (unavoidable)
- [ ] Navigation: Smooth reveal animation
- [ ] Work cards: Stable layout

### Theme Switching
- [ ] Light mode: Text remains 14px
- [ ] Dark mode: Text remains 14px
- [ ] Theme blend on scroll: No text size changes

---

## 🧪 Advanced Testing

### Test New Typography Features (Optional)

#### 1. Test Semantic Labels
Add this temporarily to `HomeLanding.tsx` or `WorksHomepage.tsx` (whichever you are tuning) to test:

```tsx
import { SEMANTIC_TYPOGRAPHY } from '@/app/config/typographyConfig'

// Example: Make "Raf" more prominent with Display typography
<span className={`font-edu-marist ${SEMANTIC_TYPOGRAPHY.display.mobile} md:${SEMANTIC_TYPOGRAPHY.display.desktop}`}>
  Raf
</span>
```

**Result**: "Raf" would be:
- Mobile: 22px (larger than current 14px)
- Desktop: 26px (larger than current 14px)

#### 2. Test Prose Utilities
Wrap hero text section in prose container:

```tsx
<div className="prose-article">
  <p className="type-body-primary">
    <TextShimmer>...</TextShimmer>
  </p>
</div>
```

**Result**: Content constrained to 65ch (~680px) for optimal readability

#### 3. Test Rhythm Utilities
Add rhythm to footer sections:

```tsx
<div className="rhythm-paragraph">
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
  {/* Automatic 24px spacing */}
</div>
```

---

## 🐛 Known Behaviors (Not Bugs)

### Font Loading
**Symptom**: Small text shift when font loads  
**Cause**: Fallback font (Inter) has slightly different metrics than Edu Marist  
**Status**: ✅ EXPECTED - Minimal shift is unavoidable with custom fonts  
**Fix**: Using `font-display: swap` for best performance

### Theme Hydration
**Symptom**: `suppressHydrationWarning` in layout.tsx  
**Cause**: Theme attribute applied client-side only  
**Status**: ✅ ACCEPTABLE - Prevents false warnings for theme system

### TextShimmer Animation
**Symptom**: Plays once on mount  
**Cause**: Intentional design - not a loading indicator  
**Status**: ✅ EXPECTED - One-time shimmer effect for polish

---

## 📊 Performance Metrics

### Measure with DevTools Performance Tab

1. DevTools → **Performance** tab
2. Click **Record** (●)
3. Hard refresh page (Cmd+Shift+R)
4. Stop recording after page loads
5. Check **Cumulative Layout Shift (CLS)**:
   - **Good**: < 0.1
   - **Needs Improvement**: 0.1 - 0.25
   - **Poor**: > 0.25

**Expected**: Small CLS from font loading (< 0.1) is acceptable

### Measure Font Loading Time

1. DevTools → **Network** tab
2. Filter by "Font"
3. Check loading times:
   - Ronzino-Regular.otf
   - EduMarist-Regular.woff2
   - CoFoSansMono-Regular.ttf

**Expected**: < 100ms on fast connection, fonts cached after first load

---

## ✅ Success Criteria

### Must Pass
- [ ] **Hero text**: No size jump on load
- [ ] **Console**: No hydration errors
- [ ] **Build**: `npm run build` succeeds
- [ ] **Font size**: Consistently 14px in hero text
- [ ] **Responsive**: Works on mobile and desktop

### Nice to Have
- [ ] **CLS**: < 0.1 (minimal layout shift)
- [ ] **Font load**: < 100ms
- [ ] **Animations**: TextShimmer plays smoothly

---

## 🔧 Debugging Tips

### If Hero Text Still Jumps

**Check in DevTools Elements panel**:
```tsx
<p class="type-body-primary leading-[1.65]">  <!-- Should have this -->
  <div class="...">  <!-- TextShimmer wrapper -->
    <span class="relative z-10">
      <span class="font-edu-marist">Raf</span>  <!-- Should NOT have text-base -->
      designs...
    </span>
  </div>
</p>
```

**Verify computed styles** on the `<span>Raf</span>`:
- font-size: 14px ✅ (inherited from .type-body-primary)
- NOT 16px ❌ (would indicate text-base is still there)

### If Hydration Warnings Appear

1. Check Console for exact error message
2. Look for mismatched classes or text content
3. Verify `suppressHydrationWarning` is on html/body
4. Check if theme system is causing issues

### If Fonts Don't Load

1. Network tab → check for 404 errors
2. Verify font files exist in `public/fonts/`
3. Check `app/layout.tsx` font configuration
4. Clear browser cache and retry

---

## 📝 Report Results

After testing, update `TEST_RESULTS.md`:

**Manual Testing Checklist**:
- [ ] ⏳ → ✅ Hero text load (no jump)
- [ ] ⏳ → ✅ Console (no warnings)
- [ ] ⏳ → ✅ Font size verification
- [ ] ⏳ → ✅ Responsive behavior
- [ ] ⏳ → ✅ Performance metrics

**If issues found**:
1. Note the exact behavior
2. Screenshot if visual issue
3. Copy console errors
4. Report for investigation

---

**Happy Testing!** 🎉

The hero text jump should be fixed. If you see any remaining issues, follow the debugging tips above.
