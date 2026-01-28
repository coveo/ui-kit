# Simplify atomic-commerce-interface E2E Tests and Add MSW to Stories

## TL;DR

> **Quick Summary**: Reduce E2E tests from 162 to ~45 lines (keep 2 happy-path integration tests), add MSW mocking to commerce stories to eliminate flakiness, and remove `SearchBeforeInit` stories from both commerce and search interfaces.
> 
> **Deliverables**:
> - Simplified E2E test file (~45 lines, 2 tests)
> - Commerce stories with MSW mocking (no more real API calls)
> - Search stories cleaned up (SearchBeforeInit removed)
> 
> **Estimated Effort**: Short (1-2 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (stories MSW) → Task 3 (E2E simplification)

---

## Context

### Original Request
Simplify the `atomic-commerce-interface` E2E test suite and add MSW mocking to stories to eliminate flakiness. The E2E file has 162 lines with deep tests covering edge cases that are already covered by comprehensive Vitest tests (1423 lines, 106 test cases).

### Interview Summary
**Key Discussions**:
- User confirmed removal of `SearchBeforeInit` story from BOTH commerce and search interfaces
- MSW cleanup should clear ALL 5 commerce endpoints in `beforeEach`
- No new stories needed - pure simplification

**Research Findings**:
- `MockCommerceApi` provides 5 endpoints: search, recommendation, querySuggest, productSuggest, productListing
- `atomic-search-interface.e2e.ts` is the reference pattern (44 lines, 2 tests)
- Vitest already covers: language changes, invalid language handling, URL manager configuration, error states

---

## Work Objectives

### Core Objective
Eliminate E2E test flakiness by adding MSW mocking to stories, and reduce E2E test maintenance burden by removing tests that duplicate Vitest coverage.

### Concrete Deliverables
1. `packages/atomic/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.new.stories.tsx` - With MSW mocking, SearchBeforeInit removed
2. `packages/atomic/src/components/commerce/atomic-commerce-interface/e2e/atomic-commerce-interface.e2e.ts` - Reduced to ~45 lines
3. `packages/atomic/src/components/search/atomic-search-interface/atomic-search-interface.new.stories.tsx` - SearchBeforeInit removed

### Definition of Done
- [ ] `pnpm test --filter=@coveo/atomic` passes
- [ ] Stories render without network errors in Storybook
- [ ] E2E tests pass: `cd packages/atomic && pnpm e2e --grep="atomic-commerce-interface"`
- [ ] No console errors about network requests in Storybook

### Must Have
- MSW mocking with all 5 endpoints cleared in `beforeEach`
- E2E tests follow `atomic-search-interface.e2e.ts` pattern
- Path aliases used for imports (`@/storybook-utils/...`)

### Must NOT Have (Guardrails)
- DO NOT modify Vitest tests (`atomic-commerce-interface.spec.ts`)
- DO NOT add new stories beyond what exists
- DO NOT use `afterEach` for cleanup (causes pollution)
- DO NOT keep E2E tests that duplicate Vitest coverage

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: Tests-after (existing E2E tests validate changes)
- **Framework**: Playwright for E2E, Vitest already comprehensive

### Manual Execution Verification

Each task includes specific verification steps using Storybook and E2E tests.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Add MSW to commerce stories
└── Task 2: Remove SearchBeforeInit from search stories

Wave 2 (After Wave 1):
└── Task 3: Simplify E2E tests (depends on Task 1 - stories must work first)

Critical Path: Task 1 → Task 3
Parallel Speedup: ~30% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2 |
| 2 | None | None | 1 |
| 3 | 1 | None | None (final) |

---

## TODOs

- [x] 1. Add MSW mocking to atomic-commerce-interface stories

  **What to do**:
  1. Import `MockCommerceApi` from `@/storybook-utils/api/commerce/mock`
  2. Create harness instance at module level
  3. Add `msw.handlers` to meta parameters
  4. Add `beforeEach` to clear all 5 endpoints
  5. Remove `SearchBeforeInit` story (lines 84-93)
  6. Update play function to work with mocked responses

  **Must NOT do**:
  - Use `afterEach` instead of `beforeEach` for cleanup
  - Use relative imports instead of path aliases
  - Keep the `SearchBeforeInit` story

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused file modification with clear patterns to follow
  - **Skills**: [`creating-stories`]
    - `creating-stories`: MSW mocking patterns, beforeEach cleanup, commerce harness usage

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `packages/atomic/src/components/recommendations/atomic-recs-interface/atomic-recs-interface.new.stories.tsx:1-60` - Complete MSW integration pattern with MockRecommendationApi, shows harness creation, handler registration, and story structure
  - `packages/atomic/storybook-utils/api/commerce/mock.ts:13-59` - MockCommerceApi class with all 5 endpoints (searchEndpoint, recommendationEndpoint, querySuggestEndpoint, productSuggestEndpoint, productListingEndpoint)

  **Target File Reference**:
  - `packages/atomic/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.new.stories.tsx` - Current file to modify (129 lines), remove lines 84-93 (SearchBeforeInit)

  **Documentation References**:
  - `.github/skills/creating-stories/references/msw-patterns.md` - Advanced MSW patterns including beforeEach cleanup
  - `packages/atomic/storybook-utils/api/README.md` - MSW API mocking utilities documentation

  **Acceptance Criteria**:

  - [ ] `MockCommerceApi` imported and instantiated at module level
  - [ ] `parameters.msw.handlers` includes `...commerceApiHarness.handlers`
  - [ ] `beforeEach` clears all 5 endpoints:
    ```typescript
    beforeEach: () => {
      commerceApiHarness.searchEndpoint.clear();
      commerceApiHarness.recommendationEndpoint.clear();
      commerceApiHarness.querySuggestEndpoint.clear();
      commerceApiHarness.productSuggestEndpoint.clear();
      commerceApiHarness.productListingEndpoint.clear();
    },
    ```
  - [ ] `SearchBeforeInit` story completely removed
  - [ ] Only `Default` and `WithProductList` stories remain
  - [ ] Storybook verification:
    - Navigate to: `http://localhost:4400/?path=/story/atomic-commerce-interface--default`
    - Verify: Story renders without network errors in console
    - Navigate to: `http://localhost:4400/?path=/story/atomic-commerce-interface--with-product-list`
    - Verify: Products display (mocked data)

  **Commit**: YES
  - Message: `fix(atomic): add MSW mocking to commerce interface stories`
  - Files: `packages/atomic/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.new.stories.tsx`
  - Pre-commit: `pnpm lint:check`

---

- [x] 2. Remove SearchBeforeInit story from atomic-search-interface

  **What to do**:
  1. Remove the `SearchBeforeInit` export (lines 83-92 in current file)
  2. Verify no other code references this story

  **Must NOT do**:
  - Remove any other stories
  - Modify the meta configuration
  - Add MSW to this file (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, single deletion - very focused change
  - **Skills**: None needed - straightforward deletion

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Target File Reference**:
  - `packages/atomic/src/components/search/atomic-search-interface/atomic-search-interface.new.stories.tsx:83-92` - Lines to remove (SearchBeforeInit story)

  **Verification Reference**:
  - `packages/atomic/src/components/search/atomic-search-interface/e2e/atomic-search-interface.e2e.ts` - Verify no E2E tests reference `search-before-init` story

  **Acceptance Criteria**:

  - [ ] `SearchBeforeInit` export removed from file
  - [ ] Only `Default` and `WithAResultList` stories remain
  - [ ] File reduced from 126 lines to ~115 lines
  - [ ] Storybook verification:
    - Navigate to: `http://localhost:4400/?path=/docs/atomic-search-interface--docs`
    - Verify: Only 2 stories listed (Default, With a Result List)
  - [ ] Grep verification: `grep -r "search-before-init" packages/atomic/src/` returns no E2E test references

  **Commit**: YES
  - Message: `chore(atomic): remove unused SearchBeforeInit story from search interface`
  - Files: `packages/atomic/src/components/search/atomic-search-interface/atomic-search-interface.new.stories.tsx`
  - Pre-commit: `pnpm lint:check`

---

- [x] 3. Simplify atomic-commerce-interface E2E tests

  **What to do**:
  1. Remove entire `when search has not been initialized` describe block (lines 6-33)
  2. Keep only 2 tests in `when a query is performed automatically`:
     - `should set the language of the interface` (lines 43-53)
     - `should update the url` when facet selected (lines 125-137)
  3. Remove all other language tests (lines 55-120)
  4. Remove `when disable-state-reflection-in-url is true` block (lines 139-158)
  5. Restructure to match `atomic-search-interface.e2e.ts` pattern

  **Must NOT do**:
  - Modify the fixture or page object
  - Keep edge case tests covered by Vitest
  - Change the story names referenced in tests

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Deletion-focused task with clear keep/remove criteria
  - **Skills**: None needed - straightforward E2E test cleanup

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 1 (stories must have MSW before E2E tests run reliably)

  **References**:

  **Pattern References** (target structure to follow):
  - `packages/atomic/src/components/search/atomic-search-interface/e2e/atomic-search-interface.e2e.ts:1-44` - Complete reference implementation showing ideal E2E structure (44 lines, 2 tests, clean nesting)

  **Target File Reference**:
  - `packages/atomic/src/components/commerce/atomic-commerce-interface/e2e/atomic-commerce-interface.e2e.ts` - Current file (162 lines)
    - KEEP: lines 35-53 (beforeEach + language test) - restructure
    - KEEP: lines 123-137 (URL reflection test) - restructure
    - REMOVE: lines 6-33 (search before init)
    - REMOVE: lines 55-120 (edge case language tests)
    - REMOVE: lines 139-158 (disable URL reflection)

  **Fixture Reference** (no changes needed):
  - `packages/atomic/src/components/commerce/atomic-commerce-interface/e2e/fixture.ts` - Page object and fixtures
  - `packages/atomic/src/components/commerce/atomic-commerce-interface/e2e/page-object.ts` - Helper methods (getFacetValue, searchBox, getBreadcrumbButtons)

  **Expected Final Structure**:
  ```typescript
  test.describe('atomic-commerce-interface', () => {
    test.describe('when a query is performed automatically', () => {
      test.beforeEach(async ({commerceInterface}) => {
        await commerceInterface.load({story: 'with-product-list'});
      });

      test.describe('when a language is provided', () => {
        test('should set the language of the interface', async ({commerceInterface}) => {
          // Load with fr language, verify French placeholder
        });
      });

      test.describe('when selecting a facet value', () => {
        test('should update the url', async ({page, commerceInterface}) => {
          // Click facet, verify URL contains value
        });
      });
    });
  });
  ```

  **Acceptance Criteria**:

  - [ ] File reduced from 162 lines to ~45 lines
  - [ ] Only 2 tests remain:
    1. `should set the language of the interface`
    2. `should update the url`
  - [ ] No references to `search-before-init` story
  - [ ] E2E test execution:
    ```bash
    cd packages/atomic && pnpm e2e --grep="atomic-commerce-interface"
    ```
    Expected: 2 tests pass
  - [ ] Test structure matches `atomic-search-interface.e2e.ts` pattern

  **Commit**: YES
  - Message: `refactor(atomic): simplify commerce interface E2E tests to happy path only`
  - Files: `packages/atomic/src/components/commerce/atomic-commerce-interface/e2e/atomic-commerce-interface.e2e.ts`
  - Pre-commit: `pnpm lint:check`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(atomic): add MSW mocking to commerce interface stories` | atomic-commerce-interface.new.stories.tsx | Storybook renders |
| 2 | `chore(atomic): remove unused SearchBeforeInit story from search interface` | atomic-search-interface.new.stories.tsx | Storybook renders |
| 3 | `refactor(atomic): simplify commerce interface E2E tests to happy path only` | atomic-commerce-interface.e2e.ts | E2E tests pass |

---

## Success Criteria

### Verification Commands
```bash
# Storybook visual verification (run in separate terminal)
cd packages/atomic && pnpm storybook

# E2E tests for commerce interface
cd packages/atomic && pnpm e2e --grep="atomic-commerce-interface"
# Expected: 2 tests pass

# Lint check
pnpm lint:check
# Expected: No errors

# Unit tests still pass
pnpm test --filter=@coveo/atomic
# Expected: All tests pass
```

### Final Checklist
- [ ] Commerce stories use MSW (no real API calls)
- [ ] `SearchBeforeInit` removed from both commerce and search stories
- [ ] E2E tests reduced to 2 happy-path integration tests
- [ ] All existing Vitest tests still pass (unchanged)
- [ ] Storybook renders without network errors
- [ ] E2E tests pass reliably (no flakiness)

---

## Risk Assessment

### Potential Issues

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| MSW handlers don't intercept correctly | Low | High | Verify endpoint paths match actual API calls; check browser Network tab in Storybook |
| E2E tests fail after story changes | Medium | Medium | Run E2E tests after Task 1 completes before proceeding to Task 3 |
| Stories show wrong data in Docs mode | Low | Low | Each story inherits meta `beforeEach`; no story-level mocking needed for defaults |
| Removing SearchBeforeInit breaks something | Very Low | Low | Grep for references before removal; the story has `!dev` tag indicating test-only |

### Rollback Strategy
Each task creates an independent commit. If issues arise:
1. `git revert <commit-hash>` for the problematic change
2. Investigate root cause
3. Re-apply with fixes

### Dependencies on External Factors
- Storybook dev server must be running for visual verification
- MSW addon must be configured in Storybook (already set up in this repo)
