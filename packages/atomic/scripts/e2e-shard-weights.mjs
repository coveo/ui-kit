import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * Computes PWTEST_SHARD_WEIGHTS for the Atomic e2e shards from the blob reports of a CI run.
 *
 * Playwright cuts the ordered test list into contiguous slices sized by these weights (equal
 * weights by default). Shard 9 alone carries `atomic-generated-answer.e2e.ts` and runs 2 to 3
 * times longer than the others, so the weights resize the slices to even out the test time.
 *
 * usage: node scripts/e2e-shard-weights.mjs <run-id>
 * Needs `gh` logged in; the run must still have its atomic-blob-report-* artifacts (kept 5 days).
 */

const atomicDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(atomicDir, 'e2e-shard-weights.json');
const runId = process.argv[2];
if (!/^\d+$/.test(runId ?? '')) {
  console.error('usage: node scripts/e2e-shard-weights.mjs <run-id>');
  process.exit(1);
}

const {shardTotal} = JSON.parse(readFileSync(outputPath, 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'atomic-shard-weights-'));
try {
  const shards = [];
  for (let i = 1; i <= shardTotal; i++) {
    const dir = join(work, String(i));
    execFileSync('gh', ['run', 'download', runId, '-n', `atomic-blob-report-${i}`, '-D', dir], {
      stdio: 'inherit',
    });
    const merged = join(work, `shard-${i}.json`);
    execFileSync('npx', ['playwright', 'merge-reports', '--reporter', 'json', dir], {
      cwd: atomicDir,
      env: {...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: merged},
      stdio: 'ignore',
    });
    shards.push(testsOf(JSON.parse(readFileSync(merged, 'utf8'))));
  }
  const tests = shards.flat();
  const durations = tests.map((t) => t.seconds);
  const currentSizes = shards.map((s) => s.length);
  const weights = linearPartition(durations, shardTotal);
  const longest = (sizes) =>
    Math.max(...slice(durations, sizes).map((s) => s.reduce((a, b) => a + b, 0)));
  const result = {
    shardTotal,
    weights,
    source: {
      run: `https://github.com/coveo/ui-kit/actions/runs/${runId}`,
      computedAt: new Date().toISOString().slice(0, 10),
      tests: tests.length,
      testSeconds: Math.round(durations.reduce((a, b) => a + b, 0)),
      longestShardSecondsBefore: Math.round(longest(currentSizes)),
      longestShardSecondsAfter: Math.round(longest(weights)),
    },
  };
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(
    `${tests.length} tests, longest shard ${result.source.longestShardSecondsBefore} s -> ${result.source.longestShardSecondsAfter} s`
  );
  console.log(`PWTEST_SHARD_WEIGHTS=${weights.join(':')} written to ${outputPath}`);
} finally {
  rmSync(work, {recursive: true, force: true});
}

function testsOf(report) {
  const out = [];
  const walk = (suite) => {
    for (const child of suite.suites ?? []) walk(child);
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        out.push({seconds: test.results.reduce((a, r) => a + r.duration, 0) / 1000});
      }
    }
  };
  for (const suite of report.suites) walk(suite);
  return out;
}

function slice(values, sizes) {
  const out = [];
  let from = 0;
  for (const size of sizes) {
    out.push(values.slice(from, from + size));
    from += size;
  }
  return out;
}

// Smallest possible longest slice, by binary search on the limit a greedy left-to-right cut respects.
function linearPartition(values, parts) {
  const cutsWithin = (limit) => {
    const cuts = [];
    let acc = 0;
    values.forEach((v, i) => {
      if (acc > 0 && acc + v > limit) {
        cuts.push(i);
        acc = 0;
      }
      acc += v;
    });
    return cuts;
  };
  let low = Math.max(...values);
  let high = values.reduce((a, b) => a + b, 0);
  while (high - low > 0.5) {
    const mid = (low + high) / 2;
    if (cutsWithin(mid).length + 1 <= parts) high = mid;
    else low = mid;
  }
  const bounds = [0, ...cutsWithin(high), values.length];
  const sizes = bounds.slice(1).map((b, i) => b - bounds[i]);
  while (sizes.length < parts) {
    const i = sizes.indexOf(Math.max(...sizes));
    sizes.splice(i, 1, Math.floor(sizes[i] / 2), Math.ceil(sizes[i] / 2));
  }
  return sizes;
}
