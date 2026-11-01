// Playwright reporter that gives every shard of a run an equal share of measured test time.
//
// Playwright cuts the test list into shards of equal test counts, so a file whose tests take
// seconds each lands on one shard and that shard runs two to three times longer than the others.
// This reporter uses Reporter.preprocess (Playwright 1.62+) instead: each test, heaviest first,
// goes to the shard with the least work so far, and Playwright's own shard filter is turned off.
// The durations come from a committed timings file (built by utils/ci/e2e-timings), so every shard
// of a run computes the same partition from the same commit. Without a shard it does nothing.
//
// The approach follows the shard balancing of @flakiness/playwright (MIT,
// https://github.com/flakiness/playwright) and the draft reporter in microsoft/playwright#17969;
// the grouping of tests below mirrors Playwright's own createTestGroups.
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

export const TIMINGS_VERSION = 1;
const TAG = '[balanced-shards]';
// For a test the timings file does not know, when it knows none at all.
const FALLBACK_MS = 1500;

const seconds = (ms) => `${Math.round(ms / 1000)} s`;

// `titlePath()` starts with the root suite, the project and the file, relative to the test
// directory. The key must match what utils/ci/e2e-timings derives from Playwright's JSON report.
export function testKey(test) {
  const [, , file, ...titles] = test.titlePath();
  return {file, title: titles.join(' › ')};
}

/**
 * Reads a timings file into a Map of file -> Map of title -> milliseconds. Throws when the file is
 * missing or not a timings file.
 */
export function readTimings(path) {
  const timings = JSON.parse(readFileSync(path, 'utf8'));
  if (timings.version !== TIMINGS_VERSION || typeof timings.durations !== 'object') {
    throw new Error(`${path} is not a version ${TIMINGS_VERSION} timings file`);
  }
  return new Map(
    Object.entries(timings.durations).map(([file, titles]) => [
      file,
      new Map(Object.entries(titles)),
    ])
  );
}

export function medianOf(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Looks every key up in the timings. A key the timings do not know gets the median of the known
 * durations, so a renamed or new test neither empties nor floods a shard.
 */
export function predictDurations(keys, timings) {
  const known = keys.map(({file, title}) => timings.get(file)?.get(title));
  const measured = known.filter((ms) => ms !== undefined);
  const fallback = measured.length ? medianOf(measured) : FALLBACK_MS;
  return {durations: known.map((ms) => ms ?? fallback), hinted: measured.length, fallback};
}

/**
 * Assigns units of work to `total` shards: the heaviest unit first, each to the shard with the
 * least work so far. Deterministic, so every shard of a run computes the same partition.
 * @param {{work: number}[]} units
 * @returns {{work: number, units: object[]}[]}
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
 * The tests that must stay on one shard, grouped the way Playwright's own sharding groups them: a
 * test inside a parallel suite is on its own, unless a `serial` or `default` describe block wraps
 * it; outside parallel mode the whole file stays together. `fullyParallel` marks every file suite
 * parallel. Playwright keeps the mode in a private field; if it ever disappears, every file stays
 * whole, which is coarser but still correct.
 */
export function unitOf(test) {
  let file;
  let sequential;
  let insideParallel = false;
  for (let suite = test.parent; suite; suite = suite.parent) {
    if (suite.type === 'file') {
      file = suite;
    }
    if (suite._parallelMode === 'serial' || suite._parallelMode === 'default') {
      sequential = suite;
    }
    if (suite._parallelMode === 'parallel') {
      insideParallel = true;
    }
  }
  return insideParallel ? (sequential ?? test) : file;
}

/**
 * Splits the tests of a run into `total` shards of about equal measured duration.
 * @returns {{shards: {work: number, tests: object[]}[], hinted: number, fallback: number}}
 */
export function plan(tests, timings, total) {
  const {durations, hinted, fallback} = predictDurations(tests.map(testKey), timings);
  const units = new Map();
  tests.forEach((test, index) => {
    const key = unitOf(test);
    const unit = units.get(key) ?? {work: 0, tests: []};
    unit.work += durations[index];
    unit.tests.push(test);
    units.set(key, unit);
  });
  const shards = partition([...units.values()], total).map(({work, units: assigned}) => ({
    work,
    tests: assigned.flatMap((unit) => unit.tests),
  }));
  const assigned = shards.flatMap((shard) => shard.tests);
  if (assigned.length !== tests.length || new Set(assigned).size !== tests.length) {
    throw new Error(
      `${TAG} planned ${assigned.length} tests for ${tests.length}: every test must land in exactly one shard`
    );
  }
  return {shards, hinted, fallback};
}

export default class BalancedShardsReporter {
  #timingsFile;
  #shard;
  #predicted = 0;
  #actual = 0;
  #ran = 0;

  constructor({timingsFile = 'e2e-timings.json'} = {}) {
    this.#timingsFile = timingsFile;
  }

  printsToStdio() {
    return false;
  }

  async preprocess({config, suite, testRun}) {
    const shard = config.shard;
    if (!shard) {
      return;
    }
    // Setup and teardown projects must run on every shard; Playwright's sharding handles them.
    if (config.projects.some((project) => project.dependencies.length > 0 || project.teardown)) {
      console.warn(
        `${TAG} projects with dependencies are not balanced; using Playwright's sharding`
      );
      return;
    }
    const directory = config.configFile ? dirname(config.configFile) : process.cwd();
    let timings;
    try {
      timings = readTimings(resolve(directory, this.#timingsFile));
    } catch (error) {
      console.warn(`${TAG} ${error.message}; using Playwright's sharding`);
      return;
    }
    const tests = suite.allTests();
    const {shards, hinted, fallback} = plan(tests, timings, shard.total);
    const mine = shards[shard.current - 1];
    for (const other of shards) {
      if (other === mine) {
        continue;
      }
      for (const test of other.tests) {
        testRun.exclude(test);
      }
    }
    testRun.skipSharding();
    this.#shard = shard;
    this.#predicted = mine.work;
    const loads = shards.map((other, index) => `${index + 1}=${seconds(other.work)}`).join(' ');
    console.log(
      `${TAG} ${hinted}/${tests.length} tests have a measured duration, the others count as ${seconds(fallback)}; ` +
        `shard work ${loads}; shard ${shard.current}/${shard.total} runs ${mine.tests.length} tests, ${seconds(mine.work)} predicted`
    );
  }

  onTestEnd(test, result) {
    this.#actual += result.duration;
    this.#ran += 1;
  }

  onEnd() {
    if (!this.#shard || this.#ran === 0) {
      return;
    }
    const delta = Math.round((100 * (this.#actual - this.#predicted)) / this.#predicted);
    console.log(
      `${TAG} shard ${this.#shard.current}/${this.#shard.total} finished: ${seconds(this.#predicted)} predicted, ` +
        `${seconds(this.#actual)} actual (${delta >= 0 ? '+' : ''}${delta}%)`
    );
  }
}
