# Draft: PR #7123 Review & Maintainability Improvements

## PR Overview
- **Title**: feat(atomic-a11y): add vitest a11y reporter and merge-shards
- **Size**: +1632 lines, 0 deletions, 12 files
- **PR Chain**: 3 of 6 (builds on shared foundation, feeds into OpenACR generator)

## File Inventory (by size)

| File | Lines | Role |
|------|-------|------|
| vitest-a11y-reporter.ts | 441 | Main reporter class + type re-exports + test utils |
| reporter-utils.ts | 338 | Utility grab-bag (shard, extraction, format, errors) |
| merge-shards.ts | 329 | Shard merging logic + CLI entry point + test utils |
| merge-shards.spec.ts | 252 | Tests for merge-shards |
| vitest-a11y-reporter.spec.ts | 175 | Tests for reporter + axe-integration |
| axe-integration.ts | 44 | Axe result type guard + criteria mapping |
| axe-rule-mappings.ts | 27 | WCAG tag parsing from axe-core |
| index.ts | 28 | Public barrel exports |
| file-utils.ts | 14 | wasExecutedDirectly() |
| constants.ts | 6 | Shared constants |

## Identified Issues

### 1. Duplicated Summary/buildSummary Logic
- `VitestA11yReporter.buildSummary()` (lines 337-374) and `merge-shards.createSummary()` (lines 68-107) are nearly identical
- Both compute lit/stencil counts, story totals, coverage percentages

### 2. Duplicated Type Re-exports
- `vitest-a11y-reporter.ts` re-exports types from `../shared/types.ts` (lines 50-61)
- `merge-shards.ts` imports these types FROM `vitest-a11y-reporter.ts` instead of directly from `../shared/types.ts`
- This creates a dependency: merge-shards → vitest-a11y-reporter → shared/types
- Should be: both → shared/types directly

### 3. `reporter-utils.ts` is a "God Utility" File
- 338 lines with 7+ exported functions spanning unrelated concerns:
  - Shard resolution (CI env vars, CLI parsing)
  - Component name/category/framework extraction (Storybook-specific)
  - Error text extraction + ANSI stripping
  - A11y rule ID extraction from test errors
  - Date formatting
  - Package metadata reading
  - Coverage percentage calculation
- No single responsibility

### 4. `*TestUtils` Export Pattern
- `vitestA11yReporterTestUtils` (vitest-a11y-reporter.ts:433-440) re-exports functions from reporter-utils
- `mergeShardsTestUtils` (merge-shards.ts:236-240) exports private functions for testing
- This is a code smell: functions are private for encapsulation but exposed for testing
- Tests access buildReport() via unsafe cast: `(reporter as unknown as {buildReport: () => A11yReport}).buildReport()`

### 5. Constants Imported via Re-exports
- merge-shards.ts imports DEFAULT_* constants from vitest-a11y-reporter.ts (line 13-16)
- vitest-a11y-reporter.ts imports them from shared/constants.ts and re-exports
- Both should import directly from shared/constants.ts

### 6. Sorting Logic Duplicated
- `sortByNumericIdentifier` in merge-shards.ts
- Inline `.localeCompare(b, 'en-US', {numeric: true})` used 5+ times across reporter and merge-shards
- Should be a shared utility

## Dependency Graph (Current)

```
index.ts
├── data/criterion-metadata.js
├── data/wcag-criteria.js
├── reporter/merge-shards.js
│   ├── shared/file-utils.js
│   ├── shared/guards.js
│   └── reporter/vitest-a11y-reporter.js  ← imports types + constants from here
│       ├── shared/constants.js
│       ├── shared/types.js
│       ├── reporter/axe-integration.js
│       │   ├── data/axe-rule-mappings.js
│       │   └── shared/guards.js
│       └── reporter/reporter-utils.js
│           └── data/criterion-metadata.js
├── shared/constants.js
├── shared/guards.js
└── shared/types.js
```

**Problem**: merge-shards depends on vitest-a11y-reporter for types and constants, 
creating tight coupling between peer modules.

## Open Questions
- Does the user want to restructure the PR, or create follow-up PRs?
- Is the `*TestUtils` pattern intentional/preferred vs. making functions public?
- How much refactoring appetite is there vs. shipping as-is?
