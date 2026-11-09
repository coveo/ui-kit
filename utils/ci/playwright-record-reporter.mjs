// Playwright reporter that saves, in CI only, which tests passed only on retry or failed every
// attempt. Each Playwright job uploads the record with .github/actions/upload-playwright-record,
// and the weekly flaky test report reads them. It also applies the quarantine of quarantine.mjs: a
// run whose only failures are quarantined tests passes, and the job log names those tests.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {isActive, matchesEntry, QUARANTINE_FILE, readQuarantine} from './quarantine.mjs';

export const RECORD_DIRECTORY = '.playwright-records';

// The record's file name becomes its artifact name, so it carries the counts: the weekly report
// counts executions from the artifact list and only downloads the records it needs. Records without
// a quarantined test end at the failed count.
const RECORD_NAME =
  /^playwright-record_([a-z0-9-]+)_(\d+-\d+)_(\d+)passed_(\d+)flaky_(\d+)failed(?:_(\d+)quarantined)?$/;

const OUTCOMES = {
  expected: 'passed',
  flaky: 'flaky',
  unexpected: 'failed',
};

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

function identify(test, repositoryRoot) {
  // The first three entries are the root suite, the project and the file.
  const [, project, , ...titles] = test.titlePath();
  return {
    // A test runs once per project, such as a browser or Quantic's LWS-enabled and LWS-disabled.
    project,
    file: relative(repositoryRoot, test.location.file),
    line: test.location.line,
    title: titles.join(' › '),
  };
}

export function buildRecord({tests, suite, shard, sha, repositoryRoot, quarantine = []}) {
  const counts = {passed: 0, flaky: 0, failed: 0, quarantined: 0};
  const recorded = [];
  for (const test of tests) {
    const outcome = OUTCOMES[test.outcome()];
    if (!outcome) {
      continue;
    }
    const identity = identify(test, repositoryRoot);
    // A quarantined test stays out of the counts, and every run of it is kept, passes included, so
    // the weekly report can tell when it is healthy again.
    if (quarantine.some((entry) => matchesEntry(entry, identity))) {
      counts.quarantined += 1;
      recorded.push({outcome, ...identity, quarantined: true});
    } else {
      counts[outcome] += 1;
      if (outcome !== 'passed') {
        recorded.push({outcome, ...identity});
      }
    }
  }
  return {
    suite,
    shard: shard ? `${shard.current}-${shard.total}` : '1-1',
    sha,
    counts,
    tests: recorded,
  };
}

export function recordName({suite, shard, counts}) {
  const name = `playwright-record_${suite}_${shard}_${counts.passed}passed_${counts.flaky}flaky_${counts.failed}failed`;
  return counts.quarantined > 0 ? `${name}_${counts.quarantined}quarantined` : name;
}

export function parseRecordName(name) {
  const match = RECORD_NAME.exec(name);
  if (!match) {
    return null;
  }
  const [, suite, shard, passed, flaky, failed, quarantined = '0'] = match;
  return {
    suite,
    shard,
    passed: Number(passed),
    flaky: Number(flaky),
    failed: Number(failed),
    quarantined: Number(quarantined),
  };
}

function activeQuarantine(repositoryRoot) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return readQuarantine(repositoryRoot).filter((entry) => isActive(entry, today));
  } catch (error) {
    // An unreadable list quarantines nothing, so every failure still fails the run.
    console.error(`No test is quarantined. ${error.message}`);
    return [];
  }
}

// The run passes only when every test that failed all its attempts is quarantined and nothing else
// went wrong: no global error, timeout or interruption.
function quarantineStatus({result, tests, quarantine, repositoryRoot, errors}) {
  if (result?.status !== 'failed' || errors > 0) {
    return undefined;
  }
  const failures = tests
    .filter((test) => test.outcome() === 'unexpected')
    .map((test) => {
      const identity = identify(test, repositoryRoot);
      return {identity, entry: quarantine.find((entry) => matchesEntry(entry, identity))};
    });
  if (failures.length === 0 || failures.some(({entry}) => !entry)) {
    return undefined;
  }
  console.log(`\nOnly quarantined tests failed, so the run passes (see ${QUARANTINE_FILE}):`);
  for (const {identity, entry} of failures) {
    const project = identity.project ? ` [${identity.project}]` : '';
    console.log(
      `  ${identity.file} › ${identity.title}${project}: ${entry.bug}, until ${entry.expires}`
    );
  }
  return {status: 'passed'};
}

export default class PlaywrightRecordReporter {
  #config;
  #suite;
  #errors = 0;

  printsToStdio() {
    return false;
  }

  onBegin(config, suite) {
    this.#config = config;
    this.#suite = suite;
  }

  onError() {
    this.#errors += 1;
  }

  onEnd(result) {
    if (!process.env.CI || !this.#suite || !this.#config?.configFile) {
      return;
    }
    const configDirectory = dirname(this.#config.configFile);
    const repositoryRoot = findUp(configDirectory, 'pnpm-workspace.yaml') ?? configDirectory;
    const tests = this.#suite.allTests();
    const quarantine = activeQuarantine(repositoryRoot);
    // A missing record only loses one data point, so it must never fail the test run.
    try {
      const record = buildRecord({
        tests,
        suite: suiteName(configDirectory, process.env),
        shard: this.#config.shard,
        // The commit the job checked out: on a pull request, GitHub's merge commit, not the PR head.
        sha: process.env.GITHUB_SHA,
        repositoryRoot,
        quarantine,
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
    return quarantineStatus({result, tests, quarantine, repositoryRoot, errors: this.#errors});
  }
}
