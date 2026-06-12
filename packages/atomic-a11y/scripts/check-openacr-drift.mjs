/**
 * check-openacr-drift.mjs
 *
 * CI check: regenerates openacr.yaml from the current a11y-report.json and
 * compares it against the committed version. Fails if they differ, indicating
 * the developer needs to update the committed openacr.yaml.
 */
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {transformJsonToOpenAcr} from '../dist/index.js';
import {formatWithOxfmt} from './format-with-oxfmt.mjs';

const PKG_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const COMMITTED_OPENACR = resolve(PKG_ROOT, 'reports/openacr.yaml');
const GENERATED_OPENACR = resolve(PKG_ROOT, 'reports/openacr.generated.yaml');

if (!existsSync(COMMITTED_OPENACR)) {
  console.log('⏭️  No committed openacr.yaml found. Skipping check.');
  process.exit(0);
}
const INPUT_REPORT = resolve(
  REPO_ROOT,
  'packages/atomic/reports/a11y-report.json'
);

if (!existsSync(INPUT_REPORT)) {
  console.log('⏭️  No a11y-report.json found. Skipping drift check.');
  process.exit(0);
}

// Generate fresh openacr from the merged a11y report
await transformJsonToOpenAcr({
  inputFile: INPUT_REPORT,
  outputFile: GENERATED_OPENACR,
});
// Format the same way the committed file is formatted (see update-openacr /
// json-to-openacr), otherwise the comparison would flag formatting differences.
formatWithOxfmt(GENERATED_OPENACR);

// `report_date` and `last_modified_date` are regenerated to the current date on
// every run, so a raw comparison would fail daily even with no conformance
// change. Neutralize those volatile fields (value and quote style) before
// comparing so the check only reacts to real conformance/coverage changes.
const VOLATILE_FIELDS = ['report_date', 'last_modified_date'];
function normalize(yaml) {
  return VOLATILE_FIELDS.reduce(
    (acc, field) =>
      acc.replace(new RegExp(`^(\\s*${field}:).*$`, 'm'), '$1 <normalized>'),
    yaml
  );
}

const committed = readFileSync(COMMITTED_OPENACR, 'utf-8');
const generated = readFileSync(GENERATED_OPENACR, 'utf-8');

if (normalize(committed) === normalize(generated)) {
  console.log('✅ openacr.yaml is up to date.');
  process.exit(0);
}

const runId = process.env.GITHUB_RUN_ID ?? '<RUN_ID>';

console.error(`
❌ openacr.yaml is out of date.

The accessibility conformance report (openacr.yaml) generated from the current
test results differs from the committed version. This means WCAG conformance
levels have changed. Either a new violation was introduced, a fix improved
conformance, or component coverage changed.

To update, run:

  pnpm exec turbo run a11y:update-openacr --filter=@coveo/atomic-a11y -- --run-id=${runId}

Then review the changes and commit the updated openacr.yaml.

Details: https://github.com/coveo/ui-kit/blob/main/packages/atomic-a11y/README.md#updating-openacryaml
`);
process.exit(1);
