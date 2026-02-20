# reporter/

Vitest reporter module — main business logic for capturing and aggregating Storybook accessibility test results into WCAG-mapped JSON reports.

## STRUCTURE

```
reporter/
├── vitest-a11y-reporter.ts   # Core class: VitestA11yReporter (implements Vitest Reporter)
├── report-builder.ts         # Transforms ComponentAccumulator map → A11yReport JSON
├── axe-integration.ts        # Axe results → WCAG criteria bridge
├── storybook-extraction.ts   # Parse module paths → component name, category, framework
├── reporter-utils.ts         # Helpers: package metadata, date formatting, criterion lookup
├── shard-resolution.ts       # CLI --shard flag parsing
└── summary.ts                # Compute A11ySummary from components + criteria
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Understand the main flow | `vitest-a11y-reporter.ts` | `onTestCaseResult()` → accumulate → `onTestRunEnd()` → write JSON |
| Change how the final report is assembled | `report-builder.ts` | `buildA11yReport()` — builds components[], criteria[], summary |
| Change axe-to-WCAG mapping | `axe-integration.ts` | `getCriteriaForRule()` uses tag parsing via `extractCriteriaFromTags()` |
| Support new component naming | `storybook-extraction.ts` | `extractComponentName()` — regex patterns match `atomic-*` |
| Add new categories | `storybook-extraction.ts` | `extractCategory()` — hardcoded list: commerce, search, insight, ipx, common, recommendations |
| Handle new CI shard flags | `shard-resolution.ts` | Parses `--shard=N/M` from `process.argv` |
| Modify summary calculation | `summary.ts` | `createSummary()` — note: `stencilExcluded` is hardcoded `true` |
| Read product/tool versions | `reporter-utils.ts` | `readPackageMetadata()` — reads `package.json` for versions used in report metadata |

## KEY TYPES

- `ComponentAccumulator` (in `reporter-utils.ts`): Mutable accumulator with `Set<string>` for story IDs and criteria — converted to `A11yComponentReport` at build time
- `PackageMetadata` (in `reporter-utils.ts`): Shape of `package.json` fields used for report metadata (version, dependencies)
- `ShardInfo` (in `shard-resolution.ts`): `{ index: number, total: number }` — parsed from CLI `--shard` flag
- `StorybookTaskMeta` / `StorybookReport` (in `reporter-utils.ts`): Shape of Vitest test metadata from Storybook addon
- `A11yReporterOptions` (in `vitest-a11y-reporter.ts`): Constructor config — outputDir, outputFilename, totalCriteria, packageJsonPath

## CONVENTIONS

- Functions are pure where possible — side effects isolated to `VitestA11yReporter` class methods
- All WCAG criteria IDs use dotted format: `"1.4.3"` (not `"wcag143"` tag format)
- Error handling: reporter hooks use `try/catch` with `this.warn()` — never throws from lifecycle methods
- `report-builder.ts` **does throw** if axe-core or storybook versions are missing from package metadata
- Sorting: `compareByNumericId` for criteria IDs, `compareByName` for component names (from `../shared/sorting.ts`)
- Deduplication: `component.storyIds` Set prevents processing the same story twice per component

## GOTCHAS

- `getCriteriaForRule()` parses `wcagXYZ` tag format from `rule.tags` — axe rules without wcag tags won't map to any criterion
- `extractComponentName()` returns `null` for non-atomic components — reporter silently skips them
- Shard resolution only reads CLI `--shard` flag (no env var support) — returns `null` if not present
- `buildA11yReport()` hardcodes `product: 'Coveo Atomic'` and `evaluationMethods` array — not configurable
