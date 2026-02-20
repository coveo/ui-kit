# @coveo/atomic-a11y

**Generated:** 2026-02-17
**Commit:** 56ae711d8
**Branch:** feat/a11y-reporter

## OVERVIEW

Accessibility auditing and reporting package for Coveo Atomic components. Captures axe-core results from Storybook/Vitest tests, maps them to WCAG 2.2 AA criteria, and emits structured JSON reports.

## STRUCTURE

```
atomic-a11y/
├── src/
│   ├── data/           # WCAG criteria definitions + axe-to-WCAG mappings
│   ├── reporter/       # Vitest reporter (main business logic) → see src/reporter/AGENTS.md
│   ├── shared/         # Types, constants, guards, sorting utilities
│   ├── __tests__/      # Empty — tests removed during refactoring
│   └── index.ts        # Public API surface
├── scripts/            # WCAG criteria code generator (fetches W3C JSON)
├── reports/            # Generated a11y report artifacts (JSON)
├── turbo.json          # Turbo task config (build outputs only)
└── package.json        # Private package, ESM ("type": "module")
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Understand the public API | `src/index.ts` | All exported symbols |
| Modify report structure | `src/shared/types.ts` | `A11yReport`, `A11yComponentReport`, `A11yCriterionReport`, `A11ySummary` |
| Change how axe results become WCAG criteria | `src/reporter/axe-integration.ts`, `src/data/axe-rule-mappings.ts` | Tag parsing + prebuilt map |
| Change how the final JSON is assembled | `src/reporter/report-builder.ts` | `buildA11yReport()` — transforms accumulators into `A11yReport` |
| Adjust report output paths/defaults | `src/shared/constants.ts` | `DEFAULT_A11Y_REPORT_OUTPUT_DIR`, `DEFAULT_WCAG_22_AA_CRITERIA_COUNT` (55) |
| Update WCAG criteria data | Run `pnpm generate:wcag` | Auto-generates `src/data/wcag-criteria.ts` from W3C JSON |
| Change component/category extraction | `src/reporter/storybook-extraction.ts` | Regex-based path parsing |
| Read package metadata (versions) | `src/reporter/reporter-utils.ts` | `readPackageMetadata()` reads `package.json` for axe-core/storybook versions |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `VitestA11yReporter` | class | `src/reporter/vitest-a11y-reporter.ts` | Core: implements Vitest `Reporter`, accumulates results, writes JSON |
| `buildA11yReport` | function | `src/reporter/report-builder.ts` | Transforms `Map<string, ComponentAccumulator>` → `A11yReport` |
| `A11yReport` | interface | `src/shared/types.ts` | Root report shape: `{report, components, criteria, summary}` |
| `A11yComponentReport` | interface | `src/shared/types.ts` | Per-component automated results |
| `A11yCriterionReport` | interface | `src/shared/types.ts` | Per-WCAG-criterion coverage/conformance |
| `A11ySummary` | interface | `src/shared/types.ts` | Rollup metrics: counts, coverage percentages |
| `ComponentAccumulator` | interface | `src/reporter/reporter-utils.ts` | Mutable per-component state with `Set<string>` for deduplication |
| `wcagCriteriaDefinitions` | const | `src/data/wcag-criteria.ts` | Auto-generated WCAG 2.2 A+AA criteria (DO NOT EDIT) |
| `getCriterionMetadata` | function | `src/data/criterion-metadata.ts` | Lookup criterion name/level/version by ID |
| `buildAxeRuleCriteriaMap` | function | `src/data/axe-rule-mappings.ts` | Builds `Map<ruleId, criteriaIds[]>` from axe-core rules |
| `isA11yReport` / `isRecord` | function | `src/shared/guards.ts` | Runtime type guards |
| `compareByNumericId` / `compareByName` | function | `src/shared/sorting.ts` | Locale-aware sorting for criteria IDs and component names |

## CONVENTIONS

- **ESM only**: `"type": "module"` — all imports use `.js` extensions even for `.ts` source files
- **No path aliases**: Uses relative imports (no `@/` configured in tsconfig)
- **Strict TypeScript**: `strict: true`, target ES2022, `moduleResolution: NodeNext`
- **`catalog:` versions**: `typescript` and `vitest` use pnpm catalog references (workspace-level pinning)
- **Private package**: Not published (`"private": true`), consumed internally within the monorepo
- **Build = codegen + tsc**: `pnpm build` runs `generate:wcag` first, then `tsc`
- **Reporter never throws**: All Vitest hooks use `try/catch` with `this.warn()` to avoid breaking test runs

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT** manually edit `src/data/wcag-criteria.ts` — it is auto-generated; run `pnpm generate:wcag` instead
- **DO NOT** throw from reporter lifecycle hooks — use `this.warn()` instead
- Conformance values on criteria are always `'notEvaluated'` in automated reports — manual audit sets final conformance
- Stencil components are tracked but `stencilExcluded: true` in summary — Lit is the target framework

## DATA FLOW

```
Storybook Test Run
  → Vitest calls onTestCaseResult() per test case
  → Filter: only project.name.startsWith('storybook')
  → Extract: axe results from meta.reports (populated by @storybook/addon-a11y)
  → Map: axe rules → WCAG criteria via tag parsing (wcagXYZ → X.Y.Z)
  → Accumulate: per-component violations/passes/incomplete/inapplicable + criteria coverage
  → onTestRunEnd(): buildA11yReport() → components[] + criteria[] + summary → write JSON
  → Output: a11y-report.json (+ shard variant if --shard CLI flag)
```

## COMMANDS

```bash
pnpm build              # Generate WCAG data + compile TypeScript
pnpm test               # Run vitest (unit + integration) — currently no test files
pnpm generate:wcag      # Re-fetch WCAG criteria from W3C and regenerate src/data/wcag-criteria.ts
```

## NOTES

- **No tests currently**: `src/__tests__/` is empty — test file was removed during refactoring
- **Shard support**: Only via `--shard=N/M` CLI flag (env var support was removed); writes both `a11y-report.json` and `a11y-report.shard-N.json`
- **Component detection**: Relies on `atomic-*` naming convention in module paths and story IDs; non-atomic components silently skipped
- **Category detection**: Extracted from path segments (`commerce/`, `search/`, `insight/`, `ipx/`, `common/`, `recommendations/`) or story ID prefixes
- **Framework detection**: `.new.stories.tsx` = Lit, `.stories.tsx` = Stencil
- **PR chain**: This package is being built incrementally — see `PR-DEPENDENCY-GRAPH.md` for merge order
- **Report consumers**: Downstream PRs (#7124-#7126) add OpenACR generation, CLI scripts, and wiring into `packages/atomic`
- **Report builder throws**: Unlike the reporter class, `buildA11yReport()` throws if `axe-core` or `storybook` versions are missing from package metadata
