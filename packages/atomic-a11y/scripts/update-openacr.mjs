/**
 * update-openacr.mjs
 *
 * Downloads the a11y-report.json from a CI run and regenerates openacr.yaml.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {transformJsonToOpenAcr} from '../dist/index.js';
import {formatWithOxfmt} from './format-with-oxfmt.mjs';

const PKG_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const REPORT_PATH = resolve(REPO_ROOT, 'packages/atomic/reports/a11y-report.json');

const runId = process.argv.find((a) => a.startsWith('--run-id='))?.split('=')[1];
const allowCoverageDrop = process.argv.includes('--allow-coverage-drop');
if (!runId) {
  console.error(
    'Usage: pnpm exec turbo run a11y:update-openacr --filter=@coveo/atomic-a11y -- --run-id=<RUN_ID>'
  );
  process.exit(1);
}

console.log(`[update-openacr] Downloading a11y report from run ${runId}...`);
rmSync(REPORT_PATH, {force: true});
execFileSync(
  'gh',
  ['run', 'download', runId, '-n', 'atomic-storybook-a11y-report', '-D', 'packages/atomic/reports'],
  {cwd: REPO_ROOT, stdio: 'inherit'}
);

const OPENACR_PATH = resolve(PKG_ROOT, 'reports/openacr.yaml');

/**
 * A report merged from an incomplete set of shards covers far fewer components
 * than the committed report, which silently downgrades WCAG conformance levels.
 * Compare against the coverage the committed openacr.yaml was generated from
 * before overwriting it.
 */
function assertNoCoverageDrop() {
  if (!existsSync(OPENACR_PATH)) {
    return;
  }
  const report = JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));
  const incoming = report.summary?.totalComponents ?? 0;
  const committedCounts = [
    ...readFileSync(OPENACR_PATH, 'utf-8').matchAll(/component\(s\) \((\d+)\)/g),
  ].map((match) => Number.parseInt(match[1], 10));
  const committed = committedCounts.length ? Math.max(...committedCounts) : 0;

  if (incoming >= committed) {
    return;
  }
  console.error(
    `\n❌ Run ${runId} covers ${incoming} component(s), fewer than the ${committed} the committed openacr.yaml reflects.\n\n` +
      'This usually means the run merged an incomplete set of a11y shard reports.\n' +
      'Pick a run where all Storybook shards produced a report, or pass\n' +
      '--allow-coverage-drop if the reduction is intentional.\n'
  );
  process.exit(1);
}

if (!allowCoverageDrop) {
  assertNoCoverageDrop();
}

console.log('[update-openacr] Regenerating openacr.yaml...');
await transformJsonToOpenAcr({
  inputFile: REPORT_PATH,
  outputFile: OPENACR_PATH,
});
formatWithOxfmt(OPENACR_PATH);

console.log('[update-openacr] ✓ Done. Review and commit packages/atomic-a11y/reports/openacr.yaml');
