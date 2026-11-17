import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';
import {decide, keysOf, partition, predictDurations, readTimings} from './timings.mjs';

const timingsOf = (durations) =>
  new Map(
    Object.entries(durations).map(([file, titles]) => [file, new Map(Object.entries(titles))])
  );

// The shape `flakiness-playwright-timings build` writes: file suites, nested suites, tests with
// one attempt per environment.
const test = (title, ...durations) => ({
  title,
  attempts: durations.map((duration, environmentIdx) => ({environmentIdx, duration})),
});

describe('readTimings', () => {
  let directory;
  const write = (report) => {
    const path = join(directory, 'timings.json');
    writeFileSync(path, JSON.stringify({environments: [{name: 'chromium'}], ...report}));
    return path;
  };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'e2e-timings-'));
  });

  afterEach(() => {
    rmSync(directory, {recursive: true, force: true});
  });

  it('keys tests by file and titles and keeps the longest attempt', () => {
    const path = write({
      suites: [
        {
          title: 'a.e2e.ts',
          type: 'file',
          tests: [test('one', 1000)],
          suites: [{title: 'block', type: 'suite', tests: [test('two', 2000, 500)]}],
        },
      ],
    });
    assert.deepEqual(readTimings(path), timingsOf({'a.e2e.ts': {one: 1000, 'block › two': 2000}}));
  });

  it('leaves out a test without attempts', () => {
    const path = write({suites: [{title: 'a.e2e.ts', tests: [test('one', 1000), test('none')]}]});
    assert.deepEqual(readTimings(path), timingsOf({'a.e2e.ts': {one: 1000}}));
  });

  for (const [label, duration] of [
    ['a string', '1200'],
    ['a negative number', -1000],
  ]) {
    it(`throws on ${label} as a duration`, () => {
      const path = write({suites: [{title: 'a.e2e.ts', tests: [test('one', duration)]}]});
      assert.throws(() => readTimings(path), /"a\.e2e\.ts › one" has an invalid duration/);
    });
  }

  it('throws on a file that is not a timings file', () => {
    const path = join(directory, 'old.json');
    writeFileSync(path, JSON.stringify({version: 1, durations: {}}));
    assert.throws(() => readTimings(path), /not a @flakiness\/playwright timings file/);
  });
});

describe('predictDurations', () => {
  it('gives unknown tests the reporter default of 1 s', () => {
    const keys = keysOf(timingsOf({'a.e2e.ts': {one: 4000, new: 9000}}));
    const {durations, hinted} = predictDurations(keys, timingsOf({'a.e2e.ts': {one: 4000}}));
    assert.deepEqual({durations, hinted}, {durations: [4000, 1000], hinted: 1});
  });
});

describe('partition', () => {
  it('places the heaviest unit first and each unit on the lightest shard', () => {
    const units = [9, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((work) => ({work}));
    assert.deepEqual(
      partition(units, 3).map((shard) => shard.work),
      [9, 5, 4]
    );
  });
});

describe('decide', () => {
  const candidate = timingsOf({'a.e2e.ts': {one: 8000, two: 1000, three: 1000, four: 1000}});
  const keys = keysOf(candidate);

  it('keeps the committed file when it is as good as the candidate', () => {
    assert.deepEqual(decide({keys, current: candidate, candidate, shards: 2, thresholdMs: 5000}), {
      tests: 4,
      unknown: 0,
      currentLongest: 8000,
      candidateLongest: 8000,
      refresh: false,
    });
  });

  it('asks for a refresh when the committed partition would run longer than the threshold', () => {
    // The committed file thinks "one" is light, so its partition pairs it with "two".
    const current = timingsOf({'a.e2e.ts': {one: 1000, two: 1000, three: 1000, four: 1000}});
    const result = decide({keys, current, candidate, shards: 2, thresholdMs: 500});
    assert.equal(result.currentLongest, 9000);
    assert.equal(result.candidateLongest, 8000);
    assert.equal(result.refresh, true);
    assert.equal(decide({keys, current, candidate, shards: 2, thresholdMs: 5000}).refresh, false);
  });

  it('counts tests the committed file does not know without forcing a refresh', () => {
    const current = timingsOf({'a.e2e.ts': {one: 8000, two: 1000, three: 1000}});
    const result = decide({keys, current, candidate, shards: 2, thresholdMs: 5000});
    assert.equal(result.unknown, 1);
    assert.equal(result.refresh, false);
  });
});
