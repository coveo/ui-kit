import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {after, before, describe, it} from 'node:test';
import {recordName} from '../playwright-record-reporter.mjs';
import {
  collectMergeQueueFailures,
  collectRecords,
  collectSkips,
  failedJobs,
  findTicket,
  isRateLimited,
  jobFamily,
  listRuns,
  recoveredJobs,
  toRun,
} from './collect.mjs';
import api from './fixtures/ci-api.json' with {type: 'json'};
import recordRun from './fixtures/records.json' with {type: 'json'};

const QUANTIC_SHARDS = 'Run Quantic E2E tests / Run Playwright e2e tests on Quantic';

function rateLimitError() {
  return Object.assign(new Error('API rate limit exceeded for installation ID 1.'), {
    status: 403,
    response: {headers: {'x-ratelimit-remaining': '0'}},
  });
}

function fakeGitHub(actions) {
  return {
    octokit: {paginate: async (method, parameters) => method(parameters), rest: {actions}},
    owner: 'coveo',
    repo: 'ui-kit',
  };
}

describe('listRuns', () => {
  it('reads the window a week at a time, since each date filter returns at most 1,000 runs', async () => {
    const filters = [];
    const beforeWindow = {...api.runs[0], id: 1, created_at: '2026-09-22T13:59:59Z'};
    const runs = await listRuns(
      fakeGitHub({
        listWorkflowRuns: ({created}) => {
          filters.push(created);
          return [...api.runs, beforeWindow];
        },
      }),
      {start: '2026-09-22T14:00:00.000Z', end: '2026-10-22T14:00:00.000Z'}
    );
    assert.deepEqual(filters, [
      '2026-09-22..2026-09-28',
      '2026-09-29..2026-10-05',
      '2026-10-06..2026-10-12',
      '2026-10-13..2026-10-19',
      '2026-10-20..2026-10-26',
    ]);
    assert.deepEqual(runs, api.runs.map(toRun));
  });
});

describe('isRateLimited', () => {
  it('tells a rate limit from a missing permission', () => {
    assert.equal(isRateLimited({status: 429}), true);
    assert.equal(isRateLimited(rateLimitError()), true);
    assert.equal(
      isRateLimited({
        status: 403,
        message: 'Resource not accessible by integration',
        response: {headers: {'x-ratelimit-remaining': '4321'}},
      }),
      false
    );
  });
});

describe('jobFamily', () => {
  it('drops the shard from a matrix job name', () => {
    assert.equal(jobFamily(`${QUANTIC_SHARDS} (3, 6)`), QUANTIC_SHARDS);
    assert.equal(jobFamily('Run unit tests'), 'Run unit tests');
  });
});

describe('recoveredJobs', () => {
  it('finds the jobs that only passed after "Re-run failed jobs", without the downstream jobs', () => {
    assert.deepEqual(recoveredJobs(api.rerunAttempts.attempts), Array(4).fill(QUANTIC_SHARDS));
  });
});

describe('failedJobs', () => {
  it('names the step that failed, without the gate and report-merging jobs', () => {
    assert.deepEqual(failedJobs(api.mergeQueueJobs['38909948473']), [
      {name: QUANTIC_SHARDS, failedStep: 'Run ./.github/actions/playwright-quantic'},
    ]);
    assert.deepEqual(failedJobs(api.mergeQueueJobs['38802776862']), [
      {name: 'Run unit tests', failedStep: 'Run ./.github/actions/setup'},
    ]);
    assert.deepEqual(
      failedJobs([
        {
          name: 'Run Quantic E2E tests / Merge Playwright reports',
          conclusion: 'failure',
          steps: [{name: 'Merge Playwright reports', conclusion: 'failure'}],
        },
      ]),
      []
    );
  });
});

describe('findTicket', () => {
  it('finds a Jira key or a GitHub issue in the lines above a skip', () => {
    assert.equal(findTicket('  // TODO V4: KIT-5197 - Remove skip'), 'KIT-5197');
    assert.equal(
      findTicket('  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues'),
      '#6691'
    );
    assert.equal(findTicket("  describe('when #field is empty', () => {"), null);
  });
});

