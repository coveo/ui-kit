# reporter/

Vitest reporter module — main business logic for capturing and aggregating Storybook accessibility test results into WCAG-mapped JSON reports.

## STRUCTURE

```
reporter/
├── vitest-a11y-reporter.ts   # Core class: VitestA11yReporter (implements Vitest Reporter)
├── axe-integration.ts        # Axe results → WCAG criteria bridge
├── error-parsing.ts          # Fallback: extract axe rule IDs from test error text
├── storybook-extraction.ts   # Parse module paths → component name, category, framework
├── reporter-utils.ts         # Helpers: package metadata, date formatting, criterion lookup
├── shard-resolution.ts       # CI shard detection (env vars + CLI args)
└── summary.ts                # Compute A11ySummary from components + criteria
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Understand the main flow | `vitest-a11y-reporter.ts` | `onTestResult()` → accumulate → `onFinished()` → write JSON |
| Change axe-to-WCAG mapping | `axe-integration.ts` | `getCriteriaForRule()` uses tag parsing; `getCriteriaForRuleId()` uses prebuilt map |
| Support new component naming | `storybook-extraction.ts` | `extractComponentName()` — regex patterns match `atomic-*` |
| Add new categories | `storybook-extraction.ts` | `extractCategory()` — hardcoded list: commerce, search, insight, ipx, common, recommendations |
| Handle new CI environments | `shard-resolution.ts` | Add env var pairs for shard index/total |
| Modify summary calculation | `summary.ts` | `createSummary()` — note: `stencilExcluded` is hardcoded `true` |
| Change error fallback parsing | `error-parsing.ts` | Matches `toHaveNoViolations` and `axeapi` patterns in error text |

## KEY TYPES (defined in `../shared/types.ts`)

- `ComponentAccumulator` (local to `reporter-utils.ts`): Mutable accumulator with `Set<string>` for story IDs and criteria — converted to `A11yComponentReport` at build time
- `ShardInfo`: `{ index: number, total: number }` — resolved from env vars or CLI
- `StorybookTaskMeta` / `StorybookReport`: Shape of Vitest test metadata from Storybook addon

## CONVENTIONS

- Functions are pure where possible — side effects isolated to `VitestA11yReporter` class methods
- All WCAG criteria IDs use dotted format: `"1.4.3"` (not `"wcag143"` tag format)
- Error handling: `try/catch` with `this.warn()` — never throws from reporter hooks
- Sorting: `compareByNumericId` for criteria IDs, `compareByName` for component names (from `../shared/sorting.ts`)

## GOTCHAS

- `getCriteriaForRule()` uses `extractCriteriaFromTags(rule.tags)` which parses `wcagXYZ` tag format — the axe rule must have wcag tags or it won't map to any criterion
- `extractComponentName()` returns `null` for non-atomic components — reporter silently skips them
- `seenComponentStoryPairs` deduplicates by `componentName:storyId` — same story processed twice is ignored
- `ANSI_ESCAPE_PATTERN` in `error-parsing.ts` has a biome lint suppression with a TODO to consider `ansi-regex` package
- Shard index normalization: 0-based indices (CircleCI, Buildkite) are converted to 1-based
