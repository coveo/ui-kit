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
import {VitestA11yReporter} from '@coveo/atomic-a11y';

export default defineConfig({
  test: {
    reporters: [new VitestA11yReporter({outputDir: 'reports'})],
  },
});
```

```ts
// After test run — merge shards (if using --shard)
import {mergeA11yShardReports} from '@coveo/atomic-a11y';

await mergeA11yShardReports({inputDir: 'reports'});
```

```ts
// Generate OpenACR YAML for VPAT
import {transformJsonToOpenAcr} from '@coveo/atomic-a11y';

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

## Manual audits (QA)

Automated tests can't cover every WCAG criterion. For the rest, record results per **surface** — an experience audited as a whole (search, commerce, insight, …), not per component.

1. **Open or create the surface file** — `a11y/reports/manual-audit-{surface}.json`. The `{surface}` label is just how you split the work into manageable files; the VPAT doesn't attach meaning to it.
2. **Add the rules you tested** as `criterion → result`:

   ```json
   {
     "surface": "commerce",
     "wcag22Criteria": {
       "2.4.7-focus-visible": "pass",
       "1.4.3-contrast-minimum": {
         "conformance": "fail",
         "remarks": "Focus ring fails 3:1 on the dark theme."
       }
     }
   }
   ```

   - Result is `pass` | `fail` | `partial` | `not-applicable`, or `{conformance, remarks}` to add a note (the remark shows in the VPAT).
   - Key is `{wcag-id}-{slug}`; the id must be a real WCAG 2.2 A/AA criterion. List only what you tested — omitted criteria stay _Does Not Support [manual audit required]_.
3. **Run `pnpm a11y:vpat`** — regenerates the VPAT and warns on invalid keys.
4. **Commit the file.**

Each criterion's VPAT verdict is the **worst** result across all surface files plus the automated and interactive signals (`fail > partial > pass > not-applicable`). So a manual `fail` surfaces even if axe was clean, and a manual `pass` can't hide a real axe violation. For permanent, by-design exceptions, use `a11y/a11y-overrides.json` (authoritative — it wins outright).

Full reference: [Manual Audit Guide](docs/manual-audit-guide.md).

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
