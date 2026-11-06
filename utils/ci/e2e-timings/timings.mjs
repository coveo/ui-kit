// The pure part of utils/ci/e2e-timings: reading the timings file that @flakiness/playwright
// balances the Atomic e2e shards with, and deciding whether the committed one is stale.
import {readFileSync} from 'node:fs';

// What @flakiness/playwright assumes for a test the timings file does not know.
export const UNKNOWN_TEST_MS = 1000;

/**
 * Reads a timings file written by `flakiness-playwright-timings build` into a Map of
 * file -> Map of title -> milliseconds. A test keeps its longest attempt, as the reporter does
 * when a test ran under several environments, and a test without attempts is left out. Throws on
 * a duration that is not a finite, nonnegative number, so a hand-edited file fails the check
 * instead of being trusted.
 */
export function readTimings(path) {
  const report = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(report.environments) || !Array.isArray(report.suites)) {
    throw new Error(`${path} is not a @flakiness/playwright timings file`);
  }
  const byFile = new Map();
  const walk = (suite, file, titles) => {
    for (const test of suite.tests ?? []) {
      const durations = (test.attempts ?? []).map(({duration}) => duration ?? 0);
      const invalid = durations.find((ms) => !Number.isFinite(ms) || ms < 0);
      if (invalid !== undefined) {
        const name = [file, ...titles, test.title].join(' › ');
        throw new Error(`${path}: "${name}" has an invalid duration ${JSON.stringify(invalid)}`);
      }
      if (durations.length) {
        const tests = byFile.get(file) ?? new Map();
        tests.set([...titles, test.title].join(' › '), Math.max(...durations));
        byFile.set(file, tests);
      }
    }
    for (const child of suite.suites ?? []) {
      walk(child, file, [...titles, child.title]);
    }
  };
  for (const fileSuite of report.suites) {
    walk(fileSuite, fileSuite.title, []);
  }
  return byFile;
}

export function keysOf(timings) {
  return [...timings].flatMap(([file, titles]) =>
    [...titles.keys()].map((title) => ({file, title}))
  );
}

export function predictDurations(keys, timings) {
  const known = keys.map(({file, title}) => timings.get(file)?.get(title));
  return {
    durations: known.map((ms) => ms ?? UNKNOWN_TEST_MS),
    hinted: known.filter((ms) => ms !== undefined).length,
  };
}

/**
 * The partition @flakiness/playwright computes for a single project without dependencies: each
 * test, heaviest first, goes to the shard with the least work so far.
 * @param {{work: number}[]} units
 */
export function partition(units, total) {
  const shards = Array.from({length: total}, () => ({work: 0, units: []}));
  const heaviestFirst = units
    .map((unit, index) => ({unit, index}))
    .sort((a, b) => b.unit.work - a.unit.work || a.index - b.index);
  for (const {unit} of heaviestFirst) {
    const lightest = shards.reduce((best, shard) => (shard.work < best.work ? shard : best));
    lightest.units.push(unit);
    lightest.work += unit.work;
  }
  return shards;
}

/**
 * Compares the committed timings with a candidate on the candidate's tests. Both partitions are
 * measured with the candidate's durations, the freshest estimate of what the tests cost, and a
 * refresh is due when the committed partition would run more than `thresholdMs` longer. Tests the
 * committed file does not know are placed at the reporter's default, so they only force a refresh
 * when they unbalance the shards.
 */
export function decide({keys, current, candidate, shards, thresholdMs}) {
  const fresh = predictDurations(keys, candidate);
  const committed = predictDurations(keys, current);
  const longestWith = (planned) =>
    Math.max(
      ...partition(
        planned.map((work, index) => ({work, index})),
        shards
      ).map((shard) => shard.units.reduce((sum, {index}) => sum + fresh.durations[index], 0))
    );
  const currentLongest = longestWith(committed.durations);
  const candidateLongest = longestWith(fresh.durations);
  return {
    tests: keys.length,
    unknown: keys.length - committed.hinted,
    currentLongest,
    candidateLongest,
    refresh: currentLongest - candidateLongest > thresholdMs,
  };
}
