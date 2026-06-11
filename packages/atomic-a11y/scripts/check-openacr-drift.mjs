/**
 * check-openacr-drift.mjs
 *
 * CI check: regenerates openacr.yaml from the current a11y-report.json and
 * compares it against the committed version. Fails if they differ, indicating
 * the developer needs to update the committed openacr.yaml.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {transformJsonToOpenAcr} from '../dist/index.js';

const PKG_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const COMMITTED_OPENACR = resolve(PKG_ROOT, 'reports/openacr.yaml');
const GENERATED_OPENACR = resolve(PKG_ROOT, 'reports/openacr.generated.yaml');
const INPUT_REPORT = resolve(
  REPO_ROOT,
  'packages/atomic/reports/a11y-report.json'
);

// Generate fresh openacr from the merged a11y report
await transformJsonToOpenAcr({
  inputFile: INPUT_REPORT,
  outputFile: GENERATED_OPENACR,
});

const committed = readFileSync(COMMITTED_OPENACR, 'utf-8');
const generated = readFileSync(GENERATED_OPENACR, 'utf-8');

if (committed === generated) {
  console.log('✅ openacr.yaml is up to date.');
  process.exit(0);
}

const runId = process.env.GITHUB_RUN_ID ?? '<RUN_ID>';

console.error(`
❌ openacr.yaml is out of date.

The accessibility conformance report (openacr.yaml) generated from the current
test results differs from the committed version. This means WCAG conformance
levels have changed — either a new violation was introduced, a fix improved
conformance, or component coverage changed.

To update, run:

  pnpm --filter @coveo/atomic-a11y a11y:update-openacr -- --run-id=${runId}

This downloads the a11y report from this CI run and regenerates openacr.yaml.
Review the changes, then commit the updated file.
`);
process.exit(1);