describe('collectRecords', () => {
  const artifactsOf = (records) => [
    {id: 100, name: 'quantic-blob-report-2', expired: false},
    {id: 101, name: recordName(records[0]), expired: true},
    ...records.map((record, index) => ({id: index, name: recordName(record), expired: false})),
  ];

  it('reads the records without a retry from their artifact names alone', async () => {
    const clean = recordRun.records.filter((record) => !record.tests);
    const result = await collectRecords(
      fakeGitHub({
        listWorkflowRunArtifacts: () => artifactsOf(clean),
        downloadArtifact: () => assert.fail('Downloaded a record without a retry'),
      }),
      [{id: recordRun.runId}]
    );
    assert.equal(result.partial, false);
    assert.equal(result.records.length, clean.length);
    assert.deepEqual(
      result.records.find((record) => record.suite === 'quantic'),
      {runId: recordRun.runId, suite: 'quantic', flaky: 0, failed: 0}
    );
  });

  it('downloads the records with a retry, and leaves out a run the rate limit cut short', async () => {
    const downloaded = [];
    const result = await collectRecords(
      fakeGitHub({
        listWorkflowRunArtifacts: () => artifactsOf(recordRun.records),
        downloadArtifact: ({artifact_id}) => {
          downloaded.push(artifact_id);
          throw rateLimitError();
        },
      }),
      [{id: recordRun.runId}]
    );
    assert.deepEqual(downloaded, [recordRun.records.findIndex((record) => record.tests)]);
    assert.deepEqual(result.records, []);
    assert.equal(result.partial, true);
  });
});

describe('collectMergeQueueFailures', () => {
  it('reads the jobs of each failed merge-queue run, and goes on past a rate limit', async () => {
    const rateLimitedRun = {id: 1, event: 'merge_group', conclusion: 'failure'};
    const result = await collectMergeQueueFailures(
      fakeGitHub({
        listJobsForWorkflowRun: ({run_id}) => {
          if (run_id === rateLimitedRun.id) {
            throw rateLimitError();
          }
          return api.mergeQueueJobs[run_id] ?? assert.fail(`Read the jobs of run ${run_id}`);
        },
      }),
      [...api.runs.map(toRun), rateLimitedRun]
    );
    assert.equal(result.partial, true);
    assert.deepEqual(result.failures.map(({runId}) => runId).sort(), [38802776862, 38909948473]);
  });
});

describe('collectSkips', () => {
  const NOTIFICATIONS =
    'packages/atomic/src/components/search/atomic-notifications/atomic-notifications.spec.ts';
  const RATING_FACET =
    'packages/atomic/src/components/search/atomic-rating-facet/e2e/atomic-rating-facet.e2e.ts';
  const HEADLESS = 'packages/headless/src/integration-tests/commerce.test.ts';
  const notifications = (quote) => `describe('atomic-notifications', () => {
  it('should render the icon', async () => {
    expect(element.icon).toBe(icon);
  });

  // TODO V4: KIT-5197 - Remove skip
  it.skip(${quote}should set error when headingLevel is invalid (negative)${quote}, async () => {
    const {element} = await renderNotifications();
  });
});
`;
  const ratingFacet = `test.describe('atomic-rating-facet', () => {
  // TODO: Issue #6691: Unskip visual tests after fixing CI snapshot issues
  test.skip('should match baseline after selecting a value', async ({facet}) => {
    await facet.hydrated.waitFor();
  });
});
`;
  const headless = `import {waitForNextStateChange} from '../test/functional-test-utils.js';

describe.skip('commerce', () => {
  let configuration: CommerceEngineConfiguration;
});
`;
  let repositoryRoot;

  // The global Git configuration stays out, so this throwaway repository works the same anywhere.
  function git(args, date) {
    execFileSync('git', args, {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_AUTHOR_NAME: 'Test',
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_NAME: 'Test',
        GIT_COMMITTER_EMAIL: 'test@example.com',
        GIT_COMMITTER_DATE: date,
      },
    });
  }

  function commit(date, message, files) {
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(dirname(join(repositoryRoot, file)), {recursive: true});
      writeFileSync(join(repositoryRoot, file), content);
    }
    git(['add', '.'], date);
    git(['commit', '--quiet', '--message', message], date);
  }

  before(() => {
    repositoryRoot = mkdtempSync(join(tmpdir(), 'flaky-report-skips-'));
    git(['init', '--quiet', '--initial-branch=main']);
    commit('2025-12-12T10:00:00Z', 'test(atomic): skip the invalid heading level tests', {
      [NOTIFICATIONS]: notifications('"'),
      [HEADLESS]: headless,
    });
    commit('2026-03-02T10:00:00Z', 'test(atomic): skip the rating facet visual tests', {
      [RATING_FACET]: ratingFacet,
    });
    commit('2026-07-24T10:00:00Z', 'style: format with oxfmt (#8056)', {
      [NOTIFICATIONS]: notifications("'"),
    });
  });

  after(() => rmSync(repositoryRoot, {recursive: true, force: true}));

  it('dates each skip from before the formatting commits, and finds its ticket', () => {
    assert.deepEqual(collectSkips({repositoryRoot, now: new Date('2026-10-21T10:00:00Z')}), [
      {file: NOTIFICATIONS, line: 7, ageDays: 313, ticket: 'KIT-5197'},
      {file: RATING_FACET, line: 3, ageDays: 233, ticket: '#6691'},
      {file: HEADLESS, line: 3, ageDays: 313, ticket: null},
    ]);
  });
});
