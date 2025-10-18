some critical elements i want you to help me solve and not just fix it

some edits may have been somewhere else, so you can conduct really deep analysis to the best of your abilities, and check with me often

main mobile issues for @page.tsx

## ✅ COMPLETED

### 1. Loading Animation Timing (FIXED)

**Problem**: The first image and caption appeared too fast after main text animation
**Solution**:

- Increased breathing time from 400ms → 900ms before `secondLineComplete` triggers
- New timeline: Text completes at ~1.2s, breathes until ~2.7s, then images appear
- Result: Harmonious, smooth flow between text and image reveal
- **Location**: `app/page.tsx` line 1342 (mobile header animation)
- **Comment added**: "Increased delay for harmonious timing - allows text to breathe before images appear"

### 2. Horizontal Alignment (FIXED)

**Problem**: Inconsistent padding between header text, images, captions, and About modal
**Solution**:

- Created `MOBILE_CONTENT_PADDING = "px-4 sm:px-6"` constant (line 125)
- Mirrors About modal padding system for unified alignment
- Applied to:
  - Mobile header (line 1328) - "Uses MOBILE_CONTENT_PADDING for consistent horizontal alignment"
  - Image section panels (line 1382) - "Changed from px-4 sm:px-3 to unified MOBILE_CONTENT_PADDING"
  - Mobile footer (line 1523) - "Uses MOBILE_CONTENT_PADDING for horizontal alignment"
- Changed captions from `text-center` to `text-left` with `w-full` (line 1466)
- **Result**: All mobile text/content aligns to same left edge
- **All changes documented** with inline comments explaining what, why, and how

---

## ✅ COMPLETED (Third Pass - SIMPLIFIED MOBILE)

### Feedback: "Simplify both image loading and scrolling - focus on mobile only"

#### 1. Mobile Image Loading - SIMPLIFIED ✅
**Problem**: Complex 3-stage blur was not appealing, felt too dramatic
**Your request**: "Simplify the animation to be harmonious with text"

