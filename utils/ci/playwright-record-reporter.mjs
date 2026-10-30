// Playwright reporter that saves, in CI only, which tests passed only on retry or failed every
// attempt, why their first attempt failed, and how much test time went to retries. Each Playwright
// job uploads the record with .github/actions/upload-playwright-record, and the weekly flaky test
// report reads them. It prints nothing, so pull requests stay as they are.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {stripVTControlCharacters} from 'node:util';

export const RECORD_DIRECTORY = '.playwright-records';

// The record's file name becomes its artifact name, so it carries the counts: the weekly report
// counts executions from the artifact list and only downloads the records with retries.
const RECORD_NAME = /^playwright-record_([a-z0-9-]+)_(\d+-\d+)_(\d+)passed_(\d+)flaky_(\d+)failed$/;

const OUTCOMES = {
  expected: 'passed',
  flaky: 'flaky',
  unexpected: 'failed',
};

// The first matching pattern names a failure, and the record keeps only that name: anyone signed in
// to GitHub can download this public repository's artifacts. The names come from the admin-ui E2E
// metrics RFC. Quantic's scratch-org and Salesforce login failures get none: they stop the job
// before any test runs.
const FAILURE_CATEGORIES = [
  {
    name: 'navigation',
    pattern:
      /\bpage\.(goto|reload|goBack|goForward|waitForURL|waitForNavigation):|net::ERR_|NS_ERROR_|NS_BINDING_ABORTED|Navigation failed|frame was detached|context was destroyed/i,
  },
  {name: 'assertion', pattern: /\bexpect\(|AssertionError/},
  {name: 'timeout', pattern: /timeout (of )?\d+ms exceeded|TimeoutError/i},
];

function findUp(directory, fileName) {
  let current = directory;
  while (!existsSync(join(current, fileName))) {
    const parent = dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
  return current;
}

function suiteName(configDirectory, environment) {
  const packageDirectory = findUp(configDirectory, 'package.json') ?? configDirectory;
  const {name} = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
  const suite = name
    .replace(/^@[^/]+\//, '')
    .replace(/^ui-kit-sample-/, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase();
  return environment.DEPLOYMENT_ENVIRONMENT === 'CDN' ? `${suite}-cdn` : suite;
}

function failureCategory(test) {
  const [error] = test.results.find((result) => result.errors.length > 0)?.errors ?? [];
  const message = stripVTControlCharacters(error?.message ?? '');
  return FAILURE_CATEGORIES.find(({pattern}) => pattern.test(message))?.name ?? 'other';
}

export function buildRecord({tests, suite, shard, sha, repositoryRoot}) {
  const counts = {passed: 0, flaky: 0, failed: 0};
  let testTime = 0;
  let retryTime = 0;
  const retried = [];
  for (const test of tests) {
    for (const result of test.results) {
      testTime += result.duration;
      if (result.retry > 0) {
        retryTime += result.duration;
      }
    }
    const outcome = OUTCOMES[test.outcome()];
    if (!outcome) {
      continue;
    }
    counts[outcome] += 1;
    if (outcome !== 'passed') {
      retried.push({
        outcome,
        category: failureCategory(test),
        file: relative(repositoryRoot, test.location.file),
        line: test.location.line,
        // The first three entries are the root suite, the project and the file.
        title: test.titlePath().slice(3).join(' › '),
      });
    }
  }
  return {
    suite,
    shard: shard ? `${shard.current}-${shard.total}` : '1-1',
    sha,
    counts,
    // Both in milliseconds.
    testTime,
    retryTime,
    tests: retried,
  };
}

export function recordName({suite, shard, counts}) {
  return `playwright-record_${suite}_${shard}_${counts.passed}passed_${counts.flaky}flaky_${counts.failed}failed`;
}

export function parseRecordName(name) {
  const match = RECORD_NAME.exec(name);
  if (!match) {
    return null;
  }
  const [, suite, shard, passed, flaky, failed] = match;
  return {suite, shard, passed: Number(passed), flaky: Number(flaky), failed: Number(failed)};
}

export default class PlaywrightRecordReporter {
  #config;
  #suite;

  printsToStdio() {
    return false;
  }

  onBegin(config, suite) {
    this.#config = config;
    this.#suite = suite;
  }

  onEnd() {
    if (!process.env.CI || !this.#suite || !this.#config?.configFile) {
      return;
    }
    // A missing record only loses one data point, so it must never fail the test run.
    try {
      const configDirectory = dirname(this.#config.configFile);
      const repositoryRoot = findUp(configDirectory, 'pnpm-workspace.yaml') ?? configDirectory;
      const record = buildRecord({
        tests: this.#suite.allTests(),
        suite: suiteName(configDirectory, process.env),
        shard: this.#config.shard,
        // The commit the job checked out: on a pull request, GitHub's merge commit, not the PR head.
        sha: process.env.GITHUB_SHA,
        repositoryRoot,
      });
      const directory = join(repositoryRoot, RECORD_DIRECTORY);
      mkdirSync(directory, {recursive: true});
      writeFileSync(
        join(directory, `${recordName(record)}.json`),
        `${JSON.stringify(record, null, 2)}\n`
      );
    } catch (error) {
      console.error(`Could not save the Playwright record: ${error.message}`);
    }
  }
}
