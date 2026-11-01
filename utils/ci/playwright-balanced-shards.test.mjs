import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, it, mock} from 'node:test';
import BalancedShardsReporter, {
  medianOf,
  partition,
  plan,
  predictDurations,
  readTimings,
  testKey,
  unitOf,
} from './playwright-balanced-shards.mjs';

// The tree a reporter sees: root > project > file > (describe) > test. `files` maps a file to
// its specs: a title, or {title, describe: {title, mode}} for a test inside a describe block.
function fakeSuite(files, {fullyParallel = true} = {}) {
  const root = {type: 'root', title: '', parent: undefined};
  const project = {type: 'project', title: 'chromium', parent: root};
  const tests = [];
  for (const [file, specs] of Object.entries(files)) {
    const fileSuite = {
      type: 'file',
      title: file,
      parent: project,
      _parallelMode: fullyParallel ? 'parallel' : undefined,
    };
    const describes = new Map();
    for (const spec of specs) {
      const {title, describe: block} = typeof spec === 'string' ? {title: spec} : spec;
      let parent = fileSuite;
      const titles = [];
      if (block) {
        if (!describes.has(block.title)) {
          describes.set(block.title, {
            type: 'describe',
            title: block.title,
            parent: fileSuite,
            _parallelMode: block.mode,
          });
        }
        parent = describes.get(block.title);
        titles.push(block.title);
      }
      tests.push({title, parent, titlePath: () => ['', 'chromium', file, ...titles, title]});
    }
  }
  return {suite: {allTests: () => tests}, tests};
}

const timingsOf = (durations) =>
  new Map(
    Object.entries(durations).map(([file, titles]) => [file, new Map(Object.entries(titles))])
  );

describe('testKey', () => {
  it('keeps the file and the titles below it', () => {
    const [test] = fakeSuite({
      'a/b.e2e.ts': [{title: 'renders', describe: {title: 'atomic-b'}}],
    }).tests;
    assert.deepEqual(testKey(test), {file: 'a/b.e2e.ts', title: 'atomic-b › renders'});
  });
});

describe('medianOf', () => {
  it('returns the middle value, or the mean of the two middle values', () => {
    assert.equal(medianOf([5, 1, 3]), 3);
    assert.equal(medianOf([4, 1, 3, 2]), 2.5);
  });
});

describe('predictDurations', () => {
  it('gives unknown tests the median of the known durations', () => {
    const timings = timingsOf({'a.e2e.ts': {one: 1000, two: 3000, three: 20000}});
    const keys = ['one', 'two', 'three', 'new'].map((title) => ({file: 'a.e2e.ts', title}));
    assert.deepEqual(predictDurations(keys, timings), {
      durations: [1000, 3000, 20000, 3000],
      hinted: 3,
      fallback: 3000,
    });
  });

  it('falls back to a fixed duration when nothing is known', () => {
    const {durations, hinted} = predictDurations([{file: 'a.e2e.ts', title: 'one'}], new Map());
    assert.deepEqual({durations, hinted}, {durations: [1500], hinted: 0});
  });
});

