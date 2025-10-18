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

## 📋 TODO (Next Priority)

### 3. Mobile Footer Visibility Issue
**Problem**: Footer links not visible on mobile - need device-specific layout rules
**Status**: PENDING
**Next Steps**: Tackle after #1 and #2 are tested and refined
