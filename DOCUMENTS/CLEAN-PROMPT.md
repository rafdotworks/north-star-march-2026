# Repository Cleanup Prompt Template

Use this prompt to instruct AI assistants (Claude, ChatGPT, etc.) on performing comprehensive codebase cleanup and reorganization.

---

## 🎯 Prompt to Use

Copy and paste the following prompt, adjusting the variables in `[BRACKETS]` as needed:

---

**COMPREHENSIVE REPOSITORY CLEANUP REQUEST**

I need a thorough, systematic cleanup of my `[PROJECT_TYPE]` codebase. The cleanup should be **extensive and test-driven**, with builds and verification after each phase.

## Project Context

- **Framework/Language**: `[e.g., Next.js 15 with TypeScript]`
- **Current State**: `[e.g., Working but accumulated technical debt]`
- **Main Issues**: `[e.g., Flat component structure, stray files, unused assets]`

## Cleanup Objectives

Execute a **comprehensive 8-phase cleanup** with the following goals:

### Phase 1: Safe Deletions (Critical Foundation)
- ✅ Find and delete stray development files (notes, temp files, etc.)
- ✅ Remove duplicate files at root that belong in subdirectories
- ✅ Delete empty directories (`lib/`, `utils/`, etc.)
- ✅ Uninstall phantom dependencies (installed but not in package.json)
- ✅ Remove all `.DS_Store`, `Thumbs.db`, and OS-generated files
- ✅ **Test:** Run `npm run build` to verify nothing breaks

### Phase 2: Extract Incomplete Features
- ✅ Identify incomplete feature directories (e.g., `/app/new/` with components but no page)
- ✅ Extract valuable components from incomplete features
- ✅ Move to appropriate locations and update import paths
- ✅ Delete empty/incomplete feature directories
- ✅ **Test:** Run `npm run build` and verify all imports resolve

### Phase 3: Structural Reorganization (Biggest Change)
**Current Issue:** Flat component structure (`20+ files in one directory`)

**Solution:** Feature-based organization:
```
components/
├── layout/           # Navigation, footer, scroll effects
├── modal/            # Modal content components
├── media/            # Images, video, media players
├── effects/          # Visual effects, animations
├── page-specific/    # Large page-specific components
├── forms/            # Form components (if applicable)
├── ui/               # Reusable UI primitives (if applicable)
```

**Actions:**
- ✅ Create feature-based directories
- ✅ Move components to appropriate folders (group by purpose, not by file type)
- ✅ **Update ALL import paths** across entire codebase (~50+ files typically)
- ✅ Use parallel search-and-replace for efficiency
- ✅ Fix relative imports after moves
- ✅ **Test:** Run `npm run build` - TypeScript will catch ALL import errors

