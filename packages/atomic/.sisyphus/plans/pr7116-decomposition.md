# Decompose PR 7116 — Restructure atomic-a11y for Readability

## TL;DR

Quick Summary: Restructure the atomic-a11y package source code to decompose 6 monolithic files into well-organized small modules with centralized WCAG data, shared utilities, and clear module boundaries. Convert scripts from .mjs to .ts. No behavior changes — pure structural refactoring.

Deliverables: Shared foundation modules (types, guards, WCAG data, file I/O utilities, YAML serializer), decomposed reporter (vitest-a11y-reporter.ts split into 4 modules), decomposed OpenACR converter (json-to-openacr.ts split into 5 modules), converted scripts (3 .mjs to .ts), updated tests, updated barrel exports.

Estimated Effort: Medium. Parallel Execution: YES — 3 waves. Critical Path: Task 1 then Tasks 2-5 (parallel) then Task 6 then Task 7.

## Context

### Prerequisites

Before starting any task, you MUST be on the PR branch. Run:

```bash
git checkout feat/a11y-reporter-and-scripts
```

All source files referenced in this plan exist on that branch under packages/atomic-a11y/. The branch currently has these files:

- packages/atomic-a11y/src/reporter/json-to-openacr.ts (1,465 lines)
- packages/atomic-a11y/src/reporter/vitest-a11y-reporter.ts (994 lines)
- packages/atomic-a11y/src/reporter/merge-shards.ts (355 lines)
- packages/atomic-a11y/src/index.ts (18 lines)
- packages/atomic-a11y/src/**tests**/json-to-openacr.spec.ts (332 lines)
- packages/atomic-a11y/src/**tests**/merge-shards.spec.ts (251 lines)
- packages/atomic-a11y/src/**tests**/vitest-a11y-reporter.spec.ts (178 lines)
- packages/atomic-a11y/scripts/ai-wcag-audit.mjs (1,201 lines)
- packages/atomic-a11y/scripts/generate-a11y-issues.mjs (504 lines)
- packages/atomic-a11y/scripts/manual-audit-delta.mjs (486 lines)

PR 7116 adds +6,083 lines across 20 files. Source files are massive (1465/1201/994 lines), contain significant code duplication, and embed 500+ lines of WCAG reference data inline. Goal: restructure for readability while keeping PR as single PR.

Key findings: isRecord() copied 4 times, isA11yReport() 2 times, BASELINE_FILE_PATTERN 2 times, VALID_STATUSES 2 times, CriterionLevel type 2 times (incompatible definitions). wcagCriteriaDefinitions = 400 lines of pure data. Monorepo uses barrel exports, domain-driven folders, max file 480-580 lines.

## Must Have

- All existing exported types and functions remain accessible from src/index.ts
- Runtime behavior identical — pure structural refactoring
- Every module has clear single responsibility
- Shared WCAG data is single source of truth

## Must NOT Have (Guardrails)

- No behavior changes
- No new dependencies (keep YAML serializer hand-rolled)
- No changes to public API surface
- No renaming of exported symbols
- No scope creep into other a11y PRs
- Do not refactor test assertions

## Proposed New Directory Structure

```
packages/atomic-a11y/src/
├── index.ts
├── shared/
│   ├── types.ts
│   ├── guards.ts
│   ├── constants.ts
│   └── file-utils.ts
├── data/
│   ├── wcag-criteria.ts
│   ├── axe-rule-mappings.ts
│   └── criterion-metadata.ts
├── reporter/
│   ├── vitest-a11y-reporter.ts
│   ├── reporter-utils.ts
│   ├── axe-integration.ts
│   └── merge-shards.ts
├── openacr/
│   ├── types.ts
│   ├── overrides.ts
│   ├── manual-audit.ts
│   ├── conformance.ts
│   ├── report-builder.ts
│   ├── yaml-serializer.ts
│   └── json-to-openacr.ts
├── scripts/
│   ├── ai-wcag-audit.ts
│   ├── generate-a11y-issues.ts
│   └── manual-audit-delta.ts
└── __tests__/
    ├── vitest-a11y-reporter.spec.ts
    ├── merge-shards.spec.ts
    └── json-to-openacr.spec.ts
```

## Execution Waves

Wave 1: Task 1 — Extract shared foundation (types, guards, constants, data modules)
Wave 2: Tasks 2-5 in parallel — Decompose reporter, OpenACR, merge-shards imports, convert scripts
Wave 3: Tasks 6-7 sequential — Update tests, update barrel exports and verify

## TODOs

### Task 1: Extract Shared Foundation Modules

What to do:

- Create src/shared/types.ts: Move shared types (A11yReport, CriterionLevel unified to superset, WCAGVersion, etc.)
- Create src/shared/guards.ts: Deduplicate isRecord() and isA11yReport()
- Create src/shared/constants.ts: Deduplicate DEFAULT\_\*, BASELINE_FILE_PATTERN, DELTA_PATTERN, VALID_STATUSES, VALID_WCAG_KEYS, ALL_AI_CRITERIA
- Create src/shared/file-utils.ts: Deduplicate readJsonFile() and wasExecutedDirectly()
- Create src/data/wcag-criteria.ts: Move wcagCriteriaDefinitions (56 entries)
- Create src/data/axe-rule-mappings.ts: Move ruleToWCAG, buildAxeRuleCriteriaMap()
- Create src/data/criterion-metadata.ts: Move criterionMetadataMap, getCriterionMetadata()

References: vitest-a11y-reporter.ts:15-290, json-to-openacr.ts:36-537, merge-shards.ts:41-57, scripts/\*.mjs
Acceptance: tsc passes, isRecord() in exactly 1 file, no file over 400 lines.
Agent: category=unspecified-high. Wave 1. Blocks: 2,3,4,5.
Commit: refactor(atomic-a11y): extract shared types, guards, constants and WCAG data modules

### Task 2: Decompose vitest-a11y-reporter.ts

What to do:

- Create src/reporter/reporter-utils.ts: Extract utility functions (lines 305-620) and internal types (lines 183-304)
- Create src/reporter/axe-integration.ts: Extract isAxeResults(), getCriteriaForRule(), getCriteriaForRuleId()
- Slim vitest-a11y-reporter.ts to VitestA11yReporter class only (~372 lines)

References: vitest-a11y-reporter.ts:183-994
Acceptance: All files under 400 lines, tsc passes.
Agent: category=unspecified-high. Wave 2. Blocks: 6.
Commit: refactor(atomic-a11y): decompose vitest-a11y-reporter into focused modules

### Task 3: Decompose json-to-openacr.ts

What to do:

- Create src/openacr/types.ts, overrides.ts, manual-audit.ts, conformance.ts, report-builder.ts, yaml-serializer.ts
- Slim json-to-openacr.ts to orchestrator + CLI (~100-150 lines)

References: json-to-openacr.ts full file (1,465 lines)
Acceptance: json-to-openacr.ts under 200 lines, no file over 400 lines, tsc passes.
Agent: category=unspecified-high. Wave 2. Blocks: 6.
Commit: refactor(atomic-a11y): decompose json-to-openacr into focused openacr modules

### Task 4: Update merge-shards.ts Imports

What to do: Update imports only — remove local guards, import from shared/.
Acceptance: No local isRecord/isA11yReport definitions remain.
Agent: category=quick. Wave 2. Blocks: 6.
Commit: refactor(atomic-a11y): update merge-shards imports to use shared modules

### Task 5: Convert Scripts from .mjs to .ts

What to do: Convert 3 scripts to TypeScript with types, replace duplicated code with shared imports, delete old .mjs files.
Acceptance: No .mjs files remain, 3 .ts files exist, no duplicate constants, tsc passes.
Agent: category=unspecified-high. Wave 2. Blocks: 6.
Commit: refactor(atomic-a11y): convert scripts from .mjs to .ts with shared imports

### Task 6: Update Tests

What to do: Update imports in 3 test files. Run tests.
Acceptance: npx vitest run — all tests pass.
Agent: category=quick. Wave 3. Blocks: 7.
Commit: refactor(atomic-a11y): update test imports for new module structure

### Task 7: Update Barrel Exports and Final Verification

What to do: Update src/index.ts exports, run full verification.
Acceptance: build succeeds, tests pass, no file over 400 lines, public API unchanged.
Agent: category=quick. Wave 3. Final task.
Commit: refactor(atomic-a11y): update barrel exports and verify complete restructuring

## Success Criteria

Verification Commands:

- npx tsc --noEmit --project packages/atomic-a11y/tsconfig.json (exit 0)
- cd packages/atomic-a11y && npx vitest run (all tests pass)
- pnpm build --filter=@coveo/atomic-a11y (exit 0)
- grep -rcn "function isRecord" packages/atomic-a11y/src/ (1 match)
- find packages/atomic-a11y/src -name "\*.ts" -exec wc -l {} + (no file > 400 lines)

Final Checklist:

- [ ] Public API unchanged
- [ ] No behavior changes, no new deps, no renamed exports
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No file over 400 lines
- [ ] Zero code duplication for guards/types/constants
- [ ] WCAG data in exactly 1 location per data type
- [ ] All scripts converted from .mjs to .ts
