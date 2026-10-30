import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';
import PlaywrightRecordReporter, {
  buildRecord,
  parseRecordName,
  RECORD_DIRECTORY,
  recordName,
} from './playwright-record-reporter.mjs';

function fakeTest({
  outcome,
  file = '/repo/packages/atomic/src/a.e2e.ts',
  line = 10,
  titlePath = ['', 'chromium', 'src/a.e2e.ts', 'atomic-a', 'should render'],
  results = [],
}) {
  return {
    outcome: () => outcome,
    expectedStatus: 'passed',
    location: {file, line},
    titlePath: () => titlePath,
    results,
  };
}

function attempt({status = 'passed', retry = 0, duration = 1000, error}) {
  return {status, retry, duration, errors: error ? [{message: error}] : []};
}

function flakyTest(error) {
  return fakeTest({
    outcome: 'flaky',
    results: [attempt({status: 'failed', error}), attempt({retry: 1})],
  });
}

describe('buildRecord', () => {
  it('counts the outcomes and keeps only the tests that needed a retry or failed', () => {
    const record = buildRecord({
      tests: [
        fakeTest({outcome: 'expected', results: [attempt({duration: 1000})]}),
        fakeTest({outcome: 'expected', results: [attempt({duration: 2000})]}),
        fakeTest({
          outcome: 'flaky',
          line: 42,
          results: [
            attempt({
              status: 'timedOut',
              duration: 30000,
              error: 'Test timeout of 30000ms exceeded.',
            }),
            attempt({retry: 1, duration: 3000}),
          ],
        }),
        fakeTest({
          outcome: 'unexpected',
          results: [0, 1, 2].map((retry) =>
            attempt({
              status: 'failed',
              retry,
              duration: 500,
              error: 'Error: expect(locator).toBeVisible() failed',
            })
          ),
        }),
        fakeTest({outcome: 'skipped'}),
      ],
      suite: 'atomic',
      shard: {current: 5, total: 12},
      sha: 'abc123',
      repositoryRoot: '/repo',
    });

    assert.deepEqual(record, {
      suite: 'atomic',
      shard: '5-12',
      sha: 'abc123',
      counts: {passed: 2, flaky: 1, failed: 1},
      testTime: 37500,
      retryTime: 4000,
      tests: [
        {
          outcome: 'flaky',
          category: 'timeout',
          file: 'packages/atomic/src/a.e2e.ts',
          line: 42,
          title: 'atomic-a › should render',
        },
        {
          outcome: 'failed',
          category: 'assertion',
          file: 'packages/atomic/src/a.e2e.ts',
          line: 10,
          title: 'atomic-a › should render',
        },
      ],
    });
  });

  for (const [label, error, category] of [
    ['a test timeout', 'Test timeout of 30000ms exceeded.', 'timeout'],
    ['an action timeout', 'TimeoutError: locator.waitFor: Timeout 15000ms exceeded.', 'timeout'],
    [
      'a colored expect failure',
      'Error: \u001b[2mexpect(\u001b[22m\u001b[31mlocator\u001b[39m\u001b[2m).\u001b[22mtoBeVisible\u001b[2m()\u001b[22m failed',
      'assertion',
    ],
    ['a navigation timeout', 'Error: page.goto: Timeout 30000ms exceeded.', 'navigation'],
    [
      'a refused connection',
      'Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4400/',
      'navigation',
    ],
    ['a detached frame', 'Error: locator.click: Frame was detached', 'navigation'],
    ['any other error', "TypeError: Cannot read properties of undefined (reading 'id')", 'other'],
    ['a failure without an error', undefined, 'other'],
  ]) {
    it(`files ${label} under ${category}`, () => {
      const record = buildRecord({
        tests: [flakyTest(error)],
        suite: 'atomic',
        shard: null,
        repositoryRoot: '/repo',
      });

      assert.equal(record.tests[0].category, category);
    });
  }

  it('names a failure from the first attempt that has an error', () => {
    const record = buildRecord({
      tests: [
        fakeTest({
          outcome: 'unexpected',
          results: [
            attempt({status: 'skipped'}),
            attempt({
              status: 'failed',
              retry: 1,
              error: 'Error: expect(locator).toBeVisible() failed',
            }),
            attempt({status: 'timedOut', retry: 2, error: 'Test timeout of 30000ms exceeded.'}),
          ],
        }),
      ],
      suite: 'atomic',
      shard: null,
      repositoryRoot: '/repo',
    });

    assert.equal(record.tests[0].category, 'assertion');
  });

  it('treats a run without shards as shard 1 of 1', () => {
    const record = buildRecord({
      tests: [],
      suite: 'headless-search-vite',
      shard: null,
      repositoryRoot: '/repo',
    });

    assert.equal(record.shard, '1-1');
  });
});

