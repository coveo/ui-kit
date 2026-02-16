# @coveo/atomic-a11y

**Generated:** 2026-02-16 | **Commit:** 0b3caf0f0 | **Branch:** feat/a11y-reporter

## OVERVIEW

Automated WCAG 2.2 AA accessibility auditing for Coveo Atomic components. Captures axe-core results from Storybook tests via a custom Vitest reporter, produces JSON reports per component/criterion, and supports CI shard merging.

## STRUCTURE

```
src/
├── data/          # Static WCAG criteria definitions + axe-core rule mappings
├── reporter/      # VitestA11yReporter + shard merge logic (core of the package)
├── shared/        # Types, constants, guards, file utils
└── __tests__/     # Vitest specs for reporter and merge-shards
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/modify WCAG criteria | `src/data/wcag-criteria.ts` | Static array of 50 AA criteria definitions |
| Change axe-core rule → WCAG mapping | `src/data/axe-rule-mappings.ts` | Uses `axe-core` API at import time to build map |
| Modify report output shape | `src/shared/types.ts` | All report interfaces defined here |
| Change reporter behavior | `src/reporter/vitest-a11y-reporter.ts` | Main `VitestA11yReporter` class (implements Vitest `Reporter`) |
| Extract component/category from stories | `src/reporter/reporter-utils.ts` | Regex-based extraction from story paths and IDs |
| Fix shard merging | `src/reporter/merge-shards.ts` | Merges per-shard JSON into unified report |
| Add new export | `src/index.ts` | Barrel file — all public API here |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `VitestA11yReporter` | class | `reporter/vitest-a11y-reporter.ts` | Core: captures axe results per Storybook test, writes JSON report |
| `mergeA11yShardReports` | function | `reporter/merge-shards.ts` | Merges shard-N.json files into single report (CI parallelism) |
| `A11yReport` | interface | `shared/types.ts` | Top-level report shape: metadata + components + criteria + summary |
| `A11yComponentReport` | interface | `shared/types.ts` | Per-component axe results (violations, passes, coverage) |
| `A11yCriterionReport` | interface | `shared/types.ts` | Per-WCAG-criterion conformance status |
| `buildAxeRuleCriteriaMap` | function | `data/axe-rule-mappings.ts` | Builds `ruleId → WCAG criteria[]` map from axe-core metadata |
| `wcagCriteriaDefinitions` | const | `data/wcag-criteria.ts` | Static array of all 50 WCAG 2.2 AA success criteria |
| `ComponentAccumulator` | interface | `reporter/reporter-utils.ts` | Internal mutable accumulator (Set-based) during report building |

## CONVENTIONS

- **ESM only** — `"type": "module"` in package.json; all internal imports use `.js` extension
- **No path aliases** — tsconfig has no `paths`; use relative imports everywhere
- **Strict TypeScript** — `strict: true`, `moduleResolution: "NodeNext"`
- **Test utils exported from source** — `vitestA11yReporterTestUtils` and `mergeShardsTestUtils` are exported objects exposing internal functions for testing (not ideal, but intentional pattern)
- **Locale-aware sorting** — All sort comparisons use `localeCompare('en-US', {numeric: true})`
- **Storybook naming conventions** — Component extraction relies on `atomic-*` naming in paths and story IDs

## ANTI-PATTERNS

- **Do NOT add path aliases** — this package uses relative imports; no `@/` prefix
- **Do NOT import from `dist/`** — always import from `src/` in tests
- **Do NOT use `as any`** — the codebase uses `as never` for test mocks where type coercion is needed
- **Do NOT modify `wcag-criteria.ts` without updating `DEFAULT_WCAG_22_AA_CRITERIA_COUNT`** in `shared/constants.ts` — they must stay in sync
- **Do NOT break the `.js` extension convention** — NodeNext resolution requires explicit `.js` in all relative imports

## COMMANDS

```bash
pnpm build          # tsc -p tsconfig.json → dist/
pnpm test           # vitest run
pnpm a11y:merge-shards  # npx tsx src/reporter/merge-shards.ts (CLI entry)
```

## NOTES

- Package is `private: true` — not published to npm, consumed internally by `packages/atomic`
- The reporter detects Storybook projects via `testCase.project.name.startsWith('storybook')`
- Framework detection: `.new.stories.tsx` = Lit, `.stories.tsx` = Stencil
- Shard detection reads from env vars: `A11Y_REPORT_SHARD`, `VITEST_SHARD`, `CI_NODE_INDEX`, `--shard` CLI arg
- `axeRuleCriteriaMap` is built once at module load from `axe-core.getRules()` — import side effect
- PR dependency chain documented in `PR-DEPENDENCY-GRAPH.md` — merge PRs in order
