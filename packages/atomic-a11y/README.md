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
pnpm build                # Compile TypeScript (dist/)
pnpm test                 # Run unit tests
```

The `a11y:*` tasks are run through turbo so their `build` dependency runs first
(and is cached — no redundant rebuilds):

```bash
pnpm exec turbo run a11y:merge-shards   --filter=@coveo/atomic-a11y -- ../atomic/reports/a11y-report.json   # Merge shard reports from parallel CI runs
pnpm exec turbo run a11y:vpat           --filter=@coveo/atomic-a11y   # Generate OpenACR YAML + VPAT markdown
pnpm exec turbo run a11y:vpat-pdf       --filter=@coveo/atomic-a11y   # Generate VPAT PDF for CDN (reads committed openacr.yaml)
pnpm exec turbo run a11y:update-openacr --filter=@coveo/atomic-a11y   # Download a11y report from CI and regenerate openacr.yaml
```

## Updating openacr.yaml

The file `reports/openacr.yaml` is committed to the repo and represents the current WCAG conformance baseline. A CI check compares the committed version against what the latest test results would produce. If they differ, the CI fails.

**Why?** This ensures conformance changes are explicit and reviewed. If a PR introduces a new axe-core violation or fixes one, the openacr will drift and the check catches it.

**How to fix a failing check:**

You have two options:

### Option 1: Download from CI (recommended)

This avoids running the full Storybook test suite locally. The CI already ran the tests and produced the report — you just download it:

```bash
pnpm exec turbo run a11y:update-openacr --filter=@coveo/atomic-a11y -- --run-id=<RUN_ID>
```

Replace `<RUN_ID>` with the GitHub Actions run ID from the failing check (shown in the error message). This uses the `gh` CLI to download the `a11y-report.json` artifact and regenerates `openacr.yaml`.

> Requires the [GitHub CLI](https://cli.github.com/) (`gh`) to be installed and authenticated.

### Option 2: Run tests locally

If you prefer to regenerate from scratch:

```bash
cd packages/atomic
pnpm test:storybook          # generates a11y-report.json in packages/atomic/reports/
cd ../..
pnpm exec turbo run a11y:vpat --filter=@coveo/atomic-a11y   # regenerates openacr.yaml from the report
```

---

After either option, review the changes to `reports/openacr.yaml` and commit the updated file. The diff shows which WCAG criteria changed conformance level — make sure the changes are intentional.

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
         "remarks": "Chrome 124, dark theme: focus ring 2.1:1 vs surface (needs 3:1). Repro: Tab to a facet checkbox."
       }
     }
   }
   ```

   - Result is `pass` | `fail` | `partial` | `not-applicable`, or `{conformance, remarks}` to add a note (the remark shows in the VPAT). Put the **AT + browser** you used and a **repro for any fail** in `remarks`.
   - Key is `{wcag-id}-{slug}`; the id must be a real WCAG 2.2 A/AA criterion. List only what you tested — omitted criteria stay _Does Not Support [manual audit required]_.

3. **Run `pnpm exec turbo run a11y:vpat --filter=@coveo/atomic-a11y`** — regenerates the VPAT and warns on invalid keys.
4. **Open a PR** using the [manual-audit PR checklist](docs/manual-audit-guide.md#pr-checklist) (method, environment, criteria audited) and commit the file + regenerated VPAT.

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
