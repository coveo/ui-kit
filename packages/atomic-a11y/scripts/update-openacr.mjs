/**
 * update-openacr.mjs
 *
 * Downloads the a11y-report.json from a CI run and regenerates openacr.yaml.
 * Usage: node scripts/update-openacr.mjs --run-id=<GITHUB_RUN_ID>
 */
import {execSync} from 'node:child_process';
import {resolve} from 'node:path';
import {transformJsonToOpenAcr} from '../dist/index.js';

const PKG_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const REPORT_PATH = resolve(
  REPO_ROOT,
  'packages/atomic/reports/a11y-report.json'
);

const runId = process.argv
  .find((a) => a.startsWith('--run-id='))
  ?.split('=')[1];
if (!runId) {
  console.error(
    'Usage: pnpm --filter @coveo/atomic-a11y a11y:update-openacr --run-id=<RUN_ID>'
  );
  process.exit(1);
}

console.log(`[update-openacr] Downloading a11y report from run ${runId}...`);
execSync(
  `gh run download ${runId} -n atomic-storybook-a11y-report -D packages/atomic/reports`,
  {cwd: REPO_ROOT, stdio: 'inherit'}
);

console.log('[update-openacr] Regenerating openacr.yaml...');
await transformJsonToOpenAcr({
  inputFile: REPORT_PATH,
  outputFile: resolve(PKG_ROOT, 'reports/openacr.yaml'),
});

console.log(
  '[update-openacr] ✓ Done. Review and commit packages/atomic-a11y/reports/openacr.yaml'
);