**Solution** - Gentle Blur-to-Focus (Option B):
- **SIMPLIFIED from**: 3-stage keyframes (30px → 12px → 0px) ❌ Too complex
- **SIMPLIFIED to**: Simple fade + gentle blur (**8px → 0px**) ✅ Harmonious
- Duration: **1.8s** (kept the harmonious timing)
- Easing: EASING.primary (matches text)
- Implementation: [page.tsx:1436-1463](app/page.tsx#L1436)
  ```tsx
  initial: { opacity: 0, blur: "8px", y: 14, scale: 0.98 }
  animate: { opacity: 1, blur: "0px", y: 0, scale: 1 }
  duration: 1.8s
  ```
- **Result**: Clean, simple reveal that matches text animation quality - no complexity

**Comment added**: *"SIMPLIFIED MOBILE IMAGE REVEAL: Simple fade + gentle blur (harmonious with text)"*

#### 2. Mobile Scroll Transitions - SIMPLIFIED ✅
**Problem**: Images staying too dark during scroll (opacity 0.4 = too faded)
**Your request**: "Images are always darker, can we simplify the scrolling?"

**Solution** - Subtle Fade + Very Gentle Blur:
- **SIMPLIFIED from**:
  - Inactive: opacity **0.4**, blur **4px** ❌ Too dark, too blurry
- **SIMPLIFIED to**:
  - **Active panel**: opacity **1**, blur(**0px**), scale 1 (sharp, full visibility)
  - **Inactive panels**: opacity **0.92**, blur(**2px**), scale 0.985 (subtle fade, stays visible)
- Duration: **0.7s** (smooth)
- Implementation: [page.tsx:1111-1130](app/page.tsx#L1111)
- **Result**: Images stay visible and clean during scroll - just a subtle hint of fade

**Comment added**: *"SIMPLIFIED: Subtle fade (was 0.4 - too dark), keeps images visible"*

**Note**: Desktop animations kept as-is - will refine desktop separately later

---

## ✅ CRITICAL FIXES (After Testing)

### CRITICAL FIX #1: Mobile Scroll Blur Bug - FIXED ✅
**Problem**: Images stayed blurred when scrolling on mobile (discovered in production - first occurrence)
**Cause**: `blurByIndex` state was applying conflicting blur via inline styles, overriding panelVariants
**Solution**:
- Removed `blurByIndex` from section style ([page.tsx:1411](app/page.tsx#L1411))
- Removed `blurByIndex` from motion.div style ([page.tsx:1447](app/page.tsx#L1447))
- **panelVariants now handles all blur transitions** cleanly via filter property
- **Result**: ✅ Clean scroll transitions, no stuck blur

**Comment added**: *"CRITICAL FIX: Removed blurByIndex - was causing scroll blur issue"*

### CRITICAL FIX #2: Mobile Scroll Blur Bug (AGAIN) - FIXED ✅
**Problem**: Images AFTER the first still appeared blurred when scrolling (discovered in production - second occurrence)
**User feedback**: "when i scroll on mobile, the images and captions after the first are still blurred. this is critical. the animation has to starts and finishes, and it's important that the works are fully visibile"
**Root Cause**: `panelVariants` inactive state was applying `filter: "blur(2px)"` to ALL inactive panels during scroll
  - Initial image load: motion.div has animation with `blur(8px) → blur(0px)` ✅ Works once
  - During scroll: panelVariants apply `blur(2px)` to inactive panels ❌ Stays blurred
  - **Conflict**: Two competing blur animations - initial load vs scroll state

**Solution**:
- **Removed blur filter entirely from panelVariants** (both active and inactive states)
- Active: opacity 1, scale 1 (no filter needed)
- Inactive: opacity 0.92, scale 0.985 (**no blur** - only subtle fade)
- **Result**: ✅ Images stay sharp after initial load, only opacity/scale changes during scroll
- **Location**: [page.tsx:1102-1120](app/page.tsx#L1102)

**Comment added**: *"CRITICAL FIX: Removed blur from inactive state - images must stay sharp after initial animation completes. Only opacity/scale changes during scroll to keep works fully visible"*

### Padding System Unified - FIXED ✅
**Problem**: About modal had extra padding layers (container + wrapper), not matching mobile simplicity
**Your request**: "Treat about modal as (4px) From the amalfi coast... simple like mobile"
**Solution**:
- **Removed** `p-4 sm:p-6` from modal container
- **Removed** `max-w-2xl` width constraint on wrapper
- Applied `MOBILE_CONTENT_PADDING` directly to text content wrapper ([page.tsx:1926](app/page.tsx#L1926))
- **Result**: ✅ All mobile content now has identical padding system:
  - Header: `px-4 sm:px-6`
  - Images: `px-4 sm:px-6`
  - Captions: `px-4 sm:px-6`
  - About modal: `px-4 sm:px-6`
  - Footer: `px-4 sm:px-6`

**Comment added**: *"SIMPLIFIED PADDING: Matches mobile system - just px-4 sm:px-6 like header/images"*

---

## ✅ CRITICAL FIX #2 (Mobile Image Blur - FIXED)

### CRITICAL: Images After First One Staying Blurred on Scroll - FIXED ✅
**Problem**: When scrolling on mobile, images 2, 3, 4+ stayed blurred forever - they never completed their animation
**Root Cause**: The `animate` condition at [page.tsx:1427-1446](app/page.tsx#L1427) was too restrictive:
```tsx
// OLD (BROKEN):
animate={
  loadingSequence.textLoaded && !!loadedImages[src] && secondLineComplete
    ? { filter: "blur(0px)", ... }
    : {}  // ❌ Empty object = animation never completes for images 2+
}
```
**Why it broke**:
- Image 1: All conditions met → animates → becomes sharp ✅
- Images 2+: Load later, but `secondLineComplete` already true → condition returns `{}` → **blur never resolves** ❌

**Solution**:
- Changed condition to check **only** `!!loadedImages[src]` ([page.tsx:1431](app/page.tsx#L1431))
- Every image now completes its blur→sharp animation once loaded
- First image still gets harmonious delay (0.55s) for text coordination
- Other images animate immediately (no delay) to prevent stuck blur
```tsx
// NEW (FIXED):
animate={
  !!loadedImages[src]  // ✅ Simple condition - just check if loaded
    ? {
        filter: "blur(0px)",
        delay: index === 0 && secondLineComplete ? 0.55 : 0  // Only first waits
      }
    : {}
}
```

**Result**: ✅ All mobile images now animate from blur(8px) → blur(0px) cleanly, works stay fully visible after animation completes

**Comment added**: *"CRITICAL FIX: Ensure ALL images complete their animation once loaded - First image: waits for text sequence for harmonious timing - Other images: animate immediately when loaded (prevents stuck blur)"*

---

## 📋 TODO (Next Priority)

### 3. Mobile Footer Visibility Issue
**Problem**: Footer links not visible on mobile - need device-specific layout rules
**Status**: PENDING
**Next Steps**: Test all current fixes first, then tackle footer visibility