describe('partition', () => {
  it('places the heaviest unit first and each unit on the lightest shard', () => {
    const units = [9, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((work) => ({work}));
    const shards = partition(units, 3);
    assert.deepEqual(
      shards.map((shard) => shard.work),
      [9, 5, 4]
    );
    assert.deepEqual(shards[0].units, [units[0]]);
  });

  it('is deterministic and breaks ties by position', () => {
    const units = [{work: 1}, {work: 1}, {work: 1}];
    const first = partition(units, 2);
    assert.deepEqual(first, partition(units, 2));
    assert.deepEqual(first[0].units, [units[0], units[2]]);
    assert.deepEqual(first[1].units, [units[1]]);
  });
});

describe('unitOf', () => {
  it('keeps each test apart in a fully parallel file', () => {
    const {tests} = fakeSuite({'a.e2e.ts': ['one', 'two']});
    assert.equal(unitOf(tests[0]), tests[0]);
    assert.notEqual(unitOf(tests[0]), unitOf(tests[1]));
  });

  it('keeps a serial describe block together', () => {
    const {tests} = fakeSuite({
      'a.e2e.ts': [
        {title: 'one', describe: {title: 'flow', mode: 'serial'}},
        {title: 'two', describe: {title: 'flow', mode: 'serial'}},
        'three',
      ],
    });
    assert.equal(unitOf(tests[0]), unitOf(tests[1]));
    assert.equal(unitOf(tests[0]).title, 'flow');
    assert.equal(unitOf(tests[2]), tests[2]);
  });

  it('keeps a file together when it is not parallel', () => {
    const {tests} = fakeSuite({'a.e2e.ts': ['one', 'two']}, {fullyParallel: false});
    assert.equal(unitOf(tests[0]), unitOf(tests[1]));
    assert.equal(unitOf(tests[0]).type, 'file');
  });
});

describe('plan', () => {
  it('puts every test in exactly one shard and balances the measured time', () => {
    const {suite, tests} = fakeSuite({
      'heavy.e2e.ts': ['one', 'two', 'three'],
      'light.e2e.ts': ['one', 'two', 'three', 'four', 'five', 'six'],
    });
    const timings = timingsOf({
      'heavy.e2e.ts': {one: 6000, two: 6000, three: 6000},
      'light.e2e.ts': {one: 1000, two: 1000, three: 1000, four: 1000, five: 1000, six: 1000},
    });
    const {shards, hinted} = plan(suite.allTests(), timings, 3);
    const assigned = shards.flatMap((shard) => shard.tests);
    assert.equal(hinted, 9);
    assert.equal(assigned.length, tests.length);
    assert.equal(new Set(assigned).size, tests.length);
    assert.deepEqual(
      shards.map((shard) => shard.work),
      [8000, 8000, 8000]
    );
  });
});

describe('BalancedShardsReporter', () => {
  let directory;
  let logs;
  let warnings;

  const files = {
    'a.e2e.ts': ['one', 'two', 'three'],
    'b.e2e.ts': ['one', 'two', 'three'],
  };
  const durations = {
    'a.e2e.ts': {one: 5000, two: 1000, three: 1000},
    'b.e2e.ts': {one: 1000, two: 1000, three: 1000},
  };

  function fakeRun({shard = {current: 2, total: 3}, dependencies = [], timings = durations} = {}) {
    if (timings) {
      writeFileSync(
        join(directory, 'e2e-timings.json'),
        JSON.stringify({version: 1, durations: timings})
      );
    }
    const {suite, tests} = fakeSuite(files);
    const excluded = [];
    const testRun = {
      exclude: (test) => excluded.push(test),
      skipSharding: mock.fn(),
    };
    const config = {
      shard,
      configFile: join(directory, 'playwright.config.ts'),
      projects: [{dependencies, teardown: undefined}],
    };
    return {config, suite, tests, testRun, excluded};
  }

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'balanced-shards-'));
    logs = [];
    warnings = [];
    mock.method(console, 'log', (line) => logs.push(line));
    mock.method(console, 'warn', (line) => warnings.push(line));
  });

  afterEach(() => {
    mock.restoreAll();
    rmSync(directory, {recursive: true, force: true});
  });

  it('excludes the other shards and takes over sharding', async () => {
    const reporter = new BalancedShardsReporter({timingsFile: './e2e-timings.json'});
    const {config, suite, tests, testRun, excluded} = fakeRun();
    await reporter.preprocess({config, suite, testRun});
    const expected = plan(tests, readTimings(join(directory, 'e2e-timings.json')), 3);
    const mine = new Set(expected.shards[1].tests);
    assert.deepEqual(new Set(excluded), new Set(tests.filter((test) => !mine.has(test))));
    assert.equal(excluded.length + mine.size, tests.length);
    assert.equal(testRun.skipSharding.mock.callCount(), 1);
    assert.match(logs[0], /6\/6 tests have a measured duration/);
    assert.match(logs[0], /shard 2\/3 runs/);
  });

  it('does nothing without a shard', async () => {
    const reporter = new BalancedShardsReporter({timingsFile: './e2e-timings.json'});
    const {config, suite, testRun, excluded} = fakeRun({shard: null});
    await reporter.preprocess({config, suite, testRun});
    assert.equal(excluded.length, 0);
    assert.equal(testRun.skipSharding.mock.callCount(), 0);
  });

  it('leaves sharding to Playwright when the timings file is missing', async () => {
    const reporter = new BalancedShardsReporter({timingsFile: './missing.json'});
    const {config, suite, testRun, excluded} = fakeRun();
    await reporter.preprocess({config, suite, testRun});
    assert.equal(excluded.length, 0);
    assert.equal(testRun.skipSharding.mock.callCount(), 0);
    assert.match(warnings[0], /using Playwright's sharding/);
  });

  it('leaves sharding to Playwright when the file is not a timings file', async () => {
    writeFileSync(join(directory, 'old.json'), JSON.stringify({weights: [1, 2]}));
    const reporter = new BalancedShardsReporter({timingsFile: './old.json'});
    const {config, suite, testRun} = fakeRun();
    await reporter.preprocess({config, suite, testRun});
    assert.equal(testRun.skipSharding.mock.callCount(), 0);
    assert.match(warnings[0], /not a version 1 timings file/);
  });

  it('leaves sharding to Playwright when a project has dependencies', async () => {
    const reporter = new BalancedShardsReporter({timingsFile: './e2e-timings.json'});
    const {config, suite, testRun} = fakeRun({dependencies: ['setup']});
    await reporter.preprocess({config, suite, testRun});
    assert.equal(testRun.skipSharding.mock.callCount(), 0);
    assert.match(warnings[0], /projects with dependencies/);
  });

  it('reports the predicted and actual time once tests ran', async () => {
    const reporter = new BalancedShardsReporter({timingsFile: './e2e-timings.json'});
    const {config, suite, tests, testRun} = fakeRun();
    await reporter.preprocess({config, suite, testRun});
    reporter.onEnd();
    assert.equal(logs.length, 1);
    reporter.onTestEnd(tests[0], {duration: 2000});
    reporter.onTestEnd(tests[0], {duration: 1000});
    reporter.onEnd();
    assert.match(logs[1], /shard 2\/3 finished: 3 s predicted, 3 s actual \(\+0%\)/);
  });
});
