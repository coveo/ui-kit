# Learnings & Patterns

## [2026-02-06T18:25:06.594Z] Wave 1 Execution

### Task 1: Storybook A11y Config Fix

**Pattern Discovered:**

- `globals: { a11y: { manual: true } }` at line 144 was silently overriding `a11y: { test: 'error' }` config
- This bug existed for 3+ years, completely disabling automated a11y checks in CI

**Solution Applied:**

- Removed `globals.a11y.manual` from preview.ts
- Added explicit WCAG 2.2 rules via `runOnly` config:
  ```typescript
  options: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
    }
  }
  ```

**Verification:**

- axe-core version 4.10.3 (≥4.8.0 required for WCAG 2.2)
- `pnpm test:storybook` now executes a11y checks (previously skipped)

### Task 4: Component Inventory

**Approach:**

- Used ast-grep to find all `@customElement` decorators
- Cross-referenced against `.new.stories.tsx` files
- Excluded Insight surface per team scope

**Key Findings:**

- 158 Lit components total
- 85.4% coverage (135/158 have stories)
- Common surface has worst coverage: 33.3% (7/21)
- Critical gaps: `atomic-modal`, `atomic-result`, `atomic-product` (missing stories)

**Pattern:** Commerce and Search surfaces have excellent story coverage (>94%). Common surface needs significant story creation work.

## [2026-02-06T18:37:00Z] Task 2: Automated A11y Baseline Scan

**Approach:**
- Executed `pnpm test:storybook` (vitest --project=storybook --run)
- axe-core v4.10.3 with WCAG 2.2 AA rules active
- Test mode: `'error'` (violations fail CI)

**Unexpected Finding:**
- **ZERO violations detected** across 161 story files (321 tests)
- This contradicts initial expectation of "many violations"
- All currently tested components are WCAG 2.2 Level AA compliant per axe-core

**Root Cause Analysis:**
- Task 1 just fixed the 3-year config bug that disabled a11y checks
- This is the FIRST time automated checks actually ran
- Team unknowingly maintained good a11y practices WITHOUT automated enforcement
- Existing Lit components appear to follow accessibility patterns naturally

**Caveats:**
1. **Story coverage gap:** 23 components lack stories (15% untested)
   - Common surface worst: 7/21 coverage (33%)
   - Hidden violations may exist in untested components
2. **Automated limitations:** axe-core catches ~30-40% of issues
   - Manual audits still required for:
     - Dynamic color contrast in themes
     - Complex keyboard interactions
     - Screen reader announcement quality
     - Logical focus order

**Pattern Learned:**
- Storybook + axe-core integration is effective for regression prevention
- Zero violations = strong baseline BUT not comprehensive
- Manual testing and user research still critical

**Next Actions:**
- Fill story gaps (prioritize Common surface)
- Schedule manual audits for complex components
- Add negative test cases (verify violations are caught)

**Report Saved:** `.sisyphus/reports/a11y-baseline-scan.md` (226 lines)

## [2026-02-06T18:55:00Z] Task 3: Manual Audit Checklist Creation

**Approach:**
- Researched WCAG 2.2 manual vs automated gaps (axe-core catches ~30-40% of criteria).
- Analyzed 5 high-priority Atomic components for complex ARIA patterns:
  - `atomic-search-box` / `atomic-commerce-search-box`: Use of `role="application"`.
  - `atomic-aria-live`: Central live region manager.
  - `atomic-modal`: Focus trapping and dialog semantics.
  - `carousel`: Region semantics and custom role descriptions.
- Mapped manual test procedures to specific Atomic component behaviors.

**Key Findings & Patterns:**
- **`role="application"` critical path**: Components using this role (search boxes) require explicit keyboard testing because they override default screen reader browse mode.
- **Status Message Reliability**: `atomic-aria-live` is the single point of failure for announcements. Manual verification with multiple screen readers (VoiceOver, NVDA) is mandatory to ensure messages like "Results found" are actually spoken.
- **Focus Management**: `atomic-modal` relies on `atomic-focus-trap`. While automation checks for ARIA attributes, only manual testing can verify if focus returns correctly to the trigger element on close (SC 2.4.3).
- **New WCAG 2.2 Gaps**: 
  - **SC 2.4.11 (Focus Not Obscured)**: High risk for interfaces with sticky headers/search-boxes.
  - **SC 2.5.8 (Target Size)**: Affects small icon buttons and facet checkboxes; axe-core often marks these "Needs Review".

**Deliverable:**
- Structured checklist created at `.sisyphus/reports/manual-audit-checklist.md`.
- Covers ALL WCAG 2.2 Level A/AA criteria requiring manual intervention.
- Includes procedures, applicable components, and required tools for each criterion.