### Phase 4: Asset Management
- ✅ Create `/public/[assets]/archive/` directory
- ✅ Search codebase for unused images/assets (grep through all files)
- ✅ Move unused assets to archive (DON'T delete - easy to restore)
- ✅ Clean up OS files (`.DS_Store`, etc.) in public directories
- ✅ **Test:** Visual check - verify all active images still load

### Phase 5: Code Quality Cleanup
- ✅ Remove ALL commented-out code (if it's commented, it should go)
- ✅ Optimize config files:
  - Remove duplicate patterns in `tailwind.config.js` content arrays
  - Clean up empty objects in `next.config.js`
  - Add explanatory comments for non-obvious config
- ✅ Fix naming inconsistencies (e.g., `modalContent.ts` → `modalConfig.ts`)
- ✅ **Test:** Run `npm run build` after each config change

### Phase 6-7: Documentation Improvements
**Add comprehensive inline documentation for:**
- ✅ Complex algorithms and logic (scroll effects, animations)
- ✅ Magic numbers with rationale (why 93% threshold?)
- ✅ Type safety workarounds (`as any` usage - explain why necessary)
- ✅ Non-standard APIs (Network Information API, etc.)
- ✅ Design decisions (binary vs gradual transitions)

**Documentation format:**
```typescript
// ========================================================================
// [SYSTEM NAME]
// ========================================================================
// Design rationale: [Why this approach was chosen]
// - Key point 1
// - Key point 2
//
// How it works:
// 1. Step one
// 2. Step two
// ========================================================================
```

### Phase 8: Update Documentation Files
- ✅ Rewrite `CLAUDE.md` (or equivalent project guide) to reflect:
  - New component organization structure
  - All system architectures (theme, loading, animations)
  - Code quality standards
  - Common patterns and best practices
  - Recent cleanup summary
- ✅ Update component path references with links
- ✅ Add "Recent Cleanup" section documenting changes

## Execution Requirements

### Git Strategy (CRITICAL)
```bash
# Create cleanup branch
git checkout -b cleanup/[DATE]-codebase-reorg

# Commit after EACH phase (5-8 commits total)
# Example commit messages:
# "Phase 1: Clean up stray files and dependencies"
# "Phase 3: Reorganize components into feature-based folders"
# etc.

# Only merge after full verification
```

### Testing Strategy (MANDATORY)
**After each phase:**
- ✅ Run `npm run build` (MUST succeed)
- ✅ Check for TypeScript errors
- ✅ Visual spot-check main routes

**Final comprehensive test:**
```bash
# Clean build
rm -rf .next
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Manual checks
- Visit all main routes
- Test key interactions
- Check console for errors
- Verify images load
```

### Parallel Execution (Performance)
When updating imports in Phase 3:
- ✅ Use **comprehensive search-and-replace** approach
- ✅ Update all imports for each component type in batches
- ✅ Don't update one file at a time (too slow)

## Success Criteria

**Code Health Metrics:**
- [ ] Zero stray files at root
- [ ] Zero empty directories
- [ ] Zero phantom dependencies
- [ ] Feature-based component organization
- [ ] Unused assets archived (not deleted)
- [ ] Zero commented-out code
- [ ] Optimized config files
- [ ] Complex logic documented

**Build Quality:**
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes (warnings OK if intentional)
- [ ] TypeScript strict mode passes
- [ ] All routes accessible
- [ ] All images load correctly
- [ ] No console errors

**Documentation:**
- [ ] Complex logic explained inline
- [ ] Project guide reflects current architecture
- [ ] Cleanup changes documented

## Expected Results

- **Lines of code:** Net reduction (typically 1,000-2,000 lines)
- **Dependencies:** Fewer packages (remove 50-200 phantom deps)
- **Organization:** Scalable to 100+ components
- **Build time:** Same or faster
- **Maintainability:** Significantly improved

## Important Guidelines

### DO:
- ✅ Test after EVERY phase (catch issues early)
- ✅ Commit after each phase (easy rollback)
- ✅ Use TypeScript to catch import errors (it will find ALL of them)
- ✅ Archive assets instead of deleting (safety net)
- ✅ Document why, not just what
- ✅ Use parallel search-and-replace for efficiency

### DON'T:
- ❌ Skip testing between phases
- ❌ Update imports one file at a time (too slow)
- ❌ Delete assets permanently (archive first)
- ❌ Forget to update import paths after moving files
- ❌ Rush - thorough is better than fast

## Communication Style

**I want you to:**
- Use option B (comprehensive search-and-replace) when updating many imports
- Commit after each phase automatically
- Show me build results after each phase
- Give me a final summary of all changes
- Be thorough and systematic, not rushed

---

## 📋 Example Usage

**Simple version:**
> "I want to clean up my Next.js repository using the CLEAN-PROMPT.md guidelines. Please execute all 8 phases with testing after each."

**Customized version:**
> "Follow CLEAN-PROMPT.md but skip Phase 2 (no incomplete features). Focus on Phases 3 (reorganization) and 6-7 (documentation). Test extensively."

**Quick version:**
> "Quick cleanup: Phases 1, 4, and 5 from CLEAN-PROMPT.md only."

---

## 🎯 Success Story Reference

This template is based on a successful cleanup that achieved:
- ✅ **46 files changed** (+916, -2,496 lines = net -1,580 lines)
- ✅ **131 phantom packages removed**
- ✅ **20 components reorganized** into feature folders
- ✅ **50+ import paths updated** successfully
- ✅ **12 unused images archived**
- ✅ **Zero breaking changes**
- ✅ **Build time: 1.4 seconds** (optimized)
- ✅ **5 clean, logical commits**

Total time: ~2 hours for comprehensive cleanup with extensive testing.

---

## 📝 Customization Notes

Adapt this prompt for your project by:
- Adjusting component folder names (layout/, modal/, media/, etc.)
- Specifying your framework/language (Next.js, React, Vue, etc.)
- Listing specific pain points (flat structure, unused code, etc.)
- Setting priority phases (all 8 or just specific ones)
- Defining testing requirements (test suite, manual checks, etc.)

---

## 💡 Pro Tips

1. **Start with a git branch** - Easy rollback if needed
2. **Commit after each phase** - Granular history
3. **Test frequently** - Catch issues early
4. **Archive, don't delete** - Safety net for assets
5. **Document complex logic** - Future self will thank you
6. **Use TypeScript** - It catches ALL import errors automatically
7. **Be patient** - Thorough cleanup takes 1-3 hours but saves months

---

## 🔗 Related Files

- `CLAUDE.md` - Project-specific AI assistant guide
- `README.md` - Project overview and setup
- `.gitignore` - Ensure cleanup artifacts are ignored

---

**Last Updated:** January 2026
**Version:** 1.0
**Tested On:** Next.js 15 + TypeScript project
