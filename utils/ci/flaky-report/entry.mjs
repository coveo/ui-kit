// What a pull request must show before it adds a test to quarantine.json: the CI runs that the
// report reads prove the test flaky.
import {matchesEntry} from '../quarantine.mjs';

// A test is proven flaky by this many flaky runs and this many blocks.
const FLAKY_RUNS = 1;
const BLOCKS = 2;
// When this many tests of a job fail every retry, something else broke, such as the pull request or
// a setup: none of them blocked the job alone.
const BROKEN_JOB = 3;

export const PROVEN_FLAKY = [
  'A flaky run is a run where the test passed on a retry.',
  `A block is a merge-queue run or a pull request where it failed every retry, in a job where fewer than ${BROKEN_JOB} tests did.`,
].join(' ');

/**
 * Keeps the entries that the base branch's list doesn't cover: the ones the pull request adds. An
 * entry whose Bug or dates changed isn't added again.
 */
export function addedEntries(entries, baseEntries) {
  return entries.filter((entry) => !baseEntries.some((base) => matchesEntry(base, entry)));
}

/**
 * Describes each entry whose test the collected runs don't prove flaky, with what they show. An
 * entry that names a Playwright project counts that project only. A pull request counts as one
 * block, however often it was pushed.
 */
export function unprovenEntries(entries, {runs, records}) {
  const runsById = new Map(runs.map((run) => [run.id, run]));
  return entries.flatMap((entry) => {
    const flakyRuns = new Set();
    const blocks = new Set();
    for (const record of records) {
      const run = runsById.get(record.runId);
      for (const test of record.tests ?? []) {
        // A quarantined test can't fail its run, so that run shows nothing of what it blocks.
        if (test.quarantined || !matchesEntry(entry, test)) {
          continue;
        }
        if (test.outcome === 'flaky') {
          flakyRuns.add(run.id);
        } else if (test.outcome === 'failed' && record.failed < BROKEN_JOB) {
          blocks.add(
            run.event === 'merge_group' ? `run ${run.id}` : `pull request ${run.pullRequest}`
          );
        }
      }
    }
    if (flakyRuns.size >= FLAKY_RUNS && blocks.size >= BLOCKS) {
      return [];
    }
    const project = entry.project ? ` (${entry.project})` : '';
    return [
      `"${entry.title}"${project}: flaky runs ${flakyRuns.size} (needs ${FLAKY_RUNS}), blocks ${blocks.size} (needs ${BLOCKS})`,
    ];
  });
}
