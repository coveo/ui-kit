# @coveo/atomic-a11y

Accessibility auditing and reporting for Coveo Atomic components. Captures axe-core results from Storybook/Vitest tests, maps them to WCAG 2.2 AA criteria, and produces structured reports in JSON and [OpenACR](https://github.com/GSA/openacr) YAML (VPAT 2.5).

> This is a **private** internal package — not published to npm.

## Pipeline

```
Storybook tests (axe-core)
  → VitestA11yReporter        → a11y-report.json (per shard)
  → mergeA11yShardReports()   → a11y-report.json (merged)
  → transformJsonToOpenAcr()  → openacr.yaml → VPAT markdown
```

## Usage

```ts
// vitest.config.ts — capture axe results during Storybook tests
import { VitestA11yReporter } from '@coveo/atomic-a11y';

export default defineConfig({
  test: {
    reporters: [new VitestA11yReporter({ outputDir: 'reports' })],
  },
});
```

```ts
// After test run — merge shards (if using --shard)
import { mergeA11yShardReports } from '@coveo/atomic-a11y';

await mergeA11yShardReports({ inputDir: 'reports' });
```

```ts
// Generate OpenACR YAML for VPAT
import { transformJsonToOpenAcr } from '@coveo/atomic-a11y';

await transformJsonToOpenAcr({
  inputFile: 'reports/a11y-report.json',
  outputFile: 'reports/openacr.yaml',
});
```

## Scripts

```bash
pnpm build                # Generate WCAG data + compile TypeScript
pnpm test                 # Run unit tests
pnpm a11y:merge-shards    # Merge shard reports from parallel CI runs
pnpm a11y:vpat            # Generate OpenACR YAML + VPAT markdown
```

## Manual audits

Automated testing covers ~30-40% of WCAG criteria. The rest requires human review. QA creates JSON baseline files that feed into the OpenACR pipeline alongside automated results.

**→ [Manual Audit Guide](docs/manual-audit-guide.md)**

## Structure

```
src/
├── data/           WCAG criteria definitions (auto-generated)
├── reporter/       Vitest reporter + shard merging
├── openacr/        JSON → OpenACR YAML converter
├── shared/         Types, constants, guards, sorting
├── __tests__/      Unit tests
└── index.ts        Public API
```
