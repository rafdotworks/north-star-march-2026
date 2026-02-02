# Typography System Testing Guide

Quick guide to verify the hero text jump fix and test the typography system.

---

## 🔍 Quick Test: Hero Text Jump Issue

### Before Testing
**Dev server should be running**:
```bash
# If not running, start it:
npm run dev
# Running on: http://localhost:3002
```

### Step-by-Step Testing

#### 1. Open Browser DevTools
1. Open http://localhost:3002
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
1. DevTools → Toggle device toolbar (Cmd+Shift+M)
2. Select "iPhone 14 Pro" or similar
3. Refresh page
4. Hero text should be **14px** (same as desktop)
5. Navigation should be **14px** (mobile: larger for tap targets)

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
Add this temporarily to `app/page.tsx` to test:

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