describe('recordName', () => {
  it('puts the suite, the shard and the counts in the name', () => {
    assert.equal(
      recordName({suite: 'quantic', shard: '3-6', counts: {passed: 97, flaky: 1, failed: 0}}),
      'playwright-record_quantic_3-6_97passed_1flaky_0failed'
    );
  });
});

describe('parseRecordName', () => {
  it('reads back what recordName wrote', () => {
    assert.deepEqual(
      parseRecordName(
        recordName({suite: 'atomic-cdn', shard: '1-1', counts: {passed: 9, flaky: 0, failed: 2}})
      ),
      {suite: 'atomic-cdn', shard: '1-1', passed: 9, flaky: 0, failed: 2}
    );
  });

  it('ignores other artifacts', () => {
    assert.equal(parseRecordName('atomic-blob-report-5'), null);
    assert.equal(parseRecordName('playwright-record_atomic_5-12_43passed_1flaky'), null);
  });
});

describe('PlaywrightRecordReporter', () => {
  let repository;
  let previousEnvironment;

  beforeEach(() => {
    previousEnvironment = {...process.env};
    repository = mkdtempSync(join(tmpdir(), 'playwright-record-'));
    writeFileSync(join(repository, 'pnpm-workspace.yaml'), '');
    mkdirSync(join(repository, 'samples', 'search-vite'), {recursive: true});
    writeFileSync(
      join(repository, 'samples', 'search-vite', 'package.json'),
      JSON.stringify({name: '@coveo/ui-kit-sample-headless-search-vite'})
    );
  });

  afterEach(() => {
    for (const name of Object.keys(process.env)) {
      if (!(name in previousEnvironment)) {
        delete process.env[name];
      }
    }
    Object.assign(process.env, previousEnvironment);
    rmSync(repository, {recursive: true, force: true});
  });

  function run(environment = {}) {
    Object.assign(process.env, environment);
    const reporter = new PlaywrightRecordReporter();
    const flaky = fakeTest({
      outcome: 'flaky',
      file: join(repository, 'samples', 'search-vite', 'tests', 'search.spec.ts'),
    });
    reporter.onBegin(
      {configFile: join(repository, 'samples', 'search-vite', 'playwright.config.ts'), shard: null},
      {allTests: () => [flaky, fakeTest({outcome: 'expected'})]}
    );
    reporter.onEnd();
    return join(repository, RECORD_DIRECTORY);
  }

  it('writes the record at the repository root in CI, with the commit the job checked out', () => {
    process.env.CI = 'true';

    const directory = run({GITHUB_SHA: 'abc123'});

    const [file] = readdirSync(directory);
    assert.equal(file, 'playwright-record_headless-search-vite_1-1_1passed_1flaky_0failed.json');
    const record = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    assert.equal(record.suite, 'headless-search-vite');
    assert.equal(record.sha, 'abc123');
    assert.equal(record.tests[0].file, 'samples/search-vite/tests/search.spec.ts');
  });

  it('marks the suite as a CDN run when Atomic is tested against the CDN build', () => {
    process.env.CI = 'true';

    const directory = run({DEPLOYMENT_ENVIRONMENT: 'CDN'});

    assert.match(readdirSync(directory)[0], /^playwright-record_headless-search-vite-cdn_1-1_/);
  });

  it('writes nothing outside CI', () => {
    delete process.env.CI;

    const directory = run();

    assert.equal(existsSync(directory), false);
  });

  it('prints nothing, so Playwright keeps its usual terminal reporter', () => {
    assert.equal(new PlaywrightRecordReporter().printsToStdio(), false);
  });
});
