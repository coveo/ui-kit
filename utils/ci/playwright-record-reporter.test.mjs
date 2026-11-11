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
}) {
  return {
    outcome: () => outcome,
    location: {file, line},
    titlePath: () => titlePath,
  };
}

describe('buildRecord', () => {
  it('counts the outcomes and keeps only the tests that needed a retry or failed', () => {
    const record = buildRecord({
      tests: [
        fakeTest({outcome: 'expected'}),
        fakeTest({outcome: 'expected'}),
        fakeTest({outcome: 'flaky', line: 42}),
        fakeTest({outcome: 'unexpected'}),
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
      counts: {passed: 2, flaky: 1, failed: 1, quarantined: 0},
      tests: [
        {
          outcome: 'flaky',
          project: 'chromium',
          file: 'packages/atomic/src/a.e2e.ts',
          line: 42,
          title: 'atomic-a › should render',
        },
        {
          outcome: 'failed',
          project: 'chromium',
          file: 'packages/atomic/src/a.e2e.ts',
          line: 10,
          title: 'atomic-a › should render',
        },
      ],
    });
  });

  it('tells the same test apart in each project', () => {
    const titlePath = (project) => ['', project, 'a.e2e.ts', 'quantic-a', 'should render'];
    const record = buildRecord({
      tests: [
        fakeTest({outcome: 'flaky', titlePath: titlePath('LWS-enabled')}),
        fakeTest({outcome: 'flaky', titlePath: titlePath('LWS-disabled')}),
      ],
      suite: 'quantic',
      shard: null,
      repositoryRoot: '/repo',
    });

    assert.deepEqual(
      record.tests.map(({project, title}) => [project, title]),
      [
        ['LWS-enabled', 'quantic-a › should render'],
        ['LWS-disabled', 'quantic-a › should render'],
      ]
    );
  });

  it('keeps every run of a quarantined test outside the counts', () => {
    const otherTest = ['', 'chromium', 'src/a.e2e.ts', 'atomic-b', 'should render'];
    const record = buildRecord({
      tests: [
        fakeTest({outcome: 'expected'}),
        fakeTest({outcome: 'unexpected'}),
        fakeTest({outcome: 'flaky', titlePath: otherTest}),
      ],
      suite: 'atomic',
      shard: null,
      repositoryRoot: '/repo',
      quarantine: [{file: 'packages/atomic/src/a.e2e.ts', title: 'atomic-a › should render'}],
    });

    assert.deepEqual(record.counts, {passed: 0, flaky: 1, failed: 0, quarantined: 2});
    assert.deepEqual(
      record.tests.map(({outcome, title, quarantined}) => [outcome, title, quarantined]),
      [
        ['passed', 'atomic-a › should render', true],
        ['failed', 'atomic-a › should render', true],
        ['flaky', 'atomic-b › should render', undefined],
      ]
    );
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

  it('adds the quarantined tests when there are some', () => {
    assert.equal(
      recordName({
        suite: 'quantic',
        shard: '3-6',
        counts: {passed: 97, flaky: 0, failed: 0, quarantined: 2},
      }),
      'playwright-record_quantic_3-6_97passed_0flaky_0failed_2quarantined'
    );
  });
});

describe('parseRecordName', () => {
  it('reads back what recordName wrote', () => {
    assert.deepEqual(
      parseRecordName(
        recordName({suite: 'atomic-cdn', shard: '1-1', counts: {passed: 9, flaky: 0, failed: 2}})
      ),
      {suite: 'atomic-cdn', shard: '1-1', passed: 9, flaky: 0, failed: 2, quarantined: 0}
    );
    assert.equal(
      parseRecordName('playwright-record_quantic_3-6_97passed_0flaky_0failed_2quarantined')
        .quarantined,
      2
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

  describe('with a quarantined test', () => {
    const file = () => join(repository, 'samples', 'search-vite', 'tests', 'search.spec.ts');
    const quarantinedTest = (outcome) =>
      fakeTest({outcome, file: file(), titlePath: ['', 'chromium', 'search.spec.ts', 'searches']});
    const otherTest = (outcome) =>
      fakeTest({outcome, file: file(), titlePath: ['', 'chromium', 'search.spec.ts', 'sorts']});
    const date = (days) =>
      new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    function finish({tests, expires = date(29), error = false}) {
      process.env.CI = 'true';
      writeFileSync(
        join(repository, 'quarantine.json'),
        JSON.stringify([
          {
            file: 'samples/search-vite/tests/search.spec.ts',
            title: 'searches',
            bug: 'KIT-1234',
            added: date(-1),
            expires,
          },
        ])
      );
      const reporter = new PlaywrightRecordReporter();
      reporter.onBegin(
        {
          configFile: join(repository, 'samples', 'search-vite', 'playwright.config.ts'),
          shard: null,
        },
        {allTests: () => tests}
      );
      if (error) {
        reporter.onError({message: 'webServer exited early'});
      }
      return reporter.onEnd({status: 'failed'});
    }

    it('lets the run pass when the quarantined test is the only failure, and says so', (t) => {
      const log = t.mock.method(console, 'log', () => {});

      const status = finish({tests: [quarantinedTest('unexpected'), otherTest('expected')]});

      assert.deepEqual(status, {status: 'passed'});
      assert.match(
        log.mock.calls.map((call) => call.arguments.join(' ')).join('\n'),
        /search\.spec\.ts › searches \[chromium\]: KIT-1234/
      );
    });

    it('keeps the run failed when another test failed too', () => {
      const status = finish({tests: [quarantinedTest('unexpected'), otherTest('unexpected')]});

      assert.equal(status, undefined);
    });

    it('keeps the run failed after an error outside the tests', () => {
      const status = finish({tests: [quarantinedTest('unexpected')], error: true});

      assert.equal(status, undefined);
    });

    it('stops quarantining the test on its expiry date', () => {
      const status = finish({tests: [quarantinedTest('unexpected')], expires: date(0)});

      assert.equal(status, undefined);
    });
  });
});
